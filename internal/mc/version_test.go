package mc

import (
	"testing"
)

func TestNewVersionManager(t *testing.T) {
	vm := NewVersionManager()
	if vm == nil {
		t.Fatal("NewVersionManager() returned nil")
	}
}
