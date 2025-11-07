// Helper Functions for Game Logic

// Helper function to convert world coordinates to screen coordinates
function toScreen(worldX, worldY) {
    return {
        x: worldX - camera.x,
        y: worldY - camera.y
    };
}

// Helper to activate ultimate (defined after gameState)
function activateUltimate() {
    if (!gameState.player.ultimate) {
        console.log('❌ No ultimate equipped');
        return;
    }
    if (gameState.player.ultimateCooldown > 0) {
        console.log(`❌ Ultimate on cooldown: ${Math.ceil(gameState.player.ultimateCooldown / 1000)}s remaining`);
        return;
    }
    if (gameState.isPaused || gameState.isGameOver) {
        console.log('❌ Game is paused or over');
        return;
    }

    const ultimate = ULTIMATES[gameState.player.ultimate.type];
    if (!ultimate) {
        console.log('❌ Ultimate not found:', gameState.player.ultimate.type);
        return;
    }

    console.log(`🔥 Activating ultimate: ${ultimate.name}`);

    // Execute ultimate effect
    ultimate.execute();

    // Set cooldown
    gameState.player.ultimateCooldown = ultimate.cooldown;
}

function checkAchievements() {
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (achievement.unlocked) return;

        let completed = false;

        switch (achievement.requirement.type) {
            case 'kills':
                completed = gameState.kills >= achievement.requirement.value;
                break;
            case 'time':
                completed = gameState.gameTime >= achievement.requirement.value;
                break;
            case 'level':
                completed = gameState.player.level >= achievement.requirement.value;
                break;
            case 'boss_no_damage':
                // Tracked separately when boss is killed
                break;
        }

        if (completed) {
            achievement.unlocked = true;
            console.log(`🏆 ACHIEVEMENT UNLOCKED: ${achievement.name}`);
            console.log(`🎁 You unlocked: ${ULTIMATES[achievement.reward].name} ultimate!`);

            // Show achievement notification (could add UI for this later)
            gameState.lastAchievement = {
                achievement: achievement,
                unlockTime: Date.now()
            };
        }
    });
}

function handleEnemyDeath(enemy) {
    // Calculate XP based on enemy type and difficulty
    let xpValue = 3; // Base XP for normal enemy (goblin)

    if (enemy.isMajorBoss) {
        xpValue = 100; // Major boss gives huge XP
    } else if (enemy.isBoss) {
        xpValue = 50; // Boss gives lots of XP
    } else if (enemy.maxHp >= 50) {
        xpValue = 8; // Ghost (50 HP) - medium XP
    } else if (enemy.maxHp >= 40) {
        xpValue = 6; // Orc (40 HP) - slightly more XP
    } else {
        xpValue = 3; // Goblin (30 HP) - base XP
    }

    gameState.xpOrbs.push(new XPOrb(enemy.x, enemy.y, xpValue));

    // 5% chance to drop a chest
    if (Math.random() < 0.05) {
        gameState.chests.push(new Chest(enemy.x, enemy.y));
    }

    // 2% chance to drop a Mystery Box (rarer than chests!)
    if (Math.random() < 0.02) {
        gameState.mysteryBoxes = gameState.mysteryBoxes || [];
        gameState.mysteryBoxes.push(new MysteryBoxDrop(enemy.x, enemy.y));
    }

    // CREATE AWESOME DEATH EXPLOSION!
    // Use enemy's own color palette if available, otherwise default green
    const enemyColorPalette = enemy.colorPalette || ['#4a9d5f', '#5fb571', '#6ed47f', '#3d8a4f', '#7be58d'];
    createDeathExplosion(enemy.x, enemy.y, enemy.isBoss || enemy.isMajorBoss, enemyColorPalette);

    // Call onDeath handler if enemy has one (e.g., Splitter splits)
    if (enemy.onDeath) {
        enemy.onDeath();
    }

    gameState.kills++;
}

// Create particles
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        gameState.particles.push(new Particle(x, y, color));
    }
}

