class ShadowClone {
    constructor(weapon) {
        this.weapon = weapon;
        this.x = gameState.player.x;
        this.y = gameState.player.y;
        this.offsetX = (Math.random() - 0.5) * 100;
        this.offsetY = (Math.random() - 0.5) * 100;
        this.size = 30;
        this.lifetime = 10000; // 10 seconds
        this.spawnTime = Date.now();
        this.attackCooldown = 1000;
        this.lastAttack = Date.now();
        this.alpha = 0;
        this.fadeInDuration = 500;
    }

    update() {
        const currentTime = Date.now();
        const age = currentTime - this.spawnTime;

        // Fade in
        if (age < this.fadeInDuration) {
            this.alpha = age / this.fadeInDuration;
        } else {
            this.alpha = 1;
        }

        // Check lifetime
        if (age > this.lifetime) {
            return true; // Remove
        }

        // Follow player with offset
        const targetX = gameState.player.x + this.offsetX;
        const targetY = gameState.player.y + this.offsetY;
        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;

        // Attack nearest enemy
        if (currentTime - this.lastAttack > this.attackCooldown) {
            let nearestEnemy = null;
            let nearestDist = 300;

            gameState.enemies.forEach(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            });

            if (nearestEnemy) {
                // Create shadow projectile
                gameState.projectiles.push(new Projectile(
                    this.x,
                    this.y,
                    nearestEnemy.x,
                    nearestEnemy.y,
                    { ...this.weapon, type: 'shadow_bolt', damage: this.weapon.damage * 0.5 }
                ));
                this.lastAttack = currentTime;
            }
        }

        return false;
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        ctx.save();

        // Shadow effect - more transparent and darker
        ctx.globalAlpha = this.alpha * 0.4;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#000088';

        // Draw player sprite but darker/shadow version
        if (gameState.player.sprite && gameState.player.sprite.complete) {
            const spriteX = gameState.player.spriteX || 0;
            const spriteY = gameState.player.spriteY || 0;
            const spriteSize = gameState.player.spriteSize || 64;

            // Apply dark tint for shadow effect
            ctx.filter = 'brightness(0.3) saturate(0.5) hue-rotate(240deg)';

            ctx.drawImage(
                gameState.player.sprite,
                spriteX, spriteY,
                spriteSize, spriteSize,
                screen.x - this.size,
                screen.y - this.size,
                this.size * 2,
                this.size * 2
            );

            ctx.filter = 'none';
        } else {
            // Fallback to circle if sprite not loaded
            ctx.fillStyle = '#220066';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
