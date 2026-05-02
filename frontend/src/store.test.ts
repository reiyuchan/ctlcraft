import { describe, it, expect, beforeEach } from 'vitest'
import { store } from './store'

describe('store', () => {
  beforeEach(() => {
    // Reset store to initial state
    store.serverStatus = 'stopped'
    store.installedMods = []
    store.installedPlugins = []
    store.installedModLoader = null
    store.logs = []
    store.modSearchResults = []
    store.pluginSearchResults = []
    store.javaInstallations = []
    store.javaReleases = []
    store.serverBuilds = []
    store.isDownloadingServer = false
    store.downloadingBuildId = null
  })

  describe('serverStatus', () => {
    it('starts as stopped', () => {
      expect(store.serverStatus).toBe('stopped')
    })
  })

  describe('addLog', () => {
    it('adds a log entry with timestamp', () => {
      store.addLog('INFO', 'info', 'test message')
      expect(store.logs).toHaveLength(1)
      expect(store.logs[0].level).toBe('INFO')
      expect(store.logs[0].type).toBe('info')
      expect(store.logs[0].msg).toBe('test message')
      expect(store.logs[0].time).toBeDefined()
    })
  })

  describe('kickPlayer', () => {
    beforeEach(() => {
      store.onlinePlayers = [
        { name: 'Player1', color: '#fff', time: '1h', ping: 20 },
      ]
      store.allPlayers = [
        { name: 'Player1', color: '#fff', online: true, op: false, lastSeen: 'Now', playtime: '1h' },
      ]
    })

    it('removes player from online list', () => {
      store.kickPlayer('Player1')
      expect(store.onlinePlayers).toHaveLength(0)
    })

    it('sets player offline in allPlayers', () => {
      store.kickPlayer('Player1')
      expect(store.allPlayers[0].online).toBe(false)
    })

    it('adds log entry', () => {
      store.kickPlayer('Player1')
      const log = store.logs.find(l => l.msg.includes('Player1'))
      expect(log).toBeDefined()
    })
  })

  describe('mods', () => {
    it('installMod adds mod to installedMods', () => {
      store.installMod({
        id: 'test-mod',
        name: 'Test Mod',
        author: 'Tester',
        description: 'A test mod',
        category: 'Performance',
        downloads: '100',
        latestVersion: '1.0.0',
        loaders: ['Fabric'],
        source: 'Modrinth',
        icon: '⚡',
        installed: false,
      })
      expect(store.installedMods).toHaveLength(1)
      expect(store.installedMods[0].name).toBe('Test Mod')
    })

    it('uninstallMod removes mod', () => {
      store.installMod({
        id: 'test-mod',
        name: 'Test Mod',
        author: 'Tester',
        description: 'A test mod',
        category: 'Performance',
        downloads: '100',
        latestVersion: '1.0.0',
        loaders: ['Fabric'],
        source: 'Modrinth',
        icon: '⚡',
        installed: false,
      })
      store.uninstallMod('test-mod')
      expect(store.installedMods).toHaveLength(0)
    })

    it('toggleMod toggles enabled/disabled', () => {
      store.installMod({
        id: 'test-mod',
        name: 'Test Mod',
        author: 'Tester',
        description: 'A test mod',
        category: 'Performance',
        downloads: '100',
        latestVersion: '1.0.0',
        loaders: ['Fabric'],
        source: 'Modrinth',
        icon: '⚡',
        installed: false,
      })
      store.toggleMod('test-mod')
      expect(store.installedMods[0].status).toBe('disabled')
      store.toggleMod('test-mod')
      expect(store.installedMods[0].status).toBe('enabled')
    })

    it('toggleMod does nothing for error status', () => {
      store.installedMods = [{
        id: 'broken', name: 'Broken', version: '1.0',
        latestVersion: '1.0', author: 'Tester',
        description: '', category: 'Performance',
        loader: 'Fabric', fileSize: '1K',
        status: 'error', source: 'Modrinth',
        icon: '', fileName: 'broken.jar',
      }]
      store.toggleMod('broken')
      expect(store.installedMods[0].status).toBe('error')
    })
  })

  describe('plugins', () => {
    it('installPlugin adds plugin to installedPlugins', () => {
      store.installPlugin({
        id: 'test-plugin',
        name: 'Test Plugin',
        author: 'Tester',
        description: 'A test plugin',
        category: 'Utility',
        downloads: '100',
        latestVersion: '1.0.0',
        loaders: ['Paper'],
        source: 'Hangar',
        icon: '🔧',
        installed: false,
      })
      expect(store.installedPlugins).toHaveLength(1)
      expect(store.installedPlugins[0].name).toBe('Test Plugin')
    })

    it('uninstallPlugin removes plugin', () => {
      store.installPlugin({
        id: 'test-plugin',
        name: 'Test Plugin',
        author: 'Tester',
        description: 'A test plugin',
        category: 'Utility',
        downloads: '100',
        latestVersion: '1.0.0',
        loaders: ['Paper'],
        source: 'Hangar',
        icon: '🔧',
        installed: false,
      })
      store.uninstallPlugin('test-plugin')
      expect(store.installedPlugins).toHaveLength(0)
    })

    it('togglePlugin toggles enabled/disabled', () => {
      store.installPlugin({
        id: 'test-plugin',
        name: 'Test Plugin',
        author: 'Tester',
        description: 'A test plugin',
        category: 'Utility',
        downloads: '100',
        latestVersion: '1.0.0',
        loaders: ['Paper'],
        source: 'Hangar',
        icon: '🔧',
        installed: false,
      })
      store.togglePlugin('test-plugin')
      expect(store.installedPlugins[0].status).toBe('disabled')
    })
  })

  describe('Java', () => {
    it('setActiveJava toggles active Java installation', () => {
      store.javaInstallations = [
        { id: 'jdk-21', vendor: 'Adoptium', majorVersion: 21, fullVersion: '21.0.1', latestVersion: '21.0.1', arch: 'x64', installPath: '/opt/java/jdk-21', sizeOnDisk: '300MB', status: 'installed', isActive: false, releaseType: 'LTS' },
        { id: 'jdk-17', vendor: 'Adoptium', majorVersion: 17, fullVersion: '17.0.1', latestVersion: '17.0.1', arch: 'x64', installPath: '/opt/java/jdk-17', sizeOnDisk: '280MB', status: 'installed', isActive: true, releaseType: 'LTS' },
      ]
      store.setActiveJava('jdk-21')
      expect(store.javaInstallations.find(j => j.id === 'jdk-21')?.isActive).toBe(true)
      expect(store.javaInstallations.find(j => j.id === 'jdk-17')?.isActive).toBe(false)
    })

    it('uninstallJava removes Java installation', () => {
      store.javaInstallations = [
        { id: 'jdk-21', vendor: 'Adoptium', majorVersion: 21, fullVersion: '21.0.1', latestVersion: '21.0.1', arch: 'x64', installPath: '/opt/java/jdk-21', sizeOnDisk: '300MB', status: 'installed', isActive: true, releaseType: 'LTS' },
      ]
      store.uninstallJava('jdk-21')
      expect(store.javaInstallations).toHaveLength(0)
    })

    it('installJava adds a new installation with installing status', () => {
      store.installJava({
        id: 'adoptium-21-x64', vendor: 'Adoptium', majorVersion: 21,
        latestVersion: '21.0.5', arch: 'x64', releaseType: 'LTS',
        downloadSize: '185MB', minecraftVersions: '1.20.5+', recommended: true,
        installed: false,
      })
      const jdk = store.javaInstallations.find(j => j.id === 'adoptium-21-x64')
      expect(jdk).toBeDefined()
      expect(jdk?.status).toBe('installing')
      expect(store.isInstallingJava).toBe(true)
    })
  })

  describe('server builds', () => {
    it('downloadServerBuild sets downloading status', () => {
      const build = {
        id: 'paper-1.21.4-139', software: 'Paper' as const,
        mcVersion: '1.21.4', build: '139', releaseDate: '2024-12-18',
        channel: 'release' as const, fileSize: '47.2 MB',
        sha256: 'abc', changelog: 'Fixes', javaRequired: 21,
        status: 'available' as const, isActive: false, downloadUrl: '',
      }
      store.serverBuilds = [build]
      store.downloadServerBuild(build)
      expect(store.serverBuilds[0].status).toBe('downloading')
      expect(store.isDownloadingServer).toBe(true)
      expect(store.downloadingBuildId).toBe('paper-1.21.4-139')
    })

    it('deleteServerBuild removes build', () => {
      store.serverBuilds = [{
        id: 'paper-1.21.4-139', software: 'Paper',
        mcVersion: '1.21.4', build: '139', releaseDate: '2024-12-18',
        channel: 'release', fileSize: '47.2 MB',
        sha256: 'abc', changelog: 'Fixes', javaRequired: 21,
        status: 'installed', isActive: true, downloadUrl: '',
      }]
      store.deleteServerBuild('paper-1.21.4-139')
      expect(store.serverBuilds).toHaveLength(0)
    })

    it('setActiveServerBuild updates active build', () => {
      store.serverBuilds = [
        { id: 'b1', software: 'Paper', mcVersion: '1.21', build: '1', releaseDate: '', channel: 'release', fileSize: '', sha256: '', changelog: '', javaRequired: 21, status: 'installed', isActive: true, downloadUrl: '' },
        { id: 'b2', software: 'Paper', mcVersion: '1.20', build: '1', releaseDate: '', channel: 'release', fileSize: '', sha256: '', changelog: '', javaRequired: 21, status: 'available', isActive: false, downloadUrl: '' },
      ]
      store.setActiveServerBuild('b2')
      expect(store.serverBuilds.find(b => b.id === 'b2')?.isActive).toBe(true)
      expect(store.serverBuilds.find(b => b.id === 'b1')?.isActive).toBe(false)
    })
  })

  describe('computed getters', () => {
    it('hasModLoader returns true when mod loader is set', () => {
      store.installedModLoader = null
      expect(store.hasModLoader).toBe(false)
      store.installedModLoader = 'Fabric'
      expect(store.hasModLoader).toBe(true)
    })

    it('hasMods returns true when mods exist', () => {
      expect(store.hasMods).toBe(false)
      store.installedMods = [{ id: 'm', name: 'M', version: '1.0', latestVersion: '1.0', author: 'A', description: '', category: 'Performance', loader: 'Fabric', fileSize: '1K', status: 'enabled', source: 'Local', icon: '', fileName: 'm.jar' }]
      expect(store.hasMods).toBe(true)
    })

    it('hasPlugins returns true when plugins exist', () => {
      expect(store.hasPlugins).toBe(false)
      store.installedPlugins = [{ id: 'p', name: 'P', version: '1.0', latestVersion: '1.0', author: 'A', description: '', category: 'Utility', loader: 'Paper', fileSize: '1K', status: 'enabled', source: 'Local', icon: '', fileName: 'p.jar' }]
      expect(store.hasPlugins).toBe(true)
    })

    it('activeJava returns the active installation', () => {
      expect(store.activeJava).toBeUndefined()
      store.javaInstallations = [
        { id: 'jdk-21', vendor: 'Adoptium', majorVersion: 21, fullVersion: '21.0.1', latestVersion: '21.0.1', arch: 'x64', installPath: '/opt/java/jdk-21', sizeOnDisk: '300MB', status: 'installed', isActive: true, releaseType: 'LTS' },
      ]
      expect(store.activeJava?.id).toBe('jdk-21')
    })

    it('activeServerBuild returns the active build', () => {
      expect(store.activeServerBuild).toBeUndefined()
      store.serverBuilds = [{ id: 'b1', software: 'Paper', mcVersion: '1.21', build: '1', releaseDate: '', channel: 'release', fileSize: '', sha256: '', changelog: '', javaRequired: 21, status: 'installed', isActive: true, downloadUrl: '' }]
      expect(store.activeServerBuild?.id).toBe('b1')
    })
  })
})
