# ctlcraft

A self-hosted Minecraft server management dashboard with a web UI. Download server JARs, manage server lifecycle, configure `server.properties`, search and install mods/plugins, and stream real-time console output — all through a browser.

## Features

- **Server Lifecycle** — Start, stop, restart, and monitor your Minecraft server from the browser.
- **Console Streaming** — Real-time console output via WebSocket. Send commands directly from the UI.
- **Server Software** — Install and manage Paper, Vanilla, Purpur, Folia, Fabric, Forge, NeoForge, Quilt, Magma, and Spigot.
- **Server Properties** — Read and edit `server.properties` through a form UI.
- **Mod Management** — Search Modrinth for mods (Fabric/NeoForge/Quilt), browse versions, install to `mods/`.
- **Plugin Management** — Search Modrinth and Hangar for plugins (Paper/Spigot), install to `plugins/`.
- **Java Management** — Auto-detect installed Java versions, browse Adoptium releases, and download Java directly.
- **Player Management** — View connected players, ops, whitelist.
- **World Management** — Browse and manage world files.
- **Single Binary** — Frontend is embedded into the Go binary via `go:embed`. No separate frontend server needed.

## Screenshots

> Screenshots coming soon.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Browser (Vue 3 SPA)                │
│  Dashboard │ Console │ Mods │ Plugins │ Settings ...│
└──────────┬───────────────────────────────┬───────────┘
           │ HTTP REST API                 │ WebSocket
           ▼                               ▼
┌──────────────────────────────────────────────────────┐
│              Go Backend (Fiber v2)                   │
│  ┌─────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │  API    │ │WebSocket │ │  Java Process         │  │
│  │ Handlers│ │ Console  │ │  (Minecraft Server)   │  │
│  └─────────┘ └──────────┘ └──────────────────────┘  │
│          │                                           │
│          ▼                                           │
│  ┌──────────────────┐  ┌──────────────────────┐     │
│  │  Modrinth API    │  │  Hangar API          │     │
│  │  Adoptium API    │  │  Paper/Forge APIs    │     │
│  └──────────────────┘  └──────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

## Quick Start

### Pre-built Binaries

