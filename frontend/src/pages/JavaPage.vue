<template>
    <div class="tab-content">

        <!-- ── Active Java Hero ── -->
        <div class="java-hero" :class="activeJava ? `vendor-${vendorSlug(activeJava.vendor)}` : 'vendor-none'">
            <div class="hero-left">
                <div class="hero-icon">☕</div>
                <div class="hero-info">
                    <div class="hero-label">ACTIVE JAVA RUNTIME</div>
                    <div class="hero-name" v-if="activeJava">
                        {{ activeJava.vendor }} {{ activeJava.majorVersion }}
                        <span class="hero-lts" v-if="activeJava.releaseType === 'LTS'">LTS</span>
                    </div>
                    <div class="hero-name muted" v-else>No Java Selected</div>
                    <div class="hero-sub" v-if="activeJava">
                        {{ activeJava.fullVersion }} · {{ activeJava.arch }} · {{ activeJava.sizeOnDisk }}
                        <span class="hero-path">{{ activeJava.installPath }}</span>
                    </div>
                    <div class="hero-sub muted" v-else>Install a Java version to launch your server</div>
                </div>
            </div>
            <div class="hero-right">
                <div class="hero-stat" v-if="activeJava">
                    <span class="hero-stat-val">{{ store.javaInstallations.length }}</span>
                    <span class="hero-stat-lbl">Installed</span>
                </div>
                <div class="hero-update-badge" v-if="activeJava && activeJava.status === 'update-available'">
                    <span>↑ Update available</span>
                    <button class="btn btn-sm btn-primary" @click="updateJava(activeJava)">UPDATE NOW</button>
                </div>
            </div>
        </div>

        <!-- ── Tab switcher ── -->
        <div class="tabs-inner" style="margin-bottom: 18px;">
            <button :class="['inner-tab', { active: view === 'installed' }]" @click="view = 'installed'">
                Installed ({{ store.javaInstallations.length }})
            </button>
            <button :class="['inner-tab', { active: view === 'browse' }]" @click="view = 'browse'">
                Browse & Install
            </button>
            <button :class="['inner-tab', { active: view === 'guide' }]" @click="view = 'guide'">
                Compatibility Guide
            </button>
        </div>

        <!-- ════════════ INSTALLED VIEW ════════════ -->
        <div v-if="view === 'installed'">

            <div v-if="store.javaInstallations.length === 0" class="empty-panel">
                <span class="empty-icon">☕</span>
                <span class="empty-title">NO JAVA INSTALLED</span>
                <span class="empty-sub">Browse available versions to get started</span>
                <button class="btn btn-primary" @click="view = 'browse'">Browse Versions →</button>
            </div>

            <div v-else class="java-cards">
                <div v-for="java in store.javaInstallations" :key="java.id" class="java-card"
                    :class="[`vendor-${vendorSlug(java.vendor)}`, { active: java.isActive, installing: java.status === 'installing' }]">
                    <!-- Active indicator strip -->
                    <div class="active-strip" v-if="java.isActive">
                        <span>● ACTIVE</span>
                    </div>

                    <div class="java-card-header">
                        <div class="java-version-badge" :class="`vendor-${vendorSlug(java.vendor)}`">
                            {{ java.majorVersion }}
                        </div>
                        <div class="java-card-meta">
                            <div class="java-card-title">
                                {{ java.vendor }} Java {{ java.majorVersion }}
                                <span class="lts-tag" v-if="java.releaseType === 'LTS'">LTS</span>
                            </div>
                            <div class="java-card-sub">{{ java.fullVersion }} · {{ java.arch }}</div>
                        </div>
                        <div class="java-card-status">
                            <span class="java-status-pill" :class="java.status">{{ javaStatusLabel(java.status)
                                }}</span>
                        </div>
                    </div>

                    <div class="java-card-body">
                        <div class="java-detail">
                            <span class="detail-label">PATH</span>
                            <span class="detail-val path">{{ java.installPath }}</span>
                        </div>
                        <div class="java-detail">
                            <span class="detail-label">SIZE</span>
                            <span class="detail-val">{{ java.sizeOnDisk }}</span>
                        </div>
                        <div class="java-detail">
                            <span class="detail-label">ARCH</span>
                            <span class="detail-val">{{ java.arch }}</span>
                        </div>
                    </div>

                    <!-- Installing progress bar -->
                    <div v-if="java.status === 'installing'" class="install-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <span class="progress-label">Installing...</span>
                    </div>

                    <div class="java-card-actions">
                        <button class="btn btn-sm btn-primary" :disabled="java.isActive || java.status === 'installing'"
                            @click="setActive(java)">
                            {{ java.isActive ? '✓ Active' : 'Set Active' }}
                        </button>
                        <button v-if="java.status === 'update-available'" class="btn btn-sm btn-outline update-btn"
                            @click="updateJava(java)">↑ Update</button>
                        <button class="btn btn-sm btn-outline" @click="openJavaFolder(java)">📁 Folder</button>
                        <button class="btn btn-sm btn-danger" :disabled="java.isActive || java.status === 'installing'"
                            @click="confirmUninstall = java">✕</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ════════════ BROWSE VIEW ════════════ -->
        <div v-if="view === 'browse'">

            <!-- Filters row -->
            <div class="browse-filters">
                <div class="filter-group">
                    <span class="filter-label">VERSION</span>
                    <div class="filter-pills">
                        <button v-for="v in versionFilters" :key="v"
                            :class="['filter-pill', { active: activeVersionFilter === v }]"
                            @click="activeVersionFilter = v">{{ v }}</button>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">VENDOR</span>
                    <div class="filter-pills">
                        <button v-for="v in vendorFilters" :key="v"
                            :class="['filter-pill', { active: activeVendorFilter === v }]"
                            @click="activeVendorFilter = v">{{ v }}</button>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">ARCH</span>
                    <div class="filter-pills">
                        <button v-for="a in ['All', 'x64', 'aarch64']" :key="a"
                            :class="['filter-pill', { active: activeArchFilter === a }]"
                            @click="activeArchFilter = a">{{ a }}</button>
                    </div>
                </div>
            </div>

            <!-- Results table -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">AVAILABLE JAVA RELEASES</span>
                    <span class="result-count">{{ filteredReleases.length }} versions</span>
                </div>
                <table class="java-table">
                    <thead>
                        <tr>
                            <th>VERSION</th>
                            <th>VENDOR</th>
                            <th>RELEASE</th>
                            <th>ARCH</th>
                            <th>MC VERSIONS</th>
                            <th>SIZE</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="release in filteredReleases" :key="release.id"
                            :class="{ 'recommended-row': release.recommended }">
                            <td>
                                <div class="version-cell">
                                    <span class="version-num" :class="`vendor-${vendorSlug(release.vendor)}`">
                                        {{ release.majorVersion }}
                                    </span>
                                    <span class="lts-tag sm" v-if="release.releaseType === 'LTS'">LTS</span>
                                    <span class="rec-tag" v-if="release.recommended">★ Recommended</span>
                                </div>
                            </td>
                            <td>
                                <div class="vendor-cell">
                                    <span class="vendor-dot" :class="`vendor-${vendorSlug(release.vendor)}`"></span>
                                    {{ release.vendor }}
                                </div>
                            </td>
                            <td class="td-muted">{{ release.releaseType }}</td>
                            <td>
                                <span class="arch-tag">{{ release.arch }}</span>
                            </td>
                            <td class="td-muted mc-versions">{{ release.minecraftVersions }}</td>
                            <td class="td-muted">{{ release.downloadSize }}</td>
                            <td>
                                <div v-if="isInstalled(release)" class="installed-indicator">
                                    <span class="installed-dot">●</span> Installed
                                    <button v-if="!isActive(release)" class="tbl-btn sm"
                                        @click="setActiveById(release.id)">Set Active</button>
                                </div>
                                <button v-else class="btn btn-sm btn-primary" :disabled="store.isInstallingJava"
                                    @click="installJava(release)">
                                    <span v-if="store.isInstallingJava && installingId === release.id"
                                        class="spinner">◌</span>
                                    <span v-else>⬇ Install</span>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filteredReleases.length === 0">
                            <td colspan="7" class="empty-row">No versions match your filters</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ════════════ COMPATIBILITY GUIDE ════════════ -->
        <div v-if="view === 'guide'">
            <div class="guide-grid">

                <div class="card guide-card">
                    <div class="card-header"><span class="card-title">MC VERSION → JAVA VERSION</span></div>
                    <div class="compat-table-wrap">
                        <table class="compat-table">
                            <thead>
                                <tr>
                                    <th>MINECRAFT</th>
                                    <th>MIN JAVA</th>
                                    <th>RECOMMENDED</th>
                                    <th>NOTES</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in compatTable" :key="row.mc">
                                    <td>
                                        <span class="mc-version-tag">{{ row.mc }}</span>
                                    </td>
                                    <td>
                                        <span class="java-req" :class="javaVersionClass(row.minJava)">Java {{
                                            row.minJava }}</span>
                                    </td>
                                    <td>
                                        <span class="java-rec" :class="javaVersionClass(row.recJava)">Java {{
                                            row.recJava }}</span>
                                    </td>
                                    <td class="td-muted compat-note">{{ row.note }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="guide-sidebar">

                    <div class="card guide-tip-card">
                        <div class="card-header"><span class="card-title">WHICH JAVA SHOULD I USE?</span></div>
                        <div class="tip-body">
                            <div class="tip-row">
                                <span class="tip-badge adoptium">Adoptium</span>
                                <span class="tip-text">Best overall. Free, open-source, community-backed builds from the
                                    Eclipse Foundation. Recommended for most servers.</span>
                            </div>
                            <div class="tip-row">
                                <span class="tip-badge corretto">Corretto</span>
                                <span class="tip-text">Amazon's build. Excellent for AWS-hosted servers.
                                    Production-grade with long-term patches.</span>
                            </div>
                            <div class="tip-row">
                                <span class="tip-badge zulu">Zulu</span>
                                <span class="tip-text">Azul's build. Strong ARM/aarch64 support — best choice for Apple
                                    Silicon or ARM VPS.</span>
                            </div>
                            <div class="tip-row">
                                <span class="tip-badge microsoft">Microsoft</span>
                                <span class="tip-text">Optimized for Windows servers. Pairs well with Azure
                                    hosting.</span>
                            </div>
                            <div class="tip-row">
                                <span class="tip-badge oracle">Oracle</span>
                                <span class="tip-text">Official Oracle JDK. Free for development; check licensing for
                                    production use.</span>
                            </div>
                        </div>
                    </div>

                    <div class="card guide-tip-card">
                        <div class="card-header"><span class="card-title">PERFORMANCE FLAGS</span></div>
                        <div class="flags-body">
                            <div class="flags-label">Aikar's G1GC flags (Java 11+)</div>
                            <div class="flags-code">
                                <code>-XX:+UseG1GC -XX:+ParallelRefProcEnabled<br>
                -XX:MaxGCPauseMillis=200<br>
                -XX:+UnlockExperimentalVMOptions<br>
                -XX:+DisableExplicitGC<br>
                -XX:+AlwaysPreTouch<br>
                -XX:G1NewSizePercent=30<br>
                -XX:G1MaxNewSizePercent=40</code>
                            </div>
                            <button class="btn btn-sm btn-outline" @click="copyFlags">📋 Copy flags</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- ── Uninstall confirm modal ── -->
        <div v-if="confirmUninstall" class="modal-overlay" @click.self="confirmUninstall = null">
            <div class="modal">
                <div class="modal-title">UNINSTALL JAVA</div>
                <div class="modal-body">
                    Remove <strong>{{ confirmUninstall.vendor }} Java {{ confirmUninstall.majorVersion }}</strong>?
                    <br><span class="modal-hint">Installation directory <code>{{ confirmUninstall.installPath }}</code>
                        will be deleted.</span>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline btn-sm" @click="confirmUninstall = null">CANCEL</button>
                    <button class="btn btn-danger btn-sm" @click="doUninstall">UNINSTALL</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { store } from '../store'
import type { JavaInstallation, JavaRelease, JavaVendor, JavaInstallStatus } from '../store'

export default defineComponent({
    name: 'JavaPage',
    emits: ['toast'],

    data() {
        return {
            store,
            view: 'installed' as 'installed' | 'browse' | 'guide',
            activeVersionFilter: 'All',
            activeVendorFilter: 'All',
            activeArchFilter: 'All',
            installingId: null as string | null,
            confirmUninstall: null as JavaInstallation | null,

            versionFilters: ['All', '21', '17', '11', '8'],
            vendorFilters: ['All', 'Adoptium', 'Amazon Corretto', 'Azul Zulu', 'Microsoft', 'Oracle'],

            compatTable: [
                { mc: '1.20.5 – 1.21+', minJava: 21, recJava: 21, note: 'Java 21 required. Use LTS build.' },
                { mc: '1.18 – 1.20.4', minJava: 17, recJava: 21, note: 'Java 17 min; Java 21 for best perf.' },
                { mc: '1.17', minJava: 16, recJava: 17, note: 'First version to require Java 16+.' },
                { mc: '1.13 – 1.16.5', minJava: 8, recJava: 11, note: 'Java 11 gives G1GC improvements.' },
                { mc: '1.7.10 – 1.12.2', minJava: 8, recJava: 8, note: 'Java 8 only. Newer Java may break.' },
            ],
        }
    },

    computed: {
        activeJava(): JavaInstallation | undefined {
            return this.store.javaInstallations.find(j => j.isActive)
        },
        filteredReleases(): JavaRelease[] {
            return this.store.javaReleases.filter(r => {
                const matchVersion = this.activeVersionFilter === 'All' || String(r.majorVersion) === this.activeVersionFilter
                const matchVendor = this.activeVendorFilter === 'All' || r.vendor === this.activeVendorFilter
                const matchArch = this.activeArchFilter === 'All' || r.arch === this.activeArchFilter
                return matchVersion && matchVendor && matchArch
            })
        },
    },

    methods: {
        vendorSlug(vendor: JavaVendor): string {
            return vendor.toLowerCase().replace(/ /g, '-')
        },
        javaStatusLabel(status: JavaInstallStatus): string {
            return ({ installed: '● Installed', installing: '◌ Installing', 'update-available': '↑ Update', error: '✕ Error' } as Record<JavaInstallStatus, string>)[status]
        },
        javaVersionClass(v: number): string {
            if (v >= 21) return 'java-21'
            if (v >= 17) return 'java-17'
            if (v >= 11) return 'java-11'
            return 'java-8'
        },
        isInstalled(release: JavaRelease): boolean {
            return this.store.javaInstallations.some(j => j.id === release.id)
        },
        isActive(release: JavaRelease): boolean {
            return !!this.store.javaInstallations.find(j => j.id === release.id && j.isActive)
        },
        setActive(java: JavaInstallation): void {
            this.store.setActiveJava(java.id)
            this.$emit('toast', { msg: `Active Java set to ${java.vendor} ${java.majorVersion}`, type: 'success' })
        },
        setActiveById(id: string): void {
            const java = this.store.javaInstallations.find(j => j.id === id)
            if (java) this.setActive(java)
        },
        installJava(release: JavaRelease): void {
            this.installingId = release.id
            this.store.installJava(release)
            this.$emit('toast', { msg: `Installing ${release.vendor} Java ${release.majorVersion}...`, type: 'success' })
            setTimeout(() => {
                this.installingId = null
                this.$emit('toast', { msg: `Java ${release.majorVersion} installed!`, type: 'success' })
            }, 3200)
        },
        updateJava(java: JavaInstallation): void {
            java.fullVersion = java.latestVersion
            java.status = 'installed'
            this.$emit('toast', { msg: `Java ${java.majorVersion} updated to ${java.latestVersion}`, type: 'success' })
            this.store.addLog('INFO', 'info', `Updated ${java.vendor} Java ${java.majorVersion} to ${java.latestVersion}`)
        },
        doUninstall(): void {
            if (!this.confirmUninstall) return
            this.store.uninstallJava(this.confirmUninstall.id)
            this.$emit('toast', { msg: `Removed Java ${this.confirmUninstall.majorVersion}`, type: 'danger' })
            this.confirmUninstall = null
        },
        async openJavaFolder(java: JavaInstallation): Promise<void> {
            try {
                const { tauri } = await import('../api')
                await tauri.openFolder(java.installPath)
            } catch (e: any) {
                this.$emit('toast', { msg: `Could not open folder: ${e}`, type: 'danger' })
            }
        },
        copyFlags(): void {
            const flags = '-XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40'
            navigator.clipboard?.writeText(flags)
            this.$emit('toast', { msg: 'JVM flags copied!', type: 'success' })
        },
    },
})
</script>

<style scoped>
/* ── Hero ── */
.java-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    margin-bottom: 20px;
    gap: 20px;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
}

