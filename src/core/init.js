// Global canvas and context variables
let canvas, ctx;

// Initialize
const player = new Player();

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found! Retrying...');
        setTimeout(initGame, 100);
        return;
    }

    ctx = canvas.getContext('2d');
    canvas.width = CONFIG.canvas.width;
    canvas.height = CONFIG.canvas.height;

    // Reset game loop timing to prevent jitter on restart
    lastTime = 0;
    frameCount = 0;

    // Reset game state
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.level = 1;
    gameState.player.xp = 0;
    gameState.player.xpToLevel = 20;
    gameState.player.isDashing = false;
    gameState.player.dashCooldown = 0;
    gameState.player.dashDuration = 0;
    gameState.enemies = [];
    gameState.projectiles = [];
    gameState.particles = [];
    gameState.xpOrbs = [];
    gameState.chests = [];
    gameState.homingMissiles = [];
    gameState.tornadoes = [];
    gameState.spinningBlades = [];
    gameState.meteors = [];
    gameState.chainLightnings = [];
    gameState.spiritWolves = [];
    gameState.blackHoles = [];
    gameState.poisonClouds = [];
    gameState.crystalShards = [];
    gameState.frostNovas = [];
    gameState.thunderHammers = [];
    gameState.shadowClones = [];
    gameState.enemyProjectiles = [];
    gameState.kills = 0;
    gameState.gameTime = 0;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.lastSpawn = 0;
    gameState.lastAttack = 0;

    // Initialize Player Position (center of world)
    gameState.player.x = CONFIG.world.width / 2;
    gameState.player.y = CONFIG.world.height / 2;

    // Initialize camera - center on player immediately to avoid jitter
    camera.x = gameState.player.x - canvas.width / 2;
    camera.y = gameState.player.y - canvas.height / 2;

    // Clamp camera within world bounds from the start
    camera.x = Math.max(0, Math.min(camera.x, CONFIG.world.width - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, CONFIG.world.height - canvas.height));

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        CONFIG.canvas.width = window.innerWidth;
        CONFIG.canvas.height = window.innerHeight;
    });

    console.log('🎮 Game initialized! Canvas ready.');
    console.log('Player position:', gameState.player.x, gameState.player.y);
    console.log('Camera position:', camera.x, camera.y);
    console.log('Player weapons:', gameState.player.weapons);

    // Start game loop if not already running
    if (!window.gameLoopRunning) {
        console.log('🚀 Starting game loop...');
        window.gameLoopRunning = true;
        requestAnimationFrame(gameLoop);
    }
}

// Expose initGame to window for UI to call
window.initGame = initGame;
