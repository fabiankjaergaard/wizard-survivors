class RangedEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.enemy.size;

        const difficulty = getDifficultyMultipliers();
        this.speed = CONFIG.enemy.speed * 0.7 * difficulty.speed; // Slower
        this.baseHp = 20; // Reduced from 25
        this.hp = this.baseHp * difficulty.hp;
        this.maxHp = this.hp;
        this.baseDamage = 8; // Reduced from 12
        this.damage = this.baseDamage * difficulty.damage;
        this.slowedUntil = 0;
        this.difficultyTier = difficulty.intervals;

        // Ranged behavior
        this.attackRange = 250;
        this.keepDistance = 180;
        this.shootCooldown = 2500; // Increased from 2000 (slower shooting)
        this.lastShot = Date.now();

        this.colorPalette = ['#9b59b6', '#8e44ad', '#af7ac5', '#7d3c98', '#bb8fce'];
        this.projectiles = [];
    }

    update() {
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentSpeed = Date.now() < this.slowedUntil ? this.speed * 0.3 : this.speed;

        // Keep distance from player
        if (distance < this.keepDistance) {
            // Move away
            if (distance > 0) {
                this.x -= (dx / distance) * currentSpeed;
                this.y -= (dy / distance) * currentSpeed;
            }
        } else if (distance > this.attackRange) {
            // Move closer
            if (distance > 0) {
                this.x += (dx / distance) * currentSpeed;
                this.y += (dy / distance) * currentSpeed;
            }
        }

        // Shoot at player
        const currentTime = Date.now();
        if (currentTime - this.lastShot > this.shootCooldown && distance < this.attackRange) {
            this.shoot();
            this.lastShot = currentTime;
        }
    }

    shoot() {
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            gameState.enemyProjectiles = gameState.enemyProjectiles || [];
            gameState.enemyProjectiles.push({
                x: this.x,
                y: this.y,
                vx: (dx / distance) * 4,
                vy: (dy / distance) * 4,
                damage: this.damage,
                size: 6,
                color: '#9b59b6'
            });
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        // Archer body
        ctx.fillStyle = this.colorPalette[0];
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.colorPalette[1];
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Bow
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screen.x + this.size, screen.y, this.size * 0.8, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(screen.x - 5, screen.y - 3, 3, 0, Math.PI * 2);
        ctx.arc(screen.x + 5, screen.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Health bar
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barX = screen.x - barWidth / 2;
        const barY = screen.y - this.size - 10;

        ctx.fillStyle = '#330000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }
}