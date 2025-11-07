class BlackHole {
    constructor(x, y, weapon) {
        this.x = x;
        this.y = y;
        this.weapon = weapon;
        this.size = 30;
        this.pullRadius = 250;
        this.damage = weapon.damage * 0.05; // Damage over time
        this.lifetime = 5000; // 5 seconds
        this.spawnTime = Date.now();
        this.rotation = 0;
    }

    update() {
        this.rotation += 0.1;

        // Check lifetime
        if (Date.now() - this.spawnTime > this.lifetime) {
            return true; // Remove
        }

        // Pull and damage enemies
        gameState.enemies.forEach((enemy, i) => {
            const dx = this.x - enemy.x;
            const dy = this.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.pullRadius) {
                // Pull enemy towards black hole
                const pullStrength = (1 - dist / this.pullRadius) * 0.8;
                enemy.x += (dx / dist) * pullStrength;
                enemy.y += (dy / dist) * pullStrength;

                // Damage if very close
                if (dist < this.size * 2) {
                    if (Math.random() < 0.1) {
                        createParticles(enemy.x, enemy.y, '#9900ff');
                    }

                    const isDead = enemy.takeDamage(this.damage);

                    // Play magic sound occasionally (to avoid spam from DoT)
                    if (Math.random() < 0.15) {
                        SoundSystem.playHit(isDead ? 'critical' : 'magic');
                    }

                    if (isDead) {
                        handleEnemyDeath(enemy);
                        gameState.enemies.splice(i, 1);
                    }
                }
            }
        });

        return false;
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        // Event horizon (outer ring)
        const gradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, this.size * 3);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.3, 'rgba(50, 0, 100, 0.8)');
        gradient.addColorStop(0.6, 'rgba(100, 0, 200, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 0, 200, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Swirling particles
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + this.rotation * (1 + i * 0.1);
            const radius = this.size + Math.sin(this.rotation * 3 + i) * this.size;
            const x = screen.x + Math.cos(angle) * radius;
            const y = screen.y + Math.sin(angle) * radius;

            const particleAlpha = 0.5 + Math.sin(this.rotation * 2 + i) * 0.3;
            ctx.fillStyle = `rgba(150, 50, 255, ${particleAlpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Black core
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Purple ring around core
        ctx.strokeStyle = 'rgba(150, 0, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#9900ff';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}
