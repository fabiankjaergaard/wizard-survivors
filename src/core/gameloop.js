// Game Over
function gameOver() {
    gameState.isGameOver = true;
    document.getElementById('finalTime').textContent = document.getElementById('time').textContent;
    document.getElementById('finalKills').textContent = gameState.kills;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// Game Loop
let lastTime = 0;
let frameCount = 0;
function gameLoop(currentTime) {
    frameCount++;
    if (frameCount === 1) {
        console.log('First game loop frame running!');
        console.log('Current time:', currentTime);
        // Initialize timing on first frame to prevent huge deltaTime
        lastTime = currentTime;
        gameState.lastSpawn = currentTime;
        gameState.lastAttack = currentTime;
    }

    // Safety check - stop if canvas or context is gone
    if (!canvas || !ctx) {
        console.error('Canvas lost! Stopping game loop.');
        return;
    }

    // Calculate deltaTime, but cap it to prevent huge jumps
    const deltaTime = lastTime ? Math.min(currentTime - lastTime, 100) : 16.67;
    lastTime = currentTime;

    // Store currentTime in gameState for UI to use
    gameState.currentTime = currentTime;

    // Debug: Log if we get a big deltaTime spike
    if (deltaTime > 50) {
        console.warn(`WARNING: Large deltaTime detected: ${deltaTime.toFixed(2)}ms at ${(gameState.gameTime / 1000).toFixed(1)}s - Frame ${frameCount}`);
        console.trace('Stack trace for large deltaTime');
    }

    // Debug: Log camera position changes
    const oldCameraX = camera.x;
    const oldCameraY = camera.y;

    // Log every 60 frames (about once per second)
    if (frameCount % 60 === 0) {
        console.log(`Frame ${frameCount}: Time: ${(gameState.gameTime / 1000).toFixed(1)}s, Enemies: ${gameState.enemies.length}, Player HP: ${gameState.player.hp}, FPS: ~${Math.round(1000/deltaTime)}`);
    }

    // Always update camera and draw, even when paused
    updateCamera();

    // Debug: Log large camera jumps
    const cameraDeltaX = Math.abs(camera.x - oldCameraX);
    const cameraDeltaY = Math.abs(camera.y - oldCameraY);
    if (cameraDeltaX > 50 || cameraDeltaY > 50) {
        console.warn(`WARNING: Large camera jump detected: ΔX=${cameraDeltaX.toFixed(1)}, ΔY=${cameraDeltaY.toFixed(1)} at ${(gameState.gameTime / 1000).toFixed(1)}s`);
        console.log(`Player pos: (${gameState.player.x.toFixed(1)}, ${gameState.player.y.toFixed(1)}), Camera: (${camera.x.toFixed(1)}, ${camera.y.toFixed(1)})`);
    }

    if (!gameState.isPaused && !gameState.isGameOver) {
        // Only update gameTime when not paused
        gameState.gameTime += deltaTime;

        // Update ultimate cooldown
        if (gameState.player.ultimateCooldown > 0) {
            gameState.player.ultimateCooldown -= deltaTime;
            if (gameState.player.ultimateCooldown < 0) {
                gameState.player.ultimateCooldown = 0;
            }
        }

        // Check achievements every second
        if (!gameState.lastAchievementCheck || gameState.gameTime - gameState.lastAchievementCheck > 1000) {
            checkAchievements();
            gameState.lastAchievementCheck = gameState.gameTime;
        }

        // Handle Meteor Storm ultimate
        if (gameState.meteorStormStartTime) {
            const elapsed = Date.now() - gameState.meteorStormStartTime;

            if (elapsed > 8000) {
                // Storm finished
                gameState.meteorStormStartTime = null;
                gameState.meteorStormLastSpawn = null;
                gameState.player.ultimateActive = false;
                console.log('Meteor Storm ended');
            } else {
                // Spawn meteors every 400ms
                if (Date.now() - gameState.meteorStormLastSpawn > 400) {
                    console.log('Spawning meteors!');
                    for (let i = 0; i < 3; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = 200 + Math.random() * 400;
                        gameState.meteors.push({
                            x: gameState.player.x + Math.cos(angle) * distance,
                            y: gameState.player.y + Math.sin(angle) * distance - 500, // Start above
                            targetX: gameState.player.x + Math.cos(angle) * distance,
                            targetY: gameState.player.y + Math.sin(angle) * distance,
                            speed: 15,
                            damage: 150,
                            radius: 80,
                            size: 12,
                            trail: []
                        });
                    }
                    gameState.meteorStormLastSpawn = Date.now();
                }
            }
        }
    } else {
        // When paused, we need to update timers to prevent spawns immediately after unpause
        gameState.lastSpawn = currentTime;
        gameState.lastAttack = currentTime;
    }

    // Always draw the game
    if (true) { // Changed from if (!gameState.isPaused) to always draw

        // Apply screen shake effect
        ctx.save();
        if (gameState.screenShake) {
            const elapsed = currentTime - gameState.screenShake.startTime;
            if (elapsed < gameState.screenShake.duration) {
                // Shake decreases over time
                const shakeProgress = 1 - (elapsed / gameState.screenShake.duration);
                const shakeX = (Math.random() - 0.5) * gameState.screenShake.intensity * shakeProgress;
                const shakeY = (Math.random() - 0.5) * gameState.screenShake.intensity * shakeProgress;
                ctx.translate(shakeX, shakeY);
            } else {
                gameState.screenShake = null;
            }
        }

        // Clear canvas
        ctx.fillStyle = '#0f1419';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background
        drawBackground();

        // Update and draw player
        if (player) {
            if (!gameState.isPaused && !gameState.isGameOver) {
                player.update(); // Only update when not paused
            }
            player.draw(); // Always draw
        } else {
            console.warn('Player not initialized!');
        }

        // Spawn enemies (only when not paused) - with dynamic difficulty
        const difficulty = getDifficultyMultipliers();
        if (!gameState.isPaused && !gameState.isGameOver && currentTime - gameState.lastSpawn > difficulty.spawnRate) {
            if (gameState.enemies.length < difficulty.maxEnemies) {
                spawnEnemy();
                // Debug: Log first few spawns and difficulty changes
                if (gameState.enemies.length <= 5) {
                    console.log(`🧟 Spawned enemy #${gameState.enemies.length} at ${(gameState.gameTime / 1000).toFixed(1)}s`);
                }

                // Log difficulty scaling every 60 seconds (1 minute)
                if (!gameState.lastDifficultyLog || gameState.gameTime - gameState.lastDifficultyLog > 60000) {
                    gameState.lastDifficultyLog = gameState.gameTime;
                    const minutes = Math.floor(gameState.gameTime / 60000);
                    console.log(`DIFFICULTY TIER ${difficulty.intervals} (${minutes} min): Speed x${difficulty.speed.toFixed(2)}, HP x${difficulty.hp.toFixed(2)}, Damage x${difficulty.damage.toFixed(2)}, Spawn: ${difficulty.spawnRate.toFixed(0)}ms, Max: ${difficulty.maxEnemies}`);
                }
            }
            gameState.lastSpawn = currentTime;
        }

        // Spawn Necromancer Boss every 60 seconds (only when not paused)
        if (!gameState.isPaused && !gameState.isGameOver) {
            // Initialize boss spawn tracker if not exists
            if (!gameState.lastBossSpawn) {
                gameState.lastBossSpawn = 0;
            }
            if (!gameState.lastMajorBossSpawn) {
                gameState.lastMajorBossSpawn = 0;
            }

            const timeSinceLastBoss = gameState.gameTime - gameState.lastBossSpawn;
            const bossSpawnInterval = 60000; // 60 seconds

            // Check if there's already a boss alive
            const hasBoss = gameState.enemies.some(e => e.isBoss && !e.isMajorBoss);
            const hasMajorBoss = gameState.enemies.some(e => e.isMajorBoss);

            // Spawn regular Necromancer boss
            if (timeSinceLastBoss > bossSpawnInterval && !hasBoss && gameState.gameTime > 30000) {
                // Spawn boss at a distance from player
                const angle = Math.random() * Math.PI * 2;
                const distance = 400; // Spawn far from player
                const bossX = gameState.player.x + Math.cos(angle) * distance;
                const bossY = gameState.player.y + Math.sin(angle) * distance;

                // Clamp to world bounds
                const clampedX = Math.max(50, Math.min(CONFIG.world.width - 50, bossX));
                const clampedY = Math.max(50, Math.min(CONFIG.world.height - 50, bossY));

                gameState.enemies.push(new NecromancerBoss(clampedX, clampedY));
                gameState.lastBossSpawn = gameState.gameTime;

                console.log(`👹 NECROMANCER BOSS SPAWNED at ${(gameState.gameTime / 1000).toFixed(1)}s!`);

                // Create dramatic spawn particles
                for (let i = 0; i < 30; i++) {
                    const pAngle = Math.random() * Math.PI * 2;
                    const pSpeed = 2 + Math.random() * 3;
                    gameState.particles.push({
                        x: clampedX,
                        y: clampedY,
                        vx: Math.cos(pAngle) * pSpeed,
                        vy: Math.sin(pAngle) * pSpeed,
                        size: 5 + Math.random() * 5,
                        color: '#9400d3',
                        alpha: 1,
                        decay: 0.02,
                        lifetime: 50
                    });
                }
            }

            // Spawn Arch-Demon Boss every 3 minutes after 2 minutes of gameplay
            const timeSinceLastMajorBoss = gameState.gameTime - gameState.lastMajorBossSpawn;
            const majorBossSpawnInterval = 180000; // 3 minutes

            if (timeSinceLastMajorBoss > majorBossSpawnInterval && !hasMajorBoss && gameState.gameTime > 120000) {
                // Spawn major boss far from player
                const angle = Math.random() * Math.PI * 2;
                const distance = 500; // Spawn very far from player
                const bossX = gameState.player.x + Math.cos(angle) * distance;
                const bossY = gameState.player.y + Math.sin(angle) * distance;

                // Clamp to world bounds
                const clampedX = Math.max(80, Math.min(CONFIG.world.width - 80, bossX));
                const clampedY = Math.max(80, Math.min(CONFIG.world.height - 80, bossY));

                gameState.enemies.push(new ArchDemonBoss(clampedX, clampedY));
                gameState.lastMajorBossSpawn = gameState.gameTime;

                console.log(`🔥💀 ARCH-DEMON BOSS SPAWNED at ${(gameState.gameTime / 1000).toFixed(1)}s!`);

                // Create MASSIVE spawn effect
                for (let i = 0; i < 80; i++) {
                    const pAngle = Math.random() * Math.PI * 2;
                    const pSpeed = 3 + Math.random() * 5;
                    gameState.particles.push({
                        x: clampedX,
                        y: clampedY,
                        vx: Math.cos(pAngle) * pSpeed,
                        vy: Math.sin(pAngle) * pSpeed,
                        size: 10 + Math.random() * 15,
                        color: Math.random() < 0.5 ? '#ff0000' : '#ff6600',
                        alpha: 1,
                        decay: 0.015,
                        lifetime: 100
                    });
                }

                // Create expanding shockwave rings
                for (let ring = 0; ring < 5; ring++) {
                    setTimeout(() => {
                        for (let i = 0; i < 30; i++) {
                            const pAngle = (Math.PI * 2 / 30) * i;
                            const ringRadius = 50 + ring * 30;
                            gameState.particles.push({
                                x: clampedX + Math.cos(pAngle) * ringRadius,
                                y: clampedY + Math.sin(pAngle) * ringRadius,
                                vx: Math.cos(pAngle) * 2,
                                vy: Math.sin(pAngle) * 2,
                                size: 8,
                                color: '#ff0000',
                                alpha: 1,
                                decay: 0.03,
                                lifetime: 60
                            });
                        }
                    }, ring * 100);
                }
            }
        }

        // Update and draw enemies
        gameState.enemies.forEach(enemy => {
            if (!gameState.isPaused && !gameState.isGameOver) {
                enemy.update(); // Only update when not paused
            }
            enemy.draw(); // Always draw
        });

        // Update meteors (from ultimate)
        if (!gameState.isPaused && !gameState.isGameOver) {
            for (let i = gameState.meteors.length - 1; i >= 0; i--) {
                const meteor = gameState.meteors[i];

                // Skip meteors with update methods (boss meteors)
                if (meteor.update) continue;

                // Update ultimate meteors
                meteor.y += meteor.speed;
                meteor.speed += 0.2; // Accelerate

                // Check if hit ground
                if (meteor.y >= meteor.targetY) {
                    // Explosion damage radius
                    const explosionRadius = meteor.radius || 80;

                    // Damage enemies in explosion radius
                    let hitAnyEnemy = false;
                    gameState.enemies.forEach(enemy => {
                        const enemyDist = Math.sqrt(
                            Math.pow(enemy.x - meteor.x, 2) +
                            Math.pow(enemy.y - meteor.y, 2)
                        );

                        if (enemyDist < explosionRadius) {
                            const damage = (meteor.damage || 150) * (1 - enemyDist / explosionRadius);
                            enemy.hp -= damage;
                            hitAnyEnemy = true;
                        }
                    });

                    // Play explosion sound if hit enemies
                    if (hitAnyEnemy) {
                        SoundSystem.playHit('explosion');
                    }

                    // Create explosion particles
                    for (let j = 0; j < 20; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 2 + Math.random() * 3;
                        gameState.particles.push({
                            x: meteor.x,
                            y: meteor.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            size: 8 + Math.random() * 8,
                            alpha: 1,
                            color: '#8b5cf6',
                            lifetime: 40
                        });
                    }

                    gameState.meteors.splice(i, 1);
                }
            }
        }

        // Auto-attack (only when not paused)
        if (!gameState.isPaused && !gameState.isGameOver) {
            autoAttack(currentTime);
        }

        // Update and draw projectiles
        for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
            const projectile = gameState.projectiles[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (projectile.update()) {
                    gameState.projectiles.splice(i, 1);
                    continue;
                }
            }
            projectile.draw();
        }

        // Update and draw orbiting orbs
        gameState.orbitingOrbs.forEach(orb => {
            if (!gameState.isPaused && !gameState.isGameOver) {
                orb.update(currentTime);
            }
            orb.draw();
        });

        // Update and draw tornadoes
        for (let i = gameState.tornadoes.length - 1; i >= 0; i--) {
            const tornado = gameState.tornadoes[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (tornado.update()) {
                    gameState.tornadoes.splice(i, 1);
                    continue;
                }
            }
            tornado.draw();
        }

        // Update and draw spinning blades
        for (let i = gameState.spinningBlades.length - 1; i >= 0; i--) {
            const blade = gameState.spinningBlades[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (blade.update()) {
                    gameState.spinningBlades.splice(i, 1);
                    continue;
                }
            }
            blade.draw();
        }

        // Update and draw meteors
        for (let i = gameState.meteors.length - 1; i >= 0; i--) {
            const meteor = gameState.meteors[i];

            // Handle meteors with methods (boss meteors)
            if (meteor.update && meteor.draw) {
                if (!gameState.isPaused && !gameState.isGameOver) {
                    if (meteor.update()) {
                        gameState.meteors.splice(i, 1);
                        continue;
                    }
                }
                meteor.draw();
            } else {
                // Handle simple meteors (ultimate meteors) - already updated in boss update
                // Just draw them
                const targetScreen = toScreen(meteor.x, meteor.targetY);
                ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'; // Purple for ultimate
                ctx.beginPath();
                ctx.arc(targetScreen.x, targetScreen.y, meteor.radius || 60, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#8b5cf6';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(targetScreen.x, targetScreen.y, meteor.radius || 60, 0, Math.PI * 2);
                ctx.stroke();

                // Meteor itself
                const meteorScreen = toScreen(meteor.x, meteor.y);
                ctx.fillStyle = '#c084fc';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#8b5cf6';
                ctx.beginPath();
                ctx.arc(meteorScreen.x, meteorScreen.y, meteor.size || 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Update and draw chain lightnings
        for (let i = gameState.chainLightnings.length - 1; i >= 0; i--) {
            const lightning = gameState.chainLightnings[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (lightning.update()) {
                    gameState.chainLightnings.splice(i, 1);
                    continue;
                }
            }
            lightning.draw();
        }

        // Update and draw spirit wolves
        for (let i = gameState.spiritWolves.length - 1; i >= 0; i--) {
            const wolf = gameState.spiritWolves[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (wolf.update()) {
                    gameState.spiritWolves.splice(i, 1);
                    continue;
                }
            }
            wolf.draw();
        }

        // Update and draw black holes
        for (let i = gameState.blackHoles.length - 1; i >= 0; i--) {
            const blackHole = gameState.blackHoles[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (blackHole.update()) {
                    gameState.blackHoles.splice(i, 1);
                    continue;
                }
            }
            blackHole.draw();
        }

        // Update and draw sword spin attack
        if (gameState.swordSpinAttack) {
            if (!gameState.isPaused && !gameState.isGameOver) {
                gameState.swordSpinAttack.update();
            }
            gameState.swordSpinAttack.draw();
        }

        // Update and draw homing missiles
        for (let i = gameState.homingMissiles.length - 1; i >= 0; i--) {
            const missile = gameState.homingMissiles[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (missile.update()) {
                    gameState.homingMissiles.splice(i, 1);
                    continue;
                }
            }
            missile.draw();
        }

        // Update and draw poison clouds
        for (let i = gameState.poisonClouds.length - 1; i >= 0; i--) {
            const cloud = gameState.poisonClouds[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (cloud.update()) {
                    gameState.poisonClouds.splice(i, 1);
                    continue;
                }
            }
            cloud.draw();
        }

        // Update and draw crystal shards
        for (let i = gameState.crystalShards.length - 1; i >= 0; i--) {
            const shard = gameState.crystalShards[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (shard.update()) {
                    gameState.crystalShards.splice(i, 1);
                    continue;
                }
            }
            shard.draw();
        }

        // Update and draw frost novas
        for (let i = gameState.frostNovas.length - 1; i >= 0; i--) {
            const nova = gameState.frostNovas[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (nova.update()) {
                    gameState.frostNovas.splice(i, 1);
                    continue;
                }
            }
            nova.draw();
        }

        // Update and draw thunder hammers
        for (let i = gameState.thunderHammers.length - 1; i >= 0; i--) {
            const hammer = gameState.thunderHammers[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (hammer.update()) {
                    gameState.thunderHammers.splice(i, 1);
                    continue;
                }
            }
            hammer.draw();
        }

        // Update and draw shadow clones
        for (let i = gameState.shadowClones.length - 1; i >= 0; i--) {
            const clone = gameState.shadowClones[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (clone.update()) {
                    gameState.shadowClones.splice(i, 1);
                    continue;
                }
            }
            clone.draw();
        }

        // Update enemy frozen/stunned states
        if (!gameState.isPaused && !gameState.isGameOver) {
            const currentTime = Date.now();
            gameState.enemies.forEach(enemy => {
                // Restore speed from frozen state
                if (enemy.frozenUntil && currentTime > enemy.frozenUntil) {
                    if (enemy.originalSpeed !== undefined) {
                        enemy.speed = enemy.originalSpeed;
                        delete enemy.originalSpeed;
                        delete enemy.frozenUntil;
                    }
                }
                // Restore speed from stunned state
                if (enemy.stunnedUntil && currentTime > enemy.stunnedUntil) {
                    if (enemy.originalSpeed !== undefined) {
                        enemy.speed = enemy.originalSpeed;
                        delete enemy.originalSpeed;
                        delete enemy.stunnedUntil;
                    }
                }
            });
        }

        // Update and draw particles
        for (let i = gameState.particles.length - 1; i >= 0; i--) {
            const particle = gameState.particles[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                // Handle both Particle objects and plain particle objects
                if (particle.update) {
                    particle.update();
                    if (particle.life <= 0) {
                        gameState.particles.splice(i, 1);
                        continue;
                    }
                } else if (particle.lifetime !== undefined) {
                    // Plain object particle (dash trail, blood particles, etc)
                    particle.x += particle.vx;
                    particle.y += particle.vy;

                    // Apply gravity if particle has it (blood particles)
                    if (particle.gravity) {
                        particle.vy += particle.gravity;
                    }

                    particle.alpha -= particle.decay;
                    particle.lifetime--;

                    if (particle.lifetime <= 0 || particle.alpha <= 0) {
                        gameState.particles.splice(i, 1);
                        continue;
                    }
                }
            }

            // Draw particle
            if (particle.draw) {
                particle.draw();
            } else if (particle.lifetime !== undefined) {
                // Draw plain object particle
                const screen = toScreen(particle.x, particle.y);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.alpha;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // Update and draw enemy projectiles
        for (let i = gameState.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = gameState.enemyProjectiles[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                proj.x += proj.vx;
                proj.y += proj.vy;

                // Check world bounds
                if (proj.x < 0 || proj.x > CONFIG.world.width || proj.y < 0 || proj.y > CONFIG.world.height) {
                    gameState.enemyProjectiles.splice(i, 1);
                    continue;
                }

                // Check collision with player
                const dx = gameState.player.x - proj.x;
                const dy = gameState.player.y - proj.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.player.size + proj.size) {
                    player.takeDamage(proj.damage);
                    gameState.enemyProjectiles.splice(i, 1);
                    continue;
                }
            }

            // Draw projectile
            const screen = toScreen(proj.x, proj.y);
            ctx.fillStyle = proj.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = proj.color;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, proj.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Update and draw damage numbers
        for (let i = gameState.damageNumbers.length - 1; i >= 0; i--) {
            const damageNum = gameState.damageNumbers[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (damageNum.update()) {
                    gameState.damageNumbers.splice(i, 1);
                    continue;
                }
            }
            damageNum.draw();
        }

        // Update and draw XP orbs
        for (let i = gameState.xpOrbs.length - 1; i >= 0; i--) {
            const orb = gameState.xpOrbs[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                if (orb.update()) {
                    // Player collected the orb
                    addXP(orb.xpValue);
                    gameState.xpOrbs.splice(i, 1);
                    // Create sparkle particles
                    for (let j = 0; j < 5; j++) {
                        gameState.particles.push(new Particle(orb.x, orb.y, '#64c8ff'));
                    }
                    continue;
                }
            }
            orb.draw();
        }

        // Update and draw chests
        for (let i = gameState.chests.length - 1; i >= 0; i--) {
            const chest = gameState.chests[i];
            if (!gameState.isPaused && !gameState.isGameOver) {
                chest.update();
            }
            chest.draw();
        }

        // Update and draw mystery boxes
        if (gameState.mysteryBoxes) {
            for (let i = gameState.mysteryBoxes.length - 1; i >= 0; i--) {
                const box = gameState.mysteryBoxes[i];
                if (!gameState.isPaused && !gameState.isGameOver) {
                    box.update();
                }
                box.draw();
            }
        }

        // Red vignette damage effect
        if (gameState.damageVignette) {
            const elapsed = currentTime - gameState.damageVignette.startTime;
            if (elapsed < gameState.damageVignette.duration) {
                // Fade out over duration
                const progress = elapsed / gameState.damageVignette.duration;
                const currentIntensity = gameState.damageVignette.intensity * (1 - progress);

                // Create radial gradient from center to edges
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

                const gradient = ctx.createRadialGradient(
                    centerX, centerY, maxRadius * 0.3,
                    centerX, centerY, maxRadius
                );
                gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
                gradient.addColorStop(1, `rgba(255, 0, 0, ${currentIntensity})`);

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                gameState.damageVignette = null;
            }
        }

        // Restore context after screen shake
        ctx.restore();

        // UI is updated automatically by React
    }

    requestAnimationFrame(gameLoop);
}
