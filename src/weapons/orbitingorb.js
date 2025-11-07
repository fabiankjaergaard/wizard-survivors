class OrbitingOrb {
    constructor(index, totalOrbs, weapon) {
        this.index = index;
        this.totalOrbs = totalOrbs;
        this.weapon = weapon;
        this.angle = (Math.PI * 2 / totalOrbs) * index; // Evenly space orbs
        this.orbitRadius = 80;
        this.rotationSpeed = 0.05; // Radians per frame
        this.size = 10;
        this.damage = weapon.damage;
        this.lastHitTime = 0;
        this.hitCooldown = 500; // ms between hits on same enemy
    }

    update(currentTime) {
        // Rotate around player
        this.angle += this.rotationSpeed;

        // Calculate position
        this.x = gameState.player.x + Math.cos(this.angle) * this.orbitRadius;
        this.y = gameState.player.y + Math.sin(this.angle) * this.orbitRadius;

        // Check collision with enemies
        if (currentTime - this.lastHitTime > this.hitCooldown) {
            for (let i = gameState.enemies.length - 1; i >= 0; i--) {
                const enemy = gameState.enemies[i];
                const dist = Math.sqrt(
                    Math.pow(this.x - enemy.x, 2) +
                    Math.pow(this.y - enemy.y, 2)
                );

                if (dist < enemy.size + this.size) {
                    // Hit enemy
                    createParticles(enemy.x, enemy.y, '#9370db');
                    const isDead = enemy.takeDamage(this.damage);

                    // Play magic hit sound for orbs
                    SoundSystem.playHit(isDead ? 'critical' : 'magic');

                    if (isDead) {
                        handleEnemyDeath(enemy);
                        gameState.enemies.splice(i, 1);
                    }
                    this.lastHitTime = currentTime;
                    break; // Only hit one enemy per update
                }
            }
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        // Purple orb with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#9370db';

        ctx.fillStyle = '#9370db';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow
        ctx.strokeStyle = '#ba55d3';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(screen.x - 3, screen.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}
