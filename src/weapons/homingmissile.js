class HomingMissile {
    constructor(x, y, weapon) {
        this.x = x;
        this.y = y;
        this.size = 6;
        this.speed = 4;
        this.turnSpeed = 0.1; // How fast missile can turn
        this.damage = weapon.damage;
        this.maxLifetime = 5000; // 5 seconds max
        this.spawnTime = Date.now();
        this.weapon = weapon;
        this.target = null;

        // Trail effect
        this.trail = [];
        this.maxTrailLength = 10;

        // Particle effects
        this.exhaustParticles = [];

        // Start with random direction
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update() {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Add exhaust particles
        const angle = Math.atan2(this.vy, this.vx);
        this.exhaustParticles.push({
            x: this.x - Math.cos(angle) * 10,
            y: this.y - Math.sin(angle) * 10,
            vx: -Math.cos(angle) * 1 + (Math.random() - 0.5) * 0.5,
            vy: -Math.sin(angle) * 1 + (Math.random() - 0.5) * 0.5,
            life: 1,
            size: 3 + Math.random() * 2
        });

        // Update exhaust particles
        this.exhaustParticles = this.exhaustParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            p.size *= 0.95;
            return p.life > 0;
        });

        // Check if missile has expired
        if (Date.now() - this.spawnTime > this.maxLifetime) {
            return true; // Remove missile
        }

        // Find closest enemy if no target or target is dead
        if (!this.target || !gameState.enemies.includes(this.target)) {
            let closestDist = Infinity;
            this.target = null;

            gameState.enemies.forEach(enemy => {
                const dist = Math.sqrt(
                    Math.pow(enemy.x - this.x, 2) +
                    Math.pow(enemy.y - this.y, 2)
                );
                if (dist < closestDist) {
                    closestDist = dist;
                    this.target = enemy;
                }
            });
        }

        // Home towards target
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // Desired direction
                const desiredVx = (dx / distance) * this.speed;
                const desiredVy = (dy / distance) * this.speed;

                // Gradually turn towards target
                this.vx += (desiredVx - this.vx) * this.turnSpeed;
                this.vy += (desiredVy - this.vy) * this.turnSpeed;

                // Maintain constant speed
                const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                this.vx = (this.vx / currentSpeed) * this.speed;
                this.vy = (this.vy / currentSpeed) * this.speed;
            }
        }

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Check collision with enemies - using missile tip position
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];

            // Calculate missile tip position (20 pixels ahead in direction of travel)
            const angle = Math.atan2(this.vy, this.vx);
            const tipX = this.x + Math.cos(angle) * 20;
            const tipY = this.y + Math.sin(angle) * 20;

            const dist = Math.sqrt(
                Math.pow(tipX - enemy.x, 2) +
                Math.pow(tipY - enemy.y, 2)
            );

            if (dist < enemy.size) {
                // Hit!
                createParticles(enemy.x, enemy.y, '#ff1493');
                const isDead = enemy.takeDamage(this.damage);

                // Play explosion sound for missiles
                SoundSystem.playHit(isDead ? 'critical' : 'explosion');

                if (isDead) {
                    handleEnemyDeath(enemy);
                    gameState.enemies.splice(i, 1);
                }
                return true; // Remove missile
            }
        }

        return false; // Keep missile
    }

    draw() {
        const screen = toScreen(this.x, this.y);
        const angle = Math.atan2(this.vy, this.vx);

        // Draw exhaust particles first (behind missile)
        ctx.save();
        this.exhaustParticles.forEach(p => {
            const pScreen = toScreen(p.x, p.y);
            ctx.globalAlpha = p.life * 0.7;

            // Purple to blue gradient for exhaust
            const gradient = ctx.createRadialGradient(pScreen.x, pScreen.y, 0, pScreen.x, pScreen.y, p.size);
            gradient.addColorStop(0, '#c4b5fd');
            gradient.addColorStop(0.4, '#8b5cf6');
            gradient.addColorStop(0.7, '#6d28d9');
            gradient.addColorStop(1, '#4c1d95');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(pScreen.x, pScreen.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Draw trail
        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
            const trailPos = this.trail[i];
            const trailScreen = toScreen(trailPos.x, trailPos.y);
            const alpha = (i + 1) / this.trail.length;

            ctx.globalAlpha = alpha * 0.5;
            ctx.fillStyle = '#8b5cf6';
            ctx.shadowBlur = 8 * alpha;
            ctx.shadowColor = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(trailScreen.x, trailScreen.y, 4 * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Draw missile body
        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(angle);

        // Rocket dimensions
        const bodyLength = 22;
        const bodyWidth = 5;
        const noseLength = 8;

        // Main body cylinder (purple metallic)
        const bodyGradient = ctx.createLinearGradient(0, -bodyWidth, 0, bodyWidth);
        bodyGradient.addColorStop(0, '#5a3f7f');
        bodyGradient.addColorStop(0.2, '#8b5cf6');
        bodyGradient.addColorStop(0.5, '#a78bfa');
        bodyGradient.addColorStop(0.8, '#8b5cf6');
        bodyGradient.addColorStop(1, '#5a3f7f');

        ctx.fillStyle = bodyGradient;
        ctx.fillRect(-bodyLength/2, -bodyWidth, bodyLength, bodyWidth * 2);

        // Nose cone (pointed front)
        const noseGradient = ctx.createLinearGradient(0, -bodyWidth, 0, bodyWidth);
        noseGradient.addColorStop(0, '#6d28d9');
        noseGradient.addColorStop(0.5, '#8b5cf6');
        noseGradient.addColorStop(1, '#6d28d9');

        ctx.fillStyle = noseGradient;
        ctx.beginPath();
        ctx.moveTo(bodyLength/2 + noseLength, 0);
        ctx.lineTo(bodyLength/2, -bodyWidth);
        ctx.lineTo(bodyLength/2, bodyWidth);
        ctx.closePath();
        ctx.fill();

        // Highlight on nose (shiny effect)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(bodyLength/2 + noseLength, 0);
        ctx.lineTo(bodyLength/2, -bodyWidth);
        ctx.lineTo(bodyLength/2 + noseLength/2, -bodyWidth/2);
        ctx.closePath();
        ctx.fill();

        // Body stripes (detail)
        ctx.strokeStyle = '#6d28d9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-bodyLength/4, -bodyWidth);
        ctx.lineTo(-bodyLength/4, bodyWidth);
        ctx.stroke();

        // Fins (4 fins for stability)
        const finLength = 10;
        const finWidth = 6;

        // Top fin
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.moveTo(-bodyLength/2, -bodyWidth);
        ctx.lineTo(-bodyLength/2 - finLength, -bodyWidth - finWidth);
        ctx.lineTo(-bodyLength/2 + 3, -bodyWidth);
        ctx.closePath();
        ctx.fill();

        // Bottom fin
        ctx.beginPath();
        ctx.moveTo(-bodyLength/2, bodyWidth);
        ctx.lineTo(-bodyLength/2 - finLength, bodyWidth + finWidth);
        ctx.lineTo(-bodyLength/2 + 3, bodyWidth);
        ctx.closePath();
        ctx.fill();

        // Side fins (smaller)
        ctx.fillStyle = '#6d28d9';
        ctx.beginPath();
        ctx.moveTo(-bodyLength/2 + 2, -bodyWidth/2);
        ctx.lineTo(-bodyLength/2 - 6, -bodyWidth - 3);
        ctx.lineTo(-bodyLength/2 + 5, -bodyWidth/2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-bodyLength/2 + 2, bodyWidth/2);
        ctx.lineTo(-bodyLength/2 - 6, bodyWidth + 3);
        ctx.lineTo(-bodyLength/2 + 5, bodyWidth/2);
        ctx.closePath();
        ctx.fill();

        // Exhaust nozzle
        ctx.fillStyle = '#1f1430';
        ctx.fillRect(-bodyLength/2 - 2, -bodyWidth + 1, 2, (bodyWidth * 2) - 2);

        // Window/detail circle
        ctx.fillStyle = '#c4b5fd';
        ctx.beginPath();
        ctx.arc(bodyLength/4, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#8b5cf6';
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-bodyLength/2, -bodyWidth, bodyLength, bodyWidth * 2);

        ctx.restore();
        ctx.shadowBlur = 0;
    }
}
