package server

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/go-resty/resty/v2"
	"github.com/gofiber/fiber/v2"
)

// ── Install Server (unified endpoint) ──────────────────────────────────────

func (h Handler) installServer(c *fiber.Ctx) error {
	var req installReq
	if err := c.BodyParser(&req); err != nil {
		return errorResp(c, 400, err)
	}

	serverDir := h.cfg.ServerDir
	javaPath := h.cfg.JavaPath
	if javaPath == "" {
		javaPath = "java"
	}

	os.MkdirAll(serverDir, 0o755)

	// Accept EULA automatically
	os.WriteFile(filepath.Join(serverDir, "eula.txt"), []byte("eula=true\n"), 0o644)

	var url string
	switch ServerSoftware(req.Software) {
	case SoftwarePaper:
		var err error
		url, err = paperDownloadURL(req.MCVersion, req.Build)
		if err != nil {
			return errorResp(c, 500, err)
		}
		_, err = downloadAndSetServer(httpClient, url, serverDir)
		return err
	case SoftwareVanilla:
		vanillaVersions, err := vanillaVersions()
		if err != nil {
			return errorResp(c, 500, err)
		}
		for _, v := range vanillaVersions {
			if v["id"] == req.MCVersion {
				versionURL, ok := v["url"].(string)
				if !ok {
					return errorResp(c, 500, fmt.Errorf("vanilla: no url for %s", req.MCVersion))
				}
				url, err = vanillaDownloadURL(versionURL)
				if err != nil {
					return errorResp(c, 500, err)
				}
				_, err = downloadAndSetServer(httpClient, url, serverDir)
				return err
			}
		}
		return errorResp(c, 500, fmt.Errorf("vanilla: version %s not found", req.MCVersion))
	case SoftwarePurpur:
		return h.installPurpur(serverDir, req.MCVersion, req.Build)
	case SoftwareFolia:
		return h.installFolia(serverDir, req.MCVersion, req.Build)
	case SoftwareNeoForge:
		return h.installNeoForge(serverDir, req.MCVersion, req.Build, javaPath)
	case SoftwareForge:
		return h.installForge(serverDir, req.MCVersion, req.Build, javaPath)
	case SoftwareQuilt:
		return h.installQuilt(serverDir, req.MCVersion, req.Build)
	case SoftwareMagma:
		return h.installMagma(serverDir, req.MCVersion, req.Build)
	case SoftwareFabric:
		return h.installFabricFromBuild(serverDir, req.MCVersion, req.Build)
	default:
		return errorResp(c, 400, fmt.Errorf("unsupported software: %s", req.Software))
	}
}

// ── Simple JAR download ────────────────────────────────────────────────────

func downloadJarTo(client *resty.Client, url, serverDir, jarName string) (string, error) {
	outPath := filepath.Join(serverDir, jarName)
	// Remove old server.jar
	os.Remove(outPath)
	resp, err := client.R().SetOutput(outPath).Get(url)
	if err != nil {
		return "", fmt.Errorf("download: %w", err)
	}
	if !resp.IsSuccess() {
		return "", fmt.Errorf("download: status %d", resp.StatusCode())
	}
	return outPath, nil
}

func downloadAndSetServer(client *resty.Client, url, serverDir string) (string, error) {
	return downloadJarTo(client, url, serverDir, "server.jar")
}

// ── Purpur ─────────────────────────────────────────────────────────────────

func (h Handler) installPurpur(serverDir, mcVersion, build string) error {
	url := fmt.Sprintf("https://api.purpurmc.org/v2/purpur/%s/%s/download", mcVersion, build)
	_, err := downloadAndSetServer(httpClient, url, serverDir)
	return err
}

// ── Folia ──────────────────────────────────────────────────────────────────

func (h Handler) installFolia(serverDir, mcVersion, build string) error {
	url, err := foliaDownloadURL(mcVersion, build)
	if err != nil {
		return err
	}
	_, err = downloadAndSetServer(httpClient, url, serverDir)
	return err
}

// ── NeoForge ───────────────────────────────────────────────────────────────

