class CrystalShard {
    constructor(x, y, targetX, targetY, weapon, isFragment = false) {
        this.x = x;
        this.y = y;
        this.weapon = weapon;
        this.isFragment = isFragment;
        this.size = isFragment ? 8 : 15;
        this.speed = isFragment ? 4 : 6;
        this.damage = isFragment ? weapon.damage * 0.4 : weapon.damage;
        this.rotation = 0;
        this.rotationSpeed = 0.2;

        // Calculate direction
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Check world bounds
        if (this.x < 0 || this.x > CONFIG.world.width || this.y < 0 || this.y > CONFIG.world.height) {
            return true; // Remove
        }

        // Check collision with enemies
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.size + enemy.size) {
                createParticles(this.x, this.y, '#00ffff');

                const isDead = enemy.takeDamage(this.damage);
                SoundSystem.playHit(isDead ? 'critical' : 'normal');

                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(i, 1);
                }

                // If main shard hits, create fragments
                if (!this.isFragment) {
                    for (let j = 0; j < 4; j++) {
                        const angle = (j / 4) * Math.PI * 2;
                        const fragmentTarget = {
                            x: this.x + Math.cos(angle) * 200,
                            y: this.y + Math.sin(angle) * 200
                        };
                        gameState.crystalShards.push(new CrystalShard(
                            this.x, this.y, fragmentTarget.x, fragmentTarget.y, this.weapon, true
                        ));
                    }
                }

                return true; // Remove this shard
            }
        }

        return false;
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(this.rotation);

        // Crystal glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';

        // Draw crystal shape
        ctx.fillStyle = this.isFragment ? '#00cccc' : '#00ffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = i % 2 === 0 ? this.size : this.size * 0.6;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
