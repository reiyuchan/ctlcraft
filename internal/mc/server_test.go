package mc

import (
	"testing"
)

func TestNewServer(t *testing.T) {
	s := New()
	if s == nil {
		t.Fatal("New() returned nil")
	}
	if cap(s.output) != 256 {
		t.Errorf("output channel cap = %d, want 256", cap(s.output))
	}
}

func TestServerIsRunning(t *testing.T) {
	s := New()
	if s.IsRunning() {
		t.Error("IsRunning() = true, want false")
	}
}

func TestServerOutput(t *testing.T) {
	s := New()
	ch := s.Output()
	if ch == nil {
		t.Error("Output() returned nil")
	}
}

func TestServerSendBeforeStart(t *testing.T) {
	s := New()
	err := s.Send("test")
	if err != nil {
		t.Errorf("Send() before start: %v", err)
	}
}

func TestServerStopBeforeStart(t *testing.T) {
	s := New()
	err := s.Stop()
	if err != nil {
		t.Errorf("Stop() before start: %v", err)
	}
}
