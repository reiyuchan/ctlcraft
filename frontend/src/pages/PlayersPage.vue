<template>
    <div class="tab-content">

        <div class="players-toolbar">
            <input v-model="playerSearch" class="search-input" placeholder="🔍 Search players..." />
            <div class="toolbar-right">
                <button class="btn btn-sm btn-outline">+ BAN</button>
                <button class="btn btn-sm btn-primary">WHITELIST</button>
            </div>
        </div>

        <div class="tabs-inner">
            <button v-for="t in playerTabs" :key="t" :class="['inner-tab', { active: activePlayerTab === t }]"
                @click="activePlayerTab = t">{{ t }}</button>
        </div>

        <div class="card">
            <table class="players-table">
                <thead>
                    <tr>
                        <th>PLAYER</th>
                        <th>STATUS</th>
                        <th>LAST SEEN</th>
                        <th>PLAYTIME</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in filteredPlayers" :key="p.name">
                        <td>
                            <div class="td-player">
                                <div class="player-avatar sm" :style="{ background: p.color }">{{ p.name[0] }}</div>
                                <span>{{ p.name }}</span>
                                <span v-if="p.op" class="op-badge">OP</span>
                            </div>
                        </td>
                        <td>
                            <span class="status-pill" :class="p.online ? 'online' : 'offline'">
                                {{ p.online ? 'Online' : 'Offline' }}
                            </span>
                        </td>
                        <td class="td-muted">{{ p.lastSeen }}</td>
                        <td class="td-muted">{{ p.playtime }}</td>
                        <td>
                            <div class="action-row">
                                <button class="tbl-btn" @click="opToggle(p)">{{ p.op ? 'Deop' : 'Op' }}</button>
                                <button class="tbl-btn warn" @click="kickPlayer(p.name)">Kick</button>
                                <button class="tbl-btn danger" @click="banPlayer(p.name)">Ban</button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="filteredPlayers.length === 0">
                        <td colspan="5" class="empty-row">No players found</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>

<script>
import { store } from '../store.js'

export default {
    name: 'PlayersPage',
    emits: ['toast'],
    data() {
        return {
            store,
            playerSearch: '',
            activePlayerTab: 'All Players',
            playerTabs: ['All Players', 'Online', 'Banned', 'Whitelist'],
        }
    },
    computed: {
        filteredPlayers() {
            let list = this.store.allPlayers
            if (this.activePlayerTab === 'Online') list = list.filter(p => p.online)
            if (this.playerSearch) list = list.filter(p =>
                p.name.toLowerCase().includes(this.playerSearch.toLowerCase())
            )
            return list
        },
    },
    methods: {
        kickPlayer(name) {
            this.store.kickPlayer(name)
            this.$emit('toast', { msg: `Kicked ${name}`, type: 'warn' })
        },
        banPlayer(name) {
            this.$emit('toast', { msg: `Banned ${name}`, type: 'danger' })
        },
        opToggle(player) {
            player.op = !player.op
            this.$emit('toast', {
                msg: `${player.op ? 'Opped' : 'Deopped'} ${player.name}`,
                type: 'success',
            })
        },
    },
}
</script>

<style scoped>
.players-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
}

.toolbar-right {
    display: flex;
    gap: 8px;
}

.players-table {
    width: 100%;
    border-collapse: collapse;
}

.players-table th {
    padding: 10px 16px;
    text-align: left;
    font-size: 11px;
    letter-spacing: 1.5px;
    color: var(--muted);
    border-bottom: 1px solid var(--border);
}

.players-table td {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(30, 45, 61, 0.5);
}

.players-table tr:hover td {
    background: var(--bg3);
}

.td-player {
    display: flex;
    align-items: center;
    gap: 8px;
}

.td-muted {
    color: var(--text2);
    font-size: 12px;
}

.action-row {
    display: flex;
    gap: 6px;
}

.empty-row {
    text-align: center;
    color: var(--muted);
    padding: 24px !important;
}
</style>