Download a binary from the [releases](https://github.com/reiyuchan/ctlcraft/releases) page (or the `bin/` directory):

```sh
./bin/ctlcraft
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Building from Source

**Prerequisites:**

- Go 1.21+
- Node.js 18+
- npm

```sh
# 1. Build the frontend
cd frontend
npm install
npm run build
cd ..

# 2. Build the Go backend
go build -ldflags="-s -w" -o bin/ctlcraft ./cmd/main.go

# 3. Cross-compile for Windows
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o bin/ctlcraft.exe ./cmd/main.go
```

## Usage

```
./ctlcraft [--port 8000]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--port` | `8000` | HTTP server port |

Open the web UI at `http://localhost:8000`. The server data is stored in `~/ctlcraft/servers/default/` by default.

### First-time Setup

1. Open the web UI.
2. Go to **Java** page — detect or download a Java runtime.
3. Go to **Versions** page — select a server software and version to install.
4. Accept the EULA on the **Dashboard**.
5. Configure `server.properties` on the **Settings** page.
6. Click **Start** on the **Dashboard**.
7. Use the **Console** page to interact with the running server.

## Project Structure

```
ctlcraft/
├── cmd/
│   └── main.go                  # Entry point, signal handling
├── internal/
│   ├── config/
│   │   └── config.go            # Data paths, default RAM/JVM flags
│   ├── mc/
│   │   ├── server.go            # Java process lifecycle (start/stop/send)
│   │   └── serverproperties.go  # server.properties read/write
│   ├── java/
│   │   └── java_versions.json   # Bundled Java version metadata
│   ├── server/
│   │   ├── server.go            # Fiber app setup, DI
│   │   ├── api.go               # HTTP route handlers
│   │   ├── install.go           # Server software installer
│   │   ├── versions.go          # Version listing endpoints
│   │   ├── helpers.go           # HTTP client, search, download helpers
│   │   └── websocket.go         # WebSocket console streaming
│   └── ui/
│       ├── ui.go                # Embed + static file handler
│       └── dist/                # Built frontend (gitignored)
├── frontend/
│   └── src/
│       ├── App.vue              # Root component
│       ├── main.ts              # Vue entry point
│       ├── api.ts               # HTTP client + SSE events
│       ├── store.ts             # Reactive state store
│       └── pages/               # UI pages
│           ├── DashboardPage.vue
│           ├── ConsolePage.vue
│           ├── PlayersPage.vue
│           ├── WorldsPage.vue
│           ├── ModsPage.vue
│           ├── PluginsPage.vue
│           ├── JavaPage.vue
│           ├── ServerVersionsPage.vue
│           └── SettingsPage.vue
├── bin/                         # Pre-built binaries
├── go.mod
└── go.sum
```

## API Reference

### Server Management

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/server/info` | Check if server.jar, eula.txt, server.properties exist |
| GET    | `/api/server/dir` | Get server data directory path |
| POST   | `/api/server/dir/ensure` | Create server directory |
| GET    | `/api/server/props` | Read server.properties |
| POST   | `/api/server/props` | Save server.properties |
| GET    | `/api/server/eula` | Check if EULA is accepted |
| POST   | `/api/server/eula/accept` | Accept EULA |
| POST   | `/api/server/start` | Start MC server |
| POST   | `/api/server/stop` | Stop MC server |
| POST   | `/api/server/command` | Send command to running server |
| POST   | `/api/server/install` | Install any server software |

### Mods & Plugins

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/mods/search` | Search Modrinth mods |
| GET    | `/api/mods/versions/:id` | Get versions for a mod |
| POST   | `/api/mods/download` | Download/install a mod |
| GET    | `/api/mods/installed` | List installed mods |
| POST   | `/api/mods/delete` | Delete a mod |
| POST   | `/api/plugins/search` | Search Modrinth + Hangar plugins |
| POST   | `/api/plugins/download` | Download/install a plugin |
| GET    | `/api/plugins/installed` | List installed plugins |
| POST   | `/api/plugins/delete` | Delete a plugin |

### Server Software Versions

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/versions/paper/:mc/builds` | List Paper builds |
| GET    | `/api/versions/paper/:mc/build/:build/url` | Get Paper JAR download URL |
| GET    | `/api/versions/vanilla` | List Vanilla versions |
| POST   | `/api/versions/vanilla/url` | Get Vanilla JAR download URL |
| POST   | `/api/versions/fabric/install` | Install Fabric + loader for MC version |
| GET    | `/api/versions/purpur/:mc` | List Purpur builds |
| GET    | `/api/versions/folia/:mc` | List Folia builds |
| GET    | `/api/versions/folia/:mc/build/:build/url` | Get Folia download URL |
| GET    | `/api/versions/neoforge/:mc` | List NeoForge versions |
| GET    | `/api/versions/forge/:mc` | List Forge versions |
| GET    | `/api/versions/quilt/:mc` | List Quilt loader versions |
| GET    | `/api/versions/magma/:mc` | List Magma builds |
| GET    | `/api/versions/spigot` | Get Spigot info |

### Java

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/java/detect` | Detect installed Java versions |
| GET    | `/api/java/versions` | List available Java versions from Adoptium |
| POST   | `/api/java/download` | Download and install Java |

### Other

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/folder/open` | Open a folder in system file manager |

### WebSocket

Connect to `ws://localhost:8000/ws` for real-time console streaming. The server sends output as plain text messages. Send commands as plain text to execute them.

### Server-Sent Events

| Event | Endpoint | Description |
|-------|----------|-------------|
| `server-log` | `/api/events/server-log` | Console log lines |
| `server-stopped` | `/api/events/server-stopped` | Server process ended |
| `server-error` | `/api/events/server-error` | Server error events |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Port | `8000` | HTTP server port |
| Server Directory | `~/ctlcraft/servers/default/` | Minecraft server data directory |
| Min RAM | `2G` | Minimum JVM heap size |
| Max RAM | `4G` | Maximum JVM heap size |
| JVM Flags | G1GC-tuned flags | Additional JVM arguments |

## Tech Stack

- **Backend**: Go, Fiber v2, go-resty, zap logging
- **Frontend**: Vue 3 (Composition API), TypeScript, Vite
- **Embedded UI**: Single binary via `go:embed`
- **APIs**: Modrinth, Hangar, PaperMC, Adoptium, Mojang

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request.

### Development

```sh
# Run the backend with hot-reload (using Air or similar)
go run ./cmd/main.go

# Run the frontend dev server
cd frontend && npm run dev
```

## License

[MIT](LICENSE) © reiyuchan
