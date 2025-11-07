class ChargerEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.enemy.size + 5; // Slightly bigger

        // Apply difficulty scaling
        const difficulty = getDifficultyMultipliers();
        this.speed = CONFIG.enemy.speed * 2.5 * difficulty.speed; // Much faster
        this.baseHp = 50;
        this.hp = this.baseHp * difficulty.hp;
        this.maxHp = this.hp;
        this.baseDamage = 15;
        this.damage = this.baseDamage * difficulty.damage;
        this.slowedUntil = 0;
        this.difficultyTier = difficulty.intervals;

        // Charger behavior
        this.state = 'idle'; // idle, charging, resting
        this.idleTime = 1000; // Wait 1 second before charging
        this.chargeTime = 1500; // Charge for 1.5 seconds
        this.restTime = 2000; // Rest for 2 seconds
        this.stateStartTime = Date.now();

        // Store charge direction
        this.chargeAngle = 0;
        this.chargeDx = 0;
        this.chargeDy = 0;
    }

    update() {
        const currentTime = Date.now();
        const timeSinceStateStart = currentTime - this.stateStartTime;

        // State machine
        if (this.state === 'idle') {
            if (timeSinceStateStart > this.idleTime) {
                // Start charging - calculate direction to player
                const dx = gameState.player.x - this.x;
                const dy = gameState.player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    this.chargeDx = dx / distance;
                    this.chargeDy = dy / distance;
                    this.chargeAngle = Math.atan2(dy, dx);
                }

                this.state = 'charging';
                this.stateStartTime = currentTime;
            }
        } else if (this.state === 'charging') {
            // Rush towards stored direction
            const currentSpeed = Date.now() < this.slowedUntil ? this.speed * 0.3 : this.speed;

            this.x += this.chargeDx * currentSpeed;
            this.y += this.chargeDy * currentSpeed;

            if (timeSinceStateStart > this.chargeTime) {
                this.state = 'resting';
                this.stateStartTime = currentTime;
            }
        } else if (this.state === 'resting') {
            // Stand still and catch breath
            if (timeSinceStateStart > this.restTime) {
                this.state = 'idle';
                this.stateStartTime = currentTime;
            }
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
        const isSlowed = Date.now() < this.slowedUntil;

        // Different colors based on state
        let bodyColor, darkColor, eyeGlow;

        if (this.state === 'charging') {
            // Red angry colors when charging
            bodyColor = isSlowed ? '#7a4f5f' : '#8b2f3f';
            darkColor = isSlowed ? '#5a2f3f' : '#5a1f2a';
            eyeGlow = isSlowed ? '#00ffff' : '#ffff00'; // Yellow eyes when charging
        } else if (this.state === 'resting') {
            // Dark tired colors when resting
            bodyColor = isSlowed ? '#3a4f5a' : '#2a3540';
            darkColor = isSlowed ? '#2a3f4a' : '#1a2530';
            eyeGlow = isSlowed ? '#00ffff' : '#6666ff';
        } else {
            // Normal colors when idle
            bodyColor = isSlowed ? '#5a4f6a' : '#4a3555';
            darkColor = isSlowed ? '#3a2f4a' : '#2a1f35';
            eyeGlow = isSlowed ? '#00ffff' : '#ff6633';
        }

        // Draw monster body (more rectangular/bulky shape for charger)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        const time = Date.now() * 0.005;

        if (this.state === 'charging') {
            // Elongated shape when charging
            const wobble = Math.sin(time * 3) * 1;
            ctx.ellipse(screen.x, screen.y + 2, this.size + 3, this.size - 5 + wobble, this.chargeAngle, 0, Math.PI * 2);
        } else if (this.state === 'resting') {
            // Squished shape when resting (tired)
            ctx.ellipse(screen.x, screen.y + 4, this.size - 2, this.size - 6, 0, 0, Math.PI * 2);
        } else {
            // Normal shape when idle
            ctx.ellipse(screen.x, screen.y + 2, this.size, this.size - 3, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // Draw darker bottom shadow
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + 6, this.size - 6, this.size - 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw horns
        ctx.fillStyle = darkColor;
        const hornOffset = this.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(screen.x - hornOffset, screen.y - this.size * 0.3);
        ctx.lineTo(screen.x - hornOffset - 8, screen.y - this.size * 0.8);
        ctx.lineTo(screen.x - hornOffset + 3, screen.y - this.size * 0.3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(screen.x + hornOffset, screen.y - this.size * 0.3);
        ctx.lineTo(screen.x + hornOffset + 8, screen.y - this.size * 0.8);
        ctx.lineTo(screen.x + hornOffset - 3, screen.y - this.size * 0.3);
        ctx.fill();

        // Draw monster eyes
        const eyeOffset = this.size * 0.25;
        const eyeSize = this.size * 0.15;

        // White part of eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screen.x - eyeOffset, screen.y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screen.x + eyeOffset, screen.y, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const angle = Math.atan2(dy, dx);
        const pupilDist = eyeSize * 0.3;
        const pupilX = Math.cos(angle) * pupilDist;
        const pupilY = Math.sin(angle) * pupilDist;

        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(screen.x - eyeOffset + pupilX, screen.y + pupilY, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screen.x + eyeOffset + pupilX, screen.y + pupilY, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Eye glow effect (stronger when charging)
        const glowStrength = this.state === 'charging' ? 12 : 6;
        ctx.shadowBlur = glowStrength;
        ctx.shadowColor = eyeGlow;
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(screen.x - eyeOffset + pupilX, screen.y + pupilY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(screen.x + eyeOffset + pupilX, screen.y + pupilY, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw mouth (grimacing)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + 6, this.size * 0.35, this.size * 0.2, 0, 0, Math.PI);
        ctx.fill();

        // Teeth (more than normal enemy)
        ctx.fillStyle = '#ffffff';
        const teeth = 6;
        for (let i = 0; i < teeth; i++) {
            const tx = screen.x - this.size * 0.28 + (this.size * 0.56 / (teeth - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(tx, screen.y + 6);
            ctx.lineTo(tx - 2, screen.y + 10);
            ctx.lineTo(tx + 2, screen.y + 10);
            ctx.closePath();
            ctx.fill();
        }

        // Charge effect (speed lines)
        if (this.state === 'charging' && !isSlowed) {
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const lineAngle = this.chargeAngle + Math.PI;
                const lineLength = 15 + i * 10;
                const startX = screen.x + Math.cos(lineAngle) * (this.size + 5);
                const startY = screen.y + Math.sin(lineAngle) * (this.size + 5);
                const endX = startX + Math.cos(lineAngle) * lineLength;
                const endY = startY + Math.sin(lineAngle) * lineLength;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        }

        // Resting effect (zzz)
        if (this.state === 'resting') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '12px Arial';
            const zOffset = Math.sin(time * 2) * 3;
            ctx.fillText('z', screen.x + this.size * 0.5, screen.y - this.size - 10 + zOffset);
            ctx.fillText('Z', screen.x + this.size * 0.6 + 5, screen.y - this.size - 15 + zOffset);
        }

        // Ice effect overlay
        if (isSlowed) {
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

        // Draw health bar
        const barWidth = 35;
        const barHeight = 5;
        const healthPercent = this.hp / this.maxHp;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(screen.x - barWidth / 2, screen.y - this.size - 15, barWidth, barHeight);

        ctx.fillStyle = '#e94560';
        ctx.fillRect(screen.x - barWidth / 2, screen.y - this.size - 15, barWidth * healthPercent, barHeight);
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