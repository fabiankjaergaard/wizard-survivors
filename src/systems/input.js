// Keyboard Input System
document.addEventListener('keydown', (e) => {
    // ESC to pause/unpause
    if (e.key === 'Escape') {
        gameState.isPaused = !gameState.isPaused;
        console.log(gameState.isPaused ? 'Game Paused' : 'Game Resumed');
        return;
    }

    // Space to dash (only when game is active)
    if (e.key === ' ' && !gameState.isPaused && !gameState.isGameOver &&
        !gameState.player.isDashing && gameState.player.dashCooldown <= 0) {
        e.preventDefault(); // Prevent page scroll

        // Calculate dash direction based on current movement or facing direction
        let dashDx = 0;
        let dashDy = 0;

        if (gameState.keys['w'] || gameState.keys['arrowup']) {
            dashDy = -1;
        }
        if (gameState.keys['s'] || gameState.keys['arrowdown']) {
            dashDy = 1;
        }
        if (gameState.keys['a'] || gameState.keys['arrowleft']) {
            dashDx = -1;
        }
        if (gameState.keys['d'] || gameState.keys['arrowright']) {
            dashDx = 1;
        }

        // If no keys pressed, dash in facing direction
        if (dashDx === 0 && dashDy === 0) {
            switch(gameState.player.direction) {
                case 'up': dashDy = -1; break;
                case 'down': dashDy = 1; break;
                case 'left': dashDx = -1; break;
                case 'right': dashDx = 1; break;
            }
        }

        // Normalize diagonal dashes
        const dashLength = Math.sqrt(dashDx * dashDx + dashDy * dashDy);
        if (dashLength > 0) {
            dashDx /= dashLength;
            dashDy /= dashLength;
        }

        gameState.player.isDashing = true;
        gameState.player.dashDuration = 200; // 200ms dash
        gameState.player.dashCooldown = 1500; // 1.5 second cooldown
        gameState.player.dashDx = dashDx;
        gameState.player.dashDy = dashDy;

        console.log('💨 Dash!');
        return;
    }

    // R to activate ultimate (only when game is active)
    if ((e.key === 'r' || e.key === 'R') && !gameState.isPaused && !gameState.isGameOver) {
        e.preventDefault();
        activateUltimate();
        return;
    }

    // E to open chest (only when game is active and near a chest)
    if (e.key === 'e' && !gameState.isPaused && !gameState.isGameOver) {
        e.preventDefault();

        // Find nearest chest that player is near
        for (let i = gameState.chests.length - 1; i >= 0; i--) {
            const chest = gameState.chests[i];
            if (chest.isNearPlayer) {
                // Determine chest loot
                const loot = {
                    coins: chest.coinValue,
                    x: chest.x,
                    y: chest.y
                };

                // 5% chance to get an ultimate (very rare!)
                if (Math.random() < 0.05) {
                    // Filter out achievement-only ultimates
                    const chestUltimates = Object.values(ULTIMATES).filter(ult => !ult.achievement);

                    if (chestUltimates.length > 0) {
                        const randomUltimate = chestUltimates[Math.floor(Math.random() * chestUltimates.length)];

                        loot.ultimate = {
                            type: randomUltimate.type,
                            name: randomUltimate.name,
                            icon: randomUltimate.icon,
                            description: randomUltimate.description
                        };

                        console.log(`🎁 RARE ULTIMATE FOUND: ${randomUltimate.name}`);
                    }
                }

                // Store chest data and remove it from world
                gameState.openingChest = loot;
                gameState.chests.splice(i, 1);
                gameState.isPaused = true; // Pause game to show chest UI
                console.log(`Opening chest with ${chest.coinValue} coins!`);
                break;
            }
        }

        // Check for mystery boxes
        if (gameState.mysteryBoxes) {
            for (let i = gameState.mysteryBoxes.length - 1; i >= 0; i--) {
                const box = gameState.mysteryBoxes[i];
                if (box.isNearPlayer) {
                    // Open mystery box spinner (free spin from drop!)
                    gameState.openingMysteryBox = { free: true }; // Mark as free spin
                    gameState.mysteryBoxes.splice(i, 1);
                    gameState.isPaused = true; // Pause game to show spinner
                    console.log('Opening Mystery Box!');
                    break;
                }
            }
        }

        return;
    }

    gameState.keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key.toLowerCase()] = false;
});

console.log('⌨️ Input system initialized');
