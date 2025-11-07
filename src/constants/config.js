// Game Configuration
const CONFIG = {
    canvas: {
        width: window.innerWidth,
        height: window.innerHeight
    },
    world: {
        width: 8000,  // Much larger map
        height: 8000  // Much larger map
    },
    player: {
        size: 12,
        speed: 2,  // Reduced from 3 to 2
        maxHp: 100
    },
    enemy: {
        size: 15,
        speed: 1.5,
        spawnRate: 1000, // ms (base rate, will decrease over time)
        maxEnemies: 100
    },
    weapon: {
        damage: 10,
        range: 150,
        cooldown: 500 // ms
    },
    difficulty: {
        // Scaling over time - tuned for 20 minute end game
        scalingInterval: 60000, // Every 60 seconds (1 minute)
        speedIncrease: 0.075, // 7.5% speed increase per interval
        hpIncrease: 0.125, // 12.5% HP increase per interval
        damageIncrease: 0.075, // 7.5% damage increase per interval
        spawnRateDecrease: 0.96, // Spawn 4% faster per interval (multiply by 0.96)
        maxEnemiesIncrease: 5, // +5 max enemies per interval
        maxSpeedMultiplier: 3, // Max 3x speed (reached at ~16 min)
        maxHpMultiplier: 6, // Max 6x HP (reached at ~20 min)
        maxDamageMultiplier: 3, // Max 3x damage (reached at ~16 min)
        minSpawnRate: 250, // Minimum 250ms between spawns
        maxEnemiesCap: 250 // Cap at 250 enemies
    }
};
