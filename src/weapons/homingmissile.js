class HomingMissile {
    constructor(x, y, weapon) {
        this.x = x;
        this.y = y;
        this.size = 6;
        this.speed = 4;
        this.turnSpeed = 0.1; // How fast missile can turn
        this.damage = weapon.damage;
        this.maxLifetime = 5000; // 5 seconds max
        this.spawnTime = Date.now();
        this.weapon = weapon;
        this.target = null;

        // Start with random direction
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update() {
        // Check if missile has expired
        if (Date.now() - this.spawnTime > this.maxLifetime) {
            return true; // Remove missile
        }

        // Find closest enemy if no target or target is dead
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

        // Home towards target
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // Desired direction
                const desiredVx = (dx / distance) * this.speed;
                const desiredVy = (dy / distance) * this.speed;

                // Gradually turn towards target
                this.vx += (desiredVx - this.vx) * this.turnSpeed;
                this.vy += (desiredVy - this.vy) * this.turnSpeed;

                // Maintain constant speed
                const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                this.vx = (this.vx / currentSpeed) * this.speed;
                this.vy = (this.vy / currentSpeed) * this.speed;
            }
        }

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Check collision with enemies
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];
            const dist = Math.sqrt(
                Math.pow(this.x - enemy.x, 2) +
                Math.pow(this.y - enemy.y, 2)
            );

            if (dist < enemy.size + this.size) {
                // Hit!
                createParticles(enemy.x, enemy.y, '#ff1493');
                const isDead = enemy.takeDamage(this.damage);

                // Play explosion sound for missiles
                SoundSystem.playHit(isDead ? 'critical' : 'explosion');

                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(i, 1);
                }
                return true; // Remove missile
            }
        }

        return false; // Keep missile
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        // Pink/red missile with trail
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff1493';

        // Draw missile body
        ctx.fillStyle = '#ff1493';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring
        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Direction indicator (small triangle)
        const angle = Math.atan2(this.vy, this.vx);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(
            screen.x + Math.cos(angle) * this.size,
            screen.y + Math.sin(angle) * this.size
        );
        ctx.lineTo(
            screen.x + Math.cos(angle + 2.5) * (this.size * 0.5),
            screen.y + Math.sin(angle + 2.5) * (this.size * 0.5)
        );
        ctx.lineTo(
            screen.x + Math.cos(angle - 2.5) * (this.size * 0.5),
            screen.y + Math.sin(angle - 2.5) * (this.size * 0.5)
        );
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}
