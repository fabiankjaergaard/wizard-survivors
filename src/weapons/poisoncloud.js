class PoisonCloud {
    constructor(x, y, weapon) {
        this.x = x;
        this.y = y;
        this.weapon = weapon;
        this.size = 40;
        this.damageRadius = 80;
        this.damage = weapon.damage * 0.3; // DoT damage per tick
        this.lifetime = 6000; // 6 seconds
        this.spawnTime = Date.now();
        this.lastDamageTick = Date.now();
        this.damageCooldown = 500; // Damage every 0.5s
        this.pulsation = 0;
        this.damagedEnemies = new Set();
    }

    update() {
        const currentTime = Date.now();
        this.pulsation += 0.1;

        // Check lifetime
        if (currentTime - this.spawnTime > this.lifetime) {
            return true; // Remove
        }

        // Damage enemies in radius
        if (currentTime - this.lastDamageTick > this.damageCooldown) {
            this.damagedEnemies.clear();
            gameState.enemies.forEach((enemy, i) => {
                const dx = this.x - enemy.x;
                const dy = this.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.damageRadius && !this.damagedEnemies.has(i)) {
                    this.damagedEnemies.add(i);
                    createParticles(enemy.x, enemy.y, '#88ff00');

                    const isDead = enemy.takeDamage(this.damage);

                    if (Math.random() < 0.2) {
                        SoundSystem.playHit(isDead ? 'critical' : 'magic');
                    }

                    if (isDead) {
                        handleEnemyDeath(enemy);
                        gameState.enemies.splice(i, 1);
                    }
                }
            });
            this.lastDamageTick = currentTime;
        }

        return false;
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const pulse = Math.sin(this.pulsation) * 10;

        // Outer gas cloud
        const gradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, this.damageRadius + pulse);
        gradient.addColorStop(0, 'rgba(100, 255, 0, 0.6)');
        gradient.addColorStop(0.5, 'rgba(80, 200, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(50, 150, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.damageRadius + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Poison bubbles
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2 + this.pulsation * 0.5;
            const radius = this.size + Math.sin(this.pulsation + i) * 20;
            const x = screen.x + Math.cos(angle) * radius;
            const y = screen.y + Math.sin(angle) * radius;

            ctx.fillStyle = `rgba(100, 255, 0, ${0.4 + Math.sin(this.pulsation * 2 + i) * 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Core
        ctx.fillStyle = 'rgba(80, 200, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
