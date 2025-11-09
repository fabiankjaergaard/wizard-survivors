// Music tracks - moved outside component to prevent re-renders
const MUSIC_TRACKS = [
    {
        id: 'pixel_dreams',
        name: 'Pixel Dreams',
        artist: 'Fabian Kjaergaard',
        path: 'music/Pixel Dreams.wav'
    },
    {
        id: 'pixel_dreams_1',
        name: 'Pixel Dreams (1)',
        artist: 'Fabian Kjaergaard',
        path: 'music/Pixel Dreams (1).wav'
    }
];

// Weapon icon mapping - returns image path or text
const getWeaponIcon = (weaponType) => {
    const icons = {
        'magic_missile': { type: 'image', src: 'assets/MagicMisileGame.png' },
        'lightning': { type: 'image', src: 'assets/TornadoProjectileGame.png' },
        'fireball': { type: 'image', src: 'assets/FireBallProjectileGame.png' },
        'ice': { type: 'image', src: 'assets/IceSpikeGame.png' },
        'arcane': { type: 'image', src: 'assets/OrbProjectileGame.png' },
        'homing_missile': { type: 'image', src: 'assets/HomingMissileGame.png' },
        'chain_lightning': { type: 'image', src: 'assets/TornadoProjectileGame.png' },
        'ghost_wolf': { type: 'image', src: 'assets/GhostWolfProjectileNonPixelGame.png' },
        'black_hole': { type: 'text', value: 'BHO' },
        'poison_cloud': { type: 'text', value: 'PSN' },
        'crystal_shard': { type: 'text', value: 'CRY' },
        'frost_nova': { type: 'image', src: 'assets/IceSpikeGame.png' },
        'thunder_hammer': { type: 'image', src: 'assets/TornadoProjectileGame.png' },
        'shadow_clone': { type: 'text', value: 'SHD' }
    };
    return icons[weaponType] || { type: 'text', value: 'WPN' };
};

// Ultimate icon mapping - returns image path or text
const getUltimateIcon = (ultimateType) => {
    const icons = {
        'meteor_storm': { type: 'image', src: 'assets/MeteorsStormUltimateGame.png' },
        'time_freeze': { type: 'text', value: 'TMP' },
        'black_hole': { type: 'text', value: 'BHO' },
        'titan_form': { type: 'text', value: 'TTN' },
        'void_rift': { type: 'text', value: 'VRF' },
        'cosmic_storm': { type: 'text', value: 'CSM' }
    };
    return icons[ultimateType] || { type: 'text', value: 'ULT' };
};

// Get icon for upgrade based on upgrade type and weaponType
const getUpgradeIcon = (upgrade) => {
    // Check if it's a new weapon upgrade
    if (upgrade.weaponType) {
        return getWeaponIcon(upgrade.weaponType);
    }
    // For stat upgrades, return null (no icon)
    return null;
};

// Constants are now available globally (no export needed for browser)
