// Camera system
const camera = {
    x: 0,
    y: 0,
    smoothing: 0.15 // How smooth camera follows (higher = faster, less lag)
};

// Helper function to convert world coordinates to screen coordinates
function toScreen(worldX, worldY) {
    return {
        x: worldX - camera.x,
        y: worldY - camera.y
    };
}
