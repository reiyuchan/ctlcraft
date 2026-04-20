<template>
    <div class="tab-content">

        <!-- ── Active server hero ── -->
        <div class="server-hero" :class="activeSlug">
            <div class="hero-left">
                <div class="hero-icon">{{ activeBuild ? softwareMeta[activeBuild.software]?.icon : '📦' }}</div>
                <div class="hero-info">
                    <div class="hero-label">ACTIVE SERVER</div>
                    <div class="hero-name" v-if="activeBuild">
                        {{ activeBuild.software }}
                        <span class="hero-mc">{{ activeBuild.mcVersion }}</span>
                        <span class="hero-build">build {{ activeBuild.build }}</span>
                    </div>
                    <div class="hero-name muted" v-else>No Server Configured</div>
                    <div class="hero-sub" v-if="activeBuild">
                        Released {{ activeBuild.releaseDate }} · Java {{ activeBuild.javaRequired }}+ required · {{
                        activeBuild.fileSize }}
                    </div>
                    <div class="hero-sub muted" v-else>Download a server jar to get started</div>
                </div>
            </div>
            <div class="hero-right" v-if="activeBuild">
                <div class="hero-stat">
                    <span class="hero-stat-val">{{ store.serverBuilds.length }}</span>
                    <span class="hero-stat-lbl">Downloaded</span>
                </div>
                <button class="btn btn-sm btn-outline" @click="openServerFolder">📁 Open Folder</button>
            </div>
        </div>

        <!-- ── Inner tabs ── -->
        <div class="tabs-inner" style="margin-bottom: 20px;">
            <button :class="['inner-tab', { active: view === 'installed' }]" @click="view = 'installed'">
                Downloaded ({{ store.serverBuilds.length }})
            </button>
            <button :class="['inner-tab', { active: view === 'browse' }]" @click="view = 'browse'">
                Browse & Download
            </button>
        </div>

        <!-- ══════════ DOWNLOADED VIEW ══════════ -->
        <div v-if="view === 'installed'">

            <div v-if="store.serverBuilds.length === 0" class="empty-panel">
                <span class="empty-icon">📦</span>
                <span class="empty-title">NO SERVER JARS DOWNLOADED</span>
                <span class="empty-sub">Browse available builds to download your first server</span>
                <button class="btn btn-primary" @click="view = 'browse'">Browse Servers →</button>
            </div>

            <div v-else class="build-list">
                <div v-for="build in store.serverBuilds" :key="build.id" class="build-card"
                    :class="[softwareSlug(build.software), { active: build.isActive, downloading: build.status === 'downloading' }]">
                    <div class="active-strip" v-if="build.isActive">● ACTIVE SERVER</div>

                    <div class="build-card-main">
                        <!-- Software icon + version -->
                        <div class="build-software-col">
                            <div class="software-icon-lg" :class="softwareSlug(build.software)">
                                {{ softwareMeta[build.software]?.icon }}
                            </div>
                            <div>
                                <div class="build-software-name">{{ build.software }}</div>
                                <div class="build-mc-ver">{{ build.mcVersion }}</div>
                            </div>
                        </div>

                        <!-- Details -->
                        <div class="build-details">
                            <div class="build-detail-row">
                                <span class="detail-label">BUILD</span>
                                <span class="detail-val">#{{ build.build }}</span>
                            </div>
                            <div class="build-detail-row">
                                <span class="detail-label">RELEASED</span>
                                <span class="detail-val">{{ build.releaseDate }}</span>
                            </div>
                            <div class="build-detail-row">
                                <span class="detail-label">SIZE</span>
                                <span class="detail-val">{{ build.fileSize }}</span>
                            </div>
                            <div class="build-detail-row">
                                <span class="detail-label">JAVA</span>
                                <span class="detail-val java-req">{{ build.javaRequired }}+</span>
                            </div>
                            <div class="build-detail-row">
                                <span class="detail-label">TYPE</span>
                                <span class="channel-tag" :class="build.channel">{{ build.channel }}</span>
                            </div>
                        </div>

                        <!-- Changelog -->
                        <div class="build-changelog">
                            <div class="changelog-label">CHANGELOG</div>
                            <div class="changelog-text">{{ build.changelog }}</div>
                            <div class="sha-row">
                                <span class="sha-label">SHA256</span>
                                <span class="sha-val">{{ build.sha256.slice(0, 16) }}...</span>
                                <button class="copy-btn" @click="copySha(build.sha256)" title="Copy hash">📋</button>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="build-actions">
                            <div class="build-status-pill" :class="build.status">{{ buildStatusLabel(build.status) }}
                            </div>
                            <button class="btn btn-sm btn-primary"
                                :disabled="build.isActive || build.status === 'downloading'"
                                @click="setActive(build)">{{ build.isActive ? '✓ Active' : 'Set Active' }}</button>
                            <button class="btn btn-sm btn-outline" @click="openBuildFolder(build)">📁</button>
                            <button class="btn btn-sm btn-danger"
                                :disabled="build.isActive || build.status === 'downloading'"
                                @click="confirmDelete = build">✕</button>
                        </div>
                    </div>

                    <!-- Download progress -->
                    <div v-if="build.status === 'downloading'" class="download-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <span class="progress-label">Downloading {{ build.software }} {{ build.mcVersion }}...</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ══════════ BROWSE VIEW ══════════ -->
        <div v-if="view === 'browse'">

            <!-- Software picker -->
            <div class="software-picker">
                <button v-for="sw in softwareList" :key="sw.id"
                    :class="['software-btn', softwareSlug(sw.id), { active: selectedSoftware === sw.id }]"
                    @click="selectedSoftware = sw.id; selectedMcVersion = ''">
                    <span class="sw-btn-icon">{{ sw.icon }}</span>
                    <div class="sw-btn-info">
                        <span class="sw-btn-name">{{ sw.name }}</span>
                        <span class="sw-btn-type">{{ sw.type }}</span>
                    </div>
                    <span class="sw-btn-badge" v-if="sw.id === 'Paper'">Popular</span>
                </button>
            </div>

            <!-- Selected software description -->
            <div class="software-desc-bar" v-if="selectedSoftware">
                <div class="desc-left">
                    <span class="desc-icon">{{ softwareMeta[selectedSoftware]?.icon }}</span>
                    <div>
                        <span class="desc-name">{{ selectedSoftware }}</span>
                        <span class="desc-text">{{ softwareMeta[selectedSoftware]?.description }}</span>
                    </div>
                </div>
                <div class="desc-tag">{{ softwareMeta[selectedSoftware]?.recommendedFor }}</div>
            </div>

            <div v-if="selectedSoftware" class="browse-layout">

                <!-- MC version list (left column) -->
                <div class="version-sidebar">
                    <div class="sidebar-header">
                        <span class="sidebar-title">MC VERSION</span>
                        <div class="channel-filters">
                            <button v-for="ch in ['All', 'release', 'snapshot']" :key="ch"
                                :class="['chan-btn', { active: channelFilter === ch }]" @click="channelFilter = ch">{{
                                ch }}</button>
                        </div>
                    </div>
                    <div class="version-list">
                        <button v-for="v in filteredMcVersions" :key="v.version"
                            :class="['version-item', { active: selectedMcVersion === v.version }, v.channel]"
                            @click="selectedMcVersion = v.version">
                            <div class="version-item-main">
                                <span class="version-num">{{ v.version }}</span>
                                <span class="channel-dot" :class="v.channel"></span>
                            </div>
                            <div class="version-item-sub">
                                <span class="ver-date">{{ v.releaseDate }}</span>
                                <span class="installed-dot-sm" v-if="isVersionInstalled(v.version)">● installed</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Builds panel (right) -->
                <div class="builds-panel">
                    <div v-if="!selectedMcVersion" class="builds-empty">
                        <span class="builds-empty-icon">←</span>
                        <span>Select a Minecraft version</span>
                    </div>

                    <template v-else>
                        <div class="builds-header">
                            <div class="builds-title-row">
                                <span class="builds-title">{{ selectedSoftware }} builds for Minecraft {{
                                    selectedMcVersion }}</span>
                                <span class="builds-count">{{ currentBuilds.length }} build{{ currentBuilds.length !== 1
                                    ? 's' : '' }}</span>
                            </div>
                            <div class="builds-java-note" v-if="currentBuilds.length">
                                ☕ Requires Java {{ currentBuilds[0].javaRequired }}+
                                <span v-if="!hasCompatibleJava(currentBuilds[0].javaRequired)" class="java-warn">
                                    — ⚠ No compatible Java installed
                                    <button class="btn btn-sm btn-outline" @click="$emit('navigate', 'java')">Install
                                        Java →</button>
                                </span>
                            </div>
                        </div>

                        <div class="build-rows">
                            <div v-for="build in currentBuilds" :key="build.id" class="build-row"
                                :class="{ 'is-installed': build.status === 'installed', 'is-downloading': build.status === 'downloading', 'is-latest': build === currentBuilds[0] }">
                                <div class="build-row-left">
                                    <div class="build-num-col">
                                        <span class="build-num">#{{ build.build }}</span>
                                        <span class="latest-tag" v-if="build === currentBuilds[0]">LATEST</span>
                                    </div>
                                    <div class="build-row-meta">
                                        <div class="build-row-top">
                                            <span class="channel-tag" :class="build.channel">{{ build.channel }}</span>
                                            <span class="build-date">{{ build.releaseDate }}</span>
                                            <span class="build-size">{{ build.fileSize }}</span>
                                        </div>
                                        <div class="build-changelog-sm">{{ build.changelog }}</div>
                                    </div>
                                </div>

                                <div class="build-row-right">
                                    <div v-if="build.status === 'downloading'" class="dl-progress-inline">
                                        <div class="progress-bar sm">
                                            <div class="progress-fill"></div>
                                        </div>
                                        <span class="spinner">◌</span>
                                    </div>
                                    <template v-else-if="build.status === 'installed'">
                                        <span class="installed-badge">✓ Downloaded</span>
                                        <button class="btn btn-sm btn-primary" :disabled="build.isActive"
                                            @click="store.setActiveServerBuild(build.id); $emit('toast', { msg: `Active server set to ${build.software} ${build.mcVersion}`, type: 'success' })">{{
                                                build.isActive ? '● Active' : 'Set Active' }}</button>
                                    </template>
                                    <button v-else class="btn btn-sm btn-primary" :disabled="store.isDownloadingServer"
                                        @click="downloadBuild(build)">⬇
                                        Download</button>
                                </div>
                            </div>

                            <div v-if="currentBuilds.length === 0" class="builds-empty">
                                <span>No builds available for this version</span>
                            </div>
                        </div>
                    </template>
                </div>

            </div>

            <div v-else class="software-prompt">
                <span class="prompt-icon">☝</span>
                <span class="prompt-text">Select a server software above to browse versions</span>
            </div>

        </div>

        <!-- Delete confirm modal -->
        <div v-if="confirmDelete" class="modal-overlay" @click.self="confirmDelete = null">
            <div class="modal">
                <div class="modal-title">DELETE SERVER JAR</div>
                <div class="modal-body">
                    Delete <strong>{{ confirmDelete.software }} {{ confirmDelete.mcVersion }} build {{
                        confirmDelete.build
                        }}</strong>?
                    <br><span class="modal-hint">The .jar file will be permanently removed from disk.</span>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline btn-sm" @click="confirmDelete = null">CANCEL</button>
                    <button class="btn btn-danger btn-sm" @click="doDelete">DELETE</button>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { store } from '../store'
