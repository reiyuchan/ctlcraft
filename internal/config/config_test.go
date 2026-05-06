package config

import (
	"testing"
)

func TestConfigDefaults(t *testing.T) {
	cfg := New()

	if cfg.Port != Port {
		t.Errorf("Port = %d, want %d", cfg.Port, Port)
	}
	if cfg.MaxRAM != MaxRAM {
		t.Errorf("MaxRAM = %s, want %s", cfg.MaxRAM, MaxRAM)
	}
	if cfg.MinRAM != MinRAM {
		t.Errorf("MinRAM = %s, want %s", cfg.MinRAM, MinRAM)
	}
	if cfg.JVMFlags != JVMFlags {
		t.Errorf("JVMFlags = %s, want %s", cfg.JVMFlags, JVMFlags)
	}
	if cfg.ServerDir == "" {
		t.Error("ServerDir should not be empty")
	}
	if cfg.DataDir == "" {
		t.Error("DataDir should not be empty")
	}
}

func TestConfigCustomPort(t *testing.T) {
	CustomPort = 9000
	defer func() { CustomPort = 0 }()

	cfg := New()
	if cfg.Port != 9000 {
		t.Errorf("Port = %d, want 9000", cfg.Port)
	}
}
