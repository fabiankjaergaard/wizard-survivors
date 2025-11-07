class HealerEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.enemy.size * 0.9;

        const difficulty = getDifficultyMultipliers();
        this.speed = CONFIG.enemy.speed * 0.6 * difficulty.speed;
        this.baseHp = 30;
        this.hp = this.baseHp * difficulty.hp;
        this.maxHp = this.hp;
        this.baseDamage = 5;
        this.damage = this.baseDamage * difficulty.damage;
        this.slowedUntil = 0;
        this.difficultyTier = difficulty.intervals;

        // Healer properties
        this.healRange = 150;
        this.healAmount = 2;
        this.healCooldown = 1000;
        this.lastHeal = Date.now();

        this.colorPalette = ['#2ecc71', '#27ae60', '#52d273', '#229954', '#7dcea0'];
        this.healPulse = 0;
    }

    update() {
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentSpeed = Date.now() < this.slowedUntil ? this.speed * 0.3 : this.speed;

        // Stay at medium distance
        const preferredDistance = 200;
        if (distance < preferredDistance - 50) {
            // Move away
            if (distance > 0) {
                this.x -= (dx / distance) * currentSpeed;
                this.y -= (dy / distance) * currentSpeed;
            }
        } else if (distance > preferredDistance + 50) {
            // Move closer
            if (distance > 0) {
                this.x += (dx / distance) * currentSpeed;
                this.y += (dy / distance) * currentSpeed;
            }
        }

        // Heal nearby enemies
        const currentTime = Date.now();
        if (currentTime - this.lastHeal > this.healCooldown) {
            this.healNearbyEnemies();
            this.lastHeal = currentTime;
        }

        this.healPulse += 0.2;

        // Check collision with player
        const playerDist = Math.sqrt(
            Math.pow(this.x - gameState.player.x, 2) +
            Math.pow(this.y - gameState.player.y, 2)
        );

        if (playerDist < CONFIG.player.size + this.size) {
            player.takeDamage(this.damage * 0.016);
        }
    }

    healNearbyEnemies() {
        let healed = false;
        gameState.enemies.forEach(enemy => {
            if (enemy === this) return;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.healRange && enemy.hp < enemy.maxHp) {
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + this.healAmount);
                healed = true;

                // Heal particles
                for (let i = 0; i < 3; i++) {
                    gameState.particles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -2 - Math.random(),
                        size: 4,
                        color: '#2ecc71',
                        alpha: 1,
                        decay: 0.02,
                        lifetime: 30
                    });
                }
            }
        });

        if (healed) {
            this.healPulse = 0; // Reset pulse for visual feedback
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const pulse = Math.abs(Math.sin(this.healPulse)) * 10;

        // Healing aura
        ctx.strokeStyle = `rgba(46, 204, 113, ${0.3 + Math.sin(this.healPulse) * 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.healRange * 0.5 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Healer body
        ctx.fillStyle = this.colorPalette[0];
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.colorPalette[1];
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross symbol
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screen.x - 3, screen.y - 10, 6, 20);
        ctx.fillRect(screen.x - 10, screen.y - 3, 20, 6);

        // Halo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y - this.size - 8, this.size * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Health bar
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barX = screen.x - barWidth / 2;
        const barY = screen.y - this.size - 20;

        ctx.fillStyle = '#003300';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }
}