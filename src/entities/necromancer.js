class NecromancerBoss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 40; // Much larger than normal enemies
        this.speed = CONFIG.enemy.speed * 0.3; // Very slow
        this.hp = 500; // Boss HP
        this.maxHp = 500;
        this.damage = 20;
        this.slowedUntil = 0;
        this.isBoss = true;

        // Boss behavior
        this.state = 'floating'; // floating, summoning, casting, channeling
        this.floatTime = 3000; // Float for 3 seconds
        this.summonTime = 2000; // Summon for 2 seconds
        this.castTime = 1500; // Cast for 1.5 seconds
        this.channelingTime = 2500; // Channel beam for 2.5 seconds
        this.stateStartTime = Date.now();

        // Attack properties
        this.projectiles = [];
        this.lastProjectileTime = 0;
        this.projectileCooldown = 400;

        // Summoning properties
        this.summonedEnemies = [];
        this.maxSummons = 8;

        // Beam attack
        this.beamActive = false;
        this.beamAngle = 0;
        this.beamRotationSpeed = 0.02;
        this.beamDamage = 0.5; // Damage per frame
        this.beamRange = 250;

        // Visual effects
        this.floatOffset = 0;
        this.auraRotation = 0;
        this.particles = [];

        // Shield
        this.hasShield = true;
        this.shieldHp = 100;
        this.maxShieldHp = 100;
        this.shieldRegenCooldown = 0;
        this.shieldRegenDelay = 5000; // 5 seconds before shield starts regenerating

        // Death explosion color palette (dark purple/black for necromancer)
        this.colorPalette = ['#4c1d95', '#6b21a8', '#7e22ce', '#2e1065', '#9333ea'];
    }

    update() {
        const currentTime = Date.now();
        const timeSinceStateStart = currentTime - this.stateStartTime;

        // Update visual effects
        this.floatOffset = Math.sin(currentTime * 0.002) * 10;
        this.auraRotation += 0.01;

        // Shield regeneration
        if (this.shieldHp < this.maxShieldHp && this.shieldRegenCooldown <= 0) {
            this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + 0.2);
        }
        if (this.shieldRegenCooldown > 0) {
            this.shieldRegenCooldown -= 16;
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
            p.size *= 0.98;

            if (p.alpha <= 0 || p.size < 0.5) {
                this.particles.splice(i, 1);
            }
        }

        // State machine
        if (this.state === 'floating') {
            // Slowly circle around player
            const dx = gameState.player.x - this.x;
            const dy = gameState.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Maintain distance of 200-300 pixels
            const targetDistance = 250;
            if (distance > 0) {
                const angle = Math.atan2(dy, dx);
                const perpAngle = angle + Math.PI / 2;

                let moveX = 0, moveY = 0;

                if (distance > targetDistance + 50) {
                    moveX = (dx / distance) * this.speed;
                    moveY = (dy / distance) * this.speed;
                } else if (distance < targetDistance - 50) {
                    moveX = -(dx / distance) * this.speed;
                    moveY = -(dy / distance) * this.speed;
                }

                // Add circular movement
                moveX += Math.cos(perpAngle) * this.speed;
                moveY += Math.sin(perpAngle) * this.speed;

                this.x += moveX;
                this.y += moveY;
            }

            // Shoot projectiles
            if (currentTime - this.lastProjectileTime > this.projectileCooldown) {
                this.shootSpiral();
                this.lastProjectileTime = currentTime;
            }

            if (timeSinceStateStart > this.floatTime) {
                // Choose next attack
                const roll = Math.random();
                if (roll < 0.4 && this.summonedEnemies.length < this.maxSummons) {
                    this.state = 'summoning';
                } else if (roll < 0.7) {
                    this.state = 'casting';
                } else {
                    this.state = 'channeling';
                    this.beamActive = true;
                    this.beamAngle = Math.atan2(
                        gameState.player.y - this.y,
                        gameState.player.x - this.x
                    );
                }
                this.stateStartTime = currentTime;
            }
        } else if (this.state === 'summoning') {
            // Summon enemies around the boss
            if (timeSinceStateStart > this.summonTime) {
                this.summonEnemies();
                this.state = 'floating';
                this.stateStartTime = currentTime;
            }

            // Create summoning particles
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 30 + Math.random() * 20;
                this.particles.push({
                    x: this.x + Math.cos(angle) * dist,
                    y: this.y + Math.sin(angle) * dist,
                    vx: Math.cos(angle) * -2,
                    vy: Math.sin(angle) * -2,
                    size: 4 + Math.random() * 4,
                    alpha: 1,
                    color: '#00ff00'
                });
            }
        } else if (this.state === 'casting') {
            // Fire spread of projectiles
            if (timeSinceStateStart > this.castTime) {
                this.castSpreadAttack();
                this.state = 'floating';
                this.stateStartTime = currentTime;
            }
        } else if (this.state === 'channeling') {
            // Rotate beam attack
            this.beamAngle += this.beamRotationSpeed;

            // Check if beam hits player
            const beamEndX = this.x + Math.cos(this.beamAngle) * this.beamRange;
            const beamEndY = this.y + Math.sin(this.beamAngle) * this.beamRange;

            // Simple line-circle collision
            const playerDist = Math.sqrt(
                Math.pow(gameState.player.x - this.x, 2) +
                Math.pow(gameState.player.y - this.y, 2)
            );

            if (playerDist < this.beamRange) {
                const angleToPlayer = Math.atan2(
                    gameState.player.y - this.y,
                    gameState.player.x - this.x
                );
                const angleDiff = Math.abs(this.beamAngle - angleToPlayer);

                if (angleDiff < 0.2 || angleDiff > Math.PI * 2 - 0.2) {
                    player.takeDamage(this.beamDamage);

                    // Beam hit particles
                    if (Math.random() < 0.5) {
                        createParticles(gameState.player.x, gameState.player.y, '#ff0000');
                    }
                }
            }

            if (timeSinceStateStart > this.channelingTime) {
                this.beamActive = false;
                this.state = 'floating';
                this.stateStartTime = currentTime;
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.lifetime--;

            // Check collision with player
            const playerDist = Math.sqrt(
                Math.pow(proj.x - gameState.player.x, 2) +
                Math.pow(proj.y - gameState.player.y, 2)
            );

            if (playerDist < CONFIG.player.size + proj.size) {
                player.takeDamage(this.damage);
                this.projectiles.splice(i, 1);
                createParticles(proj.x, proj.y, proj.color);
            } else if (proj.lifetime <= 0) {
                this.projectiles.splice(i, 1);
            }
        }

        // Check collision with player (contact damage)
        const playerDist = Math.sqrt(
            Math.pow(this.x - gameState.player.x, 2) +
            Math.pow(this.y - gameState.player.y, 2)
        );

        if (playerDist < CONFIG.player.size + this.size) {
            player.takeDamage(this.damage * 0.015);
        }

        // Remove dead summoned enemies from tracking
        this.summonedEnemies = this.summonedEnemies.filter(e =>
            gameState.enemies.includes(e)
        );
    }

    shootSpiral() {
        // Shoot 3 projectiles in a spiral pattern
        const baseAngle = Math.atan2(
            gameState.player.y - this.y,
            gameState.player.x - this.x
        );

        for (let i = 0; i < 3; i++) {
            const angle = baseAngle + (i - 1) * 0.3;
            const speed = 2.5;

            this.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 8,
                lifetime: 200,
                color: '#ff00ff'
            });
        }
    }

    castSpreadAttack() {
        // Fire 12 projectiles in all directions
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const speed = 3;

            this.projectiles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 10,
                lifetime: 180,
                color: '#ff6600'
            });
        }
    }

    summonEnemies() {
        // Summon 3-5 enemies around the boss
        const numSummons = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numSummons; i++) {
            if (this.summonedEnemies.length >= this.maxSummons) break;

            const angle = (Math.PI * 2 / numSummons) * i;
            const distance = 80 + Math.random() * 40;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;

            // Summon normal enemies
            const enemy = new Enemy(x, y);
            gameState.enemies.push(enemy);
            this.summonedEnemies.push(enemy);

            // Spawn effect
            createParticles(x, y, '#00ff00');
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y + this.floatOffset);
        const time = Date.now() * 0.003;

        // Draw custom particles
        this.particles.forEach(p => {
            const pScreen = toScreen(p.x, p.y);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(pScreen.x, pScreen.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw projectiles
        this.projectiles.forEach(proj => {
            const projScreen = toScreen(proj.x, proj.y);

            ctx.shadowBlur = 15;
            ctx.shadowColor = proj.color;
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(projScreen.x, projScreen.y, proj.size, 0, Math.PI * 2);
            ctx.fill();

            // Inner glow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(projScreen.x, projScreen.y, proj.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw beam attack
        if (this.beamActive) {
            ctx.save();
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 15;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff0000';
            ctx.globalAlpha = 0.7;

            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y);
            ctx.lineTo(
                screen.x + Math.cos(this.beamAngle) * this.beamRange,
                screen.y + Math.sin(this.beamAngle) * this.beamRange
            );
            ctx.stroke();

            // Inner beam
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y);
            ctx.lineTo(
                screen.x + Math.cos(this.beamAngle) * this.beamRange,
                screen.y + Math.sin(this.beamAngle) * this.beamRange
            );
            ctx.stroke();

            ctx.restore();
        }

        // Draw floating aura rings
        for (let i = 0; i < 3; i++) {
            const ringTime = this.auraRotation + i * (Math.PI * 2 / 3);
            const ringRadius = this.size + 15 + Math.sin(time * 2 + i) * 8;

            ctx.strokeStyle = this.state === 'summoning' ? '#00ff00' :
                             this.state === 'casting' ? '#ff6600' :
                             this.state === 'channeling' ? '#ff0000' :
                             '#9400d3';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, ringRadius, ringTime, ringTime + Math.PI);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Draw main body with dramatic glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#9400d3';

        // Outer dark robe
        ctx.fillStyle = '#1a0033';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + 5, this.size, this.size + 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Middle robe
        ctx.fillStyle = '#4b0082';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y, this.size - 5, this.size - 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#6a0dad';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y, this.size - 15, this.size - 15, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Draw skull face
        const skullSize = this.size * 0.5;

        // Eye sockets (glowing)
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.ellipse(screen.x - skullSize * 0.4, screen.y - skullSize * 0.2, skullSize * 0.25, skullSize * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(screen.x + skullSize * 0.4, screen.y - skullSize * 0.2, skullSize * 0.25, skullSize * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bright eye glow
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(screen.x - skullSize * 0.4, screen.y - skullSize * 0.2, skullSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screen.x + skullSize * 0.4, screen.y - skullSize * 0.2, skullSize * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Draw shield if active
        if (this.hasShield && this.shieldHp > 0) {
            const shieldAlpha = 0.3 + (this.shieldHp / this.maxShieldHp) * 0.4;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.globalAlpha = shieldAlpha;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';

            ctx.beginPath();
            ctx.arc(screen.x, screen.y, this.size + 20, 0, Math.PI * 2);
            ctx.stroke();

            // Shield hexagons
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + time;
                const hx = screen.x + Math.cos(angle) * (this.size + 20);
                const hy = screen.y + Math.sin(angle) * (this.size + 20);

                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(hx, hy, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // State indicator
        if (this.state === 'summoning') {
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SUMMONING...', screen.x, screen.y - this.size - 30);
        } else if (this.state === 'casting') {
            ctx.fillStyle = '#ff6600';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CASTING...', screen.x, screen.y - this.size - 30);
        }

        // Boss health bars
        const barWidth = 80;
        const barHeight = 8;
        const healthPercent = this.hp / this.maxHp;

        // HP bar background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(screen.x - barWidth / 2, screen.y - this.size - 50, barWidth, barHeight);

        // HP bar fill
        ctx.fillStyle = '#e94560';
        ctx.fillRect(screen.x - barWidth / 2, screen.y - this.size - 50, barWidth * healthPercent, barHeight);

        // HP bar border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(screen.x - barWidth / 2, screen.y - this.size - 50, barWidth, barHeight);

        // Shield bar (if shield exists)
        if (this.hasShield && this.shieldHp > 0) {
            const shieldPercent = this.shieldHp / this.maxShieldHp;

            ctx.fillStyle = '#0a0a1e';
            ctx.fillRect(screen.x - barWidth / 2, screen.y - this.size - 60, barWidth, 6);

            ctx.fillStyle = '#00ffff';
            ctx.fillRect(screen.x - barWidth / 2, screen.y - this.size - 60, barWidth * shieldPercent, 6);

            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(screen.x - barWidth / 2, screen.y - this.size - 60, barWidth, 6);
        }

        // Boss name
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        ctx.fillText('NECROMANCER', screen.x, screen.y - this.size - 65);
        ctx.shadowBlur = 0;
    }

    takeDamage(amount) {
        // Shield absorbs damage first
        if (this.hasShield && this.shieldHp > 0) {
            this.shieldHp -= amount;
            this.shieldRegenCooldown = this.shieldRegenDelay;

            if (this.shieldHp <= 0) {
                this.shieldHp = 0;
                // Shield broken effect
                createParticles(this.x, this.y, '#00ffff');
            }
            return false;
        }

        // Otherwise damage HP
        this.hp -= amount;
        return this.hp <= 0;
    }
}