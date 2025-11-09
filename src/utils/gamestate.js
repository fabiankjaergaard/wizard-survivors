// Game State (expose to window for React UI)
window.gameState = {
    player: {
        x: 0,
        y: 0,
        hp: CONFIG.player.maxHp,
        maxHp: CONFIG.player.maxHp,
        speed: CONFIG.player.speed,
        level: 1,
        xp: 0,
        xpToLevel: 10,
        direction: 'right',
        isMoving: false,
        animationFrame: 0,
        isDashing: false,
        dashCooldown: 0,
        dashDuration: 0,
        dashDx: 0,
        dashDy: 0,
        hasXPMagnet: false, // XP Magnet upgrade
        maxWeapons: 3, // Can have 3 weapons active
        weapons: [ // Start with magic missile
            {
                type: 'magic_missile',
                name: 'Magic Missile',
                damage: 10,
                range: 300,
                cooldown: 500,
                level: 1,
                projectileCount: 1, // For multi-projectile upgrades
                lastFired: 0
            }
        ],
        // Ultimate ability system
        ultimate: {
            type: 'meteor_storm',
            name: 'Meteor Storm',
            icon: 'MTR'
        }, // Start with Meteor Storm for testing
        ultimateCooldown: 0, // Time until ultimate is ready again
        ultimateActive: false // Whether ultimate effect is currently active
    },
    enemies: [],
    projectiles: [],
    particles: [],
    xpOrbs: [],
    chests: [],
    coins: 0,
    orbitingOrbs: [],
    homingMissiles: [],
    tornadoes: [],
    damageNumbers: [], // Floating damage text
    critChance: 0.15, // 15% base crit chance
    critMultiplier: 2.0, // 2x damage on crit
    spinningBlades: [],
    meteors: [],
    chainLightnings: [],
    spiritWolves: [],
    blackHoles: [],
    poisonClouds: [],
    crystalShards: [],
    frostNovas: [],
    thunderHammers: [],
    shadowClones: [],
    swordSpinAttack: null,
    keys: {},
    kills: 0,
    gameTime: 0,
    lastSpawn: 0,
    lastAttack: 0,
    isPaused: false,
    isGameOver: false,
    showLevelUp: false,
    showChestPopup: false,
    openingChest: null,
    currentUpgrades: null,
    animationCounter: 0
};

// gameState is now available globally via window.gameState (no export needed for browser)