func (h Handler) installNeoForge(serverDir, mcVersion, neoVersion, javaPath string) error {
	installerURL := neoforgeDownloadURL(neoVersion)
	installerPath := filepath.Join(serverDir, "neoforge-installer.jar")

	// Download installer
	resp, err := httpClient.R().SetOutput(installerPath).Get(installerURL)
	if err != nil {
		return fmt.Errorf("neoforge download: %w", err)
	}
	if !resp.IsSuccess() {
		return fmt.Errorf("neoforge: status %d", resp.StatusCode())
	}

	// Run installer: java -jar installer.jar --installServer
	cmd := exec.Command(javaPath, "-jar", installerPath, "--installServer")
	cmd.Dir = serverDir
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("neoforge install: %w\n%s", err, string(output))
	}

	// Clean up installer
	os.Remove(installerPath)

	// Find the produced server JAR
	entries, err := os.ReadDir(serverDir)
	if err != nil {
		return fmt.Errorf("neoforge: read dir: %w", err)
	}

	var serverJar string
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".jar") {
			continue
		}
		if strings.Contains(entry.Name(), "neoforge-") {
			serverJar = entry.Name()
			break
		}
	}
	if serverJar == "" {
		return errors.New("neoforge: server jar not found after install")
	}

	// Rename to server.jar
	oldPath := filepath.Join(serverDir, serverJar)
	newPath := filepath.Join(serverDir, "server.jar")
	os.Remove(newPath)
	return os.Rename(oldPath, newPath)
}

// ── Forge ──────────────────────────────────────────────────────────────────

func (h Handler) installForge(serverDir, mcVersion, forgeVersion, javaPath string) error {
	installerURL := forgeDownloadURL(forgeVersion)
	installerPath := filepath.Join(serverDir, "forge-installer.jar")

	// Download installer
	resp, err := httpClient.R().SetOutput(installerPath).Get(installerURL)
	if err != nil {
		return fmt.Errorf("forge download: %w", err)
	}
	if !resp.IsSuccess() {
		return fmt.Errorf("forge: status %d", resp.StatusCode())
	}

	// Run installer: java -jar installer.jar --installServer
	cmd := exec.Command(javaPath, "-jar", installerPath, "--installServer")
	cmd.Dir = serverDir
	output, err := cmd.CombinedOutput()
	if err != nil {
		// Forge installer may return non-zero even on success
		// Check if the server JAR was created
		if !existsFile(filepath.Join(serverDir, fmt.Sprintf("forge-%s.jar", forgeVersion))) {
			return fmt.Errorf("forge install: %w\n%s", err, string(output))
		}
	}

	// Clean up installer
	os.Remove(installerPath)

	// Find the produced server JAR
	entries, err := os.ReadDir(serverDir)
	if err != nil {
		return fmt.Errorf("forge: read dir: %w", err)
	}

	var serverJar string
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".jar") {
			continue
		}
		if strings.Contains(entry.Name(), "forge-") && !strings.Contains(entry.Name(), "installer") {
			serverJar = entry.Name()
			break
		}
	}
	if serverJar == "" {
		return errors.New("forge: server jar not found after install")
	}

	// Rename to server.jar
	oldPath := filepath.Join(serverDir, serverJar)
	newPath := filepath.Join(serverDir, "server.jar")
	os.Remove(newPath)
	return os.Rename(oldPath, newPath)
}

// ── Quilt ──────────────────────────────────────────────────────────────────

func (h Handler) installQuilt(serverDir, mcVersion, loaderVersion string) error {
	url, err := quiltDownloadURL(mcVersion, loaderVersion)
	if err != nil {
		return err
	}
	_, err = downloadAndSetServer(httpClient, url, serverDir)
	return err
}

// ── Magma ──────────────────────────────────────────────────────────────────

func (h Handler) installMagma(serverDir, mcVersion, buildID string) error {
	url := fmt.Sprintf("https://api.magmafoundation.net/api/v2/build/%s/download", buildID)
	_, err := downloadAndSetServer(httpClient, url, serverDir)
	return err
}

// ── Fabric (from build version) ────────────────────────────────────────────

func (h Handler) installFabricFromBuild(serverDir, mcVersion, loaderVersion string) error {
	// Fetch the installer URL from Fabric meta
	var result fabricLoaderResp
	resp, err := httpClient.R().SetResult(&result).Get(
		"https://meta.fabricmc.net/v2/versions/loader/" + mcVersion)
	if err != nil {
		return fmt.Errorf("fabric versions: %w", err)
	}
	if !resp.IsSuccess() || len(result) == 0 {
		return fmt.Errorf("fabric: no versions for %s", mcVersion)
	}

	var launcherURL string

	for _, entry := range result {
		if len(entry) == 0 {
			continue
		}
		loader := entry[0].Loader
		if loaderVersion != "" && loader.Version != loaderVersion {
			continue
		}
		// Try server launcher
		var launcher struct{ URL string }
		resp2, _ := httpClient.R().SetResult(&launcher).Get(
			"https://meta.fabricmc.net/v2/versions/loader/" + mcVersion + "/" + loader.Version + "/server/legacy")
		if resp2.IsSuccess() && launcher.URL != "" {
			launcherURL = launcher.URL
		}
		break
	}

	if launcherURL == "" {
		return fmt.Errorf("fabric: no server launcher for MC %s loader %s", mcVersion, loaderVersion)
	}

	_, err = downloadAndSetServer(httpClient, launcherURL, serverDir)
	return err
}
