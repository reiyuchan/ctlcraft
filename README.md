# Blocks Launcher

A self-hosted Minecraft server management dashboard. Download server JARs, manage server lifecycle, configure `server.properties`, search and install mods/plugins, and stream real-time console output — all through a web UI.

## Features

- **Server Lifecycle** — Download Paper, Vanilla, or Fabric server JARs. Start/stop the server with a single click. Stream live console output via WebSocket.
- **Server Properties** — Read and edit `server.properties` through a form UI.
- **Mod Management** — Search Modrinth for mods (Fabric/NeoForge/Quilt), browse versions, install to `mods/`.
- **Plugin Management** — Search Modrinth and Hangar (Paper) for plugins, install to `plugins/`.
- **Java Detection** — Automatically detects installed Java versions on your system.
- **Web UI** — Vue 3 SPA served by the Go backend. No separate frontend server needed.

## Quick Start

Download a pre-built binary from the `bin/` directory:

```
./bin/ctlcraft
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

The server stores data in `~/ctlcraft/servers/default/` by default. Set `APPDATA` on Windows to change the data directory.

### Command Line

```sh
# Run (uses default port 8000)
./ctlcraft

# Run on a different port
./ctlcraft --port 8080

# Stop: Ctrl+C or send SIGTERM
```

## Building from Source

### Prerequisites

- **Go** 1.21+
- **Node.js** 18+
- **npm**

### Build Steps

```sh
# 1. Build the frontend (outputs to internal/ui/dist/)
cd frontend
npm install
npm run build
cd ..

# 2. Build the Go backend
go build -ldflags="-s -w" -o bin/ctlcraft ./cmd/main.go

# 3. (Optional) Cross-compile for Windows
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o bin/ctlcraft.exe ./cmd/main.go
```

The final binaries are placed in `bin/`.

## Project Structure

```
ctlcraft/
├── cmd/
│   └── main.go              # Entry point, signal handling
├── internal/
│   ├── config/
│   │   └── config.go        # Data paths, default RAM/JVM flags
│   ├── mc/
│   │   ├── server.go        # Java process lifecycle (start/stop/send)
│   │   └── serverproperties.go  # server.properties read/write
│   ├── server/
│   │   ├── api.go           # HTTP route handlers (Handler struct)
│   │   ├── helpers.go       # HTTP client, search, download helpers
│   │   ├── server.go        # Fiber app setup, DI
│   │   └── websocket.go     # WebSocket console streaming
│   └── ui/
│       ├── ui.go            # Embed + static file handler
│       └── dist/             # Built frontend (gitignored, rebuilt on npm build)
├── frontend/
│   └── src/                 # Vue 3 frontend source
│       ├── api.ts           # HTTP client for backend
│       ├── store.ts         # Reactive state
│       └── pages/           # Dashboard, mods, plugins, settings, etc.
├── bin/
│   ├── ctlcraft            # Linux binary
│   └── ctlcraft.exe        # Windows binary
└── go.mod
```

## API Reference

The backend serves both the web UI and a REST API on the same port.

### Server Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/server/info` | Check if server.jar, eula.txt, server.properties exist |
| GET | `/api/server/dir` | Get server data directory path |
| POST | `/api/server/dir/ensure` | Create server directory |
| GET | `/api/server/props` | Read server.properties |
| POST | `/api/server/props` | Save server.properties |
| GET | `/api/server/eula` | Check if EULA is accepted |
| POST | `/api/server/eula/accept` | Accept EULA |
| POST | `/api/server/jar/download` | Download server JAR |
| POST | `/api/server/start` | Start MC server |
| POST | `/api/server/stop` | Stop MC server |
| POST | `/api/server/command` | Send command to running server |

### Mods & Plugins

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/mods/search` | Search Modrinth mods |
| GET | `/api/mods/versions/:id` | Get versions for a mod |
| POST | `/api/mods/download` | Download/install a mod |
| GET | `/api/mods/installed` | List installed mods |
| POST | `/api/mods/delete` | Delete a mod |
| POST | `/api/plugins/search` | Search Modrinth + Hangar plugins |
| POST | `/api/plugins/download` | Download/install a plugin |
| GET | `/api/plugins/installed` | List installed plugins |
| POST | `/api/plugins/delete` | Delete a plugin |

### Versions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/versions/paper/:mcVersion/builds` | List Paper builds |
| GET | `/api/versions/paper/:mcVersion/build/:build/url` | Get Paper JAR download URL |
| GET | `/api/versions/vanilla` | List Vanilla versions |
| POST | `/api/versions/vanilla/url` | Get Vanilla JAR download URL |
| POST | `/api/versions/fabric/install` | Install Fabric + loader for MC version |

### Other

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/java/detect` | Detect installed Java versions |
| GET | `/api/java/versions` | List available Java versions from Adoptium |
| POST | `/api/java/download` | Download and install Java to `~/ctlcraft/java/` |
| POST | `/api/folder/open` | Open a folder in system file manager |

### WebSocket

Connect to `ws://localhost:8000/ws` for real-time console streaming. The server sends server output as plain text messages. Send commands as plain text to execute them.

## Configuration

Default settings (can be changed in the UI):

| Setting | Default |
|---------|---------|
| Port | 8000 |
| Server Directory | `~/ctlcraft/servers/default/` |
| Min RAM | 2G |
| Max RAM | 4G |
| JVM Flags | G1GC tuned flags |

## Architecture

- **Backend**: Go + Fiber v2 web framework. MC server runs as a child process. stdout/stderr streamed to WebSocket clients.
- **Frontend**: Vue 3 (Composition API), TypeScript, Vite. Communicates with backend over HTTP and WebSocket.
- **Embedding**: Frontend built to `internal/ui/dist/`, embedded into the binary via `go:embed`. Single self-contained binary.
