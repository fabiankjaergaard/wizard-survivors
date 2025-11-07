class Player {
    constructor() {
        this.x = gameState.player.x;
        this.y = gameState.player.y;
    }

    update() {
        // Handle dash
        if (gameState.player.isDashing) {
            const dashSpeed = 12; // Fast dash speed

            gameState.player.x = Math.max(CONFIG.player.size, Math.min(CONFIG.world.width - CONFIG.player.size,
                gameState.player.x + gameState.player.dashDx * dashSpeed));
            gameState.player.y = Math.max(CONFIG.player.size, Math.min(CONFIG.world.height - CONFIG.player.size,
                gameState.player.y + gameState.player.dashDy * dashSpeed));

            // Create dash trail particles
            for (let i = 0; i < 3; i++) {
                gameState.particles.push({
                    x: gameState.player.x + (Math.random() - 0.5) * 20,
                    y: gameState.player.y + (Math.random() - 0.5) * 20,
                    vx: -gameState.player.dashDx * 2 + (Math.random() - 0.5) * 2,
                    vy: -gameState.player.dashDy * 2 + (Math.random() - 0.5) * 2,
                    size: 4 + Math.random() * 4,
                    color: '#00ffff',
                    alpha: 0.8,
                    decay: 0.05,
                    lifetime: 20
                });
            }

            gameState.player.dashDuration -= 16; // Subtract ~16ms per frame
            if (gameState.player.dashDuration <= 0) {
                gameState.player.isDashing = false;
            }
            return; // Skip normal movement during dash
        }

        // Update dash cooldown
        if (gameState.player.dashCooldown > 0) {
            gameState.player.dashCooldown -= 16; // Subtract ~16ms per frame
            if (gameState.player.dashCooldown < 0) {
                gameState.player.dashCooldown = 0;
            }
        }

        const speed = gameState.player.speed;
        let moving = false;
        let verticalDir = null;

        // Movement with 4-directional sprite support (bounded by WORLD, not canvas)
        if (gameState.keys['w'] || gameState.keys['arrowup']) {
            gameState.player.y = Math.max(CONFIG.player.size, gameState.player.y - speed);
            gameState.player.direction = 'up';
            verticalDir = 'up';
            moving = true;
        }
        if (gameState.keys['s'] || gameState.keys['arrowdown']) {
            gameState.player.y = Math.min(CONFIG.world.height - CONFIG.player.size, gameState.player.y + speed);
            gameState.player.direction = 'down';
            verticalDir = 'down';
            moving = true;
        }
        if (gameState.keys['a'] || gameState.keys['arrowleft']) {
            gameState.player.x = Math.max(CONFIG.player.size, gameState.player.x - speed);
            gameState.player.direction = 'left';
            moving = true;
        }
        if (gameState.keys['d'] || gameState.keys['arrowright']) {
            gameState.player.x = Math.min(CONFIG.world.width - CONFIG.player.size, gameState.player.x + speed);
            gameState.player.direction = 'right';
            moving = true;
        }

        gameState.player.isMoving = moving;

        // Update animation frame (slower for smoother animation)
        if (moving) {
            gameState.animationCounter++;
            if (gameState.animationCounter % 6 === 0) {  // Changed from 8 to 6 for smoother animation
                gameState.player.animationFrame++;
            }
        } else {
            gameState.animationCounter++;
            if (gameState.animationCounter % 10 === 0) {  // Idle animation is slower
                gameState.player.animationFrame++;
            }
        }
    }

    drawCharacter() {
        // Check if LPC sprite is loaded
        if (!wizardLPCSprite.complete || wizardLPCSprite.naturalWidth === 0) {
            // Draw a fallback circle if sprite not loaded
            const screenX = gameState.player.x - camera.x;
            const screenY = gameState.player.y - camera.y;
            ctx.fillStyle = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 20, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Get direction (default to 'down' if not set)
        const direction = gameState.player.direction || 'down';

        // Choose animation type
        const animationType = gameState.player.isMoving ? 'walk' : 'walk'; // Use walk for both, idle uses frame 0
        const animation = wizardConfig.animations[animationType];

        // Get the correct row for this direction
        const row = wizardConfig.rows[direction][animationType];

        // Calculate frame
        let frame;
        if (gameState.player.isMoving) {
            frame = gameState.player.animationFrame % animation.frames;
        } else {
            frame = 0; // Idle uses first frame of walk
        }

        // Calculate source position in spritesheet
        const srcX = frame * wizardConfig.frameWidth;
        const srcY = row * wizardConfig.frameHeight;

        // Scale for character (64x64 -> 64x64)
        const scale = 1.0;
        const drawWidth = wizardConfig.frameWidth * scale;
        const drawHeight = wizardConfig.frameHeight * scale;

        // Convert world position to screen position
        const screenX = gameState.player.x - camera.x;
        const screenY = gameState.player.y - camera.y;

        ctx.save();

        // Dash visual effect (glow and afterimage)
        if (gameState.player.isDashing) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.globalAlpha = 0.9;
        }

        // Damage flash effect - blink white when taking damage
        if (gameState.playerDamageFlash) {
            const elapsed = (gameState.currentTime || 0) - gameState.playerDamageFlash.startTime;
            if (elapsed < gameState.playerDamageFlash.duration) {
                // Blink on/off every blinkInterval
                const blinkCycle = Math.floor(elapsed / gameState.playerDamageFlash.blinkInterval);
                if (blinkCycle % 2 === 0) {
                    // Flash white
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ffffff';
                    ctx.filter = 'brightness(2.5)'; // Make very bright
                }
            } else {
                gameState.playerDamageFlash = null;
            }
        }

        // Draw the sprite (no rotation needed - LPC has proper directional sprites!)
        ctx.drawImage(
            wizardLPCSprite,
            srcX, srcY,
            wizardConfig.frameWidth, wizardConfig.frameHeight,
            screenX - drawWidth / 2,
            screenY - drawHeight / 2,
            drawWidth, drawHeight
        );

        ctx.restore();
    }

    draw() {
        this.drawCharacter();
        // Removed weapon range indicator circle
    }

    takeDamage(amount) {
        gameState.player.hp -= amount;

        // Screen shake
        gameState.screenShake = {
            intensity: Math.min(amount * 1.2, 12), // Stronger shake (max 12px)
            duration: 250, // 250ms shake
            startTime: gameState.currentTime || 0
        };

        // Player damage flash - blink white/red
        gameState.playerDamageFlash = {
            startTime: gameState.currentTime || 0,
            duration: 400, // Blink for 400ms
            blinkInterval: 50 // Blink every 50ms
        };

        // Red vignette effect
        gameState.damageVignette = {
            startTime: gameState.currentTime || 0,
            duration: 300,
            intensity: Math.min(amount / 20, 0.6) // Scale with damage
        };

        // Create blood particles - very small and few
        const particleCount = Math.min(Math.floor(amount / 4) + 2, 5); // Very few particles (2-5)
        console.log(`💥 Taking ${amount} damage! Shake intensity: ${gameState.screenShake.intensity}, Blood particles: ${particleCount}`);
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = 1 + Math.random() * 1.5; // Even slower
            const size = 1.5 + Math.random() * 1.5; // Very small (1.5-3px)

            gameState.particles.push({
                x: gameState.player.x,
                y: gameState.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1, // Initial upward velocity
                size: size,
                alpha: 1.0,
                decay: 0.015 + Math.random() * 0.01,
                lifetime: 60 + Math.floor(Math.random() * 30), // 60-90 frames
                color: Math.random() > 0.5 ? '#8b0000' : '#ff0000', // Dark red or bright red
                gravity: 0.15
            });
        }

        if (gameState.player.hp <= 0) {
            gameOver();
        }
    }
}