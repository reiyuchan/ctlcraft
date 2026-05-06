package ui

import (
	"testing"
)

func TestCtypeFromExt(t *testing.T) {
	tests := []struct {
		name string
		ext  string
		want string
	}{
		{"js file", "app.js", "application/javascript"},
		{"html file", "index.html", "text/html"},
		{"css file", "style.css", "text/css"},
		{"svg file", "icon.svg", "image/svg+xml"},
		{"png file", "image.png", "image/png"},
		{"ico file", "favicon.ico", "image/x-icon"},
		{"unknown", "data.bin", "application/octet-stream"},
		{"no extension", "Makefile", "application/octet-stream"},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := ctypeFromExt(tc.ext)
			if got != tc.want {
				t.Errorf("ctypeFromExt(%q) = %q, want %q", tc.ext, got, tc.want)
			}
		})
	}
}
