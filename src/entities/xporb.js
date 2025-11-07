class XPOrb {
    constructor(x, y, xpValue = 5) {
        this.x = x;
        this.y = y;
        this.xpValue = xpValue;

        // Size and color based on XP value
        if (xpValue <= 5) {
            // Small XP (common enemies)
            this.size = 6;
            this.color = { r: 100, g: 200, b: 255 }; // Blue
        } else if (xpValue <= 15) {
            // Medium XP
            this.size = 9;
            this.color = { r: 150, g: 100, b: 255 }; // Purple
        } else if (xpValue <= 30) {
            // Large XP
            this.size = 12;
            this.color = { r: 255, g: 150, b: 50 }; // Orange
        } else {
            // Huge XP (bosses)
            this.size = 16;
            this.color = { r: 255, g: 215, b: 0 }; // Gold
        }

        this.magnetRange = 150; // How close player needs to be to attract orb
        this.magnetSpeed = 4;
        this.pulseTimer = 0;
        this.glowIntensity = 0;
        this.rotation = Math.random() * Math.PI * 2; // Random start rotation
        this.rotationSpeed = 0.05;
        this.floatOffset = Math.random() * Math.PI * 2; // Random float phase
        this.sparkles = []; // Particle sparkles around orb
        this.age = 0;
    }

    update() {
        this.age++;

        // Calculate distance to player
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Magnetic pull when player is close (only if player has XP magnet upgrade)
        if (gameState.player.hasXPMagnet && dist < this.magnetRange) {
            const pullStrength = 1 - (dist / this.magnetRange);
            this.x += (dx / dist) * this.magnetSpeed * pullStrength;
            this.y += (dy / dist) * this.magnetSpeed * pullStrength;
        }

        // Check if player collects the orb (must touch it without magnet)
        if (dist < CONFIG.player.size + this.size) {
            return true; // Signal for removal and XP gain
        }

        // Update animations
        this.pulseTimer += 0.1;
        this.glowIntensity = Math.sin(this.pulseTimer) * 0.3 + 0.7;
        this.rotation += this.rotationSpeed;
        this.floatOffset += 0.08;

        // Add sparkle particles occasionally
        if (Math.random() < 0.15) {
            const angle = Math.random() * Math.PI * 2;
            const distance = this.size * 0.8;
            this.sparkles.push({
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 0.5,
                vy: Math.sin(angle) * 0.5 - 0.3,
                life: 1,
                size: 1 + Math.random() * 1.5
            });
        }

        // Update sparkles
        this.sparkles = this.sparkles.filter(sparkle => {
            sparkle.x += sparkle.vx;
            sparkle.y += sparkle.vy;
            sparkle.vy += 0.02; // Gravity
            sparkle.life -= 0.03;
            return sparkle.life > 0;
        });

        return false;
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const floatY = Math.sin(this.floatOffset) * 3; // Floating effect

        ctx.save();

        // Draw sparkles first (behind orb)
        this.sparkles.forEach(sparkle => {
            const sparkleScreen = toScreen(sparkle.x, sparkle.y);
            ctx.globalAlpha = sparkle.life;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 4;
            ctx.shadowColor = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
            ctx.fillRect(
                sparkleScreen.x - sparkle.size / 2,
                sparkleScreen.y - sparkle.size / 2,
                sparkle.size,
                sparkle.size
            );
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Outer pulsing glow
        const gradient = ctx.createRadialGradient(
            screen.x,
            screen.y + floatY,
            0,
            screen.x,
            screen.y + floatY,
            this.size * 2.5
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.glowIntensity * 0.6})`);
        gradient.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.glowIntensity * 0.3})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y + floatY, this.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Rotating energy ring
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.glowIntensity * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = this.rotation + (Math.PI * 2 / 8) * i;
            const ringRadius = this.size * 1.3;
            const x = screen.x + Math.cos(angle) * ringRadius;
            const y = screen.y + floatY + Math.sin(angle) * ringRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();

        // Main orb body with better gradient
        const currentSize = this.size * (0.9 + Math.sin(this.pulseTimer) * 0.1);
        const orbGradient = ctx.createRadialGradient(
            screen.x - currentSize * 0.4,
            screen.y + floatY - currentSize * 0.4,
            0,
            screen.x,
            screen.y + floatY,
            currentSize
        );

        // Create lighter versions of the color for gradient
        const lightColor = `rgb(${Math.min(255, this.color.r + 100)}, ${Math.min(255, this.color.g + 100)}, ${Math.min(255, this.color.b + 100)})`;
        const midColor = `rgb(${Math.min(255, this.color.r + 50)}, ${Math.min(255, this.color.g + 50)}, ${Math.min(255, this.color.b + 50)})`;
        const darkColor = `rgb(${Math.max(0, this.color.r - 50)}, ${Math.max(0, this.color.g - 50)}, ${Math.max(0, this.color.b - 50)})`;

        orbGradient.addColorStop(0, '#ffffff');
        orbGradient.addColorStop(0.3, lightColor);
        orbGradient.addColorStop(0.6, midColor);
        orbGradient.addColorStop(1, darkColor);

        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y + floatY, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = this.glowIntensity * 0.7;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y + floatY, currentSize * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Highlight shine
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
            screen.x - currentSize * 0.35,
            screen.y + floatY - currentSize * 0.35,
            currentSize * 0.25,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }
}