import type { ServerBuild, ServerSoftware, ServerSoftwareMeta, ReleaseChannel } from '../store'

// ── Static catalog ────────────────────────────────────────────────────────────
// In production, swap these with real API calls:
//   Paper:    https://api.papermc.io/v2/projects/paper
//   Spigot:   https://hub.spigotmc.org/versions
//   Fabric:   https://meta.fabricmc.net/v2/versions/loader
//   Forge:    https://files.minecraftforge.net/net/minecraftforge/forge
//   Vanilla:  https://launchermeta.mojang.com/mc/game/version_manifest.json

const MC_VERSIONS: { version: string; releaseDate: string; channel: ReleaseChannel }[] = [
    { version: '1.21.4', releaseDate: '2024-12-03', channel: 'release' },
    { version: '1.21.3', releaseDate: '2024-11-04', channel: 'release' },
    { version: '1.21.1', releaseDate: '2024-08-08', channel: 'release' },
    { version: '1.21', releaseDate: '2024-06-13', channel: 'release' },
    { version: '1.20.6', releaseDate: '2024-04-29', channel: 'release' },
    { version: '1.20.4', releaseDate: '2023-12-07', channel: 'release' },
    { version: '1.20.2', releaseDate: '2023-09-25', channel: 'release' },
    { version: '1.20.1', releaseDate: '2023-06-12', channel: 'release' },
    { version: '1.19.4', releaseDate: '2023-03-14', channel: 'release' },
    { version: '1.19.2', releaseDate: '2022-08-05', channel: 'release' },
    { version: '1.18.2', releaseDate: '2022-02-28', channel: 'release' },
    { version: '1.17.1', releaseDate: '2021-07-06', channel: 'release' },
    { version: '1.16.5', releaseDate: '2021-01-15', channel: 'release' },
    { version: '1.12.2', releaseDate: '2017-09-18', channel: 'release' },
    { version: '1.8.9', releaseDate: '2015-12-09', channel: 'release' },
    { version: '25w02a', releaseDate: '2025-01-08', channel: 'snapshot' },
    { version: '24w46a', releaseDate: '2024-11-13', channel: 'snapshot' },
]

