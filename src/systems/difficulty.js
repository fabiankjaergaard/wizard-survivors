// Difficulty scaling function
function getDifficultyMultipliers() {
    const timeInSeconds = gameState.gameTime / 1000;
    const intervals = Math.floor(timeInSeconds / 60); // Every 60 seconds (1 minute)

    // Calculate multipliers with caps
    const speedMultiplier = Math.min(
        1 + (intervals * CONFIG.difficulty.speedIncrease),
        CONFIG.difficulty.maxSpeedMultiplier
    );

    const hpMultiplier = Math.min(
        1 + (intervals * CONFIG.difficulty.hpIncrease),
        CONFIG.difficulty.maxHpMultiplier
    );

    const damageMultiplier = Math.min(
        1 + (intervals * CONFIG.difficulty.damageIncrease),
        CONFIG.difficulty.maxDamageMultiplier
    );

    const spawnRate = Math.max(
        CONFIG.enemy.spawnRate * Math.pow(CONFIG.difficulty.spawnRateDecrease, intervals),
        CONFIG.difficulty.minSpawnRate
    );

    const maxEnemies = Math.min(
        CONFIG.enemy.maxEnemies + (intervals * CONFIG.difficulty.maxEnemiesIncrease),
        CONFIG.difficulty.maxEnemiesCap
    );

    return {
        speed: speedMultiplier,
        hp: hpMultiplier,
        damage: damageMultiplier,
        spawnRate: spawnRate,
        maxEnemies: maxEnemies,
        intervals: intervals
    };
}
