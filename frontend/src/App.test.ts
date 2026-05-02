import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App.vue', () => {
  it('renders the app with sidebar', () => {
    const wrapper = mount(App)
    expect(wrapper.find('.sidebar').exists()).toBe(true)
    expect(wrapper.find('.logo-title').text()).toBe('CRAFTCTL')
    expect(wrapper.find('.logo-sub').text()).toBe('Server Manager')
  })

  it('renders navigation items', () => {
    const wrapper = mount(App)
    const navItems = wrapper.findAll('.nav-item')
    expect(navItems.length).toBeGreaterThan(0)
    expect(navItems[0].text()).toContain('Dashboard')
  })

  it('defaults to dashboard tab', () => {
    const wrapper = mount(App)
    expect(wrapper.vm.activeTab).toBe('dashboard')
  })

  it('renders start button when server is stopped', () => {
    const wrapper = mount(App)
    const startBtn = wrapper.find('.btn-primary')
    expect(startBtn.exists()).toBe(true)
    expect(startBtn.text()).toContain('START')
  })

  it('renders server status badge', () => {
    const wrapper = mount(App)
    const badge = wrapper.find('.server-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('Offline')
  })
})