// Generate mock build catalog per software+version
function makeBuild(
    software: ServerSoftware,
    mcVersion: string,
    buildNum: string,
    releaseDate: string,
    channel: ReleaseChannel,
    fileSize: string,
    javaRequired: number,
    changelog: string,
): ServerBuild {
    return {
        id: `${software.toLowerCase()}-${mcVersion}-${buildNum}`,
        software,
        mcVersion,
        build: buildNum,
        releaseDate,
        channel,
        fileSize,
        sha256: Math.random().toString(16).slice(2).padEnd(64, '0'),
        changelog,
        javaRequired,
        status: 'available',
        isActive: false,
        downloadUrl: '',
    }
}

const BUILD_CATALOG: Record<string, Record<string, ServerBuild[]>> = {
    Paper: {
        '1.21.4': [
            makeBuild('Paper', '1.21.4', '139', '2024-12-18', 'release', '47.2 MB', 21, 'Fix entity tracking desync, improve chunk loading, patch dupe exploit'),
            makeBuild('Paper', '1.21.4', '138', '2024-12-14', 'release', '47.1 MB', 21, 'Chunk system improvements, reduce memory usage on low-pop servers'),
            makeBuild('Paper', '1.21.4', '137', '2024-12-10', 'release', '47.0 MB', 21, 'Backport upstream Vanilla fixes, async region stabilisation'),
        ],
        '1.21.3': [
            makeBuild('Paper', '1.21.3', '101', '2024-11-15', 'release', '46.8 MB', 21, 'Security patches, perf improvements for large servers'),
            makeBuild('Paper', '1.21.3', '100', '2024-11-10', 'release', '46.7 MB', 21, 'Fix bed explosions in End, hoppers, scoreboard API'),
        ],
        '1.21.1': [
            makeBuild('Paper', '1.21.1', '56', '2024-08-22', 'release', '46.2 MB', 21, 'Arrow fix, item dupe patch, fisherman AI'),
        ],
        '1.20.4': [
            makeBuild('Paper', '1.20.4', '499', '2024-03-01', 'release', '44.9 MB', 17, 'Last stable 1.20.4 release — recommended for legacy servers'),
        ],
        '1.19.4': [
            makeBuild('Paper', '1.19.4', '550', '2023-06-01', 'release', '43.1 MB', 17, 'Warden AI, chunk perf, API additions'),
        ],
        '1.16.5': [
            makeBuild('Paper', '1.16.5', '794', '2021-05-10', 'release', '38.0 MB', 11, 'Long-term support release for 1.16'),
        ],
    },
    Vanilla: {
        '1.21.4': [
            makeBuild('Vanilla', '1.21.4', 'release', '2024-12-03', 'release', '49.1 MB', 21, 'Official Mojang server release'),
        ],
        '1.21.3': [
            makeBuild('Vanilla', '1.21.3', 'release', '2024-11-04', 'release', '48.9 MB', 21, 'Official Mojang server release'),
        ],
        '1.20.4': [
            makeBuild('Vanilla', '1.20.4', 'release', '2023-12-07', 'release', '47.2 MB', 17, 'Official Mojang server release'),
        ],
        '1.19.2': [
            makeBuild('Vanilla', '1.19.2', 'release', '2022-08-05', 'release', '44.1 MB', 17, 'Official Mojang server release'),
        ],
        '1.12.2': [
            makeBuild('Vanilla', '1.12.2', 'release', '2017-09-18', 'release', '34.0 MB', 8, 'Legacy release — Java 8 required'),
        ],
        '25w02a': [
            makeBuild('Vanilla', '25w02a', 'snapshot', '2025-01-08', 'snapshot', '49.5 MB', 21, 'Snapshot — experimental, not for production'),
        ],
        '24w46a': [
            makeBuild('Vanilla', '24w46a', 'snapshot', '2024-11-13', 'snapshot', '49.2 MB', 21, 'Snapshot — experimental, not for production'),
        ],
    },
    Spigot: {
        '1.21.4': [
            makeBuild('Spigot', '1.21.4', '4290', '2024-12-15', 'release', '45.0 MB', 21, 'Spigot 1.21.4 — Bukkit API compatible'),
        ],
        '1.20.4': [
            makeBuild('Spigot', '1.20.4', '3869', '2024-01-10', 'release', '43.5 MB', 17, 'Spigot 1.20.4'),
        ],
    },
    Purpur: {
        '1.21.4': [
            makeBuild('Purpur', '1.21.4', '2349', '2024-12-20', 'release', '48.1 MB', 21, 'Purpur 1.21.4 — Paper fork with extra config options'),
            makeBuild('Purpur', '1.21.4', '2348', '2024-12-16', 'release', '48.0 MB', 21, 'Mob riding config, rideable entities, performance tweaks'),
        ],
        '1.20.4': [
            makeBuild('Purpur', '1.20.4', '2132', '2024-02-01', 'release', '46.2 MB', 17, 'Purpur 1.20.4'),
        ],
    },
    Fabric: {
        '1.21.4': [
            makeBuild('Fabric', '1.21.4', '0.16.9', '2024-12-05', 'release', '4.2 MB', 21, 'Fabric loader 0.16.9 for Minecraft 1.21.4'),
            makeBuild('Fabric', '1.21.4', '0.16.8', '2024-11-20', 'release', '4.1 MB', 21, 'Fabric loader 0.16.8 — stability improvements'),
        ],
        '1.21.1': [
            makeBuild('Fabric', '1.21.1', '0.16.5', '2024-08-15', 'release', '4.0 MB', 21, 'Fabric loader 0.16.5'),
        ],
        '1.20.4': [
            makeBuild('Fabric', '1.20.4', '0.15.11', '2024-01-12', 'release', '3.9 MB', 17, 'Fabric loader 0.15.11'),
        ],
    },
    Forge: {
        '1.21.4': [
            makeBuild('Forge', '1.21.4', '54.0.16', '2024-12-12', 'release', '18.3 MB', 21, 'MinecraftForge 54.0.16'),
            makeBuild('Forge', '1.21.4', '54.0.14', '2024-12-01', 'release', '18.1 MB', 21, 'MinecraftForge 54.0.14 — initial 1.21.4 support'),
        ],
        '1.20.4': [
            makeBuild('Forge', '1.20.4', '49.2.0', '2024-03-15', 'release', '17.6 MB', 17, 'MinecraftForge 49.2.0'),
        ],
        '1.12.2': [
            makeBuild('Forge', '1.12.2', '14.23.5.2859', '2019-12-31', 'release', '11.4 MB', 8, 'Forge legacy LTS — most 1.12.2 modpacks'),
        ],
    },
    NeoForge: {
        '1.21.4': [
            makeBuild('NeoForge', '1.21.4', '21.4.70', '2024-12-14', 'release', '18.8 MB', 21, 'NeoForge 21.4.70 — recommended'),
            makeBuild('NeoForge', '1.21.4', '21.4.65', '2024-12-07', 'release', '18.7 MB', 21, 'NeoForge 21.4.65'),
        ],
        '1.20.4': [
            makeBuild('NeoForge', '1.20.4', '20.4.237', '2024-03-20', 'release', '17.9 MB', 17, 'NeoForge 20.4.237'),
        ],
    },
    Quilt: {
        '1.21.4': [
            makeBuild('Quilt', '1.21.4', '0.26.4', '2024-12-10', 'release', '5.1 MB', 21, 'Quilt loader 0.26.4 — Fabric-compatible'),
        ],
        '1.20.4': [
            makeBuild('Quilt', '1.20.4', '0.24.0', '2024-01-18', 'release', '4.8 MB', 17, 'Quilt loader 0.24.0'),
        ],
    },
    Folia: {
        '1.21.4': [
            makeBuild('Folia', '1.21.4', '28', '2024-12-22', 'release', '50.1 MB', 21, 'Folia — region-based multithreading for large servers'),
            makeBuild('Folia', '1.21.4', '27', '2024-12-18', 'release', '50.0 MB', 21, 'Region scheduling improvements, bug fixes'),
        ],
        '1.20.4': [
            makeBuild('Folia', '1.20.4', '18', '2024-02-10', 'release', '47.8 MB', 17, 'Folia 1.20.4'),
        ],
    },
    Magma: {
        '1.21.4': [
            makeBuild('Magma', '1.21.4', '28', '2024-12-22', 'release', '50.1 MB', 21, 'Magma 1.21.4 — hybrid Forge + Bukkit server'),
        ],
        '1.20.4': [
            makeBuild('Magma', '1.20.4', '18', '2024-02-10', 'release', '47.8 MB', 17, 'Magma 1.20.4'),
        ],
    },
    Spigot: {
        '1.21.4': [
            makeBuild('Spigot', '1.21.4', '4290', '2024-12-15', 'release', '45.0 MB', 21, 'Spigot 1.21.4 — Bukkit API compatible'),
            makeBuild('Spigot', '1.21.4', '4289', '2024-12-10', 'release', '44.9 MB', 21, 'Bug fixes, performance improvements'),
        ],
        '1.20.4': [
            makeBuild('Spigot', '1.20.4', '3869', '2024-01-10', 'release', '43.5 MB', 17, 'Spigot 1.20.4'),
        ],
    },
    Quilt: {
        '1.21.4': [
            makeBuild('Quilt', '1.21.4', '0.26.4', '2024-12-10', 'release', '5.1 MB', 21, 'Quilt loader 0.26.4 — Fabric-compatible'),
            makeBuild('Quilt', '1.21.4', '0.26.3', '2024-12-01', 'release', '5.0 MB', 21, 'Quilt loader 0.26.3'),
        ],
        '1.20.4': [
            makeBuild('Quilt', '1.20.4', '0.24.0', '2024-01-18', 'release', '4.8 MB', 17, 'Quilt loader 0.24.0'),
        ],
    },
}

