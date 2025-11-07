class Meteor {
    constructor(targetX, targetY, weapon) {
        // Start high above target
        this.x = targetX + (Math.random() - 0.5) * 100; // Slight randomness
        this.y = targetY - 400; // Start above screen
        this.targetX = targetX;
        this.targetY = targetY;
        this.size = 15;
        this.damage = weapon.damage;
        this.weapon = weapon;
        this.speed = 8;
        this.rotation = 0;
        this.trailParticles = [];
        this.hasHit = false;
        this.explosionRadius = 80;
    }

    update() {
        if (!this.hasHit) {
            // Fall towards target
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.speed) {
                // Hit ground!
                this.hasHit = true;
                this.explode();
                return true; // Remove meteor after short delay
            }

            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
            this.rotation += 0.2;

            // Add trail particle
            this.trailParticles.push({
                x: this.x,
                y: this.y,
                life: 1
            });

            // Remove old trail particles
            this.trailParticles = this.trailParticles.filter(p => {
                p.life -= 0.05;
                return p.life > 0;
            });
        }

        return false;
    }

    explode() {
        // Create explosion effect
        createExplosionEffect(this.targetX, this.targetY, this.explosionRadius);
        createParticles(this.targetX, this.targetY, '#ff6600');

        // Damage all enemies in radius
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];
            const dist = Math.sqrt(
                Math.pow(enemy.x - this.targetX, 2) +
                Math.pow(enemy.y - this.targetY, 2)
            );

            if (dist < this.explosionRadius) {
                createParticles(enemy.x, enemy.y, '#ff4400');
                if (enemy.takeDamage(this.damage)) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(i, 1);
                }
            }
        }
    }

    draw() {
        // Draw trail
        this.trailParticles.forEach(p => {
            const screen = toScreen(p.x, p.y);
            ctx.fillStyle = `rgba(255, 100, 0, ${p.life * 0.6})`;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw meteor
        const screen = toScreen(this.x, this.y);

        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(this.rotation);

        // Outer glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff6600';

        // Meteor body (rocky with flames)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#ffaa00');
        gradient.addColorStop(0.5, '#ff6600');
        gradient.addColorStop(1, '#cc3300');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Rock texture (darker spots)
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = this.size * 0.6;
            ctx.fillStyle = 'rgba(100, 50, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * radius * 0.5,
                Math.sin(angle) * radius * 0.5,
                3, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Bright core
        ctx.fillStyle = '#ffff88';
        ctx.beginPath();
        ctx.arc(-2, -2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