.java-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background: radial-gradient(circle at 0% 50%, var(--hero-color, transparent) 0%, transparent 60%);
}

.java-hero.vendor-adoptium {
    --hero-color: #4ade80;
    border-color: #4ade8033;
}

.java-hero.vendor-amazon-corretto {
    --hero-color: #fb923c;
    border-color: #fb923c33;
}

.java-hero.vendor-azul-zulu {
    --hero-color: #60a5fa;
    border-color: #60a5fa33;
}

.java-hero.vendor-microsoft {
    --hero-color: #a78bfa;
    border-color: #a78bfa33;
}

.java-hero.vendor-oracle {
    --hero-color: #f87171;
    border-color: #f8717133;
}

.hero-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.hero-icon {
    font-size: 40px;
}

.hero-label {
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    margin-bottom: 4px;
}

.hero-name {
    font-family: 'VT323', monospace;
    font-size: 28px;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.hero-name.muted {
    color: var(--muted);
}

.hero-lts {
    font-size: 11px;
    background: rgba(74, 222, 128, 0.15);
    border: 1px solid var(--green);
    color: var(--green);
    padding: 1px 6px;
    border-radius: 3px;
}

.hero-sub {
    font-size: 12px;
    color: var(--text2);
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.hero-sub.muted {
    color: var(--muted);
}

.hero-path {
    font-size: 11px;
    color: var(--muted);
    font-family: 'Share Tech Mono', monospace;
}

.hero-right {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
}

.hero-stat {
    text-align: center;
}

.hero-stat-val {
    display: block;
    font-family: 'VT323', monospace;
    font-size: 32px;
    line-height: 1;
    color: var(--text);
}

.hero-stat-lbl {
    display: block;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 1px;
}

.hero-update-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: var(--radius);
    padding: 8px 12px;
    font-size: 12px;
    color: var(--yellow);
}

/* ── Installed cards ── */
.java-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 14px;
}