const SOFTWARE_META: Record<ServerSoftware, ServerSoftwareMeta> = {
    Paper: { id: 'Paper', name: 'Paper', icon: '📄', description: 'High-performance Paper server — best plugin compatibility and optimizations.', type: 'plugin', recommendedFor: 'Recommended for most servers', color: '#f87171' },
    Spigot: { id: 'Spigot', name: 'Spigot', icon: '🪣', description: 'The original Bukkit fork. Slightly less optimized than Paper but well-tested.', type: 'plugin', recommendedFor: 'Legacy plugin compatibility', color: '#fbbf24' },
    Purpur: { id: 'Purpur', name: 'Purpur', icon: '🟣', description: 'Paper fork with hundreds of extra configuration options and gameplay tweaks.', type: 'plugin', recommendedFor: 'Highly configurable servers', color: '#a78bfa' },
    Vanilla: { id: 'Vanilla', name: 'Vanilla', icon: '🎮', description: 'Official Mojang server. No mod/plugin support. Pure vanilla experience.', type: 'vanilla', recommendedFor: 'Pure vanilla gameplay', color: '#4ade80' },
    Fabric: { id: 'Fabric', name: 'Fabric', icon: '🧵', description: 'Lightweight, modular mod loader. Fast update cycle, excellent performance mods.', type: 'mod', recommendedFor: 'Performance & client-side mods', color: '#60a5fa' },
    Forge: { id: 'Forge', name: 'Forge', icon: '🔨', description: 'The classic mod loader. Largest mod ecosystem, especially for older versions.', type: 'mod', recommendedFor: 'Large modpacks & legacy mods', color: '#fb923c' },
    NeoForge: { id: 'NeoForge', name: 'NeoForge', icon: '⚒', description: "Community-maintained Forge fork. Modern API, active development. Forge's successor.", type: 'mod', recommendedFor: 'Modern Forge-compatible mods', color: '#c084fc' },
    Quilt: { id: 'Quilt', name: 'Quilt', icon: '🪡', description: 'Fabric fork with more features. Backwards-compatible with most Fabric mods.', type: 'mod', recommendedFor: 'Extended Fabric ecosystem', color: '#34d399' },
    Folia: { id: 'Folia', name: 'Folia', icon: '🌿', description: 'Experimental Paper fork using region-based multithreading for massive servers.', type: 'plugin', recommendedFor: '500+ player servers (experimental)', color: '#6ee7b7' },
    Magma: { id: 'Magma', name: 'Magma', icon: '🌋', description: 'Hybrid server running both Forge mods and Bukkit plugins. Unstable.', type: 'hybrid', recommendedFor: 'Mods + plugins (use with caution)', color: '#ef4444' },
}

