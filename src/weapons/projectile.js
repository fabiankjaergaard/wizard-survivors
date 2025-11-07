class Projectile {
    constructor(x, y, targetX, targetY, weapon) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.speed = 8;
        this.damage = weapon.damage;
        this.range = weapon.range;
        this.distanceTraveled = 0;
        this.weapon = weapon;

        // Calculate direction
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;

        // Trail effect for magic missile
        this.trail = [];
        this.maxTrailLength = 8;
    }

    update() {
        // Add current position to trail
        if (this.weapon.type === 'magic_missile') {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.distanceTraveled += this.speed;

        // Check collision with enemies
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];
            const dist = Math.sqrt(
                Math.pow(this.x - enemy.x, 2) +
                Math.pow(this.y - enemy.y, 2)
            );

            if (dist < enemy.size + this.size) {
                this.handleHit(enemy, i);
                return true; // Projectile hit (except lightning which chains)
            }
        }

        return this.distanceTraveled > this.range;
    }

    handleHit(enemy, enemyIndex) {
        // Calculate critical hit
        const isCrit = Math.random() < gameState.critChance;
        const finalDamage = isCrit ? this.damage * gameState.critMultiplier : this.damage;

        // Show damage number
        gameState.damageNumbers.push(new DamageNumber(enemy.x, enemy.y, finalDamage, isCrit));

        // Deal damage
        const isDead = enemy.takeDamage(finalDamage);

        // Critical hit visual effect
        if (isCrit) {
            // Extra particles for crits
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                gameState.particles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(angle) * 3,
                    vy: Math.sin(angle) * 3,
                    size: 2 + Math.random() * 2,
                    color: '#ffd700',
                    alpha: 1,
                    gravity: 0,
                    life: 1,
                    draw: function() {
                        const screen = toScreen(this.x, this.y);
                        ctx.save();
                        ctx.globalAlpha = this.alpha;
                        ctx.fillStyle = this.color;
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = '#ffd700';
                        ctx.fillRect(screen.x - this.size/2, screen.y - this.size/2, this.size, this.size);
                        ctx.restore();
                    },
                    update: function() {
                        this.x += this.vx;
                        this.y += this.vy;
                        this.vx *= 0.95;
                        this.vy *= 0.95;
                        this.life -= 0.02;
                        this.alpha = this.life;
                    }
                });
            }
        }

        // Play weapon-specific hit sound
        let soundType = isCrit ? 'critical' : 'normal';
        if (isDead) {
            soundType = 'critical';
        } else if (this.weapon.type === 'fireball' || this.weapon.type === 'meteor') {
            soundType = 'explosion';
        } else if (this.weapon.type === 'ice' || this.weapon.type === 'frost_nova') {
            soundType = 'magic';
        } else if (this.weapon.type === 'lightning' || this.weapon.type === 'chain_lightning') {
            soundType = 'magic';
        } else if (this.weapon.type === 'arcane_orb' || this.weapon.type === 'spirit') {
            soundType = 'magic';
        }
        SoundSystem.playHit(soundType);

        // Weapon-specific effects
        switch(this.weapon.type) {
            case 'lightning':
                // Chain lightning - jump to multiple nearby enemies
                createParticles(enemy.x, enemy.y, '#ffff00');
                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(enemyIndex, 1);
                }

                // Recursive chain lightning
                const maxChains = 5; // Number of times it can chain
                const chainRange = 150; // Range to find next target
                let currentTarget = enemy;
                let hitTargets = new Set([enemyIndex]);
                let chainDamage = this.damage * 0.6;

                for (let chain = 0; chain < maxChains; chain++) {
                    let closestDist = chainRange;
                    let nextTarget = null;
                    let nextIndex = -1;

                    // Find closest enemy not yet hit
                    for (let j = 0; j < gameState.enemies.length; j++) {
                        if (hitTargets.has(j)) continue;
                        const nextEnemy = gameState.enemies[j];
                        const dist = Math.sqrt(
                            Math.pow(nextEnemy.x - currentTarget.x, 2) +
                            Math.pow(nextEnemy.y - currentTarget.y, 2)
                        );
                        if (dist < closestDist) {
                            closestDist = dist;
                            nextTarget = nextEnemy;
                            nextIndex = j;
                        }
                    }

                    if (!nextTarget) break; // No more targets in range

                    // Create lightning effect
                    createLightningEffect(currentTarget.x, currentTarget.y, nextTarget.x, nextTarget.y);

                    // Damage and particles
                    const chainIsDead = nextTarget.takeDamage(chainDamage);
                    createParticles(nextTarget.x, nextTarget.y, '#ffff00');

                    if (chainIsDead) {
                        handleEnemyDeath(nextTarget);
                        gameState.enemies.splice(nextIndex, 1);
                        // Update indices after removal
                        const updatedHitTargets = new Set();
                        hitTargets.forEach(idx => {
                            updatedHitTargets.add(idx > nextIndex ? idx - 1 : idx);
                        });
                        hitTargets = updatedHitTargets;
                        break; // Stop chaining if enemy died
                    }

                    hitTargets.add(nextIndex);
                    currentTarget = nextTarget;
                    chainDamage *= 0.85; // Slightly reduce damage each chain
                }
                break;

            case 'fireball':
                // Explosion - damage all nearby enemies
                createParticles(enemy.x, enemy.y, '#ff4500');
                const explosionRadius = this.weapon.explosionRadius || 50;

                for (let j = gameState.enemies.length - 1; j >= 0; j--) {
                    const nearbyEnemy = gameState.enemies[j];
                    const explosionDist = Math.sqrt(
                        Math.pow(nearbyEnemy.x - enemy.x, 2) +
                        Math.pow(nearbyEnemy.y - enemy.y, 2)
                    );

                    if (explosionDist < explosionRadius) {
                        const splashDamage = j === enemyIndex ? this.damage : this.damage * 0.6;
                        if (nearbyEnemy.takeDamage(splashDamage)) {
                            handleEnemyDeath(nearbyEnemy);
                            gameState.enemies.splice(j, 1);
                            if (j < enemyIndex) enemyIndex--; // Adjust index
                        }
                    }
                }

                // Draw explosion ring
                createExplosionEffect(enemy.x, enemy.y, explosionRadius);
                break;

            case 'ice':
                // Slow effect
                enemy.slowedUntil = Date.now() + 2000; // Slow for 2 seconds
                createParticles(enemy.x, enemy.y, '#00ffff');

                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(enemyIndex, 1);
                }
                break;

            case 'arcane':
                // Standard hit with purple particles
                createParticles(enemy.x, enemy.y, '#9370db');
                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(enemyIndex, 1);
                }
                break;

            default: // magic_missile
                createParticles(enemy.x, enemy.y, '#00d9ff');
                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(enemyIndex, 1);
                }
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        // Magic missile uses custom sprite with rotation
        if (this.weapon.type === 'magic_missile') {
            const projectileImg = new Image();
            projectileImg.src = '/assets/MagicOrbProjectileBasicGame.png';

            // Calculate angle based on velocity direction
            const angle = Math.atan2(this.vy, this.vx);

            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(angle);

            // Add glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#a855f7';

            // Draw projectile image (centered)
            const size = 40; // Size of the sprite
            ctx.drawImage(projectileImg, -size/2, -size/2, size, size);

            ctx.restore();
            ctx.shadowBlur = 0;
            return;
        }

        // Different colors and effects for other weapon types
        let fillColor, glowColor, size;

        switch(this.weapon.type) {
            case 'lightning':
                fillColor = '#ffff00';
                glowColor = '#ffff99';
                size = 7;
                // Electric spark effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ffff00';
                break;
            case 'fireball':
                fillColor = '#ff4500';
                glowColor = '#ff8c00';
                size = 10;
                // Flame trail
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ff4500';
                break;
            case 'ice':
                fillColor = '#00ffff';
                glowColor = '#b0e0e6';
                size = 6;
                // Frost effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00ffff';
                break;
            case 'arcane':
                fillColor = '#9370db';
                glowColor = '#ba55d3';
                size = 8;
                // Magic shimmer
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#9370db';
                break;
            default:
                fillColor = '#00d9ff';
                glowColor = '#7fffd4';
                size = 5;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00d9ff';
        }

        // Draw simple circle projectile for other types
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;
    }
}
