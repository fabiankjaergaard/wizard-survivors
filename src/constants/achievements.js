// Achievements Database
const ACHIEVEMENTS = {
    kill_1000_enemies: {
        id: 'kill_1000_enemies',
        name: 'Slayer of Thousands',
        description: 'Kill 1000 enemies',
        icon: 'K1K',
        requirement: {type: 'kills', value: 1000},
        reward: 'titan_form',
        unlocked: false
    },
    survive_20_minutes: {
        id: 'survive_20_minutes',
        name: 'Endurance Master',
        description: 'Survive for 20 minutes',
        icon: 'T20',
        requirement: {type: 'time', value: 1200000}, // 20 minutes in ms
        reward: 'void_rift',
        unlocked: false
    },
    kill_boss_without_damage: {
        id: 'kill_boss_without_damage',
        name: 'Untouchable',
        description: 'Kill a major boss without taking damage',
        icon: 'NHT',
        requirement: {type: 'boss_no_damage', value: 1},
        reward: 'cosmic_storm',
        unlocked: false
    },
    reach_level_50: {
        id: 'reach_level_50',
        name: 'Legendary Wizard',
        description: 'Reach level 50',
        icon: 'L50',
        requirement: {type: 'level', value: 50},
        reward: 'dragons_fury',
        unlocked: false
    }
};

// Expose ACHIEVEMENTS to window
window.ACHIEVEMENTS = ACHIEVEMENTS;