export default defineComponent({
    name: 'ServerVersionsPage',
    emits: ['toast', 'navigate'],

    data() {
        return {
            store,
            view: 'installed' as 'installed' | 'browse',
            selectedSoftware: '' as ServerSoftware | '',
            selectedMcVersion: '',
            channelFilter: 'All',
            confirmDelete: null as ServerBuild | null,
            softwareMeta: SOFTWARE_META,
            softwareList: Object.values(SOFTWARE_META),
        }
    },

    computed: {
        activeBuild(): ServerBuild | undefined {
            return this.store.activeServerBuild
        },
        activeSlug(): string {
            return this.activeBuild ? this.softwareSlug(this.activeBuild.software) : 'none'
        },
        filteredMcVersions() {
            const catalog = this.selectedSoftware ? (BUILD_CATALOG[this.selectedSoftware] ?? {}) : {}
            const availableVersions = new Set(Object.keys(catalog))
            return MC_VERSIONS.filter(v => {
                const inCatalog = availableVersions.has(v.version)
                const matchChannel = this.channelFilter === 'All' || v.channel === this.channelFilter
                return inCatalog && matchChannel
            })
        },
        currentBuilds(): ServerBuild[] {
            if (!this.selectedSoftware || !this.selectedMcVersion) return []
            const catalog = BUILD_CATALOG[this.selectedSoftware]?.[this.selectedMcVersion] ?? []
            // Merge status from store
            return catalog.map(b => {
                const stored = this.store.serverBuilds.find(s => s.id === b.id)
                return stored ?? b
            })
        },
    },

    methods: {
        softwareSlug(sw: ServerSoftware): string {
            return sw.toLowerCase().replace(/\s/g, '-')
        },
        buildStatusLabel(status: string): string {
            return ({ installed: '● Downloaded', downloading: '◌ Downloading', available: '○ Available' } as Record<string, string>)[status] ?? status
        },
        isVersionInstalled(version: string): boolean {
            return this.store.serverBuilds.some(b => b.mcVersion === version && b.status === 'installed')
        },
        hasCompatibleJava(required: number): boolean {
            return this.store.javaInstallations.some(j => j.majorVersion >= required && j.status !== 'error')
        },
        async downloadBuild(build: ServerBuild): Promise<void> {
            const existing = this.store.serverBuilds.find(b => b.id === build.id)
            if (!existing) {
                this.store.serverBuilds.push({ ...build })
                const stored = this.store.serverBuilds[this.store.serverBuilds.length - 1]
                this.store.downloadServerBuild(stored)
            } else {
                this.store.downloadServerBuild(existing)
            }
            try {
                const { api } = await import('../api')

                // Use unified backend install API for all software types
                await api.installServerSoftware(build.software, build.mcVersion, build.build)
                await api.acceptEula()

                this.$emit('toast', { msg: `Downloaded ${build.software} ${build.mcVersion} (build ${build.build})`, type: 'success' })
            } catch (e: any) {
                this.$emit('toast', { msg: `Download failed: ${e}`, type: 'danger' })
            }
        },
        setActive(build: ServerBuild): void {
            this.store.setActiveServerBuild(build.id)
            this.$emit('toast', { msg: `Active server: ${build.software} ${build.mcVersion}`, type: 'success' })
        },
        doDelete(): void {
            if (!this.confirmDelete) return
            this.store.deleteServerBuild(this.confirmDelete.id)
            this.$emit('toast', { msg: `Deleted ${this.confirmDelete.software} ${this.confirmDelete.mcVersion}`, type: 'danger' })
            this.confirmDelete = null
        },
        copySha(sha: string): void {
            navigator.clipboard?.writeText(sha)
            this.$emit('toast', { msg: 'SHA256 copied!', type: 'success' })
        },
        async openServerFolder(): Promise<void> {
            try {
                const { api } = await import('../api')
                await api.openServerFolder()
            } catch (e: any) {
                this.$emit('toast', { msg: `Could not open folder: ${e}`, type: 'danger' })
            }
        },
        async openBuildFolder(_build: ServerBuild): Promise<void> {
            try {
                const { api } = await import('../api')
                const dir = await api.getServerDirPath()
                await api.openFolder(dir)
            } catch (e: any) {
                this.$emit('toast', { msg: `Could not open folder: ${e}`, type: 'danger' })
            }
        },
    },
})
</script>

