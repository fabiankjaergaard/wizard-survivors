// Spawn enemies
function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const spawnDistance = 50; // Distance outside visible screen

    switch(side) {
        case 0: // Top
            x = camera.x + Math.random() * canvas.width;
            y = camera.y - spawnDistance;
            break;
        case 1: // Right
            x = camera.x + canvas.width + spawnDistance;
            y = camera.y + Math.random() * canvas.height;
            break;
        case 2: // Bottom
            x = camera.x + Math.random() * canvas.width;
            y = camera.y + canvas.height + spawnDistance;
            break;
        case 3: // Left
            x = camera.x - spawnDistance;
            y = camera.y + Math.random() * canvas.height;
            break;
    }

    // Make sure enemies spawn within world bounds
    x = Math.max(0, Math.min(x, CONFIG.world.width));
    y = Math.max(0, Math.min(y, CONFIG.world.height));

    // Random enemy type selection with weighted probabilities
    // Enemy types unlock based on game time to progressively increase difficulty
    const gameTimeMinutes = gameState.gameTime / 60000; // Convert to minutes
    const roll = Math.random();

    // Phase 1 (0-1 min): Only normal enemies and occasional chargers
    if (gameTimeMinutes < 1) {
        if (roll < 0.2) {
            gameState.enemies.push(new ChargerEnemy(x, y));
        } else {
            gameState.enemies.push(new Enemy(x, y));
        }
    }
    // Phase 2 (1-2 min): Introduce Swarm and Teleporter
    else if (gameTimeMinutes < 2) {
        if (roll < 0.1) {
            // Swarm enemies spawn in groups of 3-5
            const swarmSize = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < swarmSize; i++) {
                const angle = (Math.PI * 2 / swarmSize) * i + Math.random() * 0.5;
                const offsetDist = 30;
                gameState.enemies.push(new SwarmEnemy(
                    x + Math.cos(angle) * offsetDist,
                    y + Math.sin(angle) * offsetDist
                ));
            }
        } else if (roll < 0.25) {
            gameState.enemies.push(new TeleporterEnemy(x, y));
        } else if (roll < 0.4) {
            gameState.enemies.push(new ChargerEnemy(x, y));
        } else {
            gameState.enemies.push(new Enemy(x, y));
        }
    }
    // Phase 3 (2-4 min): Add Splitter and Ranged
    else if (gameTimeMinutes < 4) {
        if (roll < 0.12) {
            const swarmSize = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < swarmSize; i++) {
                const angle = (Math.PI * 2 / swarmSize) * i + Math.random() * 0.5;
                const offsetDist = 30;
                gameState.enemies.push(new SwarmEnemy(
                    x + Math.cos(angle) * offsetDist,
                    y + Math.sin(angle) * offsetDist
                ));
            }
        } else if (roll < 0.22) {
            gameState.enemies.push(new TeleporterEnemy(x, y));
        } else if (roll < 0.32) {
            gameState.enemies.push(new ChargerEnemy(x, y));
        } else if (roll < 0.42) {
            gameState.enemies.push(new SplitterEnemy(x, y, 1));
        } else if (roll < 0.52) {
            gameState.enemies.push(new RangedEnemy(x, y));
        } else {
            gameState.enemies.push(new Enemy(x, y));
        }
    }
    // Phase 4 (4+ min): Full roster including Tank and Healer
    else {
        if (roll < 0.15) {
            const swarmSize = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < swarmSize; i++) {
                const angle = (Math.PI * 2 / swarmSize) * i + Math.random() * 0.5;
                const offsetDist = 30;
                gameState.enemies.push(new SwarmEnemy(
                    x + Math.cos(angle) * offsetDist,
                    y + Math.sin(angle) * offsetDist
                ));
            }
        } else if (roll < 0.25) {
            gameState.enemies.push(new TeleporterEnemy(x, y));
        } else if (roll < 0.35) {
            gameState.enemies.push(new ChargerEnemy(x, y));
        } else if (roll < 0.45) {
            gameState.enemies.push(new SplitterEnemy(x, y, 1));
        } else if (roll < 0.55) {
            gameState.enemies.push(new RangedEnemy(x, y));
        } else if (roll < 0.60) {
            gameState.enemies.push(new TankEnemy(x, y));
        } else if (roll < 0.65) {
            gameState.enemies.push(new HealerEnemy(x, y));
        } else {
            gameState.enemies.push(new Enemy(x, y));
        }
    }
}
