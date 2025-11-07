class ChainLightning {
    constructor(startX, startY, weapon) {
        this.startX = startX;
        this.startY = startY;
        this.weapon = weapon;
        this.damage = weapon.damage;
        this.maxJumps = 5;
        this.jumpRange = 200;
        this.hitEnemies = new Set();
        this.chains = [];
        this.lifetime = 500; // 0.5 seconds
        this.spawnTime = Date.now();

        // Find initial target
        this.findChain(startX, startY);
    }

    findChain(fromX, fromY) {
        let closestEnemy = null;
        let closestDist = this.jumpRange;

        // Find closest enemy not yet hit
        gameState.enemies.forEach(enemy => {
            if (this.hitEnemies.has(enemy)) return;

            const dist = Math.sqrt(
                Math.pow(enemy.x - fromX, 2) +
                Math.pow(enemy.y - fromY, 2)
            );

            if (dist < closestDist) {
                closestDist = dist;
                closestEnemy = enemy;
            }
        });

        if (closestEnemy && this.chains.length < this.maxJumps) {
            this.chains.push({
                from: {x: fromX, y: fromY},
                to: {x: closestEnemy.x, y: closestEnemy.y},
                target: closestEnemy
            });
            this.hitEnemies.add(closestEnemy);

            // Damage enemy
            createParticles(closestEnemy.x, closestEnemy.y, '#00ffff');
            if (closestEnemy.takeDamage(this.damage)) {
                const index = gameState.enemies.indexOf(closestEnemy);
                if (index > -1) {
                    handleEnemyDeath(closestEnemy);
                    gameState.enemies.splice(index, 1);
                }
            }

            // Chain to next enemy
            this.findChain(closestEnemy.x, closestEnemy.y);
        }
    }

    update() {
        return Date.now() - this.spawnTime > this.lifetime;
    }

    draw() {
        const age = Date.now() - this.spawnTime;
        const alpha = 1 - (age / this.lifetime);

        this.chains.forEach(chain => {
            const from = toScreen(chain.from.x, chain.from.y);
            const to = toScreen(chain.to.x, chain.to.y);

            // Draw lightning bolt with jagged segments
            ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffff';

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);

            // Create jagged lightning effect
            const segments = 5;
            for (let i = 1; i < segments; i++) {
                const t = i / segments;
                const x = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * 20;
                const y = from.y + (to.y - from.y) * t + (Math.random() - 0.5) * 20;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            // Bright core
            ctx.strokeStyle = `rgba(200, 255, 255, ${alpha * 0.8})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.shadowBlur = 0;
        });
    }
}
