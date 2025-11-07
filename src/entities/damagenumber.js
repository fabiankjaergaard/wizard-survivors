class DamageNumber {
    constructor(x, y, damage, isCrit = false) {
        this.x = x;
        this.y = y;
        this.damage = Math.floor(damage);
        this.isCrit = isCrit;
        this.life = 1;
        this.vy = -2; // Float upward
        this.vx = (Math.random() - 0.5) * 1; // Slight horizontal drift
        this.scale = 1;
        this.rotation = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // Slight gravity
        this.life -= 0.015;

        return this.life <= 0; // Return true when should be removed
    }

    draw() {
        const screen = toScreen(this.x, this.y);

        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(screen.x, screen.y);

        // Shadow/outline for readability
        ctx.font = this.isCrit ? 'bold 22px "Courier New"' : 'bold 16px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = this.isCrit ? 4 : 3;
        ctx.strokeText(this.damage, 0, 0);

        // Fill
        if (this.isCrit) {
            // Critical - red
            ctx.fillStyle = '#ff4444';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff0000';
        } else {
            // Normal - white
            ctx.fillStyle = '#ffffff';
        }

        ctx.fillText(this.damage, 0, 0);

        ctx.restore();
    }
}