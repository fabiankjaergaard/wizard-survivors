class SwarmEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.enemy.size * 0.6;

        const difficulty = getDifficultyMultipliers();
        this.speed = CONFIG.enemy.speed * 2.2 * difficulty.speed; // Very fast
        this.baseHp = 8;
        this.hp = this.baseHp * difficulty.hp;
        this.maxHp = this.hp;
        this.baseDamage = 6;
        this.damage = this.baseDamage * difficulty.damage;
        this.slowedUntil = 0;
        this.difficultyTier = difficulty.intervals;

        // Swarm behavior
        this.swarmRadius = 50;
        this.zigzagPhase = Math.random() * Math.PI * 2;
        this.zigzagSpeed = 0.15;

        this.colorPalette = ['#e67e22', '#d35400', '#f39c12', '#ca6f1e', '#f8b740'];
    }

    update() {
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentSpeed = Date.now() < this.slowedUntil ? this.speed * 0.3 : this.speed;

        if (distance > 0) {
            // Zigzag movement
            this.zigzagPhase += this.zigzagSpeed;
            const zigzagOffset = Math.sin(this.zigzagPhase) * 20;

            // Perpendicular direction for zigzag
            const perpX = -dy / distance;
            const perpY = dx / distance;

            this.x += (dx / distance) * currentSpeed + perpX * zigzagOffset * 0.1;
            this.y += (dy / distance) * currentSpeed + perpY * zigzagOffset * 0.1;
        }

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

        // Small fast creature
        ctx.fillStyle = this.colorPalette[0];
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.colorPalette[1];

        // Body (elongated)
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y, this.size * 1.2, this.size * 0.8, this.zigzagPhase, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (big relative to body)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(screen.x - 4, screen.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(screen.x + 4, screen.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Motion trail
        ctx.strokeStyle = `rgba(230, 126, 34, 0.3)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y);
        ctx.lineTo(screen.x - Math.cos(this.zigzagPhase) * 15, screen.y - Math.sin(this.zigzagPhase) * 15);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // No health bar (too small and numerous)
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }
}