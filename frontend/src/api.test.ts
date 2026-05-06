import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, events } from './api'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getServerDir', () => {
    it('returns server directory from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => '/path/to/server',
      })
      const result = await api.getServerDir()
      expect(result).toBe('/path/to/server')
      expect(mockFetch).toHaveBeenCalledWith('/api/server/dir', expect.any(Object))
    })

    it('throws on error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'server error',
      })
      await expect(api.getServerDir()).rejects.toThrow('server error')
    })
  })

  describe('readServerProps', () => {
    it('returns server properties', async () => {
      const props = { server_name: 'Test', max_players: 20, difficulty: 'normal' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => props,
      })
      const result = await api.readServerProps()
      expect(result.server_name).toBe('Test')
    })
  })

  describe('saveServerProps', () => {
    it('sends POST with props', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '', json: async () => ({}) })
      const props = {
        server_name: 'Test', motd: 'Hi', max_players: 10, difficulty: 'easy',
        gamemode: 'survival', pvp: false, online_mode: true, hardcore: false,
        white_list: false, spawn_animals: true, spawn_monsters: true, spawn_npcs: true,
        view_distance: 10, simulation_distance: 10, port: 25565, level_type: 'default',
      }
      await api.saveServerProps(props)
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/server/props',
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('checkEula', () => {
    it('returns boolean', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => true })
      const result = await api.checkEula()
      expect(result).toBe(true)
    })
  })

  describe('searchMods', () => {
    it('sends search query', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] })
      await api.searchMods('optifine', ['Fabric'], '1.21')
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.query).toBe('optifine')
      expect(callBody.loaders).toEqual(['Fabric'])
    })
  })

  describe('getVanillaVersions', () => {
    it('returns vanilla versions list', async () => {
      const versions = [{ id: '1.21.4', type: 'release', url: 'https://example.com' }]
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => versions })
      const result = await api.getVanillaVersions()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1.21.4')
    })
  })

  describe('startServer', () => {
    it('sends start command', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '', json: async () => ({}) })
      await api.startServer({ javaPath: '/usr/bin/java', maxRam: '4G' })
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/server/start',
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('stopServer', () => {
    it('sends stop command', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '', json: async () => ({}) })
      await api.stopServer()
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/server/stop',
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })

  describe('HTTP error handling', () => {
    it('throws on non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'bad request',
      })
      await expect(api.stopServer()).rejects.toThrow('bad request')
    })
  })
})

describe('events', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defines event listeners', () => {
    expect(events.onServerLog).toBeTypeOf('function')
    expect(events.onServerStopped).toBeTypeOf('function')
    expect(events.onServerError).toBeTypeOf('function')
  })
})