.java-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color 0.2s;
    position: relative;
}

.java-card:hover {
    border-color: var(--text2);
}

.java-card.active {
    border-color: var(--green);
    box-shadow: 0 0 0 1px var(--green2);
}

.java-card.installing {
    opacity: 0.8;
}

/* Vendor accent left-border */
.java-card.vendor-adoptium {
    border-left: 3px solid #4ade80;
}

.java-card.vendor-amazon-corretto {
    border-left: 3px solid #fb923c;
}

.java-card.vendor-azul-zulu {
    border-left: 3px solid #60a5fa;
}

.java-card.vendor-microsoft {
    border-left: 3px solid #a78bfa;
}

.java-card.vendor-oracle {
    border-left: 3px solid #f87171;
}

.active-strip {
    background: rgba(74, 222, 128, 0.08);
    border-bottom: 1px solid var(--green2);
    padding: 3px 12px;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--green);
}

.java-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px 8px;
}

.java-version-badge {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'VT323', monospace;
    font-size: 22px;
    font-weight: 700;
    background: var(--bg3);
    border: 1px solid var(--border);
}

.java-version-badge.vendor-adoptium {
    background: rgba(74, 222, 128, 0.1);
    color: #4ade80;
    border-color: #4ade8044;
}

.java-version-badge.vendor-amazon-corretto {
    background: rgba(251, 146, 60, 0.1);
    color: #fb923c;
    border-color: #fb923c44;
}

