// Sprite Loading and Configuration

// Load New Wizard Spritesheet
const wizardLPCSprite = new Image();
wizardLPCSprite.src = 'assets/Download62188.png';

// Load Enemy Sprite
const enemySprite = new Image();
enemySprite.src = 'assets/Download67833.png';

// Load Magic Missile Sprite
const magicMissileSprite = new Image();
magicMissileSprite.src = 'assets/MagicMisileGame.png';

// Load Background Texture
const backgroundTexture = new Image();
backgroundTexture.src = 'assets/Background3TestGame.png';

// Load Reward Chest Sprite
const rewardChestSprite = new Image();
rewardChestSprite.src = 'assets/RewardChestGame.png';

// Load Homing Missile Sprite
const homingMissileSprite = new Image();
homingMissileSprite.src = 'assets/HomingMissileGame.png';

// Load Ghost Wolf Sprite
const ghostWolfSprite = new Image();
ghostWolfSprite.src = 'assets/GhostWolfProjectileNonPixelGame.png';

// Expose sprites to window for global access
window.homingMissileSprite = homingMissileSprite;
window.ghostWolfSprite = ghostWolfSprite;

// LPC Spritesheet has all animations in one image
const wizardSprites = {
    lpc: wizardLPCSprite
};

// LPC Wizard sprite config: Each frame is 64x64 pixels
// LPC format: rows are animations for different directions
// Row 9-12 = Walk (up, left, down, right) - 9 frames each
// Row 1-4 = Spellcast (up, left, down, right) - 7 frames each
const wizardConfig = {
    frameWidth: 64,
    frameHeight: 64,
    animations: {
        walk: { frames: 9, speed: 6 },
        idle: { frames: 1, speed: 10 },  // Use first frame of walk as idle
        spellcast: { frames: 7, speed: 5 }
    },
    // LPC row indices for each direction
    rows: {
        up: {
            walk: 8,      // Row 9 (0-indexed = 8)
            spellcast: 0  // Row 1 (0-indexed = 0)
        },
        left: {
            walk: 9,      // Row 10 (0-indexed = 9)
            spellcast: 1  // Row 2 (0-indexed = 1)
        },
        down: {
            walk: 10,     // Row 11 (0-indexed = 10)
            spellcast: 2  // Row 3 (0-indexed = 2)
        },
        right: {
            walk: 11,     // Row 12 (0-indexed = 11)
            spellcast: 3  // Row 4 (0-indexed = 3)
        }
    }
};

// Enemy sprite config (looking at the sprite, appears to be ~64x64 frames)
const enemyConfig = {
    frameWidth: 64,
    frameHeight: 64,
    animations: {
        walk: { frames: 9, speed: 8 }
    },
    rows: {
        up: 8,
        left: 9,
        down: 10,
        right: 11
    }
};

// Export for use in other files
// All sprites are now available globally (no export needed for browser)
