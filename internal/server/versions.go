package server

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// ── Software type constants ─────────────────────────────────────────────────

type ServerSoftware string

const (
	SoftwareVanilla  ServerSoftware = "Vanilla"
	SoftwarePaper    ServerSoftware = "Paper"
	SoftwareSpigot   ServerSoftware = "Spigot"
	SoftwarePurpur   ServerSoftware = "Purpur"
	SoftwareFabric   ServerSoftware = "Fabric"
	SoftwareForge    ServerSoftware = "Forge"
	SoftwareNeoForge ServerSoftware = "NeoForge"
	SoftwareQuilt    ServerSoftware = "Quilt"
	SoftwareFolia    ServerSoftware = "Folia"
	SoftwareMagma    ServerSoftware = "Magma"
)

// ── Purpur ─────────────────────────────────────────────────────────────────

type purpurResp struct {
	Builds struct {
		All map[string]struct {
			Build  string `json:"build"`
			Result struct {
				Commits []struct {
					Desc string `json:"desc"`
				} `json:"commits"`
			} `json:"result"`
		} `json:"all"`
		Latest string `json:"latest"`
	} `json:"builds"`
}

func purpurVersions(mcVersion string) ([]fiber.Map, error) {
	var result purpurResp
	resp, err := httpClient.R().SetResult(&result).Get(
		"https://api.purpurmc.org/v2/purpur/" + mcVersion)
	if err != nil {
		return nil, fmt.Errorf("purpur: %w", err)
	}
	if !resp.IsSuccess() {
		return nil, fmt.Errorf("purpur: status %d", resp.StatusCode())
	}

	var builds []fiber.Map
	for id, b := range result.Builds.All {
		changelog := ""
		if len(b.Result.Commits) > 0 {
			changelog = b.Result.Commits[0].Desc
		}
		builds = append(builds, fiber.Map{
			"build":       b.Build,
			"id":          id,
			"changelog":   changelog,
			"is_latest":   id == result.Builds.Latest,
			"downloadUrl": fmt.Sprintf("https://api.purpurmc.org/v2/purpur/%s/%s/download", mcVersion, b.Build),
		})
	}
	if builds == nil {
		builds = []fiber.Map{}
	}
	return builds, nil
}

// ── Folia ──────────────────────────────────────────────────────────────────

type foliaVersionResp struct {
	Builds []int `json:"builds"`
}

type foliaBuildResp struct {
	Builds []struct {
		Build     int    `json:"build"`
		Downloads struct {
			Application struct {
				Name string `json:"name"`
			} `json:"application"`
		} `json:"downloads"`
	} `json:"builds"`
}

func foliaVersions(mcVersion string) ([]fiber.Map, error) {
	var result foliaVersionResp
	resp, err := httpClient.R().SetResult(&result).Get(
		"https://api.papermc.io/v2/projects/folia/versions/" + mcVersion)
	if err != nil {
		return nil, fmt.Errorf("folia: %w", err)
	}
	if !resp.IsSuccess() {
		return nil, fmt.Errorf("folia: status %d", resp.StatusCode())
	}

	var builds []fiber.Map
	for _, b := range result.Builds {
		builds = append(builds, fiber.Map{
			"build": strconv.Itoa(b),
			"id":    fmt.Sprintf("%s-%d", mcVersion, b),
		})
	}
	if builds == nil {
		builds = []fiber.Map{}
	}
	return builds, nil
}

func foliaDownloadURL(mcVersion, build string) (string, error) {
	var result foliaBuildResp
	resp, err := httpClient.R().SetResult(&result).Get(
		fmt.Sprintf("https://api.papermc.io/v2/projects/folia/versions/%s/builds/%s", mcVersion, build))
	if err != nil {
		return "", fmt.Errorf("folia download: %w", err)
	}
	if !resp.IsSuccess() || len(result.Builds) == 0 {
		return "", fmt.Errorf("folia: build %s not found", build)
	}
	target := result.Builds[len(result.Builds)-1]
	return fmt.Sprintf(
		"https://api.papermc.io/v2/projects/folia/versions/%s/builds/%s/downloads/%s",
		mcVersion, build, target.Downloads.Application.Name), nil
}

// ── NeoForge ───────────────────────────────────────────────────────────────

type neoforgeVersionResp struct {
	Versions []struct {
		Version  string `json:"version"`
		Display  string `json:"display"`
		Featured bool   `json:"featured"`
		Recommended bool `json:"recommended"`
	} `json:"versions"`
}

