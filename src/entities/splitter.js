class SplitterEnemy {
    constructor(x, y, generation = 1) {
        this.x = x;
        this.y = y;
        this.generation = generation; // 1 = big, 2 = medium, 3 = small
        this.size = CONFIG.enemy.size + (4 - generation) * 8;

        const difficulty = getDifficultyMultipliers();
        this.speed = CONFIG.enemy.speed * (1 + generation * 0.3) * difficulty.speed;
        this.baseHp = 15 * (4 - generation); // Reduced from 20
        this.hp = this.baseHp * difficulty.hp;
        this.maxHp = this.hp;
        this.baseDamage = 6; // Reduced from 8
        this.damage = this.baseDamage * difficulty.damage;
        this.slowedUntil = 0;
        this.difficultyTier = difficulty.intervals;

        // Visual properties
        this.colorPalette = ['#ff6b6b', '#ff8787', '#ffa5a5', '#ff4d4d', '#ff9999'];
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
        // Move towards player
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const currentSpeed = Date.now() < this.slowedUntil ? this.speed * 0.3 : this.speed;

        if (distance > 0) {
            this.x += (dx / distance) * currentSpeed;
            this.y += (dy / distance) * currentSpeed;
        }

        this.pulsePhase += 0.1;

        // Check collision with player
        const playerDist = Math.sqrt(
            Math.pow(this.x - gameState.player.x, 2) +
            Math.pow(this.y - gameState.player.y, 2)
        );

        if (playerDist < CONFIG.player.size + this.size) {
            player.takeDamage(this.damage * 0.016);
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const pulse = Math.sin(this.pulsePhase) * 3;

        // Pulsating blob
        ctx.fillStyle = this.colorPalette[0];
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.colorPalette[1];
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = this.colorPalette[3];
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(screen.x - this.size * 0.3, screen.y - this.size * 0.2, this.size * 0.2, this.size * 0.2);
        ctx.fillRect(screen.x + this.size * 0.1, screen.y - this.size * 0.2, this.size * 0.2, this.size * 0.2);

        ctx.shadowBlur = 0;

        // Health bar
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barX = screen.x - barWidth / 2;
        const barY = screen.y - this.size - 10;

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }

    // Called when enemy dies - splits into smaller versions
    onDeath() {
        if (this.generation < 3) {
            // Split into 2 smaller enemies
            const angleOffset = Math.PI / 3;
            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spawnDist = 30;
                gameState.enemies.push(new SplitterEnemy(
                    this.x + Math.cos(angle) * spawnDist,
                    this.y + Math.sin(angle) * spawnDist,
                    this.generation + 1
                ));
            }
        }
    }
}