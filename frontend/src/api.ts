// api.ts — HTTP API wrapper for Go backend
// Mirrors the Tauri command interface but calls Go Fiber HTTP endpoints

const BASE = ''

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function apiVoid(path: string, opts?: RequestInit): Promise<void> {
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ServerProps {
  server_name: string
  motd: string
  max_players: number
  difficulty: string
  gamemode: string
  pvp: boolean
  online_mode: boolean
  hardcore: boolean
  white_list: boolean
  spawn_animals: boolean
  spawn_monsters: boolean
  spawn_npcs: boolean
  view_distance: number
  simulation_distance: number
  port: number
  level_type: string
}

export interface ServerInfo {
  server_dir: string
  has_server_jar: boolean
  has_eula: boolean
  has_properties: boolean
}

export interface ModSearchItem {
  id: string; slug: string; title: string; description: string
  author: string; downloads: string; latest_version: string
  icon_url: string; categories: string[]; loaders: string[]; source: string
}

export interface PluginSearchItem {
  id: string; slug: string; name: string; description: string
  author: string; downloads: string; latest_version: string
  icon_url: string; categories: string[]; loaders: string[]; source: string
}

export interface InstalledItem {
  file_name: string; name: string; version: string; size: string; source: string
}

export interface VanillaVersion {
  id: string; type: string; url: string
}

// ── API Interface ────────────────────────────────────────────────────────────

export const api = {
  // Server
  getServerDir: () => apiFetch<string>('/api/server/dir'),
  ensureServerDir: () => apiFetch<string>('/api/server/dir/ensure'),
  readServerProps: () => apiFetch<ServerProps>('/api/server/props'),
  saveServerProps: (props: ServerProps) => apiVoid('/api/server/props', { method: 'POST', body: JSON.stringify(props) }),
  acceptEula: () => apiVoid('/api/server/eula/accept', { method: 'POST' }),
  checkEula: () => apiFetch<boolean>('/api/server/eula'),
  downloadServerJar: (url: string) => apiVoid('/api/server/jar/download', { method: 'POST', body: JSON.stringify({ url }) }),
  startServer: (opts: { javaPath?: string; minRam?: string; maxRam?: string; jvmFlags?: string }) =>
    apiVoid('/api/server/start', { method: 'POST', body: JSON.stringify(opts) }),
  stopServer: () => apiVoid('/api/server/stop', { method: 'POST' }),
  sendCommand: (command: string) => apiVoid('/api/server/command', { method: 'POST', body: JSON.stringify({ command }) }),
  getActiveInfo: () => apiFetch<ServerInfo>('/api/server/info'),

  // Java
  detectJava: () => apiFetch<string[]>('/api/java/detect'),

  // Folders
  openFolder: (path: string) => apiVoid('/api/folder/open', { method: 'POST', body: JSON.stringify({ path }) }),

  // Mods
  searchMods: (query: string, loaders?: string[], gameVersion?: string) =>
    apiFetch<ModSearchItem[]>('/api/mods/search', { method: 'POST', body: JSON.stringify({ query, loaders, gameVersion }) }),
  getModVersions: (projectId: string) => apiFetch<ModSearchItem[]>('/api/mods/versions/' + projectId),
  downloadMod: (projectId: string, versionId?: string) =>
    apiVoid('/api/mods/download', { method: 'POST', body: JSON.stringify({ projectId, versionId }) }),
  getInstalledMods: () => apiFetch<InstalledItem[]>('/api/mods/installed'),
  deleteMod: (fileName: string) => apiVoid('/api/mods/delete', { method: 'POST', body: JSON.stringify({ fileName }) }),

  // Plugins
  searchPlugins: (query: string) =>
    apiFetch<PluginSearchItem[]>('/api/plugins/search', { method: 'POST', body: JSON.stringify({ query }) }),
  downloadPlugin: (slug: string, version?: string, source?: string) =>
    apiVoid('/api/plugins/download', { method: 'POST', body: JSON.stringify({ slug, version, source }) }),
  getInstalledPlugins: () => apiFetch<InstalledItem[]>('/api/plugins/installed'),
  deletePlugin: (fileName: string) => apiVoid('/api/plugins/delete', { method: 'POST', body: JSON.stringify({ fileName }) }),

  // Aliases for compatibility with page imports
  getServerDirPath: () => apiFetch<string>('/api/server/dir'),
  getServerJarPath: () => apiFetch<string>('/api/server/jar'),
  openServerFolder: () => apiVoid('/api/folder/open', { method: 'POST', body: JSON.stringify({ path: '' }) }),

  // Server versions
  getPaperBuilds: (mcVersion: string) => apiFetch<string[]>('/api/versions/paper/' + mcVersion + '/builds'),
  getPaperDownloadUrl: (mcVersion: string, build: string) =>
    apiFetch<string>('/api/versions/paper/' + mcVersion + '/build/' + build + '/url'),
  getVanillaVersions: () => apiFetch<VanillaVersion[]>('/api/versions/vanilla'),
  getVanillaDownloadUrl: (versionUrl: string) =>
    apiFetch<string>('/api/versions/vanilla/url', { method: 'POST', body: JSON.stringify({ versionUrl }) }),
  installFabricLoader: (mcVersion: string) =>
    apiVoid('/api/versions/fabric/install', { method: 'POST', body: JSON.stringify({ mcVersion }) }),
}

// ── Events (SSE) ──────────────────────────────────────────────────────────────

type LogCallback = (line: string) => void
type VoidCallback = () => void
type ErrorCallback = (error: string) => void

let _eventSources: Record<string, EventSource | null> = {
  'server-log': null,
  'server-stopped': null,
  'server-error': null,
} as Record<string, EventSource | null>

function createSSE(name: string, onMessage: (data: string) => void): () => void {
  const cleanup = (): void => {
    const es = _eventSources[name]
    if (es) {
      es.close()
      _eventSources[name] = null
    }
  }
  const es = new EventSource(`/api/events/${name}`)
  _eventSources[name] = es
  es.onmessage = (e) => onMessage(e.data)
  es.onerror = () => {
    cleanup()
  }
  return cleanup
}

export const events = {
  onServerLog(callback: LogCallback): () => void {
    return createSSE('server-log', callback)
  },
  onServerStopped(callback: VoidCallback): () => void {
    return createSSE('server-stopped', () => callback())
  },
  onServerError(callback: ErrorCallback): () => void {
    return createSSE('server-error', callback)
  },
}

// Re-export as `tauri` for backward compatibility with existing page imports
export const tauri = api
