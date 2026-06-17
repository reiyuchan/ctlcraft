import { reactive } from 'vue'
import { api } from './api'

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

export type ModLoaderType = 'Fabric' | 'Forge' | 'NeoForge'

export type PluginLoaderType = 'Paper' | 'Spigot' | 'Purpur'

export type ModLoader = ModLoaderType | PluginLoaderType | 'Vanilla'

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
  majorVersion: number
  fullVersion: string
  latestVersion: string
  arch: JavaArch
  installPath: string
  sizeOnDisk: string
  status: JavaInstallStatus
  isActive: boolean
  releaseType: 'LTS' | 'STS'
}

export interface JavaRelease {
  version: number
  lts: boolean
}

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

export interface ServerBuild {
  id: string
  software: ServerSoftware
  mcVersion: string
  build: string
  releaseDate: string
  channel: ReleaseChannel
  fileSize: string
  sha256: string
  changelog: string
  javaRequired: number
  status: ServerVersionStatus
  isActive: boolean
  downloadUrl: string
}

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
  installedModLoader: InstalledModLoader
  installedMods: InstalledMod[]
  modSearchResults: ModSearchResult[]
  isSearchingMods: boolean
  installedPlugins: InstalledPlugin[]
  pluginSearchResults: PluginSearchResult[]
  isSearchingPlugins: boolean
  javaInstallations: JavaInstallation[]
  javaReleases: JavaRelease[]
  isInstallingJava: boolean
  serverBuilds: ServerBuild[]
  isDownloadingServer: boolean
  downloadingBuildId: string | null
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
  installJava(version: string): Promise<string>
  downloadServerBuild(software: string, mcVersion: string, build: string): Promise<void>
  deleteServerBuild(id: string): void
  setActiveServerBuild(id: string): void
  readonly hasModLoader: boolean
  readonly hasMods: boolean
  readonly hasPlugins: boolean
  readonly activeJava: JavaInstallation | undefined
  readonly activeServerBuild: ServerBuild | undefined
  // New fetch methods
  fetchJavaInstallations(): Promise<void>
  fetchJavaReleases(): Promise<void>
  fetchServerBuilds(): Promise<void>
  fetchInstalledMods(): Promise<void>
  fetchInstalledPlugins(): Promise<void>
  fetchServerProps(): Promise<void>
  fetchServerInfo(): Promise<void>
}

const defaultProps = (): ServerProps => ({
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
})

