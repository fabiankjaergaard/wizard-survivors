class Chest {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.coinValue = Math.floor(Math.random() * 50) + 20; // 20-70 coins
        this.bobTimer = Math.random() * Math.PI * 2; // Random start for bob animation
        this.glowIntensity = 0;
        this.isNearPlayer = false;
    }

    update() {
        // Calculate distance to player
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if player is near
        this.isNearPlayer = dist < 50;

        // Update bob animation
        this.bobTimer += 0.05;
        this.glowIntensity = Math.sin(this.bobTimer) * 0.3 + 0.7;

        return false; // Chests don't get auto-collected
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const bobOffset = Math.sin(this.bobTimer) * 5;
        const sparklePhase = this.bobTimer * 3;

        // Chest sprite size
        const spriteSize = 64; // Adjust based on your sprite size

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + spriteSize * 0.4, spriteSize * 0.4, spriteSize * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Magical glow if player is near
        if (this.isNearPlayer) {
            // Outer magical glow
            const outerGlow = ctx.createRadialGradient(screen.x, screen.y + bobOffset, 0, screen.x, screen.y + bobOffset, spriteSize * 1.5);
            outerGlow.addColorStop(0, `rgba(255, 215, 0, ${this.glowIntensity * 0.4})`);
            outerGlow.addColorStop(0.3, `rgba(255, 165, 0, ${this.glowIntensity * 0.3})`);
            outerGlow.addColorStop(0.6, `rgba(218, 165, 32, ${this.glowIntensity * 0.1})`);
            outerGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y + bobOffset, spriteSize * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Inner bright glow
            const innerGlow = ctx.createRadialGradient(screen.x, screen.y + bobOffset, 0, screen.x, screen.y + bobOffset, spriteSize * 0.8);
            innerGlow.addColorStop(0, `rgba(255, 255, 200, ${this.glowIntensity * 0.6})`);
            innerGlow.addColorStop(0.5, `rgba(255, 215, 0, ${this.glowIntensity * 0.3})`);
            innerGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y + bobOffset, spriteSize * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw the chest sprite
        ctx.save();
        ctx.imageSmoothingEnabled = false; // Pixel art style
        ctx.drawImage(
            rewardChestSprite,
            screen.x - spriteSize / 2,
            screen.y + bobOffset - spriteSize / 2,
            spriteSize,
            spriteSize
        );
        ctx.restore();

        // Sparkle effects when near player
        if (this.isNearPlayer) {
            ctx.fillStyle = '#FFE87C';
            for (let i = 0; i < 5; i++) {
                const sparkleAngle = sparklePhase + (i * Math.PI * 2 / 5);
                const sparkleDistance = spriteSize * 0.6;
                const sparkleSize = 2 + Math.sin(sparklePhase + i) * 1.5;
                const sparkleX = screen.x + Math.cos(sparkleAngle) * sparkleDistance;
                const sparkleY = screen.y + bobOffset + Math.sin(sparkleAngle) * sparkleDistance;

                ctx.save();
                ctx.translate(sparkleX, sparkleY);
                ctx.rotate(sparklePhase + i);
                ctx.beginPath();
                ctx.moveTo(0, -sparkleSize);
                ctx.lineTo(sparkleSize * 0.3, 0);
                ctx.lineTo(0, sparkleSize);
                ctx.lineTo(-sparkleSize * 0.3, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        // Interaction prompt with better styling
        if (this.isNearPlayer) {
            // Prompt background with gradient
            const promptGradient = ctx.createLinearGradient(
                screen.x - 40,
                screen.y - spriteSize * 0.8 + bobOffset,
                screen.x + 40,
                screen.y - spriteSize * 0.8 + bobOffset + 26
            );
            promptGradient.addColorStop(0, 'rgba(20, 20, 30, 0.85)');
            promptGradient.addColorStop(0.5, 'rgba(30, 30, 40, 0.95)');
            promptGradient.addColorStop(1, 'rgba(20, 20, 30, 0.85)');
            ctx.fillStyle = promptGradient;

            // Rounded rectangle for prompt
            ctx.beginPath();
            ctx.roundRect(screen.x - 40, screen.y - spriteSize * 0.8 + bobOffset, 80, 26, 8);
            ctx.fill();

            // Border glow
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Text with glow
            ctx.save();
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#FFD700';
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Press E', screen.x, screen.y - spriteSize * 0.8 + bobOffset + 13);
            ctx.restore();
        }
    }
}