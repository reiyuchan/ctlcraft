package mc

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDefaultProps(t *testing.T) {
	p := DefaultProps()
	if p.ServerName != "A Minecraft Server" {
		t.Errorf("ServerName = %q, want %q", p.ServerName, "A Minecraft Server")
	}
	if p.MaxPlayers != 20 {
		t.Errorf("MaxPlayers = %d, want 20", p.MaxPlayers)
	}
	if p.Gamemode != "survival" {
		t.Errorf("Gamemode = %q, want %q", p.Gamemode, "survival")
	}
	if p.Difficulty != "normal" {
		t.Errorf("Difficulty = %q, want %q", p.Difficulty, "normal")
	}
	if !p.AllowNether {
		t.Error("AllowNether = false, want true")
	}
	if !p.OnlineMode {
		t.Error("OnlineMode = false, want true")
	}
	if p.Hardcore {
		t.Error("Hardcore = true, want false")
	}
	if p.ServerPort != 25565 {
		t.Errorf("ServerPort = %d, want 25565", p.ServerPort)
	}
	if p.ViewDistance != 10 {
		t.Errorf("ViewDistance = %d, want 10", p.ViewDistance)
	}
}

func TestReadServerProperties_MissingFile(t *testing.T) {
	tmp := t.TempDir()
	props, err := ReadServerProperties(tmp)
	if err != nil {
		t.Fatalf("ReadServerProperties on empty dir: %v", err)
	}
	// Should return defaults
	if props.ServerName != "A Minecraft Server" {
		t.Errorf("ServerName = %q, want default", props.ServerName)
	}
}

func TestReadServerProperties_ValidFile(t *testing.T) {
	tmp := t.TempDir()
	content := `#Minecraft server properties
server-name=Test Server
server-port=25566
max-players=42
gamemode=creative
difficulty=hard
allow-nether=false
online-mode=false
pvp=false
hardcore=true
view-distance=8
simulation-distance=6
level-type=minecraft:flat
`
	os.WriteFile(filepath.Join(tmp, "server.properties"), []byte(content), 0644)

	props, err := ReadServerProperties(tmp)
	if err != nil {
		t.Fatalf("ReadServerProperties: %v", err)
	}

	if props.ServerName != "Test Server" {
		t.Errorf("ServerName = %q, want %q", props.ServerName, "Test Server")
	}
	if props.ServerPort != 25566 {
		t.Errorf("ServerPort = %d, want 25566", props.ServerPort)
	}
	if props.MaxPlayers != 42 {
		t.Errorf("MaxPlayers = %d, want 42", props.MaxPlayers)
	}
	if props.Gamemode != "creative" {
		t.Errorf("Gamemode = %q, want %q", props.Gamemode, "creative")
	}
	if props.Difficulty != "hard" {
		t.Errorf("Difficulty = %q, want %q", props.Difficulty, "hard")
	}
	if props.AllowNether {
		t.Error("AllowNether = true, want false")
	}
	if props.OnlineMode {
		t.Error("OnlineMode = true, want false")
	}
	if props.PVP {
		t.Error("PVP = true, want false")
	}
	if !props.Hardcore {
		t.Error("Hardcore = false, want true")
	}
	if props.ViewDistance != 8 {
		t.Errorf("ViewDistance = %d, want 8", props.ViewDistance)
	}
	if props.SimulationDistance != 6 {
		t.Errorf("SimulationDistance = %d, want 6", props.SimulationDistance)
	}
	if props.LevelType != "minecraft:flat" {
		t.Errorf("LevelType = %q, want %q", props.LevelType, "minecraft:flat")
	}
}

func TestReadServerProperties_EmptyLines(t *testing.T) {
	tmp := t.TempDir()
	content := "\n\n\n\n"
	os.WriteFile(filepath.Join(tmp, "server.properties"), []byte(content), 0644)

	props, err := ReadServerProperties(tmp)
	if err != nil {
		t.Fatalf("ReadServerProperties: %v", err)
	}
	if props.ServerName != "A Minecraft Server" {
		t.Errorf("ServerName = %q, want default", props.ServerName)
	}
}

func TestWriteServerProperties(t *testing.T) {
	tmp := t.TempDir()
	props := DefaultProps()
	props.ServerName = "Write Test"
	props.MaxPlayers = 10
	props.PVP = false

	err := WriteServerProperties(tmp, props)
	if err != nil {
		t.Fatalf("WriteServerProperties: %v", err)
	}

	// Read back
	read, err := ReadServerProperties(tmp)
	if err != nil {
		t.Fatalf("ReadServerProperties after write: %v", err)
	}

	if read.ServerName != "Write Test" {
		t.Errorf("ServerName = %q, want %q", read.ServerName, "Write Test")
	}
	if read.MaxPlayers != 10 {
		t.Errorf("MaxPlayers = %d, want 10", read.MaxPlayers)
	}
	if read.PVP {
		t.Error("PVP = true, want false")
	}
}

func TestBoolStr(t *testing.T) {
	if boolStr(true) != "true" {
		t.Errorf("boolStr(true) = %q, want %q", boolStr(true), "true")
	}
	if boolStr(false) != "false" {
		t.Errorf("boolStr(false) = %q, want %q", boolStr(false), "false")
	}
}