export const store = reactive<Store>({
  serverStatus: 'stopped',
  stats: [],
  chartData: { TPS: [], RAM: [], CPU: [] },
  onlinePlayers: [],
  maxPlayers: 20,
  allPlayers: [],
  logs: [],
  serverProps: defaultProps(),
  worlds: [],
  installedModLoader: null,
  installedMods: [],
  modSearchResults: [],
  isSearchingMods: false,
  installedPlugins: [],
  pluginSearchResults: [],
  isSearchingPlugins: false,
  javaInstallations: [],
  javaReleases: [],
  isInstallingJava: false,
  serverBuilds: [],
  isDownloadingServer: false,
  downloadingBuildId: null,

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
    return this.javaInstallations.find(j => j.isActive)
  },
  get activeServerBuild(): ServerBuild | undefined {
    return this.serverBuilds.find(b => b.isActive)
  },

  addLog(level: LogLevel, type: LogType, msg: string): void {
    const time = new Date().toTimeString().slice(0, 8)
    this.logs.push({ time, level, type, msg })
  },

  kickPlayer(name: string): void {
    this.onlinePlayers = this.onlinePlayers.filter(p => p.name !== name)
    const player = this.allPlayers.find(p => p.name === name)
    if (player) player.online = false
    this.addLog('INFO', 'warn', `${name} was kicked from the server.`)
  },

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
    this.addLog('INFO', 'info', `Installed mod ${result.name} v${result.latestVersion}`)
  },

  uninstallMod(id: string): void {
    const mod = this.installedMods.find(m => m.id === id)
    if (mod) this.addLog('INFO', 'warn', `Uninstalled mod ${mod.name}`)
    this.installedMods = this.installedMods.filter(m => m.id !== id)
    const result = this.modSearchResults.find(r => r.id === id)
    if (result) result.installed = false
  },

  toggleMod(id: string): void {
    const mod = this.installedMods.find(m => m.id === id)
    if (!mod || mod.status === 'error') return
    mod.status = mod.status === 'enabled' ? 'disabled' : 'enabled'
    this.addLog('INFO', 'info', `Mod ${mod.name} ${mod.status}`)
  },

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
    this.addLog('INFO', 'info', `Installed plugin ${result.name} v${result.latestVersion}`)
  },

  uninstallPlugin(id: string): void {
    const plugin = this.installedPlugins.find(p => p.id === id)
    if (plugin) this.addLog('INFO', 'warn', `Uninstalled plugin ${plugin.name}`)
    this.installedPlugins = this.installedPlugins.filter(p => p.id !== id)
    const result = this.pluginSearchResults.find(r => r.id === id)
    if (result) result.installed = false
  },

  togglePlugin(id: string): void {
    const plugin = this.installedPlugins.find(p => p.id === id)
    if (!plugin || plugin.status === 'error') return
    plugin.status = plugin.status === 'enabled' ? 'disabled' : 'enabled'
    this.addLog('INFO', 'info', `Plugin ${plugin.name} ${plugin.status}`)
  },

  setActiveJava(id: string): void {
    this.javaInstallations.forEach(j => { j.isActive = j.id === id })
    const java = this.javaInstallations.find(j => j.id === id)
    if (java)
      this.addLog('INFO', 'info', `Active Java set to ${java.vendor} ${java.majorVersion} (${java.fullVersion})`)
  },

  uninstallJava(id: string): void {
    const java = this.javaInstallations.find(j => j.id === id)
    if (!java) return
    this.javaInstallations = this.javaInstallations.filter(j => j.id !== id)
    this.addLog('INFO', 'warn', `Uninstalled ${java.vendor} Java ${java.majorVersion}`)
  },

  async installJava(version: string): Promise<string> {
    this.isInstallingJava = true
    try {
      const result = await api.downloadJava(version)
      await this.fetchJavaInstallations()
      this.addLog('INFO', 'info', `Java ${version} installed successfully`)
      return result.path
    } catch (e: any) {
      this.addLog('ERROR', 'error', `Java install failed: ${e.message ?? e}`)
      throw e
    } finally {
      this.isInstallingJava = false
    }
  },

  async downloadServerBuild(software: string, mcVersion: string, build: string): Promise<void> {
    this.isDownloadingServer = true
    try {
      await api.installServerSoftware(software, mcVersion, build)
      await this.fetchServerBuilds()
      this.addLog('INFO', 'info', `${software} ${mcVersion} (build ${build}) downloaded`)
    } catch (e: any) {
      this.addLog('ERROR', 'error', `Download failed: ${e.message ?? e}`)
      throw e
    } finally {
      this.isDownloadingServer = false
    }
  },

  deleteServerBuild(id: string): void {
    const build = this.serverBuilds.find(b => b.id === id)
    if (!build) return
    this.serverBuilds = this.serverBuilds.filter(b => b.id !== id)
    this.addLog('INFO', 'warn', `Deleted ${build.software} ${build.mcVersion} build ${build.build}`)
  },

  setActiveServerBuild(id: string): void {
    this.serverBuilds.forEach(b => { b.isActive = b.id === id })
    const build = this.serverBuilds.find(b => b.id === id)
    if (build)
      this.addLog('INFO', 'info', `Active server set to ${build.software} ${build.mcVersion}`)
  },

  async fetchJavaInstallations(): Promise<void> {
    try {
      const runtimes = await api.detectJava()
      this.javaInstallations = runtimes.map((r, i) => ({
        id: r.id,
        vendor: r.vendor as JavaVendor,
        majorVersion: r.majorVersion,
        fullVersion: r.fullVersion,
        latestVersion: r.latestVersion,
        arch: r.arch as JavaArch,
        installPath: r.installPath,
        sizeOnDisk: r.sizeOnDisk,
        status: r.status as JavaInstallStatus,
        isActive: i === 0,
        releaseType: r.releaseType as 'LTS' | 'STS',
      }))
    } catch {
      this.javaInstallations = []
    }
  },

  async fetchJavaReleases(): Promise<void> {
    try {
      const releases = await api.javaVersions()
      this.javaReleases = releases
    } catch {
      this.javaReleases = []
    }
  },

  async fetchServerBuilds(): Promise<void> {
    try {
      const info = await api.getActiveInfo()
      const hasJar = info.has_server_jar
      if (hasJar) {
        this.serverBuilds = [{
          id: 'current',
          software: 'Paper' as ServerSoftware,
          mcVersion: '',
          build: '1',
          releaseDate: '',
          channel: 'release' as ReleaseChannel,
          fileSize: '',
          sha256: '',
          changelog: '',
          javaRequired: 17,
          status: 'installed' as ServerVersionStatus,
          isActive: true,
          downloadUrl: '',
        }]
      } else {
        this.serverBuilds = []
      }
    } catch {
      this.serverBuilds = []
    }
  },

  async fetchInstalledMods(): Promise<void> {
    try {
      const items = await api.getInstalledMods()
      this.installedMods = items.map(item => ({
        id: item.file_name,
        name: item.name ?? item.file_name,
        version: item.version,
        latestVersion: item.version,
        author: '',
        description: '',
        category: 'Utility' as ItemCategory,
        loader: 'Fabric' as ModLoaderType,
        fileSize: item.size,
        status: 'enabled' as ItemStatus,
        source: (item.source as ModSource) ?? 'Local',
        icon: '📦',
        fileName: item.file_name,
      }))
    } catch {
      this.installedMods = []
    }
  },

  async fetchInstalledPlugins(): Promise<void> {
    try {
      const items = await api.getInstalledPlugins()
      this.installedPlugins = items.map(item => ({
        id: item.file_name,
        name: item.name ?? item.file_name,
        version: item.version,
        latestVersion: item.version,
        author: '',
        description: '',
        category: 'Utility' as ItemCategory,
        loader: 'Paper' as PluginLoaderType,
        fileSize: item.size,
        status: 'enabled' as ItemStatus,
        source: (item.source as ModSource) ?? 'Local',
        icon: '📦',
        fileName: item.file_name,
      }))
    } catch {
      this.installedPlugins = []
    }
  },

  async fetchServerProps(): Promise<void> {
    try {
      const props = await api.readServerProps()
      this.serverProps = {
        serverName: props.server_name,
        motd: props.motd,
        maxPlayers: props.max_players,
        difficulty: props.difficulty as Difficulty,
        gamemode: props.gamemode as Gamemode,
        pvp: props.pvp,
        onlineMode: props.online_mode,
        hardcore: props.hardcore,
        whiteList: props.white_list,
        spawnAnimals: props.spawn_animals,
        spawnMonsters: props.spawn_monsters,
        spawnNpcs: props.spawn_npcs,
        viewDistance: props.view_distance,
        simulationDistance: props.simulation_distance,
        port: props.port,
        levelType: props.level_type as LevelType,
      }
    } catch {
      // keep defaults
    }
  },

  async fetchServerInfo(): Promise<void> {
    try {
      const info = await api.getActiveInfo()
      if (info.has_server_jar) {
        await this.fetchServerBuilds()
      }
    } catch {
      // ignore
    }
  },
})
