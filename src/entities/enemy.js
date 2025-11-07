class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.enemy.size;

        // Apply difficulty scaling
        const difficulty = getDifficultyMultipliers();
        this.speed = CONFIG.enemy.speed * difficulty.speed;
        this.baseHp = 15;
        this.hp = this.baseHp * difficulty.hp;
        this.maxHp = this.hp;
        this.baseDamage = 10;
        this.damage = this.baseDamage * difficulty.damage;
        this.slowedUntil = 0; // For ice effect
        this.difficultyTier = difficulty.intervals; // Track which tier this enemy is

        // Animation properties
        this.direction = 'down';
        this.animationFrame = 0;
        this.animationCounter = 0;

        // Death explosion color palette (green for goblin)
        this.colorPalette = ['#4a9d5f', '#5fb571', '#6ed47f', '#3d8a4f', '#7be58d'];
    }

    update() {
        // Move towards player
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply slow effect
        const currentSpeed = Date.now() < this.slowedUntil ? this.speed * 0.3 : this.speed;

        if (distance > 0) {
            this.x += (dx / distance) * currentSpeed;
            this.y += (dy / distance) * currentSpeed;

            // Update direction based on movement
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);
            if (absX > absY) {
                this.direction = dx > 0 ? 'right' : 'left';
            } else {
                this.direction = dy > 0 ? 'down' : 'up';
            }

            // Update animation
            this.animationCounter++;
            if (this.animationCounter >= enemyConfig.animations.walk.speed) {
                this.animationCounter = 0;
                this.animationFrame = (this.animationFrame + 1) % enemyConfig.animations.walk.frames;
            }
        }

        // Check collision with player
        const playerDist = Math.sqrt(
            Math.pow(this.x - gameState.player.x, 2) +
            Math.pow(this.y - gameState.player.y, 2)
        );

        if (playerDist < CONFIG.player.size + this.size) {
            player.takeDamage(this.damage * 0.016); // Damage per frame
        }
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const isSlowed = Date.now() < this.slowedUntil;

        // Draw sprite if loaded, otherwise fallback
        if (enemySprite.complete && enemySprite.naturalWidth > 0) {
            const row = enemyConfig.rows[this.direction];
            const srcX = this.animationFrame * enemyConfig.frameWidth;
            const srcY = row * enemyConfig.frameHeight;

            const scale = 1.0;
            const drawWidth = enemyConfig.frameWidth * scale;
            const drawHeight = enemyConfig.frameHeight * scale;

            // Apply ice tint if slowed
            if (isSlowed) {
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.filter = 'hue-rotate(180deg) brightness(1.2)';
            }

            ctx.drawImage(
                enemySprite,
                srcX, srcY,
                enemyConfig.frameWidth, enemyConfig.frameHeight,
                screen.x - drawWidth / 2,
                screen.y - drawHeight / 2,
                drawWidth, drawHeight
            );

            if (isSlowed) {
                ctx.restore();

                // Ice effect overlay
                const time = Date.now() * 0.003;
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, this.size + 4, 0, Math.PI * 2);
                ctx.stroke();

                // Ice crystals
                for (let i = 0; i < 6; i++) {
                    const iceAngle = (Math.PI * 2 / 6) * i + time;
                    const iceX = screen.x + Math.cos(iceAngle) * (this.size + 6);
                    const iceY = screen.y + Math.sin(iceAngle) * (this.size + 6);
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
                    ctx.fillRect(iceX - 2, iceY - 2, 4, 4);
                }
            }
        } else {
            // Fallback circle
            ctx.fillStyle = isSlowed ? '#4a5f8a' : '#2d4a3e';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw health bar
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = this.hp / this.maxHp;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(screen.x - barWidth / 2, screen.y - this.size - 10, barWidth, barHeight);

        ctx.fillStyle = '#e94560';
        ctx.fillRect(screen.x - barWidth / 2, screen.y - this.size - 10, barWidth * healthPercent, barHeight);
    }

    adjustColorForTier(hexColor, intensity, brighten = false) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);

        // Adjust color based on tier (darker for body, brighter for eyes)
        let newR, newG, newB;
        if (brighten) {
            newR = Math.min(255, r + (255 - r) * intensity);
            newG = Math.min(255, g + (255 - g) * intensity);
            newB = Math.min(255, b + (255 - b) * intensity);
        } else {
            newR = Math.max(0, r - r * intensity);
            newG = Math.max(0, g - g * intensity);
            newB = Math.max(0, b - b * intensity);
        }

        return `rgb(${Math.floor(newR)}, ${Math.floor(newG)}, ${Math.floor(newB)})`;
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }
}