func neoforgeVersions(mcVersion string) ([]fiber.Map, error) {
	var result neoforgeVersionResp
	resp, err := httpClient.R().SetResult(&result).Get(
		"https://api.neoforged.net/api/v2/minecraft/" + mcVersion + "/versions")
	if err != nil {
		return nil, fmt.Errorf("neoforge: %w", err)
	}
	if !resp.IsSuccess() {
		return nil, fmt.Errorf("neoforge: status %d", resp.StatusCode())
	}

	var versions []fiber.Map
	for _, v := range result.Versions {
		versions = append(versions, fiber.Map{
			"version":     v.Version,
			"display":     v.Display,
			"featured":    v.Featured,
			"recommended": v.Recommended,
		})
	}
	if versions == nil {
		versions = []fiber.Map{}
	}
	return versions, nil
}

func neoforgeDownloadURL(neoVersion string) string {
	return fmt.Sprintf(
		"https://maven.neoforged.net/releases/net/neoforged/neoforge/%s/neoforge-%s-installer.jar",
		neoVersion, neoVersion)
}

// ── Forge ──────────────────────────────────────────────────────────────────

type forgePromotionsResp struct {
	Promos map[string]string `json:"promos"`
	Homepage string          `json:"homepage"`
}

func forgeVersions(mcVersion string) ([]fiber.Map, error) {
	var result forgePromotionsResp
	resp, err := httpClient.R().SetResult(&result).Get(
		"https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json")
	if err != nil {
		return nil, fmt.Errorf("forge: %w", err)
	}
	if !resp.IsSuccess() {
		return nil, fmt.Errorf("forge: status %d", resp.StatusCode())
	}

	var versions []fiber.Map
	seen := make(map[string]bool)
	for key, val := range result.Promos {
		parts := strings.SplitN(key, "-", 2)
		if len(parts) != 2 {
			continue
		}
		verMC := parts[0]
		if verMC != mcVersion {
			continue
		}
		channel := parts[1]
		forgeVer := val
		if seen[forgeVer] {
			continue
		}
		seen[forgeVer] = true
		versions = append(versions, fiber.Map{
			"version": forgeVer,
			"channel": channel,
		})
	}
	if versions == nil {
		versions = []fiber.Map{}
	}
	return versions, nil
}

func forgeDownloadURL(forgeVersion string) string {
	return fmt.Sprintf(
		"https://maven.minecraftforge.net/net/minecraftforge/forge/%s/forge-%s-installer.jar",
		forgeVersion, forgeVersion)
}

// ── Quilt ──────────────────────────────────────────────────────────────────

type quiltLoaderResp []struct {
	Loader struct {
		Version    string `json:"version"`
		Separator  string `json:"separator"`
		Build      int    `json:"build"`
		Maven      string `json:"maven"`
		Stable     bool   `json:"stable"`
	} `json:"loader"`
	HasLauncher bool   `json:"has_launcher"`
	Launcher    string `json:"launcher,omitempty"`
}

func quiltVersions(mcVersion string) ([]fiber.Map, error) {
	var result quiltLoaderResp
	resp, err := httpClient.R().SetResult(&result).Get(
		"https://meta.quiltmc.org/v3/versions/loader/" + mcVersion)
	if err != nil {
		return nil, fmt.Errorf("quilt: %w", err)
	}
	if !resp.IsSuccess() {
		return nil, fmt.Errorf("quilt: status %d", resp.StatusCode())
	}

	var versions []fiber.Map
	for _, v := range result {
		versions = append(versions, fiber.Map{
			"version":     v.Loader.Version,
			"stable":      v.Loader.Stable,
			"hasLauncher": v.HasLauncher,
			"launcher":    v.Launcher,
		})
	}
	if versions == nil {
		versions = []fiber.Map{}
	}
	return versions, nil
}

func quiltDownloadURL(mcVersion, loaderVersion string) (string, error) {
	var result quiltLoaderResp
	resp, err := httpClient.R().SetResult(&result).Get(
		"https://meta.quiltmc.org/v3/versions/loader/" + mcVersion)
	if err != nil {
		return "", fmt.Errorf("quilt download: %w", err)
	}
	if !resp.IsSuccess() {
		return "", fmt.Errorf("quilt: status %d", resp.StatusCode())
	}

	for _, v := range result {
		if v.Loader.Version == loaderVersion {
			return v.Launcher, nil
		}
	}
	return "", fmt.Errorf("quilt: loader %s not found for MC %s", loaderVersion, mcVersion)
}

