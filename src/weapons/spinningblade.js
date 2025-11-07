class SpinningBlade {
    constructor(x, y, targetX, targetY, weapon) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.size = 8;
        this.damage = weapon.damage;
        this.weapon = weapon;
        this.rotation = 0;
        this.maxDistance = 250;
        this.distanceTraveled = 0;
        this.returning = false;
        this.speed = 6;
        this.hitEnemies = new Set(); // Track which enemies we've hit

        // Initial direction towards target
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }

    update() {
        // Rotate blade
        this.rotation += 0.3;

        if (!this.returning) {
            // Move outward
            this.x += this.vx;
            this.y += this.vy;
            this.distanceTraveled += this.speed;

            // Start returning when max distance reached
            if (this.distanceTraveled >= this.maxDistance) {
                this.returning = true;
                this.hitEnemies.clear(); // Can hit enemies again on return
            }
        } else {
            // Return to player
            const dx = gameState.player.x - this.x;
            const dy = gameState.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {
                return true; // Remove blade when it returns to player
            }

            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
            this.x += this.vx;
            this.y += this.vy;
        }

        // Check collision with enemies
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];

            // Skip if already hit this enemy in current direction
            if (this.hitEnemies.has(i)) continue;

            const dist = Math.sqrt(
                Math.pow(this.x - enemy.x, 2) +
                Math.pow(this.y - enemy.y, 2)
            );

            if (dist < enemy.size + this.size) {
                // Hit!
                this.hitEnemies.add(i);
                createParticles(enemy.x, enemy.y, '#ff6b6b');
                const isDead = enemy.takeDamage(this.damage);

                // Play blade hit sound
                SoundSystem.playHit(isDead ? 'critical' : 'normal');

                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(i, 1);
                }
            }
        }

        return false; // Keep blade
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(this.rotation);

        // Draw spinning blade (cross/star shape)
        ctx.strokeStyle = '#ff6b6b';
        ctx.fillStyle = '#ff3333';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';

        // Draw 4 blade edges
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI / 2) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * this.size * 2,
                Math.sin(angle) * this.size * 2
            );
            ctx.stroke();

            // Blade tip
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * this.size * 2,
                Math.sin(angle) * this.size * 2,
                3, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Center circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();

        // Draw motion trail when returning
        if (this.returning) {
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y);
            ctx.lineTo(screen.x - this.vx * 3, screen.y - this.vy * 3);
            ctx.stroke();
        }
    }
}
