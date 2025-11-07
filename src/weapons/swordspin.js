class SwordSpinAttack {
    constructor(weapon) {
        this.damage = weapon.damage;
        this.weapon = weapon;
        this.isActive = false;
        this.spinAngle = 0;
        this.spinDuration = 800; // How long the spin lasts (ms)
        this.spinStartTime = 0;
        this.spinRadius = 80; // Damage radius
        this.hitEnemies = new Set(); // Track which enemies we've hit this spin
    }

    activate() {
        if (!this.isActive) {
            this.isActive = true;
            this.spinStartTime = Date.now();
            this.spinAngle = 0;
            this.hitEnemies.clear();
        }
    }

    update() {
        if (!this.isActive) return false;

        const currentTime = Date.now();
        const elapsed = currentTime - this.spinStartTime;

        if (elapsed >= this.spinDuration) {
            this.isActive = false;
            return false;
        }

        // Spin faster at the beginning, slower at end
        const progress = elapsed / this.spinDuration;
        this.spinAngle += (1 - progress * 0.5) * 0.4; // Starts fast, slows down

        // Check collision with all enemies in radius
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            if (this.hitEnemies.has(i)) continue;

            const enemy = gameState.enemies[i];
            const dist = Math.sqrt(
                Math.pow(enemy.x - gameState.player.x, 2) +
                Math.pow(enemy.y - gameState.player.y, 2)
            );

            if (dist < this.spinRadius + enemy.size) {
                this.hitEnemies.add(i);
                createParticles(enemy.x, enemy.y, '#c0c0c0');

                const isDead = enemy.takeDamage(this.damage);

                // Play sword hit sound
                SoundSystem.playHit(isDead ? 'critical' : 'normal');

                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(i, 1);
                    // Update hit enemies set
                    const newSet = new Set();
                    this.hitEnemies.forEach(idx => {
                        if (idx > i) newSet.add(idx - 1);
                        else if (idx < i) newSet.add(idx);
                    });
                    this.hitEnemies = newSet;
                }
            }
        }

        return true;
    }

    draw() {
        if (!this.isActive) return;

        const playerScreen = toScreen(gameState.player.x, gameState.player.y);
        const elapsed = Date.now() - this.spinStartTime;
        const progress = elapsed / this.spinDuration;

        ctx.save();
        ctx.translate(playerScreen.x, playerScreen.y);

        // Draw spinning motion blur circle
        const blurAlpha = 0.3 * (1 - progress);
        ctx.strokeStyle = `rgba(192, 192, 192, ${blurAlpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.spinRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw multiple sword trails for motion blur effect
        const numTrails = 8;
        for (let i = 0; i < numTrails; i++) {
            const trailAngle = this.spinAngle - (i * 0.3);
            const trailAlpha = (1 - i / numTrails) * 0.4 * (1 - progress);

            ctx.save();
            ctx.rotate(trailAngle);

            // Sword trail
            const swordLength = 60;
            ctx.strokeStyle = `rgba(200, 200, 255, ${trailAlpha})`;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(swordLength, 0);
            ctx.stroke();

            ctx.restore();
        }

        // Draw main sword
        ctx.rotate(this.spinAngle);

        const swordLength = 60;
        const swordWidth = 12;

        // Sword glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(200, 220, 255, 0.8)';

        // Blade
        ctx.fillStyle = '#d0d0d0';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -swordWidth / 2);
        ctx.lineTo(swordLength - 10, -swordWidth / 3);
        ctx.lineTo(swordLength, 0); // Sharp tip
        ctx.lineTo(swordLength - 10, swordWidth / 3);
        ctx.lineTo(0, swordWidth / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Blade shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(5, -swordWidth / 4);
        ctx.lineTo(swordLength - 15, -swordWidth / 6);
        ctx.lineTo(swordLength - 15, swordWidth / 6);
        ctx.lineTo(5, swordWidth / 4);
        ctx.closePath();
        ctx.fill();

        // Handle
        ctx.fillStyle = '#654321';
        ctx.fillRect(-15, -swordWidth / 2, 15, swordWidth);

        // Cross guard
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(-5, -swordWidth * 1.2, 5, swordWidth * 2.4);

        // Pommel
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(-15, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
