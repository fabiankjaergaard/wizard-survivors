class TeleporterEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.enemy.size + 3;

        // Apply difficulty scaling
        const difficulty = getDifficultyMultipliers();
        this.speed = CONFIG.enemy.speed * 0.5 * difficulty.speed; // Slower when walking
        this.baseHp = 40;
        this.hp = this.baseHp * difficulty.hp;
        this.maxHp = this.hp;
        this.baseDamage = 8;
        this.damage = this.baseDamage * difficulty.damage;
        this.slowedUntil = 0;
        this.difficultyTier = difficulty.intervals;

        // Teleporter behavior
        this.state = 'idle'; // idle, preparing, teleporting, attacking
        this.idleTime = 2000; // Wait 2 seconds
        this.prepareTime = 1000; // Prepare to teleport for 1 second
        this.attackTime = 1500; // Attack for 1.5 seconds
        this.stateStartTime = Date.now();

        // Teleport properties
        this.teleportCooldown = 0;
        this.teleportX = x;
        this.teleportY = y;
        this.isTeleporting = false;
        this.teleportProgress = 0;
        this.lastTeleportX = x;
        this.lastTeleportY = y;

        // Attack properties
        this.lastAttackTime = 0;
        this.attackCooldown = 800; // Shoot every 0.8 seconds
        this.projectiles = []; // Store enemy projectiles

        // Death explosion color palette (purple for teleporter)
        this.colorPalette = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#ddd6fe'];
    }

    update() {
        const currentTime = Date.now();
        const timeSinceStateStart = currentTime - this.stateStartTime;

        // State machine
        if (this.state === 'idle') {
            // Slowly move towards player
            const dx = gameState.player.x - this.x;
            const dy = gameState.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                const currentSpeed = Date.now() < this.slowedUntil ? this.speed * 0.3 : this.speed;
                this.x += (dx / distance) * currentSpeed;
                this.y += (dy / distance) * currentSpeed;
            }

            if (timeSinceStateStart > this.idleTime) {
                this.state = 'preparing';
                this.stateStartTime = currentTime;
            }
        } else if (this.state === 'preparing') {
            // Stand still and charge up teleport
            if (timeSinceStateStart > this.prepareTime) {
                // Choose teleport location (around player at medium distance)
                const angle = Math.random() * Math.PI * 2;
                const distance = 150 + Math.random() * 100; // 150-250 pixels from player

                this.lastTeleportX = this.x;
                this.lastTeleportY = this.y;
                this.teleportX = gameState.player.x + Math.cos(angle) * distance;
                this.teleportY = gameState.player.y + Math.sin(angle) * distance;

                // Clamp to world bounds
                this.teleportX = Math.max(this.size, Math.min(CONFIG.world.width - this.size, this.teleportX));
                this.teleportY = Math.max(this.size, Math.min(CONFIG.world.height - this.size, this.teleportY));

                this.state = 'teleporting';
                this.isTeleporting = true;
                this.teleportProgress = 0;
                this.stateStartTime = currentTime;
            }
        } else if (this.state === 'teleporting') {
            // Animate teleport
            this.teleportProgress += 0.1;

            if (this.teleportProgress >= 1) {
                this.x = this.teleportX;
                this.y = this.teleportY;
                this.isTeleporting = false;
                this.state = 'attacking';
                this.stateStartTime = currentTime;
            }
        } else if (this.state === 'attacking') {
            // Stand still and shoot projectiles at player
            if (currentTime - this.lastAttackTime > this.attackCooldown) {
                this.shootAtPlayer();
                this.lastAttackTime = currentTime;
            }

            if (timeSinceStateStart > this.attackTime) {
                this.state = 'idle';
                this.stateStartTime = currentTime;
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.lifetime--;

            // Check collision with player
            const playerDist = Math.sqrt(
                Math.pow(proj.x - gameState.player.x, 2) +
                Math.pow(proj.y - gameState.player.y, 2)
            );

            if (playerDist < CONFIG.player.size + proj.size) {
                player.takeDamage(this.damage);
                this.projectiles.splice(i, 1);
                createParticles(proj.x, proj.y, '#9400d3');
            } else if (proj.lifetime <= 0) {
                this.projectiles.splice(i, 1);
            }
        }

        // Check collision with player (contact damage)
        const playerDist = Math.sqrt(
            Math.pow(this.x - gameState.player.x, 2) +
            Math.pow(this.y - gameState.player.y, 2)
        );

        if (playerDist < CONFIG.player.size + this.size) {
            player.takeDamage(this.damage * 0.01);
        }
    }

    shootAtPlayer() {
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = 3;
            this.projectiles.push({
                x: this.x,
                y: this.y,
                vx: (dx / distance) * speed,
                vy: (dy / distance) * speed,
                size: 6,
                lifetime: 180 // 3 seconds at 60fps
            });
        }
    }

    draw() {
        // Draw projectiles first (behind enemy)
        this.projectiles.forEach(proj => {
            const screen = toScreen(proj.x, proj.y);

            ctx.shadowBlur = 10;
            ctx.shadowColor = '#9400d3';
            ctx.fillStyle = '#9400d3';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, proj.size, 0, Math.PI * 2);
            ctx.fill();

            // Inner glow
            ctx.fillStyle = '#da70d6';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, proj.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Teleport effect
        if (this.isTeleporting) {
            // Draw fading out at old position
            const oldScreen = toScreen(this.lastTeleportX, this.lastTeleportY);
            ctx.globalAlpha = 1 - this.teleportProgress;
            this.drawBody(oldScreen.x, oldScreen.y, true);
            ctx.globalAlpha = 1;

            // Draw fading in at new position
            const newScreen = toScreen(this.teleportX, this.teleportY);
            ctx.globalAlpha = this.teleportProgress;
            this.drawBody(newScreen.x, newScreen.y, true);
            ctx.globalAlpha = 1;
        } else {
            const screen = toScreen(this.x, this.y);
            this.drawBody(screen.x, screen.y, false);
        }
    }

    drawBody(screenX, screenY, isTeleporting) {
        const isSlowed = Date.now() < this.slowedUntil;
        const time = Date.now() * 0.003;

        // Different colors based on state
        let bodyColor, darkColor, eyeGlow;

        if (this.state === 'preparing' || isTeleporting) {
            // Purple glow when preparing/teleporting
            bodyColor = '#6a0dad';
            darkColor = '#4b0082';
            eyeGlow = '#da70d6';
        } else if (this.state === 'attacking') {
            // Bright purple when attacking
            bodyColor = '#8b00ff';
            darkColor = '#6a0dad';
            eyeGlow = '#ff00ff';
        } else {
            // Dark purple when idle
            bodyColor = isSlowed ? '#5a4f6a' : '#4b0082';
            darkColor = isSlowed ? '#3a2f4a' : '#2e0854';
            eyeGlow = isSlowed ? '#00ffff' : '#9400d3';
        }

        // Teleport particles around body
        if (this.state === 'preparing' || isTeleporting) {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i + time * 2;
                const radius = this.size + 8 + Math.sin(time * 3 + i) * 4;
                const px = screenX + Math.cos(angle) * radius;
                const py = screenY + Math.sin(angle) * radius;

                ctx.fillStyle = '#da70d6';
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw glowing aura
        ctx.shadowBlur = this.state === 'preparing' || isTeleporting ? 20 : 10;
        ctx.shadowColor = bodyColor;

        // Draw monster body (floating orb-like shape)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        const wobble = Math.sin(time * 2) * 2;
        ctx.ellipse(screenX, screenY, this.size + wobble, this.size - wobble, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw darker inner core
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, this.size - 5, this.size - 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Draw energy rings around body
        ctx.strokeStyle = eyeGlow;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 2; i++) {
            const ringTime = time + i * Math.PI;
            const ringSize = this.size + 10 + Math.sin(ringTime) * 5;
            ctx.beginPath();
            ctx.arc(screenX, screenY, ringSize, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Draw single large eye in center
        const eyeSize = this.size * 0.4;

        // White part
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupil tracking player
        const dx = gameState.player.x - this.x;
        const dy = gameState.player.y - this.y;
        const angle = Math.atan2(dy, dx);
        const pupilDist = eyeSize * 0.3;
        const pupilX = Math.cos(angle) * pupilDist;
        const pupilY = Math.sin(angle) * pupilDist;

        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(screenX + pupilX, screenY + pupilY, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Bright center glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = eyeGlow;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX + pupilX, screenY + pupilY, eyeSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Ice effect overlay
        if (isSlowed && !isTeleporting) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.size + 4, 0, Math.PI * 2);
            ctx.stroke();

            // Ice crystals
            for (let i = 0; i < 6; i++) {
                const iceAngle = (Math.PI * 2 / 6) * i + time;
                const iceX = screenX + Math.cos(iceAngle) * (this.size + 6);
                const iceY = screenY + Math.sin(iceAngle) * (this.size + 6);
                ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
                ctx.fillRect(iceX - 2, iceY - 2, 4, 4);
            }
        }

        // Draw health bar (only when not teleporting)
        if (!isTeleporting) {
            const barWidth = 35;
            const barHeight = 4;
            const healthPercent = this.hp / this.maxHp;

            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(screenX - barWidth / 2, screenY - this.size - 15, barWidth, barHeight);

            ctx.fillStyle = '#9400d3';
            ctx.fillRect(screenX - barWidth / 2, screenY - this.size - 15, barWidth * healthPercent, barHeight);
        }
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