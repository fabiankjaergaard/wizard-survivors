class Tornado {
    constructor(x, y, targetX, targetY, weapon) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.damage = weapon.damage;
        this.weapon = weapon;
        this.rotation = 0;
        this.maxLifetime = 5000; // 5 seconds
        this.spawnTime = Date.now();
        this.pullRadius = 100; // Pull enemies within this radius

        // Move towards target direction
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * 2; // Slow moving
        this.vy = (dy / distance) * 2;
    }

    update() {
        // Move
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += 0.2;

        // Check lifetime
        if (Date.now() - this.spawnTime > this.maxLifetime) {
            return true; // Remove
        }

        // Pull in and damage enemies
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];
            const dx = this.x - enemy.x;
            const dy = this.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.pullRadius) {
                // Pull enemy towards tornado
                const pullStrength = 0.3;
                enemy.x += (dx / dist) * pullStrength;
                enemy.y += (dy / dist) * pullStrength;

                // Damage if close
                if (dist < this.size) {
                    createParticles(enemy.x, enemy.y, '#88ff88');
                    const isDead = enemy.takeDamage(this.damage * 0.1); // Damage over time

                    // Play magic sound for tornado (quieter for DoT)
                    if (Math.random() < 0.2) { // Only 20% of the time to avoid spam
                        SoundSystem.playHit(isDead ? 'critical' : 'magic');
                    }

                    if (isDead) {
                        handleEnemyDeath(enemy);
                        gameState.enemies.splice(i, 1);
                    }
                }
            }
        }

        return false; // Keep tornado
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        ctx.save();

        // Draw multiple spiral layers to create tornado effect
        for (let layer = 0; layer < 8; layer++) {
            const layerRadius = (layer + 1) * 5;
            const layerAlpha = 1 - (layer / 8) * 0.7;

            // Draw spiral
            ctx.beginPath();
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 4 + this.rotation + (layer * 0.3);
                const radius = layerRadius + (i / 20) * (this.size - layerRadius);
                const x = screen.x + Math.cos(angle) * radius;
                const y = screen.y + Math.sin(angle) * radius;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.strokeStyle = `rgba(100, 255, 150, ${layerAlpha * 0.8})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Draw swirling particles around tornado
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + this.rotation * 2;
            const radius = this.size * 0.7 + Math.sin(this.rotation * 3 + i) * 10;
            const x = screen.x + Math.cos(angle) * radius;
            const y = screen.y + Math.sin(angle) * radius;

            ctx.fillStyle = `rgba(150, 255, 180, ${0.6 + Math.sin(this.rotation * 2 + i) * 0.4})`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Bright center core
        const coreGradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, 15);
        coreGradient.addColorStop(0, 'rgba(200, 255, 200, 0.9)');
        coreGradient.addColorStop(0.5, 'rgba(100, 255, 150, 0.5)');
        coreGradient.addColorStop(1, 'rgba(100, 255, 150, 0)');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