.java-version-badge.vendor-azul-zulu {
    background: rgba(96, 165, 250, 0.1);
    color: #60a5fa;
    border-color: #60a5fa44;
}

.java-version-badge.vendor-microsoft {
    background: rgba(167, 139, 250, 0.1);
    color: #a78bfa;
    border-color: #a78bfa44;
}

.java-version-badge.vendor-oracle {
    background: rgba(248, 113, 113, 0.1);
    color: #f87171;
    border-color: #f8717144;
}

.java-card-meta {
    flex: 1;
}

.java-card-title {
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
}

.lts-tag {
    font-size: 9px;
    background: rgba(74, 222, 128, 0.12);
    border: 1px solid var(--green2);
    color: var(--green);
    padding: 1px 5px;
    border-radius: 2px;
}

.lts-tag.sm {
    font-size: 9px;
}

.java-card-sub {
    font-size: 11px;
    color: var(--muted);
    margin-top: 2px;
}

.java-status-pill {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 3px;
    display: inline-block;
    white-space: nowrap;
}

.java-status-pill.installed {
    background: rgba(74, 222, 128, 0.1);
    color: var(--green);
}

.java-status-pill.installing {
    background: rgba(251, 191, 36, 0.1);
    color: var(--yellow);
}

.java-status-pill.update-available {
    background: rgba(251, 191, 36, 0.1);
    color: var(--yellow);
}