// ── Magma ──────────────────────────────────────────────────────────────────

type magmaBuildsResp struct {
	Data []struct {
		ID     int    `json:"id"`
		MCVersion string `json:"mc_version"`
		Build  int    `json:"build"`
		Stable bool   `json:"stable"`
	} `json:"data"`
}

func magmaVersions(mcVersion string) ([]fiber.Map, error) {
	var result magmaBuildsResp
	resp, err := httpClient.R().SetResult(&result).Get(
		"https://api.magmafoundation.net/api/v2/minecraft/" + mcVersion + "/builds")
	if err != nil {
		return nil, fmt.Errorf("magma: %w", err)
	}
	if !resp.IsSuccess() {
		return nil, fmt.Errorf("magma: status %d", resp.StatusCode())
	}

	var builds []fiber.Map
	for _, b := range result.Data {
		builds = append(builds, fiber.Map{
			"id":     b.ID,
			"build":  b.Build,
			"stable": b.Stable,
		})
	}
	if builds == nil {
		builds = []fiber.Map{}
	}
	return builds, nil
}

// ── Spigot ─────────────────────────────────────────────────────────────────
// Spigot does not provide a public pre-built JAR API. BuildTools is required.
// We provide version info but cannot download directly.

func spigotInfo() []fiber.Map {
	return []fiber.Map{
		{"note": "Spigot does not provide a public download API for pre-built JARs. Use BuildTools to compile from source."},
	}
}

// ── Fabric versions ──────────────────────────────────────────────────────────

type fabricLoaderResp [][]struct {
	Loader struct {
		Version string `json:"version"`
		Build   int    `json:"build"`
		Stable  bool   `json:"stable"`
	} `json:"loader"`
	Intermediary struct {
		Version string `json:"version"`
	} `json:"intermediary"`
	LauncherMeta struct {
		Version int `json:"version"`
		Libraries struct {
			Server []struct {
				Name string `json:"name"`
				URL  string `json:"url"`
			} `json:"server"`
		} `json:"libraries"`
		MainClass struct {
			Server string `json:"server"`
		} `json:"main_class"`
	} `json:"launcher_meta"`
}

// ── Install request ────────────────────────────────────────────────────────

type installReq struct {
	Software  string `json:"software"`
	MCVersion string `json:"mcVersion"`
	Build     string `json:"build"`
}

// ── Version listing endpoints ──────────────────────────────────────────────

func (h Handler) purpurVersions(c *fiber.Ctx) error {
	mcVersion := c.Params("mcVersion")
	builds, err := purpurVersions(mcVersion)
	if err != nil {
		return errorResp(c, 500, err)
	}
	return c.JSON(builds)
}

func (h Handler) foliaVersions(c *fiber.Ctx) error {
	mcVersion := c.Params("mcVersion")
	builds, err := foliaVersions(mcVersion)
	if err != nil {
		return errorResp(c, 500, err)
	}
	return c.JSON(builds)
}

func (h Handler) foliaDownloadURL(c *fiber.Ctx) error {
	mcVersion := c.Params("mcVersion")
	build := c.Params("build")
	url, err := foliaDownloadURL(mcVersion, build)
	if err != nil {
		return errorResp(c, 500, err)
	}
	return c.JSON(fiber.Map{"url": url})
}

func (h Handler) neoforgeVersions(c *fiber.Ctx) error {
	mcVersion := c.Params("mcVersion")
	versions, err := neoforgeVersions(mcVersion)
	if err != nil {
		return errorResp(c, 500, err)
	}
	return c.JSON(versions)
}

func (h Handler) forgeVersions(c *fiber.Ctx) error {
	mcVersion := c.Params("mcVersion")
	versions, err := forgeVersions(mcVersion)
	if err != nil {
		return errorResp(c, 500, err)
	}
	return c.JSON(versions)
}

func (h Handler) quiltVersions(c *fiber.Ctx) error {
	mcVersion := c.Params("mcVersion")
	versions, err := quiltVersions(mcVersion)
	if err != nil {
		return errorResp(c, 500, err)
	}
	return c.JSON(versions)
}

func (h Handler) magmaVersions(c *fiber.Ctx) error {
	mcVersion := c.Params("mcVersion")
	builds, err := magmaVersions(mcVersion)
	if err != nil {
		return errorResp(c, 500, err)
	}
	return c.JSON(builds)
}

func (h Handler) spigotInfo(c *fiber.Ctx) error {
	return c.JSON(spigotInfo())
}
