// Draw background/map
function drawBackground() {
    // If background texture is loaded, use it; otherwise fall back to grid
    if (backgroundTexture.complete && backgroundTexture.naturalWidth > 0) {
        const tileSize = backgroundTexture.width; // Use actual image size

        // Calculate visible tiles
        const startX = Math.floor(camera.x / tileSize) * tileSize;
        const startY = Math.floor(camera.y / tileSize) * tileSize;
        const endX = camera.x + canvas.width + tileSize;
        const endY = camera.y + canvas.height + tileSize;

        // Enable pixelated rendering for crisp pixel art
        ctx.imageSmoothingEnabled = false;

        // Draw tiled background texture
        for (let x = startX; x < endX; x += tileSize) {
            for (let y = startY; y < endY; y += tileSize) {
                const screenX = x - camera.x;
                const screenY = y - camera.y;
                ctx.drawImage(backgroundTexture, screenX, screenY, tileSize, tileSize);
            }
        }
    } else {
        // Fallback: Original grid pattern
        const tileSize = 64;
        const startX = Math.floor(camera.x / tileSize) * tileSize;
        const startY = Math.floor(camera.y / tileSize) * tileSize;
        const endX = camera.x + canvas.width + tileSize;
        const endY = camera.y + canvas.height + tileSize;

        for (let x = startX; x < endX; x += tileSize) {
            for (let y = startY; y < endY; y += tileSize) {
                const screenX = x - camera.x;
                const screenY = y - camera.y;
                const isDark = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2;
                ctx.fillStyle = isDark ? '#1a2332' : '#2a3142';
                ctx.fillRect(screenX, screenY, tileSize, tileSize);
                ctx.strokeStyle = 'rgba(100, 100, 150, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(screenX, screenY, tileSize, tileSize);
            }
        }
    }

    // Draw world boundaries
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.strokeRect(-camera.x, -camera.y, CONFIG.world.width, CONFIG.world.height);
}

// Update camera to follow player smoothly
function updateCamera() {
    // Calculate target position
    let targetX = gameState.player.x - canvas.width / 2;
    let targetY = gameState.player.y - canvas.height / 2;

    // Clamp target within world bounds BEFORE smoothing to avoid jitter
    targetX = Math.max(0, Math.min(targetX, CONFIG.world.width - canvas.width));
    targetY = Math.max(0, Math.min(targetY, CONFIG.world.height - canvas.height));

    // Smooth camera movement towards clamped target
    camera.x += (targetX - camera.x) * camera.smoothing;
    camera.y += (targetY - camera.y) * camera.smoothing;

    // Final clamp to ensure we stay in bounds (shouldn't be needed, but safety)
    camera.x = Math.max(0, Math.min(camera.x, CONFIG.world.width - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, CONFIG.world.height - canvas.height));
}