.java-status-pill.error {
    background: rgba(248, 113, 113, 0.1);
    color: var(--red);
}

.java-card-body {
    padding: 4px 16px 10px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.java-detail {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.detail-label {
    font-size: 9px;
    letter-spacing: 1.5px;
    color: var(--muted);
}

.detail-val {
    font-size: 11px;
    color: var(--text2);
}

.detail-val.path {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: var(--muted);
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Progress bar */
.install-progress {
    padding: 0 16px 10px;
}

.progress-bar {
    height: 4px;
    background: var(--bg3);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
}

.progress-fill {
    height: 100%;
    background: var(--green);
    border-radius: 2px;
    animation: progress-anim 2s ease-in-out infinite;
}

@keyframes progress-anim {
    0% {
        width: 0%;
        margin-left: 0;
    }

    50% {
        width: 60%;
        margin-left: 20%;
    }

    100% {
        width: 0%;
        margin-left: 100%;
    }
}

.progress-label {
    font-size: 10px;
    color: var(--muted);
}

.java-card-actions {
    display: flex;
    gap: 6px;
    padding: 8px 16px 14px;
    flex-wrap: wrap;
}

.update-btn {
    border-color: rgba(251, 191, 36, 0.4);
    color: var(--yellow);
}

.update-btn:hover {
    border-color: var(--yellow);
}

/* ── Browse filters ── */
.browse-filters {
    display: flex;
    gap: 20px;
    margin-bottom: 18px;
    flex-wrap: wrap;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 18px;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.filter-label {
    font-size: 10px;
    letter-spacing: 1.5px;
    color: var(--muted);
    white-space: nowrap;
}

.filter-pills {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.filter-pill {
    padding: 3px 10px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 20px;
    color: var(--muted);
    cursor: pointer;
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    transition: all 0.15s;
}

.filter-pill.active {
    border-color: var(--green);
    color: var(--green);
    background: rgba(74, 222, 128, 0.07);
}

.filter-pill:hover:not(.active) {
    border-color: var(--text2);
    color: var(--text);
}

.result-count {
    font-size: 12px;
    color: var(--muted);
}

/* ── Java table ── */
.java-table {
    width: 100%;
    border-collapse: collapse;
}

.java-table th {
    padding: 10px 16px;
    text-align: left;
    font-size: 10px;
    letter-spacing: 1.5px;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
}

.java-table td {
    padding: 11px 16px;
    border-bottom: 1px solid rgba(30, 45, 61, 0.4);
}

.java-table tr:last-child td {
    border-bottom: none;
}

.java-table tr:hover td {
    background: var(--bg3);
}

.java-table .recommended-row td {
    background: rgba(74, 222, 128, 0.03);
}

.java-table .recommended-row:hover td {
    background: rgba(74, 222, 128, 0.07);
}

.version-cell {
    display: flex;
    align-items: center;
    gap: 6px;
}

.version-num {
    font-family: 'VT323', monospace;
    font-size: 22px;
    line-height: 1;
    width: 32px;
    text-align: center;
}

.version-num.vendor-adoptium {
    color: #4ade80;
}

.version-num.vendor-amazon-corretto {
    color: #fb923c;
}

.version-num.vendor-azul-zulu {
    color: #60a5fa;
}

.version-num.vendor-microsoft {
    color: #a78bfa;
}

.version-num.vendor-oracle {
    color: #f87171;
}

.rec-tag {
    font-size: 10px;
    color: var(--yellow);
}

.vendor-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
}

.vendor-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

.vendor-dot.vendor-adoptium {
    background: #4ade80;
}

.vendor-dot.vendor-amazon-corretto {
    background: #fb923c;
}

.vendor-dot.vendor-azul-zulu {
    background: #60a5fa;
}

.vendor-dot.vendor-microsoft {
    background: #a78bfa;
}

.vendor-dot.vendor-oracle {
    background: #f87171;
}

.arch-tag {
    font-size: 11px;
    background: var(--bg3);
    border: 1px solid var(--border);
    padding: 1px 7px;
    border-radius: 3px;
    color: var(--text2);
}

.mc-versions {
    font-size: 11px;
}

.td-muted {
    color: var(--text2);
    font-size: 12px;
}

.installed-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--green);
}

.installed-dot {
    font-size: 8px;
}

.tbl-btn.sm {
    padding: 2px 8px;
    font-size: 10px;
}

.empty-row {
    text-align: center;
    color: var(--muted);
    padding: 24px !important;
}

/* ── Guide ── */
.guide-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 16px;
    align-items: start;
}

.compat-table-wrap {
    overflow-x: auto;
}

.compat-table {
    width: 100%;
    border-collapse: collapse;
}

.compat-table th {
    padding: 10px 16px;
    text-align: left;
    font-size: 10px;
    letter-spacing: 1.5px;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
}

.compat-table td {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(30, 45, 61, 0.4);
}

.compat-table tr:last-child td {
    border-bottom: none;
}

.mc-version-tag {
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
}

.java-req,
.java-rec {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 3px;
}

.java-21 {
    background: rgba(74, 222, 128, 0.1);
    color: var(--green);
}

.java-17 {
    background: rgba(96, 165, 250, 0.1);
    color: var(--blue);
}

.java-11 {
    background: rgba(167, 139, 250, 0.1);
    color: var(--purple);
}

.java-8 {
    background: rgba(251, 191, 36, 0.1);
    color: var(--yellow);
}

.compat-note {
    font-size: 11px;
}

.guide-sidebar {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.tip-body {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.tip-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.tip-badge {
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 3px;
    flex-shrink: 0;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.tip-badge.adoptium {
    background: rgba(74, 222, 128, 0.1);
    color: #4ade80;
}

.tip-badge.corretto {
    background: rgba(251, 146, 60, 0.1);
    color: #fb923c;
}

.tip-badge.zulu {
    background: rgba(96, 165, 250, 0.1);
    color: #60a5fa;
}

.tip-badge.microsoft {
    background: rgba(167, 139, 250, 0.1);
    color: #a78bfa;
}

.tip-badge.oracle {
    background: rgba(248, 113, 113, 0.1);
    color: #f87171;
}

.tip-text {
    font-size: 11px;
    color: var(--text2);
    line-height: 1.6;
}

.flags-body {
    padding: 12px 16px;
}

.flags-label {
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 8px;
}

.flags-code {
    background: #060810;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 12px;
    margin-bottom: 10px;
    font-size: 11px;
    line-height: 1.8;
    color: var(--green);
    font-family: 'Share Tech Mono', monospace;
}

/* ── Empty panel ── */
.empty-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px;
    text-align: center;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
}

.empty-icon {
    font-size: 48px;
}

.empty-title {
    font-family: 'VT323', monospace;
    font-size: 22px;
    letter-spacing: 3px;
    color: var(--text);
}

.empty-sub {
    font-size: 12px;
    color: var(--muted);
}

/* ── Modal ── */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    width: 400px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.modal-title {
    font-family: 'VT323', monospace;
    font-size: 20px;
    letter-spacing: 2px;
    color: var(--red);
    margin-bottom: 14px;
}

.modal-body {
    font-size: 13px;
    color: var(--text2);
    line-height: 1.6;
    margin-bottom: 20px;
}

.modal-body strong {
    color: var(--text);
}

.modal-body code {
    font-size: 11px;
    background: var(--bg3);
    padding: 1px 5px;
    border-radius: 3px;
    color: var(--muted);
}

.modal-hint {
    display: block;
    font-size: 11px;
    color: var(--muted);
    margin-top: 8px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
</style>