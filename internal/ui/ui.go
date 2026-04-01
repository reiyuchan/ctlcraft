package ui

import (
	"embed"
	"io"
	"io/fs"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
)

//go:embed dist
var staticFS embed.FS

func SetFS(fs embed.FS) {
	staticFS = fs
}

func Handler() fiber.Handler {
	sub, _ := fs.Sub(staticFS, "dist")
	httpFS := http.FS(sub)

	return func(c *fiber.Ctx) error {
		p := c.Path()
		if len(p) > 1 && (p[:4] == "/api" || p[:4] == "/ws/") {
			return c.Next()
		}

		if p == "/" {
			p = "/index.html"
		}

		f, err := httpFS.Open(p[1:])
		if err != nil {
			f2, err2 := httpFS.Open("/index.html")
			if err2 != nil {
				return nil
			}
			data, _ := io.ReadAll(f2)
			f2.Close()
			c.Set("Content-Type", "text/html")
			return c.Send(data)
		}
		data, err := io.ReadAll(f)
		f.Close()
		if err != nil {
			return nil
		}
		c.Set("Content-Type", ctypeFromExt(p))
		return c.Send(data)
	}
}

func ctypeFromExt(name string) string {
	switch {
	case strings.HasSuffix(name, ".js"):
		return "application/javascript"
	case strings.HasSuffix(name, ".html"):
		return "text/html"
	case strings.HasSuffix(name, ".css"):
		return "text/css"
	case strings.HasSuffix(name, ".svg"):
		return "image/svg+xml"
	case strings.HasSuffix(name, ".png"):
		return "image/png"
	case strings.HasSuffix(name, ".ico"):
		return "image/x-icon"
	default:
		return "application/octet-stream"
	}
}
