class ThunderHammer {
    constructor(weapon) {
        this.x = gameState.player.x;
        this.y = gameState.player.y;
        this.weapon = weapon;
        this.size = 40;
        this.damageRadius = 120;
        this.damage = weapon.damage;
        this.lifetime = 400; // Short lived
        this.spawnTime = Date.now();
        this.hasHit = false;
        this.stunDuration = 1500; // Stun for 1.5s

        // Hammer appears in front of player
        const keys = gameState.keys;
        let hammerX = this.x;
        let hammerY = this.y;

        if (keys.w || keys.ArrowUp) hammerY -= 60;
        else if (keys.s || keys.ArrowDown) hammerY += 60;
        if (keys.a || keys.ArrowLeft) hammerX -= 60;
        else if (keys.d || keys.ArrowRight) hammerX += 60;

        this.targetX = hammerX;
        this.targetY = hammerY;
    }

    update() {
        const currentTime = Date.now();

        if (currentTime - this.spawnTime > this.lifetime) {
            return true; // Remove
        }

        // Damage enemies once
        if (!this.hasHit) {
            this.hasHit = true;

            gameState.enemies.forEach((enemy, i) => {
                const dx = this.targetX - enemy.x;
                const dy = this.targetY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.damageRadius) {
                    createParticles(enemy.x, enemy.y, '#ffff00');

                    // Stun enemy
                    if (enemy.originalSpeed === undefined) {
                        enemy.originalSpeed = enemy.speed;
                    }
                    enemy.speed = 0;
                    enemy.stunnedUntil = currentTime + this.stunDuration;

                    const isDead = enemy.takeDamage(this.damage);
                    SoundSystem.playHit(isDead ? 'explosion' : 'critical');

                    if (isDead) {
                        handleEnemyDeath(enemy);
                        gameState.enemies.splice(i, 1);
                    }
                }
            });
        }

        return false;
    }

    draw() {
        const screen = toScreen(this.targetX, this.targetY);
        const progress = (Date.now() - this.spawnTime) / this.lifetime;

        // Lightning effect
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffff00';

        // Hammer impact
        const impactRadius = this.damageRadius * (1 - progress);
        const alpha = 1 - progress;

        ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, impactRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Lightning bolts
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const length = this.damageRadius * (1 - progress * 0.5);

            ctx.strokeStyle = `rgba(255, 255, 100, ${alpha * 0.8})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y);
            ctx.lineTo(
                screen.x + Math.cos(angle) * length,
                screen.y + Math.sin(angle) * length
            );
            ctx.stroke();
        }

        // Hammer (only visible at start)
        if (progress < 0.5) {
            const hammerAlpha = 1 - progress * 2;

            // Hammer head
            ctx.fillStyle = `rgba(150, 150, 150, ${hammerAlpha})`;
            ctx.fillRect(screen.x - 20, screen.y - 15, 40, 30);

            // Hammer glow
            ctx.fillStyle = `rgba(255, 255, 0, ${hammerAlpha * 0.5})`;
            ctx.fillRect(screen.x - 22, screen.y - 17, 44, 34);

            // Handle
            ctx.fillStyle = `rgba(101, 67, 33, ${hammerAlpha})`;
            ctx.fillRect(screen.x - 3, screen.y + 15, 6, 30);
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
