class MysteryBoxDrop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 25;
        this.bobTimer = Math.random() * Math.PI * 2;
        this.glowIntensity = 0;
        this.isNearPlayer = false;
        this.rotationAngle = 0;
    }

    update() {
        // Calculate distance to player
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if player is near
        this.isNearPlayer = dist < 50;

        // Update animations
        this.bobTimer += 0.05;
        this.rotationAngle += 0.02;
        this.glowIntensity = Math.sin(this.bobTimer) * 0.3 + 0.7;

        return false; // Mystery boxes don't get auto-collected
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const bobOffset = Math.sin(this.bobTimer) * 7;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + this.size * 1.5, this.size * 1.3, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rainbow glow if player is near
        if (this.isNearPlayer) {
            const rainbow = ['#FFD700', '#FF1493', '#00CED1', '#9370DB', '#FFD700'];
            const glowPhase = this.bobTimer * 2;

            for (let i = 0; i < 5; i++) {
                const phase = (glowPhase + i * 0.4) % rainbow.length;
                const colorIndex = Math.floor(phase);
                const color = rainbow[colorIndex];

                const glow = ctx.createRadialGradient(screen.x, screen.y + bobOffset, 0, screen.x, screen.y + bobOffset, this.size * (4 - i * 0.5));
                glow.addColorStop(0, `${color}${Math.floor(this.glowIntensity * 100).toString(16).padStart(2, '0')}`);
                glow.addColorStop(0.5, `${color}33`);
                glow.addColorStop(1, `${color}00`);
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y + bobOffset, this.size * (4 - i * 0.5), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.save();
        ctx.translate(screen.x, screen.y + bobOffset);
        ctx.rotate(Math.sin(this.rotationAngle) * 0.1);

        // Box main body with gradient (golden)
        const boxGradient = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
        boxGradient.addColorStop(0, '#FFD700');
        boxGradient.addColorStop(0.3, '#FFA500');
        boxGradient.addColorStop(0.7, '#FFD700');
        boxGradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = boxGradient;
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);

        // Box border
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.size, -this.size, this.size * 2, this.size * 2);

        // Question mark
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);

        // Sparkles around box
        const sparkleCount = 6;
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (this.rotationAngle * 2 + (i / sparkleCount) * Math.PI * 2);
            const sparkleX = Math.cos(angle) * this.size * 1.8;
            const sparkleY = Math.sin(angle) * this.size * 1.8;
            const sparkleSize = 3 + Math.sin(this.bobTimer * 3 + i) * 2;

            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Interaction prompt
        if (this.isNearPlayer) {
            const promptGradient = ctx.createLinearGradient(
                screen.x - 50,
                screen.y - this.size * 2.8 + bobOffset,
                screen.x + 50,
                screen.y - this.size * 2.8 + bobOffset + 26
            );
            promptGradient.addColorStop(0, 'rgba(20, 20, 30, 0.85)');
            promptGradient.addColorStop(0.5, 'rgba(30, 30, 40, 0.95)');
            promptGradient.addColorStop(1, 'rgba(20, 20, 30, 0.85)');
            ctx.fillStyle = promptGradient;

            ctx.beginPath();
            ctx.roundRect(screen.x - 50, screen.y - this.size * 2.8 + bobOffset, 100, 26, 8);
            ctx.fill();

            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#FFD700';
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Press E to Spin!', screen.x, screen.y - this.size * 2.8 + bobOffset + 13);
            ctx.restore();
        }
    }
}