class TankEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.enemy.size * 1.8;

        const difficulty = getDifficultyMultipliers();
        this.speed = CONFIG.enemy.speed * 0.4 * difficulty.speed; // Very slow
        this.baseHp = 120; // Reduced from 200
        this.hp = this.baseHp * difficulty.hp;
        this.maxHp = this.hp;
        this.baseDamage = 15; // Reduced from 20
        this.damage = this.baseDamage * difficulty.damage;
        this.slowedUntil = 0;
        this.difficultyTier = difficulty.intervals;

        // Tank properties
        this.armor = 0.6; // Reduced from 0.5 (takes 40% damage instead of 50%)
        this.pushStrength = 2; // Reduced from 3

        this.colorPalette = ['#34495e', '#2c3e50', '#455a64', '#1c2833', '#566573'];
    }

    update() {
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentSpeed = Date.now() < this.slowedUntil ? this.speed * 0.3 : this.speed;

        if (distance > 0) {
            this.x += (dx / distance) * currentSpeed;
            this.y += (dy / distance) * currentSpeed;
        }

        // Check collision with player - push back
        const playerDist = Math.sqrt(
            Math.pow(this.x - gameState.player.x, 2) +
            Math.pow(this.y - gameState.player.y, 2)
        );

        if (playerDist < CONFIG.player.size + this.size) {
            player.takeDamage(this.damage * 0.016);

            // Push player back
            if (playerDist > 0) {
                const pushX = -(dx / playerDist) * this.pushStrength;
                const pushY = -(dy / playerDist) * this.pushStrength;
                gameState.player.x += pushX;
                gameState.player.y += pushY;

                // Keep player in bounds
                gameState.player.x = Math.max(CONFIG.player.size, Math.min(CONFIG.world.width - CONFIG.player.size, gameState.player.x));
                gameState.player.y = Math.max(CONFIG.player.size, Math.min(CONFIG.world.height - CONFIG.player.size, gameState.player.y));
            }
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        // Tank body - large and armored
        ctx.fillStyle = this.colorPalette[0];
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#000000';

        // Main body (rectangle)
        ctx.fillRect(screen.x - this.size, screen.y - this.size * 0.8, this.size * 2, this.size * 1.6);

        // Armor plating lines
        ctx.strokeStyle = this.colorPalette[1];
        ctx.lineWidth = 3;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(screen.x - this.size, screen.y + i * this.size * 0.4);
            ctx.lineTo(screen.x + this.size, screen.y + i * this.size * 0.4);
            ctx.stroke();
        }

        // Eyes (glowing red)
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(screen.x - this.size * 0.4, screen.y - this.size * 0.3, 5, 0, Math.PI * 2);
        ctx.arc(screen.x + this.size * 0.4, screen.y - this.size * 0.3, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Health bar
        const barWidth = this.size * 2.5;
        const barHeight = 6;
        const barX = screen.x - barWidth / 2;
        const barY = screen.y - this.size * 1.2;

        ctx.fillStyle = '#000000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);

        // Armor indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('🛡️', screen.x - 8, screen.y + this.size + 10);
    }

    takeDamage(amount) {
        // Apply armor reduction
        this.hp -= amount * this.armor;
        return this.hp <= 0;
    }
}