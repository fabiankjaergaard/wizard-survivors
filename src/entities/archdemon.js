class ArchDemonBoss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 60; // Massive size
        this.speed = CONFIG.enemy.speed * 0.2; // Very slow
        this.hp = 2000; // Boss HP
        this.maxHp = 2000;
        this.damage = 35;
        this.slowedUntil = 0;
        this.isBoss = true;
        this.isMajorBoss = true;

        // Phase system
        this.phase = 1; // 1, 2, 3 (gets more aggressive)
        this.lastPhaseChange = Date.now();

        // Boss behavior - more complex state machine
        this.state = 'idle'; // idle, meteor_rain, fire_wave, summon_minions, enrage, teleport_strike
        this.stateStartTime = Date.now();
        this.stateDurations = {
            idle: 2000,
            meteor_rain: 4000,
            fire_wave: 3000,
            summon_minions: 3000,
            enrage: 5000,
            teleport_strike: 2000
        };

        // Attack properties
        this.projectiles = [];
        this.meteors = [];
        this.fireWaves = [];
        this.lastMeteorTime = 0;
        this.meteorCooldown = 200; // Very fast meteors

        // Summoning
        this.summonedMinions = [];
        this.maxMinions = 15;

        // Enrage mechanics
        this.isEnraged = false;
        this.enrageDamageMultiplier = 1;

        // Teleport strike
        this.isTeleporting = false;
        this.teleportProgress = 0;
        this.teleportStartX = x;
        this.teleportStartY = y;
        this.teleportEndX = x;
        this.teleportEndY = y;
        this.teleportStrikeDamage = 50;

        // Visual effects
        this.wingFlap = 0;
        this.breatheFire = false;
        this.fireBreathAngle = 0;
        this.auraIntensity = 0;
        this.particles = [];
        this.groundCracks = [];

        // Death explosion color palette (red/orange for arch-demon)
        this.colorPalette = ['#dc2626', '#ef4444', '#f97316', '#991b1b', '#fb923c'];

        // Shield system
        this.shields = [
            { hp: 200, maxHp: 200, broken: false, color: '#ff0000', name: 'Fire Shield' },
            { hp: 200, maxHp: 200, broken: false, color: '#00ff00', name: 'Nature Shield' },
            { hp: 200, maxHp: 200, broken: false, color: '#0000ff', name: 'Frost Shield' }
        ];

        // Ground slam attack
        this.chargingSlam = false;
        this.slamChargeTime = 0;
        this.slamRadius = 0;

        // Attacks counter for phase transitions
        this.attacksInPhase = 0;
    }

    update() {
        const currentTime = Date.now();
        const timeSinceStateStart = currentTime - this.stateStartTime;

        // Update visual effects
        this.wingFlap = Math.sin(currentTime * 0.003) * 15;
        this.auraIntensity = 0.5 + Math.sin(currentTime * 0.005) * 0.3;

        // Check phase transitions (based on HP)
        const hpPercent = this.hp / this.maxHp;
        if (hpPercent < 0.66 && this.phase === 1) {
            this.phase = 2;
            this.enrageDamageMultiplier = 1.5;
            console.log('🔥 ARCH-DEMON ENTERS PHASE 2!');
            this.createPhaseTransitionEffect();
        } else if (hpPercent < 0.33 && this.phase === 2) {
            this.phase = 3;
            this.enrageDamageMultiplier = 2;
            this.isEnraged = true;
            console.log('💀 ARCH-DEMON ENTERS PHASE 3 - ENRAGED!');
            this.createPhaseTransitionEffect();
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay || 0.02;
            p.size *= 0.98;
            p.lifetime--;

            if (p.alpha <= 0 || p.size < 0.5 || p.lifetime <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // State machine - different behaviors per phase
        if (this.state === 'idle') {
            // Move towards player menacingly
            const dx = gameState.player.x - this.x;
            const dy = gameState.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 200) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }

            if (timeSinceStateStart > this.stateDurations.idle) {
                this.chooseNextAttack();
            }
        } else if (this.state === 'meteor_rain') {
            // Rain meteors around player
            if (currentTime - this.lastMeteorTime > this.meteorCooldown) {
                this.summonMeteor();
                this.lastMeteorTime = currentTime;
            }

            if (timeSinceStateStart > this.stateDurations.meteor_rain) {
                this.state = 'idle';
                this.stateStartTime = currentTime;
                this.attacksInPhase++;
            }
        } else if (this.state === 'fire_wave') {
            // Create expanding fire waves
            if (timeSinceStateStart < this.stateDurations.fire_wave) {
                if (Math.floor(timeSinceStateStart / 500) > this.fireWaves.length) {
                    this.createFireWave();
                }
            } else {
                this.state = 'idle';
                this.stateStartTime = currentTime;
                this.attacksInPhase++;
            }
        } else if (this.state === 'summon_minions') {
            if (timeSinceStateStart > this.stateDurations.summon_minions) {
                this.summonMinions();
                this.state = 'idle';
                this.stateStartTime = currentTime;
                this.attacksInPhase++;
            }

            // Summoning particles
            if (Math.random() < 0.2) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 40 + Math.random() * 30;
                this.particles.push({
                    x: this.x + Math.cos(angle) * dist,
                    y: this.y + Math.sin(angle) * dist,
                    vx: Math.cos(angle) * -1,
                    vy: Math.sin(angle) * -1,
                    size: 6,
                    alpha: 1,
                    color: '#ff0000',
                    lifetime: 60
                });
            }
        } else if (this.state === 'teleport_strike') {
            if (!this.isTeleporting) {
                // Start teleport
                this.isTeleporting = true;
                this.teleportProgress = 0;
                this.teleportStartX = this.x;
                this.teleportStartY = this.y;

                // Teleport behind player
                const angleToPlayer = Math.atan2(
                    gameState.player.y - this.y,
                    gameState.player.x - this.x
                );
                const distance = 100;
                this.teleportEndX = gameState.player.x - Math.cos(angleToPlayer) * distance;
                this.teleportEndY = gameState.player.y - Math.sin(angleToPlayer) * distance;

                // Clamp to world
                this.teleportEndX = Math.max(this.size, Math.min(CONFIG.world.width - this.size, this.teleportEndX));
                this.teleportEndY = Math.max(this.size, Math.min(CONFIG.world.height - this.size, this.teleportEndY));
            } else {
                this.teleportProgress += 0.05;

                if (this.teleportProgress >= 1) {
                    this.x = this.teleportEndX;
                    this.y = this.teleportEndY;

                    // Teleport strike damage in area
                    const strikeRadius = 80;
                    const playerDist = Math.sqrt(
                        Math.pow(gameState.player.x - this.x, 2) +
                        Math.pow(gameState.player.y - this.y, 2)
                    );

                    if (playerDist < strikeRadius) {
                        player.takeDamage(this.teleportStrikeDamage);
                        createParticles(gameState.player.x, gameState.player.y, '#ff0000');
                    }

                    // Create shockwave
                    this.createShockwave();

                    this.isTeleporting = false;
                    this.state = 'idle';
                    this.stateStartTime = currentTime;
                    this.attacksInPhase++;
                }
            }
        } else if (this.state === 'enrage') {
            // Violent thrashing and fast attacks
            this.breatheFire = true;
            this.fireBreathAngle += 0.03;

            // Fire breath projectiles
            if (Math.random() < 0.15) {
                const spread = 0.3;
                for (let i = -1; i <= 1; i++) {
                    const angle = Math.atan2(
                        gameState.player.y - this.y,
                        gameState.player.x - this.x
                    ) + i * spread;

                    this.projectiles.push({
                        x: this.x,
                        y: this.y,
                        vx: Math.cos(angle) * 4,
                        vy: Math.sin(angle) * 4,
                        size: 12,
                        lifetime: 150,
                        color: '#ff4400',
                        damage: this.damage * this.enrageDamageMultiplier
                    });
                }
            }

            if (timeSinceStateStart > this.stateDurations.enrage) {
                this.breatheFire = false;
                this.state = 'idle';
                this.stateStartTime = currentTime;
                this.attacksInPhase++;
            }
        }

        // Update meteors
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];
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

                // Also damage player if it's a boss meteor
                const playerDist = Math.sqrt(
                    Math.pow(gameState.player.x - meteor.x, 2) +
                    Math.pow(gameState.player.y - meteor.y, 2)
                );

                if (playerDist < explosionRadius && !gameState.meteorStormStartTime) {
                    // Only damage player if it's NOT from ultimate
                    const damage = 25 * (1 - playerDist / explosionRadius);
                    player.takeDamage(damage);
                }

                // Create explosion particles
                for (let j = 0; j < 20; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 2 + Math.random() * 3;
                    this.particles.push({
                        x: meteor.x,
                        y: meteor.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: 8 + Math.random() * 8,
                        alpha: 1,
                        color: gameState.meteorStormStartTime ? '#8b5cf6' : '#ff6600',
                        lifetime: 40
                    });
                }

                this.meteors.splice(i, 1);
            }
        }

        // Update fire waves
        for (let i = this.fireWaves.length - 1; i >= 0; i--) {
            const wave = this.fireWaves[i];
            wave.radius += wave.speed;
            wave.alpha -= 0.01;

            // Check collision with player
            const playerDist = Math.sqrt(
                Math.pow(gameState.player.x - wave.x, 2) +
                Math.pow(gameState.player.y - wave.y, 2)
            );

            if (Math.abs(playerDist - wave.radius) < 20 && !wave.hitPlayer) {
                player.takeDamage(30);
                wave.hitPlayer = true;
            }

            if (wave.alpha <= 0 || wave.radius > 400) {
                this.fireWaves.splice(i, 1);
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.lifetime--;

            const playerDist = Math.sqrt(
                Math.pow(proj.x - gameState.player.x, 2) +
                Math.pow(proj.y - gameState.player.y, 2)
            );

            if (playerDist < CONFIG.player.size + proj.size) {
                player.takeDamage(proj.damage || this.damage);
                this.projectiles.splice(i, 1);
                createParticles(proj.x, proj.y, proj.color);
            } else if (proj.lifetime <= 0) {
                this.projectiles.splice(i, 1);
            }
        }

        // Contact damage
        const playerDist = Math.sqrt(
            Math.pow(this.x - gameState.player.x, 2) +
            Math.pow(this.y - gameState.player.y, 2)
        );

        if (playerDist < CONFIG.player.size + this.size) {
            player.takeDamage(this.damage * 0.02);
        }

        // Clean up dead minions
        this.summonedMinions = this.summonedMinions.filter(m =>
            gameState.enemies.includes(m)
        );
    }

    chooseNextAttack() {
        const attacks = ['meteor_rain', 'fire_wave', 'summon_minions'];

        // Phase 2+ adds more attacks
        if (this.phase >= 2) {
            attacks.push('teleport_strike');
        }

        // Phase 3 adds enrage
        if (this.phase >= 3 && Math.random() < 0.3) {
            attacks.push('enrage');
        }

        // Don't summon if already have max minions
        if (this.summonedMinions.length >= this.maxMinions) {
            const idx = attacks.indexOf('summon_minions');
            if (idx > -1) attacks.splice(idx, 1);
        }

        const chosen = attacks[Math.floor(Math.random() * attacks.length)];
        this.state = chosen;
        this.stateStartTime = Date.now();

        console.log(`👹 Arch-Demon uses ${chosen}!`);
    }

    summonMeteor() {
        // Random position around player
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 150;
        const targetX = gameState.player.x + Math.cos(angle) * distance;
        const targetY = gameState.player.y + Math.sin(angle) * distance;

        this.meteors.push({
            x: targetX,
            y: targetY - 400, // Start above
            targetY: targetY,
            speed: 3,
            size: 15,
            warningTime: 60
        });
    }

    createFireWave() {
        this.fireWaves.push({
            x: this.x,
            y: this.y,
            radius: 0,
            speed: 4,
            alpha: 1,
            hitPlayer: false
        });
    }

    summonMinions() {
        const numMinions = 4 + Math.floor(Math.random() * 4);

        for (let i = 0; i < numMinions; i++) {
            if (this.summonedMinions.length >= this.maxMinions) break;

            const angle = (Math.PI * 2 / numMinions) * i;
            const distance = 100 + Math.random() * 50;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;

            // Summon charger enemies (more dangerous)
            const minion = new ChargerEnemy(x, y);
            gameState.enemies.push(minion);
            this.summonedMinions.push(minion);

            createParticles(x, y, '#ff0000');
        }
    }

    createShockwave() {
        for (let i = 0; i < 40; i++) {
            const angle = (Math.PI * 2 / 40) * i;
            const speed = 3 + Math.random() * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 10,
                alpha: 1,
                color: '#ff0000',
                lifetime: 50
            });
        }
    }

    createPhaseTransitionEffect() {
        // Massive explosion
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 15 + Math.random() * 10,
                alpha: 1,
                color: this.phase === 2 ? '#ff6600' : '#ff0000',
                lifetime: 80,
                decay: 0.015
            });
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const time = Date.now() * 0.003;

        // Draw particles
        this.particles.forEach(p => {
            const pScreen = toScreen(p.x, p.y);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(pScreen.x, pScreen.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Draw meteors with warning indicators
        this.meteors.forEach(meteor => {
            // Warning indicator on ground
            const targetScreen = toScreen(meteor.x, meteor.targetY);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(targetScreen.x, targetScreen.y, 60, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(targetScreen.x, targetScreen.y, 60, 0, Math.PI * 2);
            ctx.stroke();

            // Meteor itself
            const meteorScreen = toScreen(meteor.x, meteor.y);
            ctx.fillStyle = '#ff3300';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff6600';
            ctx.beginPath();
            ctx.arc(meteorScreen.x, meteorScreen.y, meteor.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw fire waves
        this.fireWaves.forEach(wave => {
            const waveScreen = toScreen(wave.x, wave.y);
            ctx.strokeStyle = `rgba(255, 100, 0, ${wave.alpha})`;
            ctx.lineWidth = 15;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#ff6600';
            ctx.beginPath();
            ctx.arc(waveScreen.x, waveScreen.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Draw projectiles
        this.projectiles.forEach(proj => {
            const projScreen = toScreen(proj.x, proj.y);
            ctx.shadowBlur = 20;
            ctx.shadowColor = proj.color;
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(projScreen.x, projScreen.y, proj.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Teleport effect
        if (this.isTeleporting) {
            const startScreen = toScreen(this.teleportStartX, this.teleportStartY);
            const endScreen = toScreen(this.teleportEndX, this.teleportEndY);

            ctx.globalAlpha = 1 - this.teleportProgress;
            this.drawDemonBody(startScreen.x, startScreen.y);
            ctx.globalAlpha = this.teleportProgress;
            this.drawDemonBody(endScreen.x, endScreen.y);
            ctx.globalAlpha = 1;
        } else {
            this.drawDemonBody(screen.x, screen.y);
        }
    }

    drawDemonBody(screenX, screenY) {
        const time = Date.now() * 0.003;

        // Phase color scheme
        let primaryColor, secondaryColor, eyeColor;
        if (this.phase === 1) {
            primaryColor = '#8b0000';
            secondaryColor = '#4a0000';
            eyeColor = '#ff6600';
        } else if (this.phase === 2) {
            primaryColor = '#b30000';
            secondaryColor = '#660000';
            eyeColor = '#ff3300';
        } else {
            primaryColor = '#ff0000';
            secondaryColor = '#990000';
            eyeColor = '#ffff00';
        }

        // Massive glowing aura
        ctx.shadowBlur = 50 * this.auraIntensity;
        ctx.shadowColor = primaryColor;

        // Draw wings
        const wingSpread = this.size * 1.5 + this.wingFlap;

        // Left wing
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.ellipse(screenX - wingSpread, screenY, this.size * 0.6, this.size * 1.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.ellipse(screenX + wingSpread, screenY, this.size * 0.6, this.size * 1.2, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, this.size, this.size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner body
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, this.size - 10, this.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Horns
        const hornSize = this.size * 0.5;
        ctx.fillStyle = '#1a0000';
        ctx.beginPath();
        ctx.moveTo(screenX - this.size * 0.6, screenY - this.size * 0.8);
        ctx.lineTo(screenX - this.size * 0.8, screenY - this.size * 1.5);
        ctx.lineTo(screenX - this.size * 0.4, screenY - this.size * 0.7);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(screenX + this.size * 0.6, screenY - this.size * 0.8);
        ctx.lineTo(screenX + this.size * 0.8, screenY - this.size * 1.5);
        ctx.lineTo(screenX + this.size * 0.4, screenY - this.size * 0.7);
        ctx.fill();

        // Eyes (massive glowing)
        ctx.shadowBlur = 30;
        ctx.shadowColor = eyeColor;
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.ellipse(screenX - this.size * 0.3, screenY - this.size * 0.3, this.size * 0.2, this.size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(screenX + this.size * 0.3, screenY - this.size * 0.3, this.size * 0.2, this.size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Mouth (flaming if enraged)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + this.size * 0.3, this.size * 0.4, this.size * 0.3, 0, 0, Math.PI);
        ctx.fill();

        if (this.breatheFire) {
            ctx.fillStyle = '#ff4400';
            for (let i = 0; i < 3; i++) {
                ctx.globalAlpha = 0.7 - i * 0.2;
                ctx.beginPath();
                ctx.arc(
                    screenX + Math.cos(this.fireBreathAngle) * (40 + i * 20),
                    screenY + Math.sin(this.fireBreathAngle) * (40 + i * 20),
                    10 + i * 5,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // Draw shields
        this.shields.forEach((shield, index) => {
            if (!shield.broken && shield.hp > 0) {
                const shieldRadius = this.size + 30 + (index * 15);
                const shieldAlpha = 0.2 + (shield.hp / shield.maxHp) * 0.4;

                ctx.strokeStyle = shield.color;
                ctx.lineWidth = 6;
                ctx.globalAlpha = shieldAlpha;
                ctx.shadowBlur = 25;
                ctx.shadowColor = shield.color;

                ctx.beginPath();
                ctx.arc(screenX, screenY, shieldRadius, time + index, time + index + Math.PI);
                ctx.stroke();

                // Shield runes
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i + time * 0.5;
                    const rx = screenX + Math.cos(angle) * shieldRadius;
                    const ry = screenY + Math.sin(angle) * shieldRadius;

                    ctx.fillStyle = shield.color;
                    ctx.beginPath();
                    ctx.arc(rx, ry, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        });

        // Boss health bars
        const barWidth = 120;
        const barHeight = 10;
        const healthPercent = this.hp / this.maxHp;

        // HP bar
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(screenX - barWidth / 2, screenY - this.size - 100, barWidth, barHeight);

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX - barWidth / 2, screenY - this.size - 100, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - barWidth / 2, screenY - this.size - 100, barWidth, barHeight);

        // Shield bars
        let shieldYOffset = -110;
        this.shields.forEach(shield => {
            if (!shield.broken && shield.hp > 0) {
                const shieldPercent = shield.hp / shield.maxHp;

                ctx.fillStyle = '#0a0a1e';
                ctx.fillRect(screenX - barWidth / 2, screenY - this.size + shieldYOffset, barWidth, 6);

                ctx.fillStyle = shield.color;
                ctx.fillRect(screenX - barWidth / 2, screenY - this.size + shieldYOffset, barWidth * shieldPercent, 6);

                ctx.strokeStyle = shield.color;
                ctx.lineWidth = 1;
                ctx.strokeRect(screenX - barWidth / 2, screenY - this.size + shieldYOffset, barWidth, 6);

                shieldYOffset -= 8;
            }
        });

        // Boss name and phase
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        ctx.fillText(`ARCH-DEMON`, screenX, screenY - this.size - 120);

        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = this.phase === 3 ? '#ffff00' : '#ff6600';
        ctx.fillText(`PHASE ${this.phase}${this.isEnraged ? ' - ENRAGED' : ''}`, screenX, screenY - this.size - 135);
        ctx.shadowBlur = 0;
    }

    takeDamage(amount) {
        // Shields absorb damage first (in order)
        for (let shield of this.shields) {
            if (!shield.broken && shield.hp > 0) {
                shield.hp -= amount;

                if (shield.hp <= 0) {
                    shield.hp = 0;
                    shield.broken = true;
                    console.log(`💥 ${shield.name} BROKEN!`);
                    this.createShockwave();
                }
                return false;
            }
        }

        // All shields down, damage HP
        this.hp -= amount;
        return this.hp <= 0;
    }
}