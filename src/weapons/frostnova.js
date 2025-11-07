class FrostNova {
    constructor(weapon) {
        this.x = gameState.player.x;
        this.y = gameState.player.y;
        this.weapon = weapon;
        this.radius = 0;
        this.maxRadius = 200;
        this.expansionSpeed = 15;
        this.damage = weapon.damage;
        this.hitEnemies = new Set();
        this.freezeDuration = 2000; // Freeze enemies for 2s
    }

    update() {
        this.radius += this.expansionSpeed;

        // Check collision with enemies
        gameState.enemies.forEach((enemy, i) => {
            if (this.hitEnemies.has(i)) return;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this.radius && dist < this.maxRadius) {
                this.hitEnemies.add(i);
                createParticles(enemy.x, enemy.y, '#00ffff');

                // Freeze enemy (slow them down)
                if (enemy.originalSpeed === undefined) {
                    enemy.originalSpeed = enemy.speed;
                }
                enemy.speed = enemy.originalSpeed * 0.2;
                enemy.frozenUntil = Date.now() + this.freezeDuration;

                const isDead = enemy.takeDamage(this.damage);
                SoundSystem.playHit(isDead ? 'critical' : 'magic');

                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(i, 1);
                }
            }
        });

        // Remove when fully expanded
        return this.radius >= this.maxRadius;
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        // Expanding frost ring
        const alpha = 1 - (this.radius / this.maxRadius);
        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
        ctx.lineWidth = 8;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = `rgba(200, 255, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.radius - 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}