<style scoped>
/* ── Hero ── */
.server-hero {
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

.server-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.04;
    background: radial-gradient(circle at 0% 50%, var(--hero-color, transparent) 0%, transparent 60%);
}

.server-hero.paper {
    --hero-color: #f87171;
    border-color: #f8717133;
}

.server-hero.vanilla {
    --hero-color: #4ade80;
    border-color: #4ade8033;
}

.server-hero.fabric {
    --hero-color: #60a5fa;
    border-color: #60a5fa33;
}

.server-hero.forge {
    --hero-color: #fb923c;
    border-color: #fb923c33;
}

.server-hero.neoforge {
    --hero-color: #c084fc;
    border-color: #c084fc33;
}

.server-hero.purpur {
    --hero-color: #a78bfa;
    border-color: #a78bfa33;
}

.server-hero.spigot {
    --hero-color: #fbbf24;
    border-color: #fbbf2433;
}

.server-hero.folia {
    --hero-color: #34d399;
    border-color: #34d39933;
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
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: 1px;
}

.hero-name.muted {
    color: var(--muted);
    font-size: 22px;
}

.hero-mc {
    color: var(--text2);
    font-size: 22px;
}

.hero-build {
    font-size: 14px;
    color: var(--muted);
    font-family: 'Share Tech Mono', monospace;
}

.hero-sub {
    font-size: 12px;
    color: var(--text2);
    margin-top: 2px;
}

.hero-sub.muted {
    color: var(--muted);
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
}

.hero-stat-lbl {
    display: block;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 1px;
}

/* ── Downloaded builds list ── */
.build-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.build-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: border-color 0.2s;
}

.build-card.active {
    border-color: var(--green);
}

.build-card:hover {
    border-color: var(--text2);
}

