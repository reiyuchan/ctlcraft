// store.ts — shared reactive state across all page components
import { reactive } from 'vue'

// ── Types ────────────────────────────────────────────────────────────────────

export type ServerStatus = 'running' | 'stopped' | 'starting'

export type StatTrend = 'up' | 'down' | 'neutral'

export interface Stat {
  icon: string
  label: string
  value: string
  trend: StatTrend
  trendVal: string
}

export interface ChartData {
  TPS: number[]
  RAM: number[]
  CPU: number[]
}

export type ChartMetric = keyof ChartData

export interface OnlinePlayer {
  name: string
  color: string
  time: string
  ping: number
}

export interface Player {
  name: string
  color: string
  online: boolean
  op: boolean
  lastSeen: string
  playtime: string
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR'

export type LogType = 'info' | 'warn' | 'error' | 'join' | 'chat' | 'cmd'

export interface LogEntry {
  time: string
  level: LogLevel
  type: LogType
  msg: string
}

export type Difficulty = 'peaceful' | 'easy' | 'normal' | 'hard'

export type Gamemode = 'survival' | 'creative' | 'adventure' | 'spectator'

export type LevelType =
  | 'minecraft:default'
  | 'minecraft:flat'
  | 'minecraft:large_biomes'
  | 'minecraft:amplified'

export interface ServerProps {
  serverName: string
  motd: string
  maxPlayers: number
  difficulty: Difficulty
  gamemode: Gamemode
  pvp: boolean
  onlineMode: boolean
  hardcore: boolean
  whiteList: boolean
  spawnAnimals: boolean
  spawnMonsters: boolean
  spawnNpcs: boolean
  viewDistance: number
  simulationDistance: number
  port: number
  levelType: LevelType
}

export interface World {
  name: string
  biome: string
  size: string
  seed: string
  active: boolean
  gradient: string
}

// ── Mods ─────────────────────────────────────────────────────────────────────

/** Loaders that run client/server mods (incompatible with plugins) */
export type ModLoaderType = 'Fabric' | 'Forge' | 'NeoForge'

/** Loaders that run server plugins (incompatible with mods) */
export type PluginLoaderType = 'Paper' | 'Spigot' | 'Purpur'

export type ModLoader = ModLoaderType | PluginLoaderType | 'Vanilla'

/** Which mod loader framework is currently installed on the server, if any */
export type InstalledModLoader = ModLoaderType | null

export type ItemCategory =
  | 'Performance'
  | 'World Generation'
  | 'Gameplay'
  | 'Utility'
  | 'Admin'
  | 'Economy'
  | 'Protection'
  | 'Chat'

export type ItemStatus = 'enabled' | 'disabled' | 'error' | 'update-available'

export type ModSource = 'Modrinth' | 'CurseForge' | 'Hangar' | 'Local'

export interface InstalledMod {
  id: string
  name: string
  version: string
  latestVersion: string
  author: string
  description: string
  category: ItemCategory
  loader: ModLoaderType
  fileSize: string
  status: ItemStatus
  source: ModSource
  icon: string
  fileName: string
}

export interface InstalledPlugin {
  id: string
  name: string
  version: string
  latestVersion: string
  author: string
  description: string
  category: ItemCategory
  loader: PluginLoaderType
  fileSize: string
  status: ItemStatus
  source: ModSource
  icon: string
  fileName: string
}

export interface ModSearchResult {
  id: string
  name: string
  author: string
  description: string
  category: ItemCategory
  downloads: string
  latestVersion: string
  loaders: ModLoaderType[]
  source: ModSource
  icon: string
  installed: boolean
}

export interface PluginSearchResult {
  id: string
  name: string
  author: string
  description: string
  category: ItemCategory
  downloads: string
  latestVersion: string
  loaders: PluginLoaderType[]
  source: ModSource
  icon: string
  installed: boolean
}

// ── Java ─────────────────────────────────────────────────────────────────────

export type JavaVendor =
  | 'Adoptium'
  | 'Oracle'
  | 'Microsoft'
  | 'Amazon Corretto'
  | 'Azul Zulu'

export type JavaInstallStatus =
  | 'installed'
  | 'installing'
  | 'update-available'
  | 'error'

export type JavaArch = 'x64' | 'aarch64'

export interface JavaInstallation {
  id: string
  vendor: JavaVendor
  majorVersion: number // e.g. 21
  fullVersion: string // e.g. "21.0.4+7"
  latestVersion: string // e.g. "21.0.5+11"
  arch: JavaArch
  installPath: string // e.g. "/opt/java/21"
  sizeOnDisk: string // e.g. "312 MB"
  status: JavaInstallStatus
  isActive: boolean // the one currently used to launch the server
  releaseType: 'LTS' | 'STS'
}

export interface JavaRelease {
  id: string
  vendor: JavaVendor
  majorVersion: number
  latestVersion: string
  arch: JavaArch
  releaseType: 'LTS' | 'STS'
  downloadSize: string
  minecraftVersions: string // e.g. "1.17 – 1.21+"
  recommended: boolean
  installed: boolean
}

// ── Server Versions ──────────────────────────────────────────────────────────

export type ServerSoftware =
  | 'Vanilla'
  | 'Paper'
  | 'Spigot'
  | 'Purpur'
  | 'Fabric'
  | 'Forge'
  | 'NeoForge'
  | 'Quilt'
  | 'Folia'
  | 'Magma'

export type ServerVersionStatus = 'installed' | 'downloading' | 'available'

export type ReleaseChannel = 'release' | 'snapshot' | 'beta' | 'alpha'

/** A specific build of a server software for a given MC version */
export interface ServerBuild {
  id: string
  software: ServerSoftware
  mcVersion: string // e.g. "1.21.4"
  build: string // e.g. "139" (Paper build) or "14.23.5.2859" (Forge)
  releaseDate: string
  channel: ReleaseChannel
  fileSize: string
  sha256: string
  changelog: string
  javaRequired: number // minimum Java major version
  status: ServerVersionStatus
  isActive: boolean // currently loaded by this server instance
  downloadUrl: string
}

/** Metadata about a server software type */
export interface ServerSoftwareMeta {
  id: ServerSoftware
  name: string
  icon: string
  description: string
  type: 'vanilla' | 'plugin' | 'mod' | 'hybrid'
  recommendedFor: string
  color: string
}

export interface Store {
  serverStatus: ServerStatus
  stats: Stat[]
  chartData: ChartData
  onlinePlayers: OnlinePlayer[]
  maxPlayers: number
  allPlayers: Player[]
  logs: LogEntry[]
  serverProps: ServerProps
  worlds: World[]
  // ── Mods (Fabric/Forge/NeoForge) ──
  installedModLoader: InstalledModLoader
  installedMods: InstalledMod[]
  modSearchResults: ModSearchResult[]
  isSearchingMods: boolean
  // ── Plugins (Paper/Spigot/Purpur) ──
  installedPlugins: InstalledPlugin[]
  pluginSearchResults: PluginSearchResult[]
  isSearchingPlugins: boolean
  // ── Java ──
  javaInstallations: JavaInstallation[]
  javaReleases: JavaRelease[]
  isInstallingJava: boolean
  // ── Server Versions ──
  serverBuilds: ServerBuild[]
  isDownloadingServer: boolean
  downloadingBuildId: string | null
  // ── Methods ──
  addLog(level: LogLevel, type: LogType, msg: string): void
  kickPlayer(name: string): void
  installMod(result: ModSearchResult): void
  uninstallMod(id: string): void
  toggleMod(id: string): void
  installPlugin(result: PluginSearchResult): void
  uninstallPlugin(id: string): void
  togglePlugin(id: string): void
  setActiveJava(id: string): void
  uninstallJava(id: string): void
  installJava(release: JavaRelease): void
  downloadServerBuild(build: ServerBuild): void
  deleteServerBuild(id: string): void
  setActiveServerBuild(id: string): void
  /** True if a mod loader (Fabric/Forge/NeoForge) is installed */
  readonly hasModLoader: boolean
  /** True if any mods are installed */
  readonly hasMods: boolean
  /** True if any plugins are installed */
  readonly hasPlugins: boolean
  /** The currently active Java installation, if any */
  readonly activeJava: JavaInstallation | undefined
  /** The currently active server build, if any */
  readonly activeServerBuild: ServerBuild | undefined
}

// ── Store ────────────────────────────────────────────────────────────────────

export const store = reactive<Store>({
  // ── Server ────────────────────────────────────────────────
  serverStatus: 'stopped',

  // ── Live stats (updated by ticker in App.vue) ─────────────
  stats: [
    {
      icon: '⚡',
      label: 'TPS',
      value: '20.0',
      trend: 'up',
      trendVal: '↑ stable',
    },
    { icon: '🧠', label: 'RAM', value: '3.2G', trend: 'up', trendVal: '↑ 64%' },
    { icon: '💻', label: 'CPU', value: '12%', trend: 'down', trendVal: '↓ 3%' },
    {
      icon: '👥',
      label: 'Players',
      value: '4/20',
      trend: 'up',
      trendVal: '↑ 2',
    },
  ],

  chartData: {
    TPS: [20, 20, 19.8, 20, 20, 18, 20, 20, 20, 17, 20, 20],
    RAM: [45, 48, 52, 55, 53, 58, 62, 60, 64, 63, 65, 64],
    CPU: [8, 10, 12, 11, 15, 22, 18, 12, 10, 14, 12, 11],
  },

  // ── Players ───────────────────────────────────────────────
  onlinePlayers: [
    { name: 'Notch', color: '#4ade80', time: '2h 14m', ping: 24 },
    { name: 'Herobrine', color: '#f87171', time: '45m', ping: 180 },
    { name: 'Dinnerbone', color: '#60a5fa', time: '1h 02m', ping: 55 },
    { name: 'Jeb_', color: '#a78bfa', time: '18m', ping: 8 },
  ],
  maxPlayers: 20,

  allPlayers: [
    {
      name: 'Notch',
      color: '#4ade80',
      online: true,
      op: true,
      lastSeen: 'Now',
      playtime: '142h',
    },
    {
      name: 'Herobrine',
      color: '#f87171',
      online: true,
      op: false,
      lastSeen: 'Now',
      playtime: '89h',
    },
    {
      name: 'Dinnerbone',
      color: '#60a5fa',
      online: true,
      op: true,
      lastSeen: 'Now',
      playtime: '221h',
    },
    {
      name: 'Jeb_',
      color: '#a78bfa',
      online: true,
      op: false,
      lastSeen: 'Now',
      playtime: '55h',
    },
    {
      name: 'xXDarkness',
      color: '#fb923c',
      online: false,
      op: false,
      lastSeen: '2 days ago',
      playtime: '12h',
    },
    {
      name: 'CreeperFan',
      color: '#34d399',
      online: false,
      op: false,
      lastSeen: '1 week ago',
      playtime: '7h',
    },
  ],

  // ── Console logs ──────────────────────────────────────────
  logs: [
    {
      time: '12:00:01',
      level: 'INFO',
      type: 'info',
      msg: 'Starting minecraft server version 1.21.4',
    },
    {
      time: '12:00:02',
      level: 'INFO',
      type: 'info',
      msg: 'Loading properties',
    },
    {
      time: '12:00:03',
      level: 'INFO',
      type: 'info',
      msg: 'Default game type: SURVIVAL',
    },
    {
      time: '12:00:04',
      level: 'INFO',
      type: 'info',
      msg: 'Preparing level "world"',
    },
    {
      time: '12:00:07',
      level: 'INFO',
      type: 'info',
      msg: 'Preparing spawn area: 83%',
    },
    {
      time: '12:00:08',
      level: 'INFO',
      type: 'info',
      msg: 'Done (3.142s)! For help, type "help"',
    },
    {
      time: '12:01:12',
      level: 'INFO',
      type: 'join',
      msg: 'Notch joined the game',
    },
    {
      time: '12:01:30',
      level: 'WARN',
      type: 'warn',
      msg: "Can't keep up! Is the server overloaded?",
    },
    {
      time: '12:02:00',
      level: 'INFO',
      type: 'join',
      msg: 'Herobrine joined the game',
    },
    {
      time: '12:03:15',
      level: 'ERROR',
      type: 'error',
      msg: 'java.lang.NullPointerException at net.minecraft...',
    },
    {
      time: '12:04:00',
      level: 'INFO',
      type: 'chat',
      msg: '<Notch> Hello everyone!',
    },
    {
      time: '12:05:00',
      level: 'INFO',
      type: 'join',
      msg: 'Dinnerbone joined the game',
    },
  ],

  // ── server.properties ─────────────────────────────────────
  serverProps: {
    serverName: 'My Minecraft Server',
    motd: 'A Minecraft Server',
    maxPlayers: 20,
    difficulty: 'normal',
    gamemode: 'survival',
    pvp: true,
    onlineMode: true,
    hardcore: false,
    whiteList: false,
    spawnAnimals: true,
    spawnMonsters: true,
    spawnNpcs: true,
    viewDistance: 10,
    simulationDistance: 10,
    port: 25565,
    levelType: 'minecraft:default',
  },

  // ── Worlds ────────────────────────────────────────────────
  worlds: [
    {
      name: 'world',
      biome: '🌲 Forest',
      size: '248 MB',
      seed: '1234567',
      active: true,
      gradient: 'linear-gradient(135deg,#166534,#15803d)',
    },
    {
      name: 'world_nether',
      biome: '🔥 Nether',
      size: '89 MB',
      seed: '1234567',
      active: false,
      gradient: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
    },
    {
      name: 'world_the_end',
      biome: '🌌 The End',
      size: '34 MB',
      seed: '1234567',
      active: false,
      gradient: 'linear-gradient(135deg,#1e1b4b,#312e81)',
    },
    {
      name: 'creative_world',
      biome: '✨ Creative',
      size: '12 MB',
      seed: '9876543',
      active: false,
      gradient: 'linear-gradient(135deg,#0c4a6e,#075985)',
    },
  ],

  // ── Mod loader framework installed on the server ──────────
  // e.g. 'Fabric' | 'Forge' | 'NeoForge' | null (vanilla/plugin server)
  installedModLoader: 'Fabric' as InstalledModLoader,

  // ── Installed mods (Fabric / Forge / NeoForge only) ───────
  installedMods: [
    {
      id: 'lithium',
      name: 'Lithium',
      version: '0.12.1',
      latestVersion: '0.12.1',
      author: 'jellysquid3',
      description: 'No-compromises game logic/server optimization mod.',
      category: 'Performance',
      loader: 'Fabric',
      fileSize: '412 KB',
      status: 'enabled',
      source: 'Modrinth',
      icon: '⚡',
      fileName: 'lithium-fabric-0.12.1.jar',
    },
    {
      id: 'sodium',
      name: 'Sodium',
      version: '0.5.8',
      latestVersion: '0.5.11',
      author: 'jellysquid3',
      description: 'Modern rendering engine and client-side optimization.',
      category: 'Performance',
      loader: 'Fabric',
      fileSize: '523 KB',
      status: 'update-available',
      source: 'Modrinth',
      icon: '🚀',
      fileName: 'sodium-fabric-0.5.8.jar',
    },
  ] as InstalledMod[],

  modSearchResults: [] as ModSearchResult[],
  isSearchingMods: false,

  // ── Installed plugins (Paper / Spigot / Purpur only) ───────
  installedPlugins: [
    {
      id: 'essentialsx',
      name: 'EssentialsX',
      version: '2.20.1',
      latestVersion: '2.21.0',
      author: 'EssentialsX Team',
      description: 'The essential plugin suite for Spigot/Paper servers.',
      category: 'Utility',
      loader: 'Paper',
      fileSize: '1.8 MB',
      status: 'update-available',
      source: 'Hangar',
      icon: '🔧',
      fileName: 'EssentialsX-2.20.1.jar',
    },
    {
      id: 'worldguard',
      name: 'WorldGuard',
      version: '7.0.9',
      latestVersion: '7.0.9',
      author: 'sk89q',
      description: 'Powerful world protection and management plugin.',
      category: 'Protection',
      loader: 'Paper',
      fileSize: '890 KB',
      status: 'enabled',
      source: 'CurseForge',
      icon: '🛡',
      fileName: 'worldguard-bukkit-7.0.9.jar',
    },
    {
      id: 'luckperms',
      name: 'LuckPerms',
      version: '5.4.108',
      latestVersion: '5.4.108',
      author: 'Luck',
      description: 'A permissions plugin for Minecraft servers.',
      category: 'Admin',
      loader: 'Paper',
      fileSize: '3.2 MB',
      status: 'error',
      source: 'Modrinth',
      icon: '🔑',
      fileName: 'LuckPerms-Bukkit-5.4.108.jar',
    },
  ] as InstalledPlugin[],

  pluginSearchResults: [] as PluginSearchResult[],
  isSearchingPlugins: false,

  // ── Java installations ────────────────────────────────────
  javaInstallations: [
    {
      id: 'adoptium-21',
      vendor: 'Adoptium',
      majorVersion: 21,
      fullVersion: '21.0.4+7',
      latestVersion: '21.0.5+11',
      arch: 'x64',
      installPath: '/opt/java/adoptium-21',
      sizeOnDisk: '312 MB',
      status: 'update-available',
      isActive: true,
      releaseType: 'LTS',
    },
    {
      id: 'adoptium-17',
      vendor: 'Adoptium',
      majorVersion: 17,
      fullVersion: '17.0.11+9',
      latestVersion: '17.0.11+9',
      arch: 'x64',
      installPath: '/opt/java/adoptium-17',
      sizeOnDisk: '298 MB',
      status: 'installed',
      isActive: false,
      releaseType: 'LTS',
    },
  ] as JavaInstallation[],

  javaReleases: [
    {
      id: 'adoptium-21-x64',
      vendor: 'Adoptium',
      majorVersion: 21,
      latestVersion: '21.0.5+11',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '185 MB',
      minecraftVersions: '1.20.5 – 1.21+',
      recommended: true,
      installed: false,
    },
    {
      id: 'adoptium-17-x64',
      vendor: 'Adoptium',
      majorVersion: 17,
      latestVersion: '17.0.11+9',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '178 MB',
      minecraftVersions: '1.17 – 1.20.4',
      recommended: true,
      installed: false,
    },
    {
      id: 'adoptium-11-x64',
      vendor: 'Adoptium',
      majorVersion: 11,
      latestVersion: '11.0.23+9',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '165 MB',
      minecraftVersions: '1.13 – 1.16.5',
      recommended: false,
      installed: false,
    },
    {
      id: 'adoptium-8-x64',
      vendor: 'Adoptium',
      majorVersion: 8,
      latestVersion: '8u422b05',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '102 MB',
      minecraftVersions: '1.7.10 – 1.12.2',
      recommended: false,
      installed: false,
    },
    {
      id: 'corretto-21-x64',
      vendor: 'Amazon Corretto',
      majorVersion: 21,
      latestVersion: '21.0.5.11',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '192 MB',
      minecraftVersions: '1.20.5 – 1.21+',
      recommended: false,
      installed: false,
    },
    {
      id: 'corretto-17-x64',
      vendor: 'Amazon Corretto',
      majorVersion: 17,
      latestVersion: '17.0.13.11',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '180 MB',
      minecraftVersions: '1.17 – 1.20.4',
      recommended: false,
      installed: false,
    },
    {
      id: 'zulu-21-x64',
      vendor: 'Azul Zulu',
      majorVersion: 21,
      latestVersion: '21.0.5',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '188 MB',
      minecraftVersions: '1.20.5 – 1.21+',
      recommended: false,
      installed: false,
    },
    {
      id: 'zulu-21-aarch64',
      vendor: 'Azul Zulu',
      majorVersion: 21,
      latestVersion: '21.0.5',
      arch: 'aarch64',
      releaseType: 'LTS',
      downloadSize: '182 MB',
      minecraftVersions: '1.20.5 – 1.21+',
      recommended: false,
      installed: false,
    },
    {
      id: 'microsoft-21-x64',
      vendor: 'Microsoft',
      majorVersion: 21,
      latestVersion: '21.0.5',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '190 MB',
      minecraftVersions: '1.20.5 – 1.21+',
      recommended: false,
      installed: false,
    },
    {
      id: 'microsoft-17-x64',
      vendor: 'Microsoft',
      majorVersion: 17,
      latestVersion: '17.0.13',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '176 MB',
      minecraftVersions: '1.17 – 1.20.4',
      recommended: false,
      installed: false,
    },
    {
      id: 'adoptium-21-arm',
      vendor: 'Adoptium',
      majorVersion: 21,
      latestVersion: '21.0.5+11',
      arch: 'aarch64',
      releaseType: 'LTS',
      downloadSize: '180 MB',
      minecraftVersions: '1.20.5 – 1.21+',
      recommended: false,
      installed: false,
    },
    {
      id: 'oracle-21-x64',
      vendor: 'Oracle',
      majorVersion: 21,
      latestVersion: '21.0.5',
      arch: 'x64',
      releaseType: 'LTS',
      downloadSize: '195 MB',
      minecraftVersions: '1.20.5 – 1.21+',
      recommended: false,
      installed: false,
    },
  ] as JavaRelease[],

  isInstallingJava: false,

  // ── Computed-like getters ─────────────────────────────────
  get hasModLoader(): boolean {
    return this.installedModLoader !== null
  },
  get hasMods(): boolean {
    return this.installedMods.length > 0
  },
  get hasPlugins(): boolean {
    return this.installedPlugins.length > 0
  },
  get activeJava(): JavaInstallation | undefined {
    return this.javaInstallations.find((j: JavaInstallation) => j.isActive)
  },

  // ── Methods ───────────────────────────────────────────────
  addLog(level: LogLevel, type: LogType, msg: string): void {
    const time = new Date().toTimeString().slice(0, 8)
    this.logs.push({ time, level, type, msg })
  },

  kickPlayer(name: string): void {
    this.onlinePlayers = this.onlinePlayers.filter(
      (p: OnlinePlayer) => p.name !== name,
    )
    const player = this.allPlayers.find((p: Player) => p.name === name)
    if (player) player.online = false
    this.addLog('INFO', 'warn', `${name} was kicked from the server.`)
  },

  // Mods
  installMod(result: ModSearchResult): void {
    const mod: InstalledMod = {
      id: result.id,
      name: result.name,
      version: result.latestVersion,
      latestVersion: result.latestVersion,
      author: result.author,
      description: result.description,
      category: result.category,
      loader: result.loaders[0] ?? 'Fabric',
      fileSize: 'Downloading...',
      status: 'enabled',
      source: result.source,
      icon: result.icon,
      fileName: `${result.id}-${result.latestVersion}.jar`,
    }
    this.installedMods.push(mod)
    result.installed = true
    this.addLog(
      'INFO',
      'info',
      `Installed mod ${result.name} v${result.latestVersion}`,
    )
  },

  uninstallMod(id: string): void {
    const mod = this.installedMods.find((m: InstalledMod) => m.id === id)
    if (mod) this.addLog('INFO', 'warn', `Uninstalled mod ${mod.name}`)
    this.installedMods = this.installedMods.filter(
      (m: InstalledMod) => m.id !== id,
    )
    const result = this.modSearchResults.find(
      (r: ModSearchResult) => r.id === id,
    )
    if (result) result.installed = false
  },

  toggleMod(id: string): void {
    const mod = this.installedMods.find((m: InstalledMod) => m.id === id)
    if (!mod || mod.status === 'error') return
    mod.status = mod.status === 'enabled' ? 'disabled' : 'enabled'
    this.addLog('INFO', 'info', `Mod ${mod.name} ${mod.status}`)
  },

  // Plugins
  installPlugin(result: PluginSearchResult): void {
    const plugin: InstalledPlugin = {
      id: result.id,
      name: result.name,
      version: result.latestVersion,
      latestVersion: result.latestVersion,
      author: result.author,
      description: result.description,
      category: result.category,
      loader: result.loaders[0] ?? 'Paper',
      fileSize: 'Downloading...',
      status: 'enabled',
      source: result.source,
      icon: result.icon,
      fileName: `${result.id}-${result.latestVersion}.jar`,
    }
    this.installedPlugins.push(plugin)
    result.installed = true
    this.addLog(
      'INFO',
      'info',
      `Installed plugin ${result.name} v${result.latestVersion}`,
    )
  },

  uninstallPlugin(id: string): void {
    const plugin = this.installedPlugins.find(
      (p: InstalledPlugin) => p.id === id,
    )
    if (plugin) this.addLog('INFO', 'warn', `Uninstalled plugin ${plugin.name}`)
    this.installedPlugins = this.installedPlugins.filter(
      (p: InstalledPlugin) => p.id !== id,
    )
    const result = this.pluginSearchResults.find(
      (r: PluginSearchResult) => r.id === id,
    )
    if (result) result.installed = false
  },

  togglePlugin(id: string): void {
    const plugin = this.installedPlugins.find(
      (p: InstalledPlugin) => p.id === id,
    )
    if (!plugin || plugin.status === 'error') return
    plugin.status = plugin.status === 'enabled' ? 'disabled' : 'enabled'
    this.addLog('INFO', 'info', `Plugin ${plugin.name} ${plugin.status}`)
  },

  // Java
  setActiveJava(id: string): void {
    this.javaInstallations.forEach((j: JavaInstallation) => {
      j.isActive = j.id === id
    })
    const java = this.javaInstallations.find(
      (j: JavaInstallation) => j.id === id,
    )
    if (java)
      this.addLog(
        'INFO',
        'info',
        `Active Java set to ${java.vendor} ${java.majorVersion} (${java.fullVersion})`,
      )
  },

  uninstallJava(id: string): void {
    const java = this.javaInstallations.find(
      (j: JavaInstallation) => j.id === id,
    )
    if (!java) return
    this.javaInstallations = this.javaInstallations.filter(
      (j: JavaInstallation) => j.id !== id,
    )
    const release = this.javaReleases.find((r: JavaRelease) => r.id === id)
    if (release) release.installed = false
    this.addLog(
      'INFO',
      'warn',
      `Uninstalled ${java.vendor} Java ${java.majorVersion}`,
    )
  },

  installJava(release: JavaRelease): void {
    const installation: JavaInstallation = {
      id: release.id,
      vendor: release.vendor,
      majorVersion: release.majorVersion,
      fullVersion: release.latestVersion,
      latestVersion: release.latestVersion,
      arch: release.arch,
      installPath: `/opt/java/${release.vendor.toLowerCase().replace(/ /g, '-')}-${release.majorVersion}`,
      sizeOnDisk: release.downloadSize,
      status: 'installing',
      isActive: false,
      releaseType: release.releaseType,
    }
    this.javaInstallations.push(installation)
    release.installed = true
    this.isInstallingJava = true
    this.addLog(
      'INFO',
      'info',
      `Installing ${release.vendor} Java ${release.majorVersion}...`,
    )
    setTimeout(() => {
      installation.status = 'installed'
      this.isInstallingJava = false
      this.addLog(
        'INFO',
        'info',
        `${release.vendor} Java ${release.majorVersion} installed successfully`,
      )
    }, 3000)
  },

  // ── Server builds ──────────────────────────────────────────
  serverBuilds: [
    {
      id: 'paper-1.21.4-139',
      software: 'Paper',
      mcVersion: '1.21.4',
      build: '139',
      releaseDate: '2024-12-18',
      channel: 'release',
      fileSize: '47.2 MB',
      sha256:
        'a3f1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      changelog:
        'Fix entity tracking desync, improve chunk loading performance, patch duplication exploit.',
      javaRequired: 21,
      status: 'installed',
      isActive: true,
      downloadUrl:
        'https://api.papermc.io/v2/projects/paper/versions/1.21.4/builds/139/downloads/paper-1.21.4-139.jar',
    },
    {
      id: 'paper-1.21.3-101',
      software: 'Paper',
      mcVersion: '1.21.3',
      build: '101',
      releaseDate: '2024-11-04',
      channel: 'release',
      fileSize: '46.8 MB',
      sha256:
        'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5',
      changelog:
        'Security patches, performance improvements for large servers.',
      javaRequired: 21,
      status: 'available',
      isActive: false,
      downloadUrl: '',
    },
  ] as ServerBuild[],

  isDownloadingServer: false,
  downloadingBuildId: null as string | null,

  get activeServerBuild(): ServerBuild | undefined {
    return this.serverBuilds.find((b: ServerBuild) => b.isActive)
  },

  downloadServerBuild(build: ServerBuild): void {
    build.status = 'downloading'
    this.isDownloadingServer = true
    this.downloadingBuildId = build.id
    this.addLog(
      'INFO',
      'info',
      `Downloading ${build.software} ${build.mcVersion} build ${build.build}...`,
    )
    setTimeout(() => {
      build.status = 'installed'
      this.isDownloadingServer = false
      this.downloadingBuildId = null
      this.addLog('INFO', 'info', `${build.software} ${build.mcVersion} ready`)
    }, 3500)
  },

  deleteServerBuild(id: string): void {
    const build = this.serverBuilds.find((b: ServerBuild) => b.id === id)
    if (!build) return
    this.serverBuilds = this.serverBuilds.filter(
      (b: ServerBuild) => b.id !== id,
    )
    this.addLog(
      'INFO',
      'warn',
      `Deleted ${build.software} ${build.mcVersion} build ${build.build}`,
    )
  },

  setActiveServerBuild(id: string): void {
    this.serverBuilds.forEach((b: ServerBuild) => {
      b.isActive = b.id === id
    })
    const build = this.serverBuilds.find((b: ServerBuild) => b.id === id)
    if (build)
      this.addLog(
        'INFO',
        'info',
        `Active server set to ${build.software} ${build.mcVersion}`,
      )
  },
})