// Lightning effect between two points
function createLightningEffect(x1, y1, x2, y2) {
    gameState.particles.push({
        type: 'lightning',
        x1, y1, x2, y2,
        life: 1.5, // Much longer duration to see all chains
        maxLife: 1.5,
        draw: function() {
            const screen1 = toScreen(this.x1, this.y1);
            const screen2 = toScreen(this.x2, this.y2);

            // Main lightning bolt (bright yellow)
            const alpha = Math.min(this.life * 0.9, 1);
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(screen1.x, screen1.y);

            // Jagged lightning effect
            const segments = 5;
            for (let i = 1; i < segments; i++) {
                const t = i / segments;
                const worldX = this.x1 + (this.x2 - this.x1) * t + (Math.random() - 0.5) * 25;
                const worldY = this.y1 + (this.y2 - this.y1) * t + (Math.random() - 0.5) * 25;
                const screenPoint = toScreen(worldX, worldY);
                ctx.lineTo(screenPoint.x, screenPoint.y);
            }

            ctx.lineTo(screen2.x, screen2.y);
            ctx.stroke();

            // Inner bright core
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.shadowBlur = 0;
        },
        update: function() {
            this.life -= 0.015; // Much slower fade (was 0.05)
        }
    });
}

// Explosion ring effect
function createExplosionEffect(x, y, radius) {
    gameState.particles.push({
        type: 'explosion',
        x, y,
        radius: 0,
        maxRadius: radius,
        life: 1,
        draw: function() {
            const screen = toScreen(this.x, this.y);

            ctx.strokeStyle = `rgba(255, 69, 0, ${this.life})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner glow
            ctx.strokeStyle = `rgba(255, 140, 0, ${this.life * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        },
        update: function() {
            this.radius += this.maxRadius / 10;
            this.life -= 0.1;
            if (this.radius >= this.maxRadius) this.life = 0;
        }
    });
}

// Create awesome death explosion with multiple particle types
function createDeathExplosion(x, y, isBoss = false, colorPalette = null) {
    const particleCount = isBoss ? 40 : 20;
    const colors = colorPalette || ['#ff6b35', '#f7931e', '#fdc830', '#ff4444', '#ff8800'];

    // Explosive particles shooting outward
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = isBoss ? 4 + Math.random() * 3 : 2 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        gameState.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: isBoss ? 4 + Math.random() * 3 : 2 + Math.random() * 2,
            color: color,
            alpha: 1,
            gravity: 0.1,
            friction: 0.98,
            life: 1,
            maxLife: 1,
            draw: function() {
                const screen = toScreen(this.x, this.y);
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
            update: function() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.life -= 0.02;
                this.alpha = this.life;
                this.size *= 0.97;
            }
        });
    }

    // Add central flash explosion ring
    const ringColor = colors[0]; // Use primary color from palette
    const glowColor = colors[2] || colors[1]; // Use lighter color for inner glow

    gameState.particles.push({
        type: 'flash',
        x: x,
        y: y,
        radius: 5,
        maxRadius: isBoss ? 60 : 30,
        life: 1,
        ringColor: ringColor,
        glowColor: glowColor,
        draw: function() {
            const screen = toScreen(this.x, this.y);

            // Outer ring
            ctx.save();
            ctx.globalAlpha = this.life * 0.8;
            ctx.strokeStyle = this.ringColor;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.ringColor;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner glow
            ctx.strokeStyle = this.glowColor;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.glowColor;
            ctx.stroke();
            ctx.restore();
        },
        update: function() {
            this.radius += (this.maxRadius - this.radius) * 0.3;
            this.life -= 0.05;
        }
    });

    // Sparks
    const sparkCount = isBoss ? 15 : 8;
    for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 4;

        gameState.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            size: 1 + Math.random(),
            color: '#ffffff',
            alpha: 1,
            gravity: 0.15,
            life: 1,
            draw: function() {
                const screen = toScreen(this.x, this.y);
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#ffff00';
                ctx.fillRect(screen.x - this.size/2, screen.y - this.size/2, this.size, this.size);
                ctx.restore();
            },
            update: function() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                this.vx *= 0.96;
                this.life -= 0.025;
                this.alpha = this.life;
            }
        });
    }
}

// All helper functions are now available globally (no export needed for browser)