/* Software accent */
.build-card.paper {
    border-left: 3px solid #f87171;
}

.build-card.vanilla {
    border-left: 3px solid #4ade80;
}

.build-card.fabric {
    border-left: 3px solid #60a5fa;
}

.build-card.forge {
    border-left: 3px solid #fb923c;
}

.build-card.neoforge {
    border-left: 3px solid #c084fc;
}

.build-card.purpur {
    border-left: 3px solid #a78bfa;
}

.build-card.spigot {
    border-left: 3px solid #fbbf24;
}

.build-card.folia {
    border-left: 3px solid #34d399;
}

.build-card.quilt {
    border-left: 3px solid #34d399;
}

.active-strip {
    background: rgba(74, 222, 128, 0.08);
    border-bottom: 1px solid var(--green2);
    padding: 3px 14px;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--green);
}

.build-card-main {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 16px;
    flex-wrap: wrap;
}

.build-software-col {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}

.software-icon-lg {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: var(--bg3);
    border: 1px solid var(--border);
}

.software-icon-lg.paper {
    background: rgba(248, 113, 113, 0.1);
    border-color: #f8717133;
}

.software-icon-lg.vanilla {
    background: rgba(74, 222, 128, 0.1);
    border-color: #4ade8033;
}

.software-icon-lg.fabric {
    background: rgba(96, 165, 250, 0.1);
    border-color: #60a5fa33;
}

.software-icon-lg.forge {
    background: rgba(251, 146, 60, 0.1);
    border-color: #fb923c33;
}

.software-icon-lg.neoforge {
    background: rgba(192, 132, 252, 0.1);
    border-color: #c084fc33;
}

.software-icon-lg.purpur {
    background: rgba(167, 139, 250, 0.1);
    border-color: #a78bfa33;
}

.software-icon-lg.spigot {
    background: rgba(251, 191, 36, 0.1);
    border-color: #fbbf2433;
}

.software-icon-lg.folia {
    background: rgba(52, 211, 153, 0.1);
    border-color: #34d39933;
}

.build-software-name {
    font-size: 15px;
    font-weight: 600;
}

.build-mc-ver {
    font-family: 'VT323', monospace;
    font-size: 22px;
    color: var(--text2);
    line-height: 1;
}

.build-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex-shrink: 0;
}

.build-detail-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-label {
    font-size: 9px;
    letter-spacing: 1.5px;
    color: var(--muted);
    width: 58px;
}

.detail-val {
    font-size: 12px;
    color: var(--text2);
}

.java-req {
    color: var(--blue);
}

.build-changelog {
    flex: 1;
    min-width: 160px;
}

.changelog-label {
    font-size: 9px;
    letter-spacing: 1.5px;
    color: var(--muted);
    margin-bottom: 4px;
}

.changelog-text {
    font-size: 11px;
    color: var(--text2);
    line-height: 1.6;
    margin-bottom: 8px;
}

.sha-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.sha-label {
    font-size: 9px;
    color: var(--muted);
}

.sha-val {
    font-size: 10px;
    font-family: 'Share Tech Mono', monospace;
    color: var(--muted);
}

.copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    padding: 0 2px;
}

.build-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-shrink: 0;
    align-items: flex-end;
    justify-content: flex-start;
}

.build-status-pill {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 3px;
    white-space: nowrap;
    text-align: center;
}

.build-status-pill.installed {
    background: rgba(74, 222, 128, 0.1);
    color: var(--green);
}

.build-status-pill.downloading {
    background: rgba(251, 191, 36, 0.1);
    color: var(--yellow);
}

.build-status-pill.available {
    background: rgba(75, 85, 99, 0.2);
    color: var(--muted);
}

/* Progress bar */
.download-progress {
    padding: 0 16px 12px;
}

.progress-bar {
    height: 3px;
    background: var(--bg3);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
}

.progress-bar.sm {
    height: 2px;
    width: 80px;
}

.progress-fill {
    height: 100%;
    background: var(--green);
    border-radius: 2px;
    animation: progress-anim 1.8s ease-in-out infinite;
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

/* ── Software picker ── */
.software-picker {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
    margin-bottom: 16px;
}

.software-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 14px;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    text-align: left;
}

.software-btn:hover {
    border-color: var(--text2);
    background: var(--bg3);
}

.software-btn.active {
    background: var(--bg3);
}

.software-btn.paper.active {
    border-color: #f87171;
    box-shadow: 0 0 0 1px #f8717133;
}

.software-btn.vanilla.active {
    border-color: #4ade80;
    box-shadow: 0 0 0 1px #4ade8033;
}

.software-btn.fabric.active {
    border-color: #60a5fa;
    box-shadow: 0 0 0 1px #60a5fa33;
}

.software-btn.forge.active {
    border-color: #fb923c;
    box-shadow: 0 0 0 1px #fb923c33;
}

.software-btn.neoforge.active {
    border-color: #c084fc;
    box-shadow: 0 0 0 1px #c084fc33;
}

.software-btn.purpur.active {
    border-color: #a78bfa;
    box-shadow: 0 0 0 1px #a78bfa33;
}

.software-btn.spigot.active {
    border-color: #fbbf24;
    box-shadow: 0 0 0 1px #fbbf2433;
}

.software-btn.folia.active {
    border-color: #34d399;
    box-shadow: 0 0 0 1px #34d39933;
}

.software-btn.quilt.active {
    border-color: #34d399;
    box-shadow: 0 0 0 1px #34d39933;
}

.software-btn.magma.active {
    border-color: #ef4444;
    box-shadow: 0 0 0 1px #ef444433;
}

.sw-btn-icon {
    font-size: 22px;
    flex-shrink: 0;
}

.sw-btn-info {
    flex: 1;
    min-width: 0;
}

.sw-btn-name {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
}

.sw-btn-type {
    display: block;
    font-size: 10px;
    color: var(--muted);
    margin-top: 1px;
}

.sw-btn-badge {
    position: absolute;
    top: 6px;
    right: 8px;
    font-size: 9px;
    background: rgba(74, 222, 128, 0.15);
    border: 1px solid var(--green2);
    color: var(--green);
    padding: 1px 5px;
    border-radius: 2px;
}

/* Software description bar */
.software-desc-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    margin-bottom: 16px;
    gap: 12px;
}

.desc-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.desc-icon {
    font-size: 22px;
}

.desc-name {
    display: block;
    font-size: 14px;
    font-weight: 600;
}

.desc-text {
    display: block;
    font-size: 11px;
    color: var(--text2);
    margin-top: 2px;
}

.desc-tag {
    font-size: 11px;
    color: var(--muted);
    background: var(--bg3);
    border: 1px solid var(--border);
    padding: 4px 10px;
    border-radius: var(--radius);
    white-space: nowrap;
}

/* Browse layout */
.browse-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 14px;
    align-items: start;
}

/* Version sidebar */
.version-sidebar {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
}

.sidebar-header {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    background: var(--bg3);
}

.sidebar-title {
    display: block;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    margin-bottom: 8px;
}

.channel-filters {
    display: flex;
    gap: 4px;
}

.chan-btn {
    padding: 2px 7px;
    background: none;
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--muted);
    cursor: pointer;
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    transition: all 0.12s;
}

.chan-btn.active {
    border-color: var(--green);
    color: var(--green);
}

.version-list {
    max-height: 520px;
    overflow-y: auto;
}

.version-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    background: none;
    border: none;
    border-bottom: 1px solid rgba(30, 45, 61, 0.4);
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
}

.version-item:hover {
    background: var(--bg3);
}

.version-item.active {
    background: rgba(74, 222, 128, 0.07);
    border-left: 2px solid var(--green);
}

.version-item-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.version-num {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
}

.channel-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

.channel-dot.release {
    background: var(--green);
}

.channel-dot.snapshot {
    background: var(--yellow);
}

.version-item-sub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;
}

.ver-date {
    font-size: 10px;
    color: var(--muted);
}

.installed-dot-sm {
    font-size: 9px;
    color: var(--green);
}

/* Builds panel */
.builds-panel {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
}

.builds-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 48px;
    color: var(--muted);
    font-size: 13px;
}

.builds-empty-icon {
    font-size: 20px;
}

.builds-header {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--bg3);
}

.builds-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
}

.builds-title {
    font-size: 13px;
    font-weight: 600;
}

.builds-count {
    font-size: 11px;
    color: var(--muted);
}

.builds-java-note {
    font-size: 11px;
    color: var(--text2);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.java-warn {
    color: var(--yellow);
    display: flex;
    align-items: center;
    gap: 6px;
}

.build-rows {
    padding: 6px 0;
}

.build-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(30, 45, 61, 0.4);
    transition: background 0.1s;
}

.build-row:last-child {
    border-bottom: none;
}

.build-row:hover {
    background: var(--bg3);
}

.build-row.is-latest {
    background: rgba(74, 222, 128, 0.03);
}

.build-row.is-installed {}

.build-row-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 0;
}

.build-num-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    width: 52px;
}

.build-num {
    font-family: 'VT323', monospace;
    font-size: 18px;
    color: var(--text);
}

.latest-tag {
    font-size: 8px;
    background: rgba(74, 222, 128, 0.15);
    border: 1px solid var(--green2);
    color: var(--green);
    padding: 1px 4px;
    border-radius: 2px;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.build-row-meta {
    flex: 1;
    min-width: 0;
}

.build-row-top {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 3px;
}

.build-date {
    font-size: 11px;
    color: var(--muted);
}

.build-size {
    font-size: 11px;
    color: var(--muted);
}

.build-changelog-sm {
    font-size: 11px;
    color: var(--text2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.build-row-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.dl-progress-inline {
    display: flex;
    align-items: center;
    gap: 6px;
}

.installed-badge {
    font-size: 11px;
    color: var(--green);
}

/* Channel tags */
.channel-tag {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
}

.channel-tag.release {
    background: rgba(74, 222, 128, 0.1);
    color: var(--green);
}

.channel-tag.snapshot {
    background: rgba(251, 191, 36, 0.1);
    color: var(--yellow);
}

.channel-tag.beta {
    background: rgba(96, 165, 250, 0.1);
    color: var(--blue);
}

.channel-tag.alpha {
    background: rgba(248, 113, 113, 0.1);
    color: var(--red);
}

/* Prompt */
.software-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 48px;
    color: var(--muted);
    font-size: 13px;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
}

.prompt-icon {
    font-size: 20px;
}

/* Empty panel */
.empty-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    text-align: center;
}

.empty-icon {
    font-size: 48px;
}

.empty-title {
    font-family: 'VT323', monospace;
    font-size: 22px;
    letter-spacing: 3px;
}

.empty-sub {
    font-size: 12px;
    color: var(--muted);
}

/* Modal */
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