package server

import (
	"testing"
)

func TestSoftwareConstants(t *testing.T) {
	if SoftwareVanilla != "Vanilla" {
		t.Errorf("SoftwareVanilla = %q, want 'Vanilla'", SoftwareVanilla)
	}
	if SoftwarePaper != "Paper" {
		t.Errorf("SoftwarePaper = %q, want 'Paper'", SoftwarePaper)
	}
	if SoftwareFabric != "Fabric" {
		t.Errorf("SoftwareFabric = %q, want 'Fabric'", SoftwareFabric)
	}
	if SoftwareForge != "Forge" {
		t.Errorf("SoftwareForge = %q, want 'Forge'", SoftwareForge)
	}
	if SoftwareNeoForge != "NeoForge" {
		t.Errorf("SoftwareNeoForge = %q, want 'NeoForge'", SoftwareNeoForge)
	}
	if SoftwarePurpur != "Purpur" {
		t.Errorf("SoftwarePurpur = %q, want 'Purpur'", SoftwarePurpur)
	}
	if SoftwareFolia != "Folia" {
		t.Errorf("SoftwareFolia = %q, want 'Folia'", SoftwareFolia)
	}
	if SoftwareQuilt != "Quilt" {
		t.Errorf("SoftwareQuilt = %q, want 'Quilt'", SoftwareQuilt)
	}
	if SoftwareMagma != "Magma" {
		t.Errorf("SoftwareMagma = %q, want 'Magma'", SoftwareMagma)
	}
	if SoftwareSpigot != "Spigot" {
		t.Errorf("SoftwareSpigot = %q, want 'Spigot'", SoftwareSpigot)
	}
}

func TestSpigotInfo(t *testing.T) {
	info := spigotInfo()
	if len(info) != 1 {
		t.Fatalf("spigotInfo() length = %d, want 1", len(info))
	}
	note, ok := info[0]["note"]
	if !ok {
		t.Fatal("spigotInfo() missing 'note' key")
	}
	if note == "" {
		t.Error("spigotInfo() note is empty")
	}
}

func TestNeoforgeDownloadURL(t *testing.T) {
	url := neoforgeDownloadURL("21.0.123")
	want := "https://maven.neoforged.net/releases/net/neoforged/neoforge/21.0.123/neoforge-21.0.123-installer.jar"
	if url != want {
		t.Errorf("neoforgeDownloadURL = %q, want %q", url, want)
	}
}

func TestForgeDownloadURL(t *testing.T) {
	url := forgeDownloadURL("1.21-51.0.33")
	want := "https://maven.minecraftforge.net/net/minecraftforge/forge/1.21-51.0.33/forge-1.21-51.0.33-installer.jar"
	if url != want {
		t.Errorf("forgeDownloadURL = %q, want %q", url, want)
	}
}
