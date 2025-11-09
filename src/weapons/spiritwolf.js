class SpiritWolf {
    constructor(x, y, weapon) {
        this.x = x;
        this.y = y;
        this.weapon = weapon;
        this.size = 15;
        this.speed = 3;
        this.damage = weapon.damage;
        this.hp = 50;
        this.maxHp = 50;
        this.target = null;
        this.lifetime = 10000; // 10 seconds
        this.spawnTime = Date.now();
        this.attackCooldown = 0;
    }

    update() {
        // Check lifetime
        if (Date.now() - this.spawnTime > this.lifetime) {
            return true; // Remove
        }

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= 16;
        }

        // Find target if none or target dead
        if (!this.target || !gameState.enemies.includes(this.target)) {
            let closestDist = Infinity;
            this.target = null;

            gameState.enemies.forEach(enemy => {
                const dist = Math.sqrt(
                    Math.pow(enemy.x - this.x, 2) +
                    Math.pow(enemy.y - this.y, 2)
                );
                if (dist < closestDist) {
                    closestDist = dist;
                    this.target = enemy;
                }
            });
        }

        // Move towards target
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > this.size) {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }

            // Attack if close and cooldown ready
            if (dist < this.size + 20 && this.attackCooldown <= 0) {
                createParticles(this.target.x, this.target.y, '#8b5cf6');
                const isDead = this.target.takeDamage(this.damage);

                // Play magic sound for spirit wolf
                SoundSystem.playHit(isDead ? 'critical' : 'magic');

                if (isDead) {
                    const index = gameState.enemies.indexOf(this.target);
                    if (index > -1) {
                        handleEnemyDeath(this.target);
                        gameState.enemies.splice(index, 1);
                    }
                    this.target = null;
                }
                this.attackCooldown = 500; // 0.5 second cooldown
            }
        }

        return false;
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        // Use the ghost wolf sprite
        if (ghostWolfSprite && ghostWolfSprite.complete) {
            const spriteSize = this.size * 3;
            ctx.drawImage(
                ghostWolfSprite,
                screen.x - spriteSize / 2,
                screen.y - spriteSize / 2,
                spriteSize,
                spriteSize
            );
        } else {
            // Fallback circle if sprite not loaded
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
