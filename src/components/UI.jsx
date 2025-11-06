const { useState, useEffect } = React;

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

// ============================================
// STANDARD BACK BUTTON COMPONENT
// ============================================
// IMPORTANT: This is the ONLY back button design allowed!
// ALL pages MUST use this exact component.
// DO NOT create custom back buttons or modify this styling.
// Size: 300px × 145px
// Background: KNAPP1.png
// Font: Press Start 2P, 24px, color #2a1810
// ============================================
function BackButton({ onClick }) {
    return (
        <button onClick={onClick} style={{
            width: '300px !important',
            height: '145px !important',
            minWidth: '300px !important',
            minHeight: '145px !important',
            maxWidth: '300px !important',
            maxHeight: '145px !important',
            backgroundImage: 'url(assets/KNAPP1.png)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            border: 'none',
            cursor: 'url(assets/wand-cursor-small.png) 8 8, auto',
            imageRendering: 'pixelated',
            transition: 'transform 0.15s ease, filter 0.15s ease',
            backgroundColor: 'transparent',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '24px',
            color: '#2a1810',
            fontWeight: 'bold',
            textShadow: '2px 2px 0 rgba(255,255,255,0.3)',
            filter: 'brightness(1)',
            marginTop: '20px',
            marginBottom: '-60px',
            padding: '0',
            boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.filter = 'brightness(1.15)';
        }}
        onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.filter = 'brightness(1)';
        }}
        onMouseDown={(e) => {
            e.target.style.transform = 'scale(0.95)';
            e.target.style.filter = 'brightness(0.9)';
        }}
        onMouseUp={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.filter = 'brightness(1.15)';
        }}
        >
            BACK
        </button>
    );
}

// Weapon icon mapping - returns image path or text
const getWeaponIcon = (weaponType) => {
    const icons = {
        'magic_missile': { type: 'image', src: 'assets/MagicMisileGame.png' },
        'lightning': { type: 'image', src: 'assets/TornadoProjectileGame.png' },
        'fireball': { type: 'image', src: 'assets/FireBallProjectileGame.png' },
        'ice': { type: 'image', src: 'assets/IceSpikeGame.png' },
        'arcane': { type: 'image', src: 'assets/OrbProjectileGame.png' },
        'homing_missile': { type: 'text', value: 'HMS' },
        'chain_lightning': { type: 'image', src: 'assets/TornadoProjectileGame.png' },
        'spirit_wolf': { type: 'image', src: 'assets/GhostWolfGame.png' },
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

function GameUI() {
    const [gameStarted, setGameStarted] = useState(false);
    const [currentMenuView, setCurrentMenuView] = useState('main'); // main, shop, skills, achievements, character

    const [gameStats, setGameStats] = useState({
        hp: 100,
        maxHp: 100,
        level: 1,
        xp: 0,
        xpToLevel: 10,
        kills: 0,
        time: '0:00'
    });

    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showGameOver, setShowGameOver] = useState(false);
    const [showPaused, setShowPaused] = useState(false);
    const [showChestPopup, setShowChestPopup] = useState(false);
    const [chestData, setChestData] = useState(null);
    const [showMysteryBoxSpinner, setShowMysteryBoxSpinner] = useState(false);
    const [upgrades, setUpgrades] = useState([]);
    const [showDebugMenu, setShowDebugMenu] = useState(false);
    const [coins, setCoins] = useState(0);
    const [showMusicControl, setShowMusicControl] = useState(false);

    // Player progression data (persists between games)
    const [playerData, setPlayerData] = useState({
        coins: 1000,
        totalKills: 0,
        gamesPlayed: 0,
        selectedCharacter: 'wizard',
        unlockedCharacters: ['wizard'],
        skillPoints: 5,
        skills: {
            maxHp: 0,
            damage: 0,
            speed: 0,
            xpGain: 0,
            luck: 0
        },
        achievements: [],
        shopItems: [],
        selectedTrack: null, // Currently selected track
        musicVolume: 0.5, // Volume (0-1)
        // Equipped gear
        equippedGear: {
            helmet: { name: 'Rare Helmet', slot: 'helmet', icon: 'H', rarity: 'rare', stats: { maxHp: 20 } },
            chest: { name: 'Legendary Chest', slot: 'chest', icon: 'C', rarity: 'legendary', stats: { maxHp: 60, damage: 8 } },
            staff: { name: 'Common Staff', slot: 'staff', icon: 'S', rarity: 'common', stats: { damage: 10 } },
            ring: { name: 'Legendary Ring', slot: 'ring', icon: 'R', rarity: 'legendary', stats: { damage: 20, luck: 20 } },
            belt: { name: 'Rare Belt', slot: 'belt', icon: 'B', rarity: 'rare', stats: { maxHp: 16, speed: 0.4 } },
            boots: { name: 'Common Boots', slot: 'boots', icon: 'Bo', rarity: 'common', stats: { speed: 0.5 } },
            gloves: { name: 'Rare Gloves', slot: 'gloves', icon: 'G', rarity: 'rare', stats: { damage: 6, speed: 0.6 } },
            amulet: { name: 'Legendary Amulet', slot: 'amulet', icon: 'A', rarity: 'legendary', stats: { maxHp: 48, luck: 32 } }
        },
        // Inventory of collected gear
        inventory: [
            { name: 'Common Helmet', slot: 'helmet', icon: 'H', rarity: 'common', stats: { maxHp: 10 } },
            { name: 'Rare Staff', slot: 'staff', icon: 'S', rarity: 'rare', stats: { damage: 20 } },
            { name: 'Legendary Boots', slot: 'boots', icon: 'Bo', rarity: 'legendary', stats: { speed: 2.0 } },
            { name: 'Common Ring', slot: 'ring', icon: 'R', rarity: 'common', stats: { damage: 5, luck: 5 } },
            { name: 'Rare Chest', slot: 'chest', icon: 'C', rarity: 'rare', stats: { maxHp: 30, damage: 4 } },
            { name: 'Common Belt', slot: 'belt', icon: 'B', rarity: 'common', stats: { maxHp: 8, speed: 0.2 } },
            { name: 'Legendary Gloves', slot: 'gloves', icon: 'G', rarity: 'legendary', stats: { damage: 12, speed: 1.2 } },
            { name: 'Rare Amulet', slot: 'amulet', icon: 'A', rarity: 'rare', stats: { maxHp: 24, luck: 16 } }
        ]
    });

    // Update game stats from game state
    useEffect(() => {
        const interval = setInterval(() => {
            if (window.gameState) {
                const minutes = Math.floor(window.gameState.gameTime / 60000);
                const seconds = Math.floor((window.gameState.gameTime % 60000) / 1000);

                setGameStats({
                    hp: Math.floor(window.gameState.player.hp),
                    maxHp: window.gameState.player.maxHp,
                    level: window.gameState.player.level,
                    xp: window.gameState.player.xp,
                    xpToLevel: window.gameState.player.xpToLevel,
                    kills: window.gameState.kills,
                    time: `${minutes}:${seconds.toString().padStart(2, '0')}`
                });

                setShowGameOver(window.gameState.isGameOver);
                setShowLevelUp(window.gameState.showLevelUp);
                setShowPaused(window.gameState.isPaused);
                setCoins(window.gameState.coins || 0);

                if (window.gameState.currentUpgrades) {
                    setUpgrades(window.gameState.currentUpgrades);
                }

                if (window.gameState.openingChest) {
                    // Check if chest has ultimate or generate gear
                    if (window.gameState.openingChest.ultimate) {
                        // Chest contains an ultimate!
                        setChestData({
                            ...window.gameState.openingChest
                        });
                    } else {
                        // Generate gear for the chest
                        const gear = generateRandomGear();
                        setChestData({
                            ...window.gameState.openingChest,
                            gear: gear
                        });
                    }
                    setShowChestPopup(true);
                    window.gameState.openingChest = null; // Clear it after showing
                }

                // Check for mystery box opening
                if (window.gameState.openingMysteryBox) {
                    setShowMysteryBoxSpinner(true);
                    window.gameState.openingMysteryBox = null;
                }
            }
        }, 50); // Update more frequently for smoother progressbar animation

        return () => clearInterval(interval);
    }, []);

    // HP bar color based on health percentage
    const getHPColor = () => {
        const percentage = (gameStats.hp / gameStats.maxHp) * 100;
        if (percentage > 60) return '#4ade80';
        if (percentage > 30) return '#facc15';
        return '#ef4444';
    };

    // Debug functions to add weapons
    const addWeapon = (weaponType) => {
        if (window.gameState && window.gameState.player) {
            const weaponConfigs = {
                magic_missile: { type: 'magic_missile', name: 'Magic Missile', damage: 10, cooldown: 500, range: 500, level: 1 },
                lightning: { type: 'lightning', name: 'Lightning Bolt', damage: 15, cooldown: 1000, range: 500, level: 1 },
                fireball: { type: 'fireball', name: 'Fireball', damage: 25, cooldown: 1500, range: 500, explosionRadius: 50, level: 1 },
                ice: { type: 'ice', name: 'Ice Spike', damage: 12, cooldown: 800, range: 500, level: 1 },
                arcane: { type: 'arcane', name: 'Arcane Orbs', damage: 8, cooldown: 100, level: 1 },
                homing_missile: { type: 'homing_missile', name: 'Homing Missiles', damage: 15, cooldown: 800, level: 1 },
                tornado: { type: 'tornado', name: 'Tornado', damage: 20, cooldown: 2000, level: 1 },
                spinning_blade: { type: 'spinning_blade', name: 'Spinning Blade', damage: 18, cooldown: 1200, level: 1 },
                meteor: { type: 'meteor', name: 'Meteor Strike', damage: 35, cooldown: 2500, level: 1 },
                sword_spin: { type: 'sword_spin', name: 'Sword Spin', damage: 12, cooldown: 3000, level: 1 },
                chain_lightning: { type: 'chain_lightning', name: 'Chain Lightning', damage: 20, range: 200, cooldown: 2000, level: 1 },
                spirit_wolf: { type: 'spirit_wolf', name: 'Spirit Wolf', damage: 18, range: 0, cooldown: 5000, level: 1 },
                black_hole: { type: 'black_hole', name: 'Black Hole', damage: 100, range: 250, cooldown: 8000, level: 1 },
                poison_cloud: { type: 'poison_cloud', name: 'Poison Cloud', damage: 30, range: 250, cooldown: 3000, level: 1 },
                crystal_shard: { type: 'crystal_shard', name: 'Crystal Shard', damage: 20, range: 300, cooldown: 1500, level: 1 },
                frost_nova: { type: 'frost_nova', name: 'Frost Nova', damage: 40, range: 200, cooldown: 4000, level: 1 },
                thunder_hammer: { type: 'thunder_hammer', name: 'Thunder Hammer', damage: 50, range: 120, cooldown: 3500, level: 1 },
                shadow_clone: { type: 'shadow_clone', name: 'Shadow Clone', damage: 15, range: 0, cooldown: 15000, level: 1 }
            };

            const weaponConfig = weaponConfigs[weaponType];
            if (weaponConfig) {
                // Check if weapon already exists
                const hasWeapon = window.gameState.player.weapons.some(w => w.type === weaponType);
                if (!hasWeapon) {
                    // Create a NEW copy of the weapon config
                    const newWeapon = { ...weaponConfig };
                    // Set lastFired so weapon starts ready (use game's currentTime)
                    const currentTime = window.gameState.currentTime || 0;
                    newWeapon.lastFired = currentTime - (newWeapon.cooldown * 2);
                    window.gameState.player.weapons.push(newWeapon);
                    console.log(`✅ Added weapon: ${weaponType}`);

                    // Special handling for Arcane Orbs - create the orbs immediately
                    if (weaponType === 'arcane') {
                        const numOrbs = 3;
                        // Clear existing orbs first
                        window.gameState.orbitingOrbs = window.gameState.orbitingOrbs || [];

                        // Add new orbs
                        for (let i = 0; i < numOrbs; i++) {
                            window.gameState.orbitingOrbs.push(
                                new window.OrbitingOrb(i, numOrbs, newWeapon)
                            );
                        }
                        console.log(`✨ Created ${numOrbs} Arcane Orbs!`);
                    }

                    // Special handling for Sword Spin - create the spin attack
                    if (weaponType === 'sword_spin') {
                        window.gameState.swordSpinAttack = new window.SwordSpinAttack(newWeapon);
                        console.log(`⚔️ Created Sword Spin Attack!`);
                    }
                } else {
                    console.log(`⬆️ Already have ${weaponType}, upgrading damage!`);
                    const weapon = window.gameState.player.weapons.find(w => w.type === weaponType);
                    weapon.damage += 5;

                    // If upgrading arcane, add more orbs!
                    if (weaponType === 'arcane') {
                        window.gameState.orbitingOrbs = window.gameState.orbitingOrbs || [];
                        const currentOrbs = window.gameState.orbitingOrbs.length;
                        const newOrbCount = currentOrbs + 1;

                        // Recreate all orbs with new spacing
                        window.gameState.orbitingOrbs = [];
                        for (let i = 0; i < newOrbCount; i++) {
                            window.gameState.orbitingOrbs.push(
                                new window.OrbitingOrb(i, newOrbCount, weapon)
                            );
                        }
                        console.log(`✨ Now have ${newOrbCount} Arcane Orbs!`);
                    }

                    // If upgrading sword spin, increase radius and duration!
                    if (weaponType === 'sword_spin') {
                        if (window.gameState.swordSpinAttack) {
                            window.gameState.swordSpinAttack.spinRadius += 15;
                            window.gameState.swordSpinAttack.spinDuration += 200;
                            console.log(`⚔️ Sword Spin upgraded! Radius: ${window.gameState.swordSpinAttack.spinRadius}, Duration: ${window.gameState.swordSpinAttack.spinDuration}ms`);
                        }
                    }
                }
            }
        }
    };

    // Generate random gear item
    const generateRandomGear = () => {
        const slots = ['helmet', 'chest', 'staff', 'ring', 'belt', 'boots', 'gloves', 'amulet'];
        const rarities = [
            { name: 'common', chance: 0.6, multiplier: 1 },
            { name: 'rare', chance: 0.3, multiplier: 2 },
            { name: 'legendary', chance: 0.1, multiplier: 4 }
        ];

        const gearData = {
            helmet: { icon: 'H', baseStats: { maxHp: 10 } },
            chest: { icon: 'C', baseStats: { maxHp: 15, damage: 2 } },
            staff: { icon: 'S', baseStats: { damage: 10 } },
            ring: { icon: 'R', baseStats: { damage: 5, luck: 5 } },
            belt: { icon: 'B', baseStats: { maxHp: 8, speed: 0.2 } },
            boots: { icon: 'Bo', baseStats: { speed: 0.5 } },
            gloves: { icon: 'G', baseStats: { damage: 3, speed: 0.3 } },
            amulet: { icon: 'A', baseStats: { maxHp: 12, luck: 8 } }
        };

        // Random roll for rarity
        const roll = Math.random();
        let rarity = rarities[0];
        let cumulativeChance = 0;
        for (const r of rarities) {
            cumulativeChance += r.chance;
            if (roll < cumulativeChance) {
                rarity = r;
                break;
            }
        }

        // Random slot
        const slot = slots[Math.floor(Math.random() * slots.length)];
        const data = gearData[slot];

        // Apply rarity multiplier to stats
        const stats = {};
        Object.entries(data.baseStats).forEach(([stat, value]) => {
            stats[stat] = Math.round(value * rarity.multiplier * 100) / 100;
        });

        const rarityNames = { common: 'Common', rare: 'Rare', legendary: 'Legendary' };

        return {
            name: `${rarityNames[rarity.name]} ${slot.charAt(0).toUpperCase() + slot.slice(1)}`,
            slot: slot,
            icon: data.icon,
            rarity: rarity.name,
            stats: stats
        };
    };

    const spawnChest = () => {
        if (window.gameState && window.gameState.player) {
            // Spawn chest near player
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 100; // 100-200 pixels away
            const chestX = window.gameState.player.x + Math.cos(angle) * distance;
            const chestY = window.gameState.player.y + Math.sin(angle) * distance;

            // Make sure Chest class is available
            if (window.Chest) {
                window.gameState.chests.push(new window.Chest(chestX, chestY));
                console.log('💎 Spawned chest at:', chestX, chestY);
            } else {
                console.error('Chest class not found!');
            }
        }
    };

    const startGame = () => {
        setGameStarted(true);
        setCurrentMenuView('main');
        // Initialize/reset game state when starting
        if (window.initGame) {
            window.initGame();
        }

        // Autoplay music - start first track
        if (!window.currentMusicAudio && MUSIC_TRACKS.length > 0) {
            const firstTrack = MUSIC_TRACKS[0];
            const audio = new Audio(firstTrack.path);
            audio.volume = playerData.musicVolume;
            audio.loop = true;
            audio.play().catch(err => {
                console.log('Autoplay blocked - user interaction required:', err);
            });
            window.currentMusicAudio = audio;
            setPlayerData({...playerData, selectedTrack: firstTrack.id});
        }
    };

    const returnToMenu = () => {
        setGameStarted(false);
        setCurrentMenuView('main');
        // Pause the game
        if (window.gameState) {
            window.gameState.isPaused = true;
        }
    };

    // If game hasn't started, show main menu
    if (!gameStarted) {
        return (
            <div className="main-menu-container">
                <div className="main-menu">
                    {currentMenuView === 'main' && (
                        <div className="main-menu-box" style={{
                            position: 'relative',
                            width: 'min(500px, 90vw)',
                            height: '850px',
                            maxHeight: '95vh',
                            backgroundImage: 'url(assets/MainMenuBoxGame.png)',
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            border: 'none',
                            borderRadius: '0',
                            boxShadow: 'none',
                            imageRendering: 'pixelated',
                            fontFamily: '"Press Start 2P", monospace',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            padding: '150px 40px 60px 40px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '5px',
                                paddingRight: '10px'
                            }}>
                            <button onClick={startGame} style={{
                                width: '280px',
                                height: '145px',
                                backgroundImage: 'url(assets/dffgdfgdf.png)',
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                border: 'none',
                                cursor: 'default',
                                imageRendering: 'pixelated',
                                transition: 'transform 0.15s ease, filter 0.15s ease',
                                backgroundColor: 'transparent',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '24px',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                                filter: 'brightness(1)',
                                marginBottom: '-60px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.filter = 'brightness(1.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.filter = 'brightness(1)';
                            }}
                            onMouseDown={(e) => {
                                e.target.style.transform = 'scale(0.95)';
                                e.target.style.filter = 'brightness(0.9)';
                            }}
                            onMouseUp={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.filter = 'brightness(1.15)';
                            }}
                            >
                                PLAY
                            </button>

                            <button onClick={() => setCurrentMenuView('character')} style={{
                                width: '300px',
                                height: '145px',
                                backgroundImage: 'url(assets/KNAPP1.png)',
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                border: 'none',
                                cursor: 'default',
                                imageRendering: 'pixelated',
                                transition: 'transform 0.15s ease, filter 0.15s ease',
                                backgroundColor: 'transparent',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '24px',
                                color: '#2a1810',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 0 rgba(255,255,255,0.3)',
                                filter: 'brightness(1)',
                                marginBottom: '-60px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.filter = 'brightness(1.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.filter = 'brightness(1)';
                            }}
                            onMouseDown={(e) => {
                                e.target.style.transform = 'scale(0.95)';
                                e.target.style.filter = 'brightness(0.9)';
                            }}
                            onMouseUp={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.filter = 'brightness(1.15)';
                            }}
                            >
                                GEAR
                            </button>

                            <button onClick={() => setCurrentMenuView('skills')} style={{
                                width: '300px',
                                height: '145px',
                                backgroundImage: 'url(assets/KNAPP1.png)',
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                border: 'none',
                                cursor: 'default',
                                imageRendering: 'pixelated',
                                transition: 'transform 0.15s ease, filter 0.15s ease',
                                backgroundColor: 'transparent',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '24px',
                                color: '#2a1810',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 0 rgba(255,255,255,0.3)',
                                filter: 'brightness(1)',
                                marginBottom: '-60px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.filter = 'brightness(1.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.filter = 'brightness(1)';
                            }}
                            onMouseDown={(e) => {
                                e.target.style.transform = 'scale(0.95)';
                                e.target.style.filter = 'brightness(0.9)';
                            }}
                            onMouseUp={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.filter = 'brightness(1.15)';
                            }}
                            >
                                SKILL TREE
                            </button>

                            <button onClick={() => setCurrentMenuView('achievements')} style={{
                                width: '300px',
                                height: '145px',
                                backgroundImage: 'url(assets/KNAPP1.png)',
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                border: 'none',
                                cursor: 'default',
                                imageRendering: 'pixelated',
                                transition: 'transform 0.15s ease, filter 0.15s ease',
                                backgroundColor: 'transparent',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: '24px',
                                color: '#2a1810',
                                fontWeight: 'bold',
                                textShadow: '2px 2px 0 rgba(255,255,255,0.3)',
                                filter: 'brightness(1)',
                                marginBottom: '-60px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.filter = 'brightness(1.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.filter = 'brightness(1)';
                            }}
                            onMouseDown={(e) => {
                                e.target.style.transform = 'scale(0.95)';
                                e.target.style.filter = 'brightness(0.9)';
                            }}
                            onMouseUp={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.filter = 'brightness(1.15)';
                            }}
                            >
                                ACHIEVEMENTS
                            </button>
                            </div>
                        </div>
                    )}

                    {/* Music Play Button - Top Right Corner */}
                    <button onClick={() => setCurrentMenuView('music')} style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        width: '80px',
                        height: '80px',
                        backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        border: 'none',
                        backgroundColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'default',
                        imageRendering: 'pixelated',
                        transition: 'transform 0.1s',
                        zIndex: 3000,
                        padding: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span style={{
                            fontSize: '24px',
                            color: 'white',
                            fontFamily: '"Press Start 2P", monospace',
                            textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1
                        }}>
                            ♪
                        </span>
                    </button>

                    {currentMenuView === 'main' && null}

                    {currentMenuView === 'character' && (
                        <CharacterMenu
                            playerData={playerData}
                            setPlayerData={setPlayerData}
                            onBack={() => setCurrentMenuView('main')}
                        />
                    )}

                    {currentMenuView === 'skills' && (
                        <SkillTreeMenu
                            playerData={playerData}
                            setPlayerData={setPlayerData}
                            onBack={() => setCurrentMenuView('main')}
                        />
                    )}

                    {currentMenuView === 'achievements' && (
                        <AchievementsMenu
                            playerData={playerData}
                            onBack={() => setCurrentMenuView('main')}
                        />
                    )}

                    {currentMenuView === 'music' && (
                        <MusicMenu
                            playerData={playerData}
                            setPlayerData={setPlayerData}
                            onBack={() => setCurrentMenuView('main')}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Game is running - show game UI
    return (
        <div className="game-ui-container">
            <div id="game-container">
                <canvas id="gameCanvas"></canvas>

                {/* Compact Pixel Art HUD */}
                <div className="pixel-hud">
                    <div className="pixel-hud-main">
                        {/* Character Portrait */}
                        <div className="char-portrait">
                            <div className="portrait-inner">
                                <img
                                    src="assets/wizard-lpc.png"
                                    className="wizard-face-sprite"
                                    alt="Wizard"
                                />
                            </div>
                        </div>

                        {/* Bars and Stats */}
                        <div className="hud-bars">
                            {/* HP Bar */}
                            <div className="pixel-bar-row">
                                <div className="bar-label">HP</div>
                                <div className="pixel-bar hp-pixel-bar">
                                    <div
                                        className="pixel-bar-fill"
                                        style={{
                                            width: `${(gameStats.hp / gameStats.maxHp) * 100}%`,
                                            backgroundColor: '#ff4444'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* XP Bar */}
                            <div className="pixel-bar-row">
                                <div className="bar-label">XP</div>
                                <div className="pixel-bar xp-pixel-bar">
                                    <div
                                        className="pixel-bar-fill"
                                        style={{
                                            width: `${(gameStats.xp / gameStats.xpToLevel) * 100}%`,
                                            backgroundColor: '#4a9eff'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Coins */}
                            <div className="pixel-stat-row">
                                <span className="coin-icon">💰</span>
                                <span className="coin-value">{coins}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Music Mute/Unmute Button */}
                <button
                    onClick={() => {
                        if (window.currentMusicAudio) {
                            if (window.currentMusicAudio.volume > 0) {
                                window.currentMusicAudio.volume = 0;
                                setPlayerData({...playerData, musicVolume: 0});
                            } else {
                                window.currentMusicAudio.volume = 0.5;
                                setPlayerData({...playerData, musicVolume: 0.5});
                            }
                        }
                    }}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '110px',
                        width: '80px',
                        height: '80px',
                        backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        border: 'none',
                        backgroundColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'default',
                        imageRendering: 'pixelated',
                        transition: 'transform 0.1s',
                        zIndex: 3000,
                        padding: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <span style={{
                        fontSize: '24px',
                        color: 'white',
                        fontFamily: '"Press Start 2P", monospace',
                        textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1
                    }}>
                        {playerData.musicVolume > 0 ? '♪' : '✕'}
                    </span>
                </button>

                {/* Active Weapons Display */}
                <div className="weapons-hud">
                    {window.gameState && window.gameState.player.weapons.map((weapon, index) => {
                        // Magic Missile doesn't need cooldown progressbar (fires too fast)
                        const showProgressbar = weapon.type !== 'magic_missile';

                        // Calculate cooldown progress (0-100%) using game's currentTime
                        const currentTime = window.gameState.currentTime || 0;
                        const rawCooldownPercent = ((currentTime - weapon.lastFired) / weapon.cooldown) * 100;
                        const cooldownPercent = Math.min(rawCooldownPercent, 100);
                        const isReady = cooldownPercent >= 100;

                        const weaponIcon = getWeaponIcon(weapon.type);

                        // Show cooldown remaining (inverted) - full circle when just fired, empties as cooldown finishes
                        const cooldownRemainingPercent = 100 - cooldownPercent;
                        const remainingDegrees = (cooldownRemainingPercent / 100) * 360;

                        return (
                            <div
                                key={index}
                                className="weapon-slot-custom"
                                style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    imageRendering: 'pixelated',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '12px',
                                    border: 'none !important',
                                    outline: 'none !important',
                                    boxShadow: 'none !important'
                                }}
                            >
                                {/* Cooldown Progress Bar - Below slot */}
                                {showProgressbar && !isReady && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        left: '8px',
                                        right: '8px',
                                        height: '6px',
                                        background: '#5a4530',
                                        borderRadius: '2px',
                                        overflow: 'hidden',
                                        border: '1px solid #3a2820',
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{
                                            width: `${100 - cooldownPercent}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #6fb880, #4a9860)',
                                            transition: 'width 0.1s linear',
                                            imageRendering: 'pixelated'
                                        }} />
                                    </div>
                                )}

                                {/* Weapon Icon */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    {weaponIcon.type === 'image' ? (
                                        <img
                                            src={weaponIcon.src}
                                            alt={weapon.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                imageRendering: 'pixelated',
                                                filter: isReady ? 'none' : 'brightness(0.5)'
                                            }}
                                        />
                                    ) : (
                                        <span style={{
                                            fontSize: '20px',
                                            color: '#6fb880',
                                            filter: isReady ? 'none' : 'brightness(0.5)'
                                        }}>{weaponIcon.value}</span>
                                    )}
                                </div>

                                {/* Level Badge - Bottom Right */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    right: '4px',
                                    background: 'rgba(139, 111, 71, 0.9)',
                                    border: '1px solid #8b6f47',
                                    borderRadius: '3px',
                                    padding: '2px 4px',
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '6px',
                                    color: '#f5e6c8',
                                    zIndex: 2
                                }}>
                                    {weapon.level}
                                </div>

                                {/* Projectile Count - Top Right */}
                                {weapon.projectileCount > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: 'rgba(74, 152, 96, 0.9)',
                                        border: '1px solid #4a9860',
                                        borderRadius: '3px',
                                        padding: '2px 4px',
                                        fontFamily: '"Press Start 2P", monospace',
                                        fontSize: '6px',
                                        color: '#f5e6c8',
                                        zIndex: 2
                                    }}>
                                        ×{weapon.projectileCount}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Empty slots */}
                    {window.gameState && [...Array(window.gameState.player.maxWeapons - window.gameState.player.weapons.length)].map((_, index) => (
                        <div key={`empty-${index}`} style={{
                            position: 'relative',
                            width: '80px',
                            height: '80px',
                            backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            imageRendering: 'pixelated',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.5
                        }}>
                            <div style={{
                                fontSize: '24px',
                                color: '#8b6f47',
                                opacity: 0.8
                            }}>?</div>
                        </div>
                    ))}

                    {/* Ultimate Ability Display - Now inline with weapons */}
                    {window.gameState && window.gameState.player.ultimate && (() => {
                        const ultimateIcon = getUltimateIcon(window.gameState.player.ultimate.type);

                        // Calculate cooldown for border color
                        const cooldownPercent = window.gameState.player.ultimateCooldown > 0
                            ? ((window.gameState.player.ultimateCooldown /
                                (window.gameState.player.ultimate.type &&
                                 window.ULTIMATES &&
                                 window.ULTIMATES[window.gameState.player.ultimate.type]
                                    ? window.ULTIMATES[window.gameState.player.ultimate.type].cooldown
                                    : 60000)) * 100)
                            : 0;
                        const isReady = cooldownPercent === 0;

                        // Progress goes from 100% (on cooldown) to 0% (ready)
                        // We want to show progress filling from 0 to 360 degrees
                        const progressDegrees = isReady ? 360 : (360 * (1 - cooldownPercent / 100));

                        // Progress goes from 0 to 360 degrees as cooldown completes
                        const ultimateProgressDegrees = (1 - cooldownPercent / 100) * 360;

                        return (
                            <div
                                className="weapon-slot-custom"
                                style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    imageRendering: 'pixelated',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '12px',
                                    border: 'none',
                                    outline: 'none',
                                    boxShadow: 'none'
                                }}
                            >
                                {/* Ultimate Cooldown Progress Bar - Below slot */}
                                {!isReady && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        left: '8px',
                                        right: '8px',
                                        height: '6px',
                                        background: '#5a4530',
                                        borderRadius: '2px',
                                        overflow: 'hidden',
                                        border: '1px solid #3a2820',
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{
                                            width: `${cooldownPercent}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                                            transition: 'width 0.1s linear',
                                            imageRendering: 'pixelated'
                                        }} />
                                    </div>
                                )}

                                {/* Ultimate Icon */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    {ultimateIcon.type === 'image' ? (
                                        <img
                                            src={ultimateIcon.src}
                                            alt={window.gameState.player.ultimate.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                imageRendering: 'pixelated',
                                                filter: isReady ? 'drop-shadow(0 0 4px #d4a5c0)' : 'brightness(0.5)'
                                            }}
                                        />
                                    ) : (
                                        <span style={{
                                            fontSize: '20px',
                                            color: '#d4a5c0',
                                            filter: isReady ? 'drop-shadow(0 0 4px #d4a5c0)' : 'brightness(0.5)'
                                        }}>{ultimateIcon.value}</span>
                                    )}
                                </div>

                                {/* "R" Badge - Top Right */}
                                <div style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '7px',
                                    color: '#f5e6c8',
                                    background: 'rgba(139, 42, 94, 0.9)',
                                    padding: '2px 5px',
                                    borderRadius: '3px',
                                    border: '1px solid #8b2a5e',
                                    zIndex: 2
                                }}>R</div>
                            </div>
                        );
                    })()}
                </div>

                {/* Debug Menu Toggle Button */}
                <button
                    className="debug-toggle-btn"
                    onClick={() => setShowDebugMenu(!showDebugMenu)}
                >
                    {showDebugMenu ? 'X' : 'Test Weapons'}
                </button>

                {/* Debug Weapon Menu */}
                {showDebugMenu && (
                    <div className="debug-menu">
                        <h3 style={{color: '#e94560', marginBottom: '12px'}}>Test Weapons</h3>
                        <div className="weapon-grid">
                            <button className="weapon-btn magic-missile" onClick={() => addWeapon('magic_missile')}>
                                <span className="weapon-icon"></span>
                                <span>Magic Missile</span>
                            </button>
                            <button className="weapon-btn lightning" onClick={() => addWeapon('lightning')}>
                                <span className="weapon-icon"></span>
                                <span>Chain Lightning</span>
                            </button>
                            <button className="weapon-btn fireball" onClick={() => addWeapon('fireball')}>
                                <span className="weapon-icon"></span>
                                <span>Fireball</span>
                            </button>
                            <button className="weapon-btn ice" onClick={() => addWeapon('ice')}>
                                <span className="weapon-icon"></span>
                                <span>Ice Spike</span>
                            </button>
                            <button className="weapon-btn arcane" onClick={() => addWeapon('arcane')}>
                                <span className="weapon-icon"></span>
                                <span>Arcane Orbs</span>
                            </button>
                            <button className="weapon-btn homing" onClick={() => addWeapon('homing_missile')}>
                                <span className="weapon-icon"></span>
                                <span>Homing Missiles</span>
                            </button>
                            <button className="weapon-btn tornado" onClick={() => addWeapon('tornado')}>
                                <span className="weapon-icon"></span>
                                <span>Tornado</span>
                            </button>
                            <button className="weapon-btn blade" onClick={() => addWeapon('spinning_blade')}>
                                <span className="weapon-icon"></span>
                                <span>Spinning Blade</span>
                            </button>
                            <button className="weapon-btn meteor" onClick={() => addWeapon('meteor')}>
                                <span className="weapon-icon"></span>
                                <span>Meteor Strike</span>
                            </button>
                            <button className="weapon-btn sword-spin" onClick={() => addWeapon('sword_spin')}>
                                <span className="weapon-icon"></span>
                                <span>Sword Spin</span>
                            </button>
                            <button className="weapon-btn chain-lightning" onClick={() => addWeapon('chain_lightning')}>
                                <span className="weapon-icon"></span>
                                <span>Chain Lightning</span>
                            </button>
                            <button className="weapon-btn spirit-wolf" onClick={() => addWeapon('spirit_wolf')}>
                                <span className="weapon-icon"></span>
                                <span>Spirit Wolf</span>
                            </button>
                            <button className="weapon-btn black-hole" onClick={() => addWeapon('black_hole')}>
                                <span className="weapon-icon"></span>
                                <span>Black Hole</span>
                            </button>
                            <button className="weapon-btn poison-cloud" onClick={() => addWeapon('poison_cloud')} style={{
                                background: 'linear-gradient(135deg, rgba(136, 255, 0, 0.2) 0%, rgba(80, 200, 0, 0.2) 100%)',
                                border: '2px solid #88ff00'
                            }}>
                                <span className="weapon-icon">☠️</span>
                                <span>Poison Cloud</span>
                            </button>
                            <button className="weapon-btn crystal-shard" onClick={() => addWeapon('crystal_shard')} style={{
                                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 200, 200, 0.2) 100%)',
                                border: '2px solid #00ffff'
                            }}>
                                <span className="weapon-icon">💎</span>
                                <span>Crystal Shard</span>
                            </button>
                            <button className="weapon-btn frost-nova" onClick={() => addWeapon('frost_nova')} style={{
                                background: 'linear-gradient(135deg, rgba(0, 200, 255, 0.2) 0%, rgba(100, 220, 255, 0.2) 100%)',
                                border: '2px solid #00c8ff'
                            }}>
                                <span className="weapon-icon">❄️</span>
                                <span>Frost Nova</span>
                            </button>
                            <button className="weapon-btn thunder-hammer" onClick={() => addWeapon('thunder_hammer')} style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 0, 0.2) 0%, rgba(255, 200, 0, 0.2) 100%)',
                                border: '2px solid #ffff00'
                            }}>
                                <span className="weapon-icon">⚡</span>
                                <span>Thunder Hammer</span>
                            </button>
                            <button className="weapon-btn shadow-clone" onClick={() => addWeapon('shadow_clone')} style={{
                                background: 'linear-gradient(135deg, rgba(102, 0, 204, 0.2) 0%, rgba(153, 0, 255, 0.2) 100%)',
                                border: '2px solid #9900ff'
                            }}>
                                <span className="weapon-icon">👤</span>
                                <span>Shadow Clone</span>
                            </button>
                        </div>
                        <hr style={{margin: '20px 0', borderColor: 'rgba(255,255,255,0.1)'}} />
                        <h3 style={{color: '#e94560', marginBottom: '12px'}}>Test Items</h3>
                        <div className="weapon-grid">
                            <button className="weapon-btn chest-spawn" onClick={spawnChest} style={{
                                background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.8) 0%, rgba(101, 67, 33, 0.8) 100%)',
                                border: '2px solid #FFD700'
                            }}>
                                <span className="weapon-icon"></span>
                                <span>Spawn Chest</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Level Up Screen - Pixel Art Style */}
                {showLevelUp && (
                    <div className="modal-overlay">
                        <div style={{
                            position: 'relative',
                            width: '800px',
                            maxWidth: '90vw',
                            padding: '50px',
                            background: '#d4c5a0',
                            border: '12px solid #6fb880',
                            borderRadius: '0',
                            boxShadow: '0 0 0 6px #5a4530, inset 0 0 0 10px #f5e6c8',
                            imageRendering: 'pixelated',
                            fontFamily: '"Press Start 2P", monospace'
                        }}>
                            <h2 style={{
                                textAlign: 'center',
                                fontSize: '36px',
                                color: '#6fb880',
                                marginBottom: '40px',
                                textShadow: '4px 4px 0px #2a5840',
                                letterSpacing: '2px',
                                textTransform: 'uppercase'
                            }}>LEVEL UP!</h2>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                {upgrades.map((upgrade, index) => {
                                    // Determine colors based on rarity
                                    let borderColor = '#8b6f47'; // Always brown border
                                    let glowColor = 'transparent';
                                    let badgeColor = '#6b5545';

                                    // Keep badge color for rarity but not border/glow
                                    if (upgrade.rarity) {
                                        if (upgrade.rarity.key === 'rare') {
                                            badgeColor = '#4a9eff';
                                        } else if (upgrade.rarity.key === 'legendary') {
                                            badgeColor = '#ffa500';
                                        }
                                    }

                                    const upgradeIcon = getUpgradeIcon(upgrade);

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => window.selectUpgrade(index)}
                                            style={{
                                                background: '#b8a586',
                                                padding: '20px',
                                                borderRadius: '8px',
                                                border: `4px solid ${borderColor}`,
                                                boxShadow: `0 4px 0 #5a4530, 0 0 20px ${glowColor}, inset 0 2px 0 rgba(245, 230, 200, 0.3)`,
                                                cursor: 'default',
                                                transition: 'transform 0.1s, box-shadow 0.1s',
                                                position: 'relative',
                                                display: 'flex',
                                                gap: '15px',
                                                alignItems: 'center',
                                                outline: 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = `0 6px 0 #5a4530, 0 0 30px ${glowColor}, inset 0 2px 0 rgba(245, 230, 200, 0.3)`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = `0 4px 0 #5a4530, 0 0 20px ${glowColor}, inset 0 2px 0 rgba(245, 230, 200, 0.3)`;
                                            }}
                                        >
                                            {/* Weapon Icon - Always show slot */}
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                flexShrink: 0,
                                                backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                imageRendering: 'pixelated',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '12px',
                                                border: 'none',
                                                outline: 'none',
                                                boxShadow: 'none'
                                            }}>
                                                {upgradeIcon && (
                                                    <>
                                                        {upgradeIcon.type === 'image' ? (
                                                            <img
                                                                src={upgradeIcon.src}
                                                                alt={upgrade.name}
                                                                style={{
                                                                    width: '35px',
                                                                    height: '35px',
                                                                    objectFit: 'contain',
                                                                    imageRendering: 'pixelated'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span style={{
                                                                fontSize: '20px',
                                                                color: '#6fb880',
                                                                fontWeight: 'bold'
                                                            }}>{upgradeIcon.value}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Text Content */}
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{
                                                    fontSize: '14px',
                                                    color: '#1a1a1a',
                                                    marginBottom: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}>
                                                    {upgrade.name}
                                                    {upgrade.rarity && (
                                                        <span style={{
                                                            fontSize: '8px',
                                                            padding: '4px 8px',
                                                            background: badgeColor,
                                                            color: '#1a1a1a',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {upgrade.rarity.name.toUpperCase()}
                                                        </span>
                                                    )}
                                                </h3>
                                                <p style={{
                                                    fontSize: '10px',
                                                    color: '#4a3830',
                                                    lineHeight: '1.5'
                                                }}>{upgrade.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Chest Popup */}
                {showChestPopup && chestData && (
                    <div className="modal-overlay">
                        <div className="modal chest-modal" style={{maxWidth: '500px'}}>
                            <h2>Treasure Chest!</h2>

                            {/* Ultimate Display (if chest has ultimate) */}
                            {chestData.ultimate && (
                                <div style={{
                                    padding: '20px',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.4) 100%)',
                                    borderRadius: '12px',
                                    border: '3px solid #8b5cf6',
                                    marginBottom: '20px',
                                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
                                }}>
                                    <div style={{fontSize: '80px', textAlign: 'center', marginBottom: '15px', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))'}}>
                                        {chestData.ultimate.icon}
                                    </div>
                                    <div style={{textAlign: 'center', marginBottom: '10px'}}>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#c084fc',
                                            textShadow: '0 0 10px rgba(192, 132, 252, 0.8)',
                                            marginBottom: '5px'
                                        }}>
                                            {chestData.ultimate.name}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#fbbf24',
                                            fontWeight: 'bold',
                                            textShadow: '0 0 5px rgba(251, 191, 36, 0.8)',
                                            letterSpacing: '2px',
                                            marginBottom: '10px'
                                        }}>
                                            ⭐ ULTIMATE ABILITY ⭐
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#e0e0e0',
                                            lineHeight: '1.5',
                                            padding: '10px',
                                            background: 'rgba(0, 0, 0, 0.4)',
                                            borderRadius: '8px'
                                        }}>
                                            {chestData.ultimate.description}
                                        </div>
                                    </div>
                                    <div style={{
                                        textAlign: 'center',
                                        marginTop: '15px',
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                        fontStyle: 'italic'
                                    }}>
                                        Press R to activate in battle
                                    </div>
                                </div>
                            )}

                            {/* Gear Display (if chest has gear) */}
                            {chestData.gear && (
                                <div style={{
                                    padding: '20px',
                                    background: chestData.gear.rarity === 'legendary' ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.3) 100%)' :
                                               chestData.gear.rarity === 'rare' ? 'linear-gradient(135deg, rgba(65, 105, 225, 0.3) 0%, rgba(30, 144, 255, 0.3) 100%)' :
                                               'linear-gradient(135deg, rgba(128, 128, 128, 0.3) 0%, rgba(105, 105, 105, 0.3) 100%)',
                                    borderRadius: '12px',
                                    border: `3px solid ${chestData.gear.rarity === 'legendary' ? '#FFD700' : chestData.gear.rarity === 'rare' ? '#4169E1' : '#808080'}`,
                                    marginBottom: '20px'
                                }}>
                                    <div style={{fontSize: '64px', textAlign: 'center', marginBottom: '10px'}}>
                                        {chestData.gear.icon}
                                    </div>
                                    <div style={{textAlign: 'center', marginBottom: '10px'}}>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: chestData.gear.rarity === 'legendary' ? '#FFD700' :
                                                   chestData.gear.rarity === 'rare' ? '#4169E1' :
                                                   '#C0C0C0',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                        }}>
                                            {chestData.gear.name}
                                        </div>
                                        <div style={{fontSize: '14px', color: '#AAA', marginTop: '5px'}}>
                                            {chestData.gear.rarity.charAt(0).toUpperCase() + chestData.gear.rarity.slice(1)}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        marginTop: '10px'
                                    }}>
                                        {Object.entries(chestData.gear.stats).map(([stat, value]) => (
                                            <div key={stat} style={{color: '#4ade80', fontSize: '14px', marginBottom: '3px'}}>
                                                {stat === 'damage' && `+${value} Damage`}
                                                {stat === 'maxHp' && `+${value} Max HP`}
                                                {stat === 'speed' && `+${value} Speed`}
                                                {stat === 'luck' && `+${value}% Luck`}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Coins Display */}
                            <p style={{color: '#FFD700', fontSize: '18px', marginBottom: '20px'}}>
                                + {chestData.coins} coins
                            </p>

                            <button
                                className="primary-button"
                                onClick={() => {
                                    if (window.gameState) {
                                        window.gameState.coins = (window.gameState.coins || 0) + chestData.coins;

                                        // Equip ultimate if found
                                        if (chestData.ultimate) {
                                            window.gameState.player.ultimate = {
                                                type: chestData.ultimate.type,
                                                name: chestData.ultimate.name,
                                                icon: chestData.ultimate.icon
                                            };
                                            console.log(`✨ Ultimate equipped: ${chestData.ultimate.name}`);
                                        }

                                        window.gameState.isPaused = false;
                                    }
                                    // Add gear to inventory (if exists)
                                    if (chestData.gear) {
                                        setPlayerData({
                                            ...playerData,
                                            inventory: [...playerData.inventory, chestData.gear]
                                        });
                                    }
                                    setShowChestPopup(false);
                                }}
                                style={{
                                    background: chestData.ultimate
                                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)'
                                        : 'linear-gradient(135deg, rgba(255, 215, 0, 0.8) 0%, rgba(255, 165, 0, 0.8) 100%)',
                                    fontSize: '20px',
                                    padding: '15px 40px'
                                }}
                            >
                                Collect
                            </button>
                        </div>
                    </div>
                )}

                {/* Mystery Box Spinner */}
                {showMysteryBoxSpinner && (
                    <MysteryBoxSpinner
                        playerData={playerData}
                        setPlayerData={setPlayerData}
                        onClose={() => {
                            setShowMysteryBoxSpinner(false);
                            if (window.gameState) {
                                window.gameState.isPaused = false;
                            }
                        }}
                    />
                )}

                {/* Pause Screen with Pixel Art Menu */}
                {showPaused && !showLevelUp && !showGameOver && !showChestPopup && !showMysteryBoxSpinner && (
                    <div className="modal-overlay">
                        <div style={{
                            position: 'relative',
                            width: '420px',
                            padding: '50px',
                            background: '#d4c5a0',
                            border: '12px solid #8b6f47',
                            borderRadius: '0',
                            boxShadow: '0 0 0 6px #5a4530, inset 0 0 0 10px #f5e6c8',
                            imageRendering: 'pixelated',
                            fontFamily: '"Press Start 2P", monospace'
                        }}>
                            {/* Game Stats Display */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                marginBottom: '30px',
                                paddingBottom: '30px',
                                borderBottom: '3px solid #8b6f47',
                                gap: '15px'
                            }}>
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '12px 18px',
                                    borderRadius: '6px',
                                    border: '2px solid #8b6f47',
                                    fontSize: '10px',
                                    color: '#2a5840',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    flex: 1
                                }}>
                                    <div style={{fontSize: '18px', marginBottom: '5px'}}>{gameStats.kills}</div>
                                    <div>Kills</div>
                                </div>
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '12px 18px',
                                    borderRadius: '6px',
                                    border: '2px solid #8b6f47',
                                    fontSize: '10px',
                                    color: '#2a5840',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    flex: 1
                                }}>
                                    <div style={{fontSize: '18px', marginBottom: '5px'}}>{gameStats.time}</div>
                                    <div>Time</div>
                                </div>
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '12px 18px',
                                    borderRadius: '6px',
                                    border: '2px solid #8b6f47',
                                    fontSize: '10px',
                                    color: '#2a5840',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    flex: 1
                                }}>
                                    <div style={{fontSize: '18px', marginBottom: '5px'}}>{coins}</div>
                                    <div>Coins</div>
                                </div>
                            </div>

                            {/* Menu buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <button
                                    onClick={() => {
                                        if (window.gameState) {
                                            window.gameState.isPaused = false;
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '18px 24px',
                                        background: 'linear-gradient(180deg, #6fb880 0%, #4a9860 100%)',
                                        border: '4px solid #2a5840',
                                        borderRadius: '8px',
                                        color: '#1a1a1a',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'default',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        boxShadow: '0 6px 0 #2a5840, inset 0 3px 0 #8fd8a0',
                                        imageRendering: 'pixelated',
                                        fontFamily: '"Press Start 2P", monospace',
                                        transition: 'transform 0.1s'
                                    }}
                                    onMouseDown={(e) => e.target.style.transform = 'translateY(2px)'}
                                    onMouseUp={(e) => e.target.style.transform = 'translateY(0)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    RESUME
                                </button>

                                <button
                                    onClick={() => window.location.reload()}
                                    style={{
                                        width: '100%',
                                        padding: '18px 24px',
                                        background: 'linear-gradient(180deg, #6fb880 0%, #4a9860 100%)',
                                        border: '4px solid #2a5840',
                                        borderRadius: '8px',
                                        color: '#1a1a1a',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'default',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        boxShadow: '0 6px 0 #2a5840, inset 0 3px 0 #8fd8a0',
                                        imageRendering: 'pixelated',
                                        fontFamily: '"Press Start 2P", monospace',
                                        transition: 'transform 0.1s'
                                    }}
                                    onMouseDown={(e) => e.target.style.transform = 'translateY(2px)'}
                                    onMouseUp={(e) => e.target.style.transform = 'translateY(0)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    RESTART
                                </button>

                                {/* Music controls section */}
                                <div style={{
                                    marginTop: '30px',
                                    padding: '20px',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    border: '3px solid #8b6f47'
                                }}>
                                    <div style={{fontSize: '14px', color: '#2a5840', marginBottom: '15px', fontWeight: 'bold'}}>
                                        🎵 MUSIC
                                    </div>
                                    <div style={{marginBottom: '15px'}}>
                                        <label style={{color: '#2a5840', fontSize: '12px', marginBottom: '8px', display: 'block'}}>
                                            Volume: {Math.round(playerData.musicVolume * 100)}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={playerData.musicVolume}
                                            onChange={(e) => {
                                                const volume = parseFloat(e.target.value);
                                                setPlayerData({...playerData, musicVolume: volume});
                                                if (window.currentMusicAudio) {
                                                    window.currentMusicAudio.volume = volume;
                                                }
                                            }}
                                            style={{width: '100%'}}
                                        />
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px'}}>
                                        {MUSIC_TRACKS.map(track => {
                                            const isPlaying = playerData.selectedTrack === track.id;
                                            return (
                                                <div
                                                    key={track.id}
                                                    onClick={() => {
                                                        if (window.currentMusicAudio) {
                                                            window.currentMusicAudio.pause();
                                                            window.currentMusicAudio = null;
                                                        }
                                                        if (isPlaying) {
                                                            setPlayerData({...playerData, selectedTrack: null});
                                                        } else {
                                                            const audio = new Audio(track.path);
                                                            audio.volume = playerData.musicVolume;
                                                            audio.loop = true;
                                                            audio.play().catch(err => console.error('Error playing music:', err));
                                                            window.currentMusicAudio = audio;
                                                            setPlayerData({...playerData, selectedTrack: track.id});
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '12px',
                                                        background: isPlaying ? '#6fb880' : '#5a4530',
                                                        border: '3px solid #2a5840',
                                                        borderRadius: '4px',
                                                        color: isPlaying ? '#1a1a1a' : '#d4c5a0',
                                                        fontSize: '11px',
                                                        cursor: 'default',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <span>{track.name}</span>
                                                    {isPlaying && <span>▶</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {playerData.selectedTrack && (
                                        <button
                                            onClick={() => {
                                                if (window.currentMusicAudio) {
                                                    window.currentMusicAudio.pause();
                                                    window.currentMusicAudio = null;
                                                }
                                                setPlayerData({...playerData, selectedTrack: null});
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: '#c85a54',
                                                border: '3px solid #8b3a34',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                fontSize: '11px',
                                                cursor: 'default',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            STOP MUSIC
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Game Over Screen - Pixel Art Style */}
                {showGameOver && (
                    <div className="modal-overlay">
                        <div style={{
                            position: 'relative',
                            width: '650px',
                            padding: '50px 70px',
                            background: '#d4c5a0',
                            border: '12px solid #8b6f47',
                            borderRadius: '0',
                            boxShadow: '0 0 0 6px #5a4530, inset 0 0 0 10px #f5e6c8',
                            imageRendering: 'pixelated',
                            fontFamily: '"Press Start 2P", monospace'
                        }}>
                            <h2 style={{
                                textAlign: 'center',
                                fontSize: '36px',
                                color: '#c85a54',
                                marginBottom: '40px',
                                textShadow: '4px 4px 0px #8b3a34',
                                letterSpacing: '2px',
                                textTransform: 'uppercase'
                            }}>GAME OVER!</h2>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                marginBottom: '40px'
                            }}>
                                <div style={{
                                    background: '#b8a586',
                                    padding: '20px 30px',
                                    borderRadius: '8px',
                                    border: '3px solid #8b6f47',
                                    boxShadow: '0 4px 0 #5a4530, inset 0 2px 0 rgba(245, 230, 200, 0.3)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{fontSize: '14px', color: '#5a4530'}}>Survived</span>
                                    <strong style={{fontSize: '24px', color: '#6fb880'}}>{gameStats.time}</strong>
                                </div>
                                <div style={{
                                    background: '#b8a586',
                                    padding: '20px 30px',
                                    borderRadius: '8px',
                                    border: '3px solid #8b6f47',
                                    boxShadow: '0 4px 0 #5a4530, inset 0 2px 0 rgba(245, 230, 200, 0.3)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{fontSize: '14px', color: '#5a4530'}}>Kills</span>
                                    <strong style={{fontSize: '24px', color: '#6fb880'}}>{gameStats.kills}</strong>
                                </div>
                                <div style={{
                                    background: '#b8a586',
                                    padding: '20px 30px',
                                    borderRadius: '8px',
                                    border: '3px solid #8b6f47',
                                    boxShadow: '0 4px 0 #5a4530, inset 0 2px 0 rgba(245, 230, 200, 0.3)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{fontSize: '14px', color: '#5a4530'}}>Level Reached</span>
                                    <strong style={{fontSize: '24px', color: '#6fb880'}}>{gameStats.level}</strong>
                                </div>
                            </div>

                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    width: '100%',
                                    padding: '20px 24px',
                                    background: 'linear-gradient(180deg, #6fb880 0%, #4a9860 100%)',
                                    border: '4px solid #2a5840',
                                    borderRadius: '8px',
                                    color: '#1a1a1a',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    cursor: 'default',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    boxShadow: '0 6px 0 #2a5840, inset 0 3px 0 #8fd8a0',
                                    imageRendering: 'pixelated',
                                    fontFamily: '"Press Start 2P", monospace',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseDown={(e) => e.target.style.transform = 'translateY(3px)'}
                                onMouseUp={(e) => e.target.style.transform = 'translateY(0)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                TRY AGAIN
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Character/Gear Menu Component - Simplified Achievement-style
function CharacterMenu({ playerData, setPlayerData, onBack }) {
    const [hoveredItem, setHoveredItem] = React.useState(null);
    const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

    // ESC key to go back
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onBack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onBack]);

    const equipGear = (slot, item) => {
        const newEquippedGear = {...playerData.equippedGear};
        const oldItem = newEquippedGear[slot];

        // Remove the item from inventory first
        let newInventory = playerData.inventory.filter(i => i !== item);

        // If there's already gear in this slot, add it back to inventory
        if (oldItem) {
            newInventory = [...newInventory, oldItem];
        }

        // Equip the new item
        newEquippedGear[slot] = item;

        // Update state once with all changes
        setPlayerData({
            ...playerData,
            equippedGear: newEquippedGear,
            inventory: newInventory
        });
    };

    const unequipGear = (slot) => {
        const item = playerData.equippedGear[slot];
        if (item) {
            const newEquippedGear = {...playerData.equippedGear};
            newEquippedGear[slot] = null;

            setPlayerData({
                ...playerData,
                equippedGear: newEquippedGear,
                inventory: [...playerData.inventory, item]
            });
        }
    };

    const leftSlots = [
        { id: 'helmet', name: 'Helmet', icon: 'H' },
        { id: 'chest', name: 'Chest', icon: 'C' },
        { id: 'belt', name: 'Belt', icon: 'B' },
        { id: 'boots', name: 'Boots', icon: 'Bo' },
        { id: 'gloves', name: 'Gloves', icon: 'G' }
    ];

    const rightSlots = [
        { id: 'staff', name: 'Staff', icon: 'S' },
        { id: 'ring', name: 'Ring', icon: 'R' },
        { id: 'amulet', name: 'Amulet', icon: 'A' },
        { id: 'trinket1', name: 'Trinket', icon: 'T1' },
        { id: 'trinket2', name: 'Trinket', icon: 'T2' }
    ];

    // Calculate total stats from equipped gear
    const getTotalStats = () => {
        const stats = { damage: 0, maxHp: 0, speed: 0, luck: 0 };
        Object.values(playerData.equippedGear).forEach(item => {
            if (item && item.stats) {
                Object.keys(item.stats).forEach(stat => {
                    stats[stat] = (stats[stat] || 0) + item.stats[stat];
                });
            }
        });
        return stats;
    };

    const totalStats = getTotalStats();

    // Compare stats between two items
    const compareStats = (newItem, currentItem) => {
        const comparison = {};
        const allStats = new Set([
            ...Object.keys(newItem.stats || {}),
            ...Object.keys(currentItem?.stats || {})
        ]);

        allStats.forEach(stat => {
            const newValue = newItem.stats[stat] || 0;
            const currentValue = currentItem?.stats[stat] || 0;
            const diff = newValue - currentValue;
            comparison[stat] = {
                new: newValue,
                current: currentValue,
                diff: diff
            };
        });

        return comparison;
    };

    const renderGearSlot = (slot) => {
        const equippedItem = playerData.equippedGear[slot.id];
        const rarityColors = {
            legendary: '#ffa500',
            rare: '#4a9eff',
            common: '#8b6f47'
        };
        const borderColor = equippedItem ? rarityColors[equippedItem.rarity] : '#6b5545';

        return (
            <div
                key={slot.id}
                className={`gear-slot ${equippedItem ? 'filled' : 'empty'}`}
                style={{
                    aspectRatio: '1',
                    width: '60px',
                    border: `3px solid ${borderColor}`,
                    borderRadius: '6px',
                    background: equippedItem ? '#b8a586' : 'rgba(139, 111, 71, 0.3)',
                    boxShadow: equippedItem ? '0 3px 0 #5a4530, inset 0 2px 0 rgba(245, 230, 200, 0.3)' : '0 2px 0 #5a4530',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                    transition: 'transform 0.1s',
                    position: 'relative',
                    padding: '6px',
                    imageRendering: 'pixelated',
                    fontFamily: '"Press Start 2P", monospace'
                }}
                onClick={() => equippedItem && unequipGear(slot.id)}
                onMouseEnter={(e) => equippedItem && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => equippedItem && (e.currentTarget.style.transform = 'translateY(0)')}
            >
                <div style={{
                    fontSize: '18px',
                    color: equippedItem ? '#2a5840' : '#8b6f47',
                    opacity: equippedItem ? 1 : 0.5
                }}>{equippedItem ? equippedItem.icon : slot.icon}</div>
                <div style={{
                    fontSize: '6px',
                    color: equippedItem ? '#4a3830' : '#6b5545',
                    marginTop: '3px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    opacity: equippedItem ? 1 : 0.6
                }}>{slot.name}</div>
                {equippedItem && (
                    <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: rarityColors[equippedItem.rarity],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#1a1a1a',
                        border: '2px solid #5a4530',
                        boxShadow: '0 2px 0 #2a1a0a'
                    }}>
                        {equippedItem.rarity === 'legendary' ? 'L' : equippedItem.rarity === 'rare' ? 'R' : 'C'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="submenu" style={{ position: 'relative' }}>
            {/* Back button */}
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    left: '20px',
                    top: '20px',
                    width: '80px',
                    height: '80px',
                    backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: 'none',
                    cursor: 'default',
                    imageRendering: 'pixelated',
                    transition: 'transform 0.15s ease, filter 0.15s ease',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: 0,
                    paddingBottom: '2px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    zIndex: 10
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.filter = 'brightness(1.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(1)';
                }}
            >
                ←
            </button>

            <h2>EQUIPMENT</h2>

            {/* Main Grid: Character on Left, Inventory on Right */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '20px'
            }}>
                {/* Character Sheet - LEFT SIDE */}
                <div style={{
                    background: '#d4c5a0',
                    padding: '20px',
                    borderRadius: '0',
                    border: '8px solid #8b6f47',
                    boxShadow: '0 0 0 4px #5a4530, inset 0 0 0 6px #f5e6c8',
                    display: 'flex',
                    flexDirection: 'column',
                    imageRendering: 'pixelated',
                    fontFamily: '"Press Start 2P", monospace'
                }}>
                    <h3 style={{
                        marginBottom: '15px',
                        color: '#2a5840',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textAlign: 'center',
                        textShadow: '1px 1px 0px #8b6f47'
                    }}>EQUIPPED GEAR</h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        gap: '10px',
                        alignItems: 'center',
                        marginBottom: '12px',
                        flex: 1
                    }}>
                        {/* Left Gear Slots - 5 slots vertical */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            justifyContent: 'center'
                        }}>
                            {leftSlots.map(slot => renderGearSlot(slot))}
                        </div>

                        {/* Player Sprite in Center */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '0 15px'
                        }}>
                            <div style={{
                                position: 'relative',
                                width: '100px',
                                height: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(139, 111, 71, 0.2)',
                                border: '3px solid #8b6f47',
                                borderRadius: '8px',
                                boxShadow: 'inset 0 2px 0 rgba(245, 230, 200, 0.3)'
                            }}>
                                <img
                                    src="assets/Download62188.png"
                                    alt="Player"
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        objectFit: 'none',
                                        objectPosition: '0 -64px',
                                        imageRendering: 'pixelated'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right Gear Slots - 5 slots vertical */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            justifyContent: 'center'
                        }}>
                            {rightSlots.map(slot => renderGearSlot(slot))}
                        </div>
                    </div>

                    {/* Total Stats Display */}
                    <div style={{
                        padding: '12px',
                        background: 'rgba(139, 111, 71, 0.3)',
                        borderRadius: '0',
                        border: '3px solid #6fb880',
                        boxShadow: '0 3px 0 #5a4530, inset 0 2px 0 rgba(245, 230, 200, 0.2)'
                    }}>
                        <h4 style={{
                            color: '#2a5840',
                            marginBottom: '10px',
                            textAlign: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            textShadow: '1px 1px 0px #8b6f47'
                        }}>TOTAL STATS</h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            fontSize: '10px'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '8px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '4px',
                                border: '2px solid #8b6f47'
                            }}>
                                <span style={{color: '#6b5545', fontSize: '7px', marginBottom: '3px', fontWeight: 'bold'}}>Damage</span>
                                <span style={{color: '#6fb880', fontWeight: 'bold', fontSize: '12px'}}>+{totalStats.damage}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '8px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '4px',
                                border: '2px solid #8b6f47'
                            }}>
                                <span style={{color: '#6b5545', fontSize: '7px', marginBottom: '3px', fontWeight: 'bold'}}>Max HP</span>
                                <span style={{color: '#6fb880', fontWeight: 'bold', fontSize: '12px'}}>+{totalStats.maxHp}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '8px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '4px',
                                border: '2px solid #8b6f47'
                            }}>
                                <span style={{color: '#6b5545', fontSize: '7px', marginBottom: '3px', fontWeight: 'bold'}}>Speed</span>
                                <span style={{color: '#6fb880', fontWeight: 'bold', fontSize: '12px'}}>+{totalStats.speed.toFixed(1)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '8px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '4px',
                                border: '2px solid #8b6f47'
                            }}>
                                <span style={{color: '#6b5545', fontSize: '7px', marginBottom: '3px', fontWeight: 'bold'}}>Luck</span>
                                <span style={{color: '#6fb880', fontWeight: 'bold', fontSize: '12px'}}>+{totalStats.luck}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory - RIGHT SIDE */}
                <div style={{
                    background: '#d4c5a0',
                    padding: '20px',
                    borderRadius: '0',
                    border: '8px solid #8b6f47',
                    boxShadow: '0 0 0 4px #5a4530, inset 0 0 0 6px #f5e6c8',
                    imageRendering: 'pixelated',
                    fontFamily: '"Press Start 2P", monospace'
                }}>
                    <h3 style={{
                        marginBottom: '15px',
                        color: '#2a5840',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textAlign: 'center',
                        textShadow: '1px 1px 0px #8b6f47'
                    }}>INVENTORY ({playerData.inventory.length}/32)</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(16, 1fr)',
                        gap: '5px'
                    }}>
                        {/* Render all 32 slots (4 rows x 8 columns) */}
                        {Array.from({ length: 32 }).map((_, index) => {
                            const item = playerData.inventory[index];

                            if (item) {
                                const rarityColors = {
                                    legendary: '#ffa500',
                                    rare: '#4a9eff',
                                    common: '#8b6f47'
                                };
                                // Filled slot with item
                                return (
                                    <div
                                        key={index}
                                        className={`inventory-item rarity-${item.rarity}`}
                                        onClick={() => equipGear(item.slot, item)}
                                        style={{
                                            aspectRatio: '1',
                                            padding: '6px',
                                            background: '#b8a586',
                                            border: `3px solid ${rarityColors[item.rarity]}`,
                                            borderRadius: '4px',
                                            cursor: 'default',
                                            textAlign: 'center',
                                            transition: 'transform 0.1s',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 0 #5a4530, inset 0 1px 0 rgba(245, 230, 200, 0.3)',
                                            imageRendering: 'pixelated'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
                                            setHoveredItem(item);
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            setHoveredItem(null);
                                        }}
                                    >
                                        <div style={{fontSize: '18px'}}>{item.icon}</div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '2px',
                                            right: '2px',
                                            fontSize: '7px',
                                            fontWeight: 'bold',
                                            color: item.rarity === 'legendary' ? '#FFD700' : item.rarity === 'rare' ? '#4169E1' : '#999',
                                            textShadow: '0 0 3px #000'
                                        }}>
                                            {item.rarity === 'legendary' ? 'L' : item.rarity === 'rare' ? 'R' : 'C'}
                                        </div>
                                    </div>
                                );
                            } else {
                                // Empty slot
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            aspectRatio: '1',
                                            background: 'rgba(139, 111, 71, 0.2)',
                                            border: '2px dashed #8b6f47',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0.6,
                                            boxShadow: 'inset 0 1px 0 rgba(90, 69, 48, 0.3)'
                                        }}
                                    >
                                        <div style={{fontSize: '14px', color: '#8b6f47', opacity: 0.5}}>+</div>
                                    </div>
                                );
                            }
                        })}
                </div>
            </div>
            </div>

            <BackButton onClick={onBack} />

            {/* Comparison Tooltip */}
            {hoveredItem && (
                <div style={{
                    position: 'fixed',
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y - 10}px`,
                    transform: 'translate(-50%, -100%)',
                    background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%)',
                    border: '2px solid #FFD700',
                    borderRadius: '12px',
                    padding: '15px',
                    minWidth: '280px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                    zIndex: 10000,
                    pointerEvents: 'none'
                }}>
                    {/* New Item Header */}
                    <div style={{
                        marginBottom: '12px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: hoveredItem.rarity === 'legendary' ? '#FFD700' :
                                   hoveredItem.rarity === 'rare' ? '#4169E1' :
                                   '#C0C0C0',
                            marginBottom: '5px'
                        }}>
                            {hoveredItem.name}
                        </div>
                        <div style={{fontSize: '12px', color: '#888'}}>
                            {hoveredItem.slot.charAt(0).toUpperCase() + hoveredItem.slot.slice(1)}
                        </div>
                    </div>

                    {/* Stat Comparison */}
                    {(() => {
                        const equippedItem = playerData.equippedGear[hoveredItem.slot];
                        const comparison = compareStats(hoveredItem, equippedItem);

                        return (
                            <div>
                                {Object.entries(comparison).map(([stat, values]) => (
                                    <div key={stat} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                        fontSize: '13px'
                                    }}>
                                        <span style={{color: '#CCC'}}>
                                            {stat === 'maxHp' ? 'Max HP' :
                                             stat === 'damage' ? 'Damage' :
                                             stat === 'speed' ? 'Speed' :
                                             stat === 'luck' ? 'Luck' : stat}:
                                        </span>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            {equippedItem && (
                                                <span style={{color: '#888', textDecoration: 'line-through'}}>
                                                    {values.current}
                                                </span>
                                            )}
                                            <span style={{
                                                color: values.diff > 0 ? '#4ade80' : values.diff < 0 ? '#ef4444' : '#888',
                                                fontWeight: 'bold'
                                            }}>
                                                {values.new}
                                            </span>
                                            {values.diff !== 0 && (
                                                <span style={{
                                                    color: values.diff > 0 ? '#4ade80' : '#ef4444',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ({values.diff > 0 ? '+' : ''}{values.diff})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Currently Equipped Item Info */}
                                {equippedItem && (
                                    <div style={{
                                        marginTop: '12px',
                                        paddingTop: '10px',
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '11px',
                                        color: '#888'
                                    }}>
                                        Currently equipped: <span style={{
                                            color: equippedItem.rarity === 'legendary' ? '#FFD700' :
                                                   equippedItem.rarity === 'rare' ? '#4169E1' :
                                                   '#C0C0C0'
                                        }}>{equippedItem.name}</span>
                                    </div>
                                )}

                                {!equippedItem && (
                                    <div style={{
                                        marginTop: '12px',
                                        paddingTop: '10px',
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '11px',
                                        color: '#4ade80',
                                        textAlign: 'center'
                                    }}>
                                        No item equipped in this slot
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

// Skill Tree Menu Component (same layout as main menu)
function SkillTreeMenu({ playerData, setPlayerData, onBack }) {
    // ESC key to go back
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onBack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onBack]);

    // Skill tree data - each tree has multiple skills
    const skillTrees = [
        {
            name: 'Combat',
            skills: [
                { id: 'atk1', name: 'Attack I', desc: '+5% Damage' },
                { id: 'atk2', name: 'Attack II', desc: '+10% Damage' },
                { id: 'atk3', name: 'Attack III', desc: '+15% Damage' },
                { id: 'atk4', name: 'Attack IV', desc: '+20% Damage' },
                { id: 'crit1', name: 'Critical I', desc: '+5% Crit' },
                { id: 'crit2', name: 'Critical II', desc: '+10% Crit' },
                { id: 'crit3', name: 'Critical III', desc: '+15% Crit' },
                { id: 'speed1', name: 'Speed I', desc: '+5% Speed' },
                { id: 'speed2', name: 'Speed II', desc: '+10% Speed' },
                { id: 'rage1', name: 'Rage I', desc: '+10% Dmg' },
                { id: 'rage2', name: 'Rage II', desc: '+20% Dmg' },
                { id: 'pierce1', name: 'Pierce I', desc: '+5% Pierce' },
                { id: 'pierce2', name: 'Pierce II', desc: '+10% Pierce' },
                { id: 'fury1', name: 'Fury I', desc: '+Attack Spd' },
                { id: 'fury2', name: 'Fury II', desc: '++Attack Spd' },
            ]
        },
        {
            name: 'Defense',
            skills: [
                { id: 'hp1', name: 'Health I', desc: '+10 HP' },
                { id: 'hp2', name: 'Health II', desc: '+20 HP' },
                { id: 'hp3', name: 'Health III', desc: '+30 HP' },
                { id: 'hp4', name: 'Health IV', desc: '+50 HP' },
                { id: 'armor1', name: 'Armor I', desc: '+5% Defense' },
                { id: 'armor2', name: 'Armor II', desc: '+10% Defense' },
                { id: 'armor3', name: 'Armor III', desc: '+15% Defense' },
                { id: 'regen1', name: 'Regen I', desc: '+1 HP/s' },
                { id: 'regen2', name: 'Regen II', desc: '+2 HP/s' },
                { id: 'regen3', name: 'Regen III', desc: '+3 HP/s' },
                { id: 'resist1', name: 'Resist I', desc: '+5% Resist' },
                { id: 'resist2', name: 'Resist II', desc: '+10% Resist' },
                { id: 'tough1', name: 'Tough I', desc: '+Toughness' },
                { id: 'tough2', name: 'Tough II', desc: '++Toughness' },
                { id: 'block1', name: 'Block I', desc: '+5% Block' },
            ]
        },
        {
            name: 'Magic',
            skills: [
                { id: 'mag1', name: 'Magic I', desc: '+5% Magic' },
                { id: 'mag2', name: 'Magic II', desc: '+10% Magic' },
                { id: 'mag3', name: 'Magic III', desc: '+15% Magic' },
                { id: 'mag4', name: 'Magic IV', desc: '+20% Magic' },
                { id: 'mana1', name: 'Mana I', desc: '+10 Mana' },
                { id: 'mana2', name: 'Mana II', desc: '+20 Mana' },
                { id: 'mana3', name: 'Mana III', desc: '+30 Mana' },
                { id: 'cool1', name: 'Cooldown I', desc: '-10% CD' },
                { id: 'cool2', name: 'Cooldown II', desc: '-20% CD' },
                { id: 'spell1', name: 'Spell I', desc: '+Spell Dmg' },
                { id: 'spell2', name: 'Spell II', desc: '++Spell Dmg' },
                { id: 'wisdom1', name: 'Wisdom I', desc: '+5% XP' },
                { id: 'wisdom2', name: 'Wisdom II', desc: '+10% XP' },
                { id: 'arcane1', name: 'Arcane I', desc: '+Magic Find' },
                { id: 'arcane2', name: 'Arcane II', desc: '++Magic Find' },
            ]
        }
    ];

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            padding: '40px',
            position: 'relative'
        }}>
            {/* Back button */}
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    left: '40px',
                    top: '40px',
                    width: '80px',
                    height: '80px',
                    backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: 'none',
                    cursor: 'default',
                    imageRendering: 'pixelated',
                    transition: 'transform 0.15s ease, filter 0.15s ease',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: 0,
                    paddingBottom: '2px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.filter = 'brightness(1.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(1)';
                }}
            >
                ←
            </button>

            {skillTrees.map((tree, treeIndex) => (
                <div key={treeIndex} className="main-menu-box" style={{
                    position: 'relative',
                    width: '350px',
                    height: '700px',
                    backgroundImage: 'url(assets/MainMenuBoxGame.png)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: 'none',
                    borderRadius: '0',
                    boxShadow: 'none',
                    imageRendering: 'pixelated',
                    fontFamily: '"Press Start 2P", monospace',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    padding: '0',
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '110px',
                        left: '45px',
                        right: '45px',
                        bottom: '110px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px',
                        paddingTop: '20px',
                        paddingBottom: '20px',
                        paddingLeft: '10px',
                        paddingRight: '20px'
                    }}>
                        {/* Tree Title */}
                        <h3 style={{
                            color: '#6fb880',
                            fontSize: '18px',
                            textAlign: 'center',
                            marginBottom: '10px',
                            textShadow: '2px 2px 0 #2a5840',
                            fontFamily: '"Press Start 2P", monospace',
                            textTransform: 'uppercase'
                        }}>{tree.name}</h3>

                        {/* Skill Slots */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '15px',
                            width: '100%'
                        }}>
                            {tree.skills.map((skill) => (
                                <div
                                    key={skill.id}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                                        backgroundSize: '100% 100%',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        border: 'none',
                                        cursor: 'default',
                                        imageRendering: 'pixelated',
                                        transition: 'transform 0.15s ease, filter 0.15s ease',
                                        backgroundColor: 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        position: 'relative',
                                        justifySelf: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.filter = 'brightness(1.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.filter = 'brightness(1)';
                                    }}
                                >
                                    {/* Icon placeholder - no emoji */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Mystery Box Spinner Component
function MysteryBoxSpinner({ playerData, setPlayerData, onClose }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinOffset, setSpinOffset] = useState(0);
    const [wonItem, setWonItem] = useState(null);
    const [showResult, setShowResult] = useState(false);

    // All possible rewards (mixed rarities for visual variety)
    const possibleRewards = [
        { id: '20coins', name: '20 Coins', icon: '$20', rarity: 'common', type: 'coins', value: 20 },
        { id: '75coins', name: '75 Coins', icon: '$75', rarity: 'rare', type: 'coins', value: 75 },
        { id: '30coins', name: '30 Coins', icon: '$30', rarity: 'common', type: 'coins', value: 30 },
        { id: 'ultimate_meteor', name: 'Meteor Storm Ultimate', icon: 'MTR', rarity: 'legendary', type: 'ultimate', ultimate: 'meteor_storm' },
        { id: 'heal', name: 'Health Potion', icon: 'HP+', rarity: 'common', type: 'item', item: 'heal' },
        { id: 'skillpoint', name: 'Skill Point', icon: 'SP', rarity: 'rare', type: 'skillpoint', value: 1 },
        { id: '40coins', name: '40 Coins', icon: '$40', rarity: 'common', type: 'coins', value: 40 },
        { id: '200coins', name: '200 Coins', icon: '$200', rarity: 'legendary', type: 'coins', value: 200 },
        { id: 'xpboost', name: 'XP Boost', icon: 'XP+', rarity: 'rare', type: 'boost', boost: 'xp' },
        { id: '50coins', name: '50 Coins', icon: '$50', rarity: 'common', type: 'coins', value: 50 },
        { id: '100coins', name: '100 Coins', icon: '$100', rarity: 'rare', type: 'coins', value: 100 },
        { id: 'ultimate_blackhole', name: 'Black Hole Ultimate', icon: 'BHO', rarity: 'legendary', type: 'ultimate', ultimate: 'black_hole' },
        { id: 'heal2', name: 'Health Potion', icon: 'HP+', rarity: 'common', type: 'item', item: 'heal' },
        { id: 'goldboost', name: 'Gold Boost', icon: 'GLD', rarity: 'rare', type: 'boost', boost: 'gold' },
        { id: 'smallxp', name: 'Small XP Boost', icon: 'XP', rarity: 'common', type: 'boost', boost: 'xp_small' },
        { id: '2skillpoints', name: '2 Skill Points', icon: 'SP+', rarity: 'legendary', type: 'skillpoint', value: 2 },
        { id: '125coins', name: '125 Coins', icon: '$125', rarity: 'rare', type: 'coins', value: 125 },
        { id: 'revive', name: 'Revive Token', icon: 'REV', rarity: 'rare', type: 'item', item: 'revive' },
        { id: '250coins', name: '250 Coins', icon: '$250', rarity: 'legendary', type: 'coins', value: 250 },
        { id: 'skillpoint2', name: 'Skill Point', icon: 'SP', rarity: 'rare', type: 'skillpoint', value: 1 },
        { id: 'ultimate_timefreeze', name: 'Time Freeze Ultimate', icon: 'TMP', rarity: 'legendary', type: 'ultimate', ultimate: 'time_freeze' },
        { id: '3skillpoints', name: '3 Skill Points', icon: 'SP++', rarity: 'legendary', type: 'skillpoint', value: 3 }
    ];

    // Create carousel with duplicates for smooth loop
    const carouselItems = [...possibleRewards, ...possibleRewards, ...possibleRewards];

    const startSpin = () => {
        setIsSpinning(true);
        setShowResult(false);

        // Randomly select winning item
        const winningIndex = Math.floor(Math.random() * possibleRewards.length);
        const winningItem = possibleRewards[winningIndex];

        // Calculate spin distance
        const itemWidth = 150; // width of each item
        const totalItems = carouselItems.length;
        const targetIndex = possibleRewards.length + winningIndex; // Middle set
        const randomExtra = Math.random() * 100 - 50; // Add some randomness
        const finalOffset = -(targetIndex * itemWidth) + (window.innerWidth / 2) - 75 + randomExtra;

        // Spin animation
        setTimeout(() => {
            setSpinOffset(finalOffset);
        }, 50);

        // Show result after spin completes
        setTimeout(() => {
            setIsSpinning(false);
            setWonItem(winningItem);
            setShowResult(true);
            applyReward(winningItem);
        }, 4000);
    };

    const applyReward = (item) => {
        let newPlayerData = { ...playerData };

        switch (item.type) {
            case 'coins':
                newPlayerData.coins = (newPlayerData.coins || 0) + item.value;
                break;
            case 'skillpoint':
                newPlayerData.skillPoints = (newPlayerData.skillPoints || 0) + item.value;
                break;
            case 'ultimate':
                // Add ultimate to player (this would need game integration)
                console.log('Unlocked ultimate:', item.ultimate);
                break;
            case 'boost':
                newPlayerData.shopItems = [...(newPlayerData.shopItems || []), item.boost + 'boost'];
                break;
            case 'item':
                newPlayerData.shopItems = [...(newPlayerData.shopItems || []), item.item];
                break;
        }

        setPlayerData(newPlayerData);
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'legendary': return '#FFD700';
            case 'rare': return '#4169E1';
            case 'common': return '#808080';
            default: return '#fff';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <h2 style={{
                color: '#D4AF37',
                marginBottom: '20px',
                fontSize: '32px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '4px'
            }}>
                MYSTERY BOX
            </h2>

            {/* Carousel Container */}
            <div style={{
                width: '100%',
                height: '200px',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '40px',
                background: '#1a1a1a'
            }}>
                {/* Pointer/Arrow at top overlapping boxes */}
                <div style={{
                    position: 'absolute',
                    top: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    <img
                        src="assets/ui_arrow_down.png"
                        alt="↓"
                        style={{
                            width: '64px',
                            height: '64px',
                            filter: 'brightness(1.5) saturate(1.2)'
                        }}
                    />
                </div>
                {/* Items Carousel */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    transition: isSpinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.3, 0.99)' : 'none',
                    transform: `translateX(${spinOffset}px)`,
                    padding: '20px 0'
                }}>
                    {carouselItems.map((item, index) => (
                        <div key={index} style={{
                            minWidth: '130px',
                            height: '160px',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '15px'
                        }}>
                            {/* Background UI button image */}
                            <img
                                src={item.rarity === 'legendary' ? 'assets/ui_button_gold.png' : 'assets/ui_button.png'}
                                alt=""
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'fill',
                                    filter: item.rarity === 'rare' ? 'hue-rotate(180deg)' : 'none',
                                    opacity: 0.9
                                }}
                            />
                            {/* Content on top */}
                            <div style={{position: 'relative', zIndex: 1}}>
                                <div style={{fontSize: '48px', marginBottom: '10px', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>{item.icon}</div>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#fff',
                                    textAlign: 'center',
                                    fontWeight: '700',
                                    fontFamily: 'monospace',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.9)'
                                }}>
                                    {item.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Spin Button or Result */}
            {!isSpinning && !showResult && (
                <button
                    onClick={startSpin}
                    style={{
                        position: 'relative',
                        padding: '20px 60px',
                        fontSize: '20px',
                        background: 'transparent',
                        border: 'none',
                        color: '#000',
                        fontWeight: '900',
                        cursor: 'default',
                        fontFamily: 'monospace',
                        letterSpacing: '2px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <img
                        src="assets/ui_button_gold.png"
                        alt=""
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'fill',
                            zIndex: -1
                        }}
                    />
                    SPIN NOW!
                </button>
            )}

            {showResult && wonItem && (
                <div style={{
                    textAlign: 'center',
                    animation: 'bounceIn 0.5s'
                }}>
                    <h3 style={{
                        color: getRarityColor(wonItem.rarity),
                        fontSize: '28px',
                        marginBottom: '20px',
                        fontFamily: 'monospace',
                        letterSpacing: '3px'
                    }}>
                        YOU WON!
                    </h3>
                    <div style={{
                        fontSize: '64px',
                        marginBottom: '15px'
                    }}>
                        {wonItem.icon}
                    </div>
                    <div style={{
                        fontSize: '20px',
                        color: '#fff',
                        marginBottom: '30px',
                        fontWeight: '700',
                        fontFamily: 'monospace'
                    }}>
                        {wonItem.name}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'relative',
                            padding: '20px 50px',
                            fontSize: '18px',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontWeight: '700',
                            cursor: 'default',
                            fontFamily: 'monospace',
                            letterSpacing: '2px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <img
                            src="assets/ui_button_green.png"
                            alt=""
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'fill',
                                zIndex: -1
                            }}
                        />
                        CONTINUE
                    </button>
                </div>
            )}

            {isSpinning && (
                <div style={{
                    color: '#D4AF37',
                    fontSize: '20px',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    letterSpacing: '3px',
                    animation: 'pulse 1s infinite'
                }}>
                    SPINNING...
                </div>
            )}

            {!isSpinning && !showResult && (
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '20px',
                        padding: '10px 30px',
                        fontSize: '16px',
                        background: 'transparent',
                        border: '2px solid #666',
                        borderRadius: '4px',
                        color: '#999',
                        cursor: 'default',
                        fontFamily: 'monospace',
                        letterSpacing: '2px'
                    }}
                >
                    CANCEL
                </button>
            )}
        </div>
    );
}

// Achievements Menu Component
function AchievementsMenu({ playerData, onBack }) {
    const [selectedAchievement, setSelectedAchievement] = React.useState(null);
    const [selectedTier, setSelectedTier] = React.useState(0); // For multi-tier achievements
    const scrollContainerRef = React.useRef(null);

    // Set initial scroll position when component mounts
    React.useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 60; // Scroll down 60px from start
        }
    }, []);

    // ESC key to go back
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (selectedAchievement) {
                    setSelectedAchievement(null);
                } else {
                    onBack();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onBack, selectedAchievement]);

    // Calculate current tier for multi-tier achievements
    const getKillTier = () => {
        const kills = playerData.totalKills;
        if (kills >= 10000) return 7;
        if (kills >= 5000) return 6;
        if (kills >= 2500) return 5;
        if (kills >= 1000) return 4;
        if (kills >= 500) return 3;
        if (kills >= 100) return 2;
        if (kills >= 1) return 1;
        return 0;
    };

    const getKillTarget = () => {
        const tier = getKillTier();
        const targets = [1, 100, 500, 1000, 2500, 5000, 10000];
        return targets[Math.min(tier, 6)];
    };

    const achievements = [
        // Multi-tier Kill Achievement
        {
            id: 'kills',
            name: 'Enemy Slayer',
            desc: `Kill enemies (Tier ${getKillTier()}/7)`,
            reward: 'Coins & Glory',
            current: playerData.totalKills,
            target: getKillTarget(),
            unlocked: playerData.totalKills >= getKillTarget(),
            tiers: [
                { target: 1, name: 'First Blood', reward: '50 coins' },
                { target: 100, name: 'Slayer', reward: '100 coins' },
                { target: 500, name: 'Destroyer', reward: '250 coins' },
                { target: 1000, name: 'Executioner', reward: '500 coins' },
                { target: 2500, name: 'Annihilator', reward: '1000 coins' },
                { target: 5000, name: 'Legendary', reward: '2000 coins' },
                { target: 10000, name: 'God of War', reward: '5000 coins' }
            ]
        },
        // Multi-tier Level Achievement
        {
            id: 'levels',
            name: 'Level Progress',
            desc: 'Reach higher levels',
            reward: 'Skill Points',
            current: 0,
            target: 10,
            unlocked: false,
            tiers: [
                { target: 10, name: 'Experienced', reward: '1 skill point' },
                { target: 25, name: 'Expert', reward: '2 skill points' },
                { target: 50, name: 'Master', reward: '5 skill points' },
                { target: 75, name: 'Grand Master', reward: '10 skill points' },
                { target: 100, name: 'Legend', reward: '20 skill points' }
            ]
        },
        // Multi-tier Survival Achievement
        {
            id: 'survival',
            name: 'Survival Time',
            desc: 'Survive longer',
            reward: 'Coins',
            current: 0,
            target: 300,
            unlocked: false,
            tiers: [
                { target: 300, name: 'Endurance', reward: '100 coins' },
                { target: 600, name: 'Survivor', reward: '200 coins' },
                { target: 1200, name: 'Immortal', reward: '500 coins' },
                { target: 1800, name: 'Eternal', reward: '1000 coins' }
            ]
        },
        // Special achievements
        { id: 'allweapons', name: 'Arsenal', desc: 'Unlock all weapons in one game', reward: '300 coins', current: 0, target: 6, unlocked: false },
        { id: 'nodamage5min', name: 'Untouchable', desc: 'Survive 5 min without damage', reward: '400 coins', current: 0, target: 1, unlocked: false },
        { id: 'ultimate10', name: 'Ultimate Master', desc: 'Use ultimate 10 times', reward: '250 coins', current: 0, target: 10, unlocked: false },
        { id: 'ultimate50', name: 'Ultimate Legend', desc: 'Use ultimate 50 times', reward: '1000 coins', current: 0, target: 50, unlocked: false },
        { id: 'collector', name: 'Coin Collector', desc: 'Collect 10000 coins total', reward: 'Special skin', current: 0, target: 10000, unlocked: false },
        { id: 'collector2', name: 'Coin Hoarder', desc: 'Collect 50000 coins total', reward: 'Epic skin', current: 0, target: 50000, unlocked: false },
        { id: 'speedrun', name: 'Speed Demon', desc: 'Reach level 20 in under 10 min', reward: '500 coins', current: 0, target: 1, unlocked: false },
        { id: 'perfectgame', name: 'Perfectionist', desc: 'Complete a game with 100% accuracy', reward: '1000 coins', current: 0, target: 1, unlocked: false }
    ];

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            padding: '40px',
            position: 'relative'
        }}>
            {/* Back button */}
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    left: '40px',
                    top: '40px',
                    width: '80px',
                    height: '80px',
                    backgroundImage: 'url(assets/WeaponSlotTestGame.png)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: 'none',
                    cursor: 'default',
                    imageRendering: 'pixelated',
                    transition: 'transform 0.15s ease, filter 0.15s ease',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: 0,
                    paddingBottom: '2px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.filter = 'brightness(1.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'brightness(1)';
                }}
            >
                ←
            </button>

            {/* Single large box with all achievements */}
            <div className="main-menu-box" style={{
                position: 'relative',
                width: '600px',
                height: '700px',
                backgroundImage: 'url(assets/MainMenuBoxGame.png)',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                border: 'none',
                borderRadius: '0',
                boxShadow: 'none',
                imageRendering: 'pixelated',
                fontFamily: '"Press Start 2P", monospace',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: '0',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}>
                <div ref={scrollContainerRef} style={{
                    position: 'absolute',
                    top: '120px',
                    left: '45px',
                    right: '45px',
                    bottom: '90px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                    paddingTop: '20px',
                    paddingBottom: '40px',
                    paddingLeft: '20px',
                    paddingRight: '30px'
                }}>
                    {/* Achievement Slots */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0px',
                        width: '80%',
                        margin: '0 auto',
                        padding: 0
                    }}>
                        {achievements.map((ach) => (
                            <button
                                key={ach.id}
                                onClick={() => setSelectedAchievement(ach)}
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    backgroundImage: 'url(assets/KNAPP1.png)',
                                    backgroundSize: '100% 100%',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    imageRendering: 'pixelated',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: '30px 35px',
                                    position: 'relative',
                                    margin: 0,
                                    marginBottom: '-80px',
                                    cursor: 'default',
                                    transition: 'transform 0.15s ease, filter 0.15s ease',
                                    fontFamily: '"Press Start 2P", monospace',
                                    gap: '20px',
                                    filter: 'brightness(1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.filter = 'brightness(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.filter = 'brightness(1)';
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.98)';
                                    e.currentTarget.style.filter = 'brightness(0.9)';
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.filter = 'brightness(1.1)';
                                }}
                            >
                                {/* Content */}
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    width: '100%'
                                }}>
                                    {/* Title */}
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: '#2a1810',
                                        textAlign: 'center',
                                        textShadow: '1px 1px 0 rgba(255,255,255,0.3)'
                                    }}>{ach.name}</div>

                                    {/* Progress Bar Container */}
                                    <div style={{
                                        width: '70%',
                                        height: '24px',
                                        backgroundColor: '#5a4530',
                                        border: '2px solid #3a2820',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
                                    }}>
                                        {/* Progress Fill */}
                                        <div style={{
                                            width: `${Math.min((ach.current / ach.target) * 100, 100)}%`,
                                            height: '100%',
                                            backgroundColor: ach.unlocked ? '#6fb880' : '#8b6f47',
                                            transition: 'width 0.3s ease',
                                            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                                        }}></div>

                                        {/* Progress Text */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            color: '#f5e6c8',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                            pointerEvents: 'none'
                                        }}>{Math.min(ach.current, ach.target)}/{ach.target}</div>
                                    </div>
                                </div>

                                {/* Checkmark */}
                                {ach.unlocked && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        fontSize: '16px',
                                        color: '#6fb880',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                    }}>✓</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedAchievement && (
                <>
                    {/* Backdrop overlay */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 999
                    }} onClick={() => {
                        setSelectedAchievement(null);
                        setSelectedTier(0);
                    }}></div>

                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '650px',
                        minHeight: '500px',
                        backgroundImage: 'url(assets/MainMenuBoxGame.png)',
                        backgroundSize: '100% 100%',
                        imageRendering: 'pixelated',
                        padding: '100px 80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '15px',
                        zIndex: 1000,
                        position: 'relative'
                    }}>
                    {/* Left Arrow (for multi-tier achievements) */}
                    {selectedAchievement.tiers && selectedTier > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTier(selectedTier - 1);
                            }}
                            style={{
                                position: 'absolute',
                                left: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '60px',
                                height: '60px',
                                fontSize: '32px',
                                backgroundColor: '#8b6f47',
                                border: '3px solid #3a2820',
                                borderRadius: '8px',
                                color: '#f5e6c8',
                                cursor: 'pointer',
                                fontFamily: '"Press Start 2P", monospace',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                e.currentTarget.style.backgroundColor = '#6fb880';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                e.currentTarget.style.backgroundColor = '#8b6f47';
                            }}
                        >←</button>
                    )}

                    {/* Right Arrow (for multi-tier achievements) */}
                    {selectedAchievement.tiers && selectedTier < selectedAchievement.tiers.length - 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTier(selectedTier + 1);
                            }}
                            style={{
                                position: 'absolute',
                                right: '20px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '60px',
                                height: '60px',
                                fontSize: '32px',
                                backgroundColor: '#8b6f47',
                                border: '3px solid #3a2820',
                                borderRadius: '8px',
                                color: '#f5e6c8',
                                cursor: 'pointer',
                                fontFamily: '"Press Start 2P", monospace',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                e.currentTarget.style.backgroundColor = '#6fb880';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                e.currentTarget.style.backgroundColor = '#8b6f47';
                            }}
                        >→</button>
                    )}

                    {(() => {
                        // Get current tier data for multi-tier achievements
                        const tierData = selectedAchievement.tiers ? selectedAchievement.tiers[selectedTier] : null;
                        const displayName = tierData ? tierData.name : selectedAchievement.name;
                        const displayDesc = tierData ? `Kill ${tierData.target} enemies (Tier ${selectedTier + 1}/${selectedAchievement.tiers.length})` : selectedAchievement.desc;
                        const displayReward = tierData ? tierData.reward : selectedAchievement.reward;
                        const displayTarget = tierData ? tierData.target : selectedAchievement.target;
                        const isUnlocked = selectedAchievement.current >= displayTarget;

                        return (
                            <>
                                {/* Icon Circle */}
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    backgroundColor: isUnlocked ? '#6fb880' : '#6b5545',
                                    border: '4px solid #3a2820',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5)'
                                }}>
                                    {/* Icon will go here later */}
                                </div>

                                {/* Title */}
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#1a1410',
                                    fontFamily: '"Press Start 2P", monospace',
                                    textAlign: 'center'
                                }}>{displayName}</div>

                                {/* Description */}
                                <div style={{
                                    fontSize: '10px',
                                    color: '#4a3830',
                                    fontFamily: '"Press Start 2P", monospace',
                                    textAlign: 'center',
                                    lineHeight: '1.6',
                                    maxWidth: '80%'
                                }}>{displayDesc}</div>

                                {/* Progress Bar */}
                                <div style={{
                                    width: '80%',
                                    height: '28px',
                                    backgroundColor: '#5a4530',
                                    border: '2px solid #3a2820',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
                                }}>
                                    <div style={{
                                        width: `${Math.min((selectedAchievement.current / displayTarget) * 100, 100)}%`,
                                        height: '100%',
                                        backgroundColor: isUnlocked ? '#6fb880' : '#8b6f47',
                                        transition: 'width 0.3s ease',
                                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                                    }}></div>

                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#f5e6c8',
                                        fontFamily: '"Press Start 2P", monospace',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                        pointerEvents: 'none'
                                    }}>{Math.min(selectedAchievement.current, displayTarget)} / {displayTarget}</div>
                                </div>

                                {/* Reward */}
                                <div style={{
                                    fontSize: '11px',
                                    color: '#D4AF37',
                                    fontWeight: 'bold',
                                    fontFamily: '"Press Start 2P", monospace',
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    padding: '8px 16px',
                                    borderRadius: '8px'
                                }}>Reward: {displayReward}</div>

                                {/* Unlocked Status */}
                                {isUnlocked && (
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#6fb880',
                                        fontWeight: 'bold',
                                        fontFamily: '"Press Start 2P", monospace',
                                        textShadow: '2px 2px 0 #2a5840'
                                    }}>UNLOCKED</div>
                                )}
                            </>
                        );
                    })()}

                    {/* Close Button */}
                    <button
                        onClick={() => {
                            setSelectedAchievement(null);
                            setSelectedTier(0);
                        }}
                        style={{
                            marginTop: '10px',
                            width: '220px',
                            height: '80px',
                            backgroundImage: 'url(assets/KNAPP1.png)',
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: 'transparent',
                            border: 'none',
                            imageRendering: 'pixelated',
                            cursor: 'default',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#2a1810',
                            fontFamily: '"Press Start 2P", monospace',
                            textShadow: '1px 1px 0 rgba(255,255,255,0.3)',
                            transition: 'transform 0.15s ease, filter 0.15s ease',
                            filter: 'brightness(1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.filter = 'brightness(1.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.filter = 'brightness(1)';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'scale(0.95)';
                            e.currentTarget.style.filter = 'brightness(0.9)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.filter = 'brightness(1.15)';
                        }}
                    >CLOSE</button>
                </div>
                </>
            )}
        </div>
    );
}

function MusicMenu({ playerData, setPlayerData, onBack }) {
    const [currentlyPlaying, setCurrentlyPlaying] = React.useState(null);

    const playTrack = (track) => {
        // Stop current track if playing
        if (window.currentMusicAudio) {
            window.currentMusicAudio.pause();
            window.currentMusicAudio = null;
        }

        if (currentlyPlaying === track.id) {
            // Stop if clicking same track
            setCurrentlyPlaying(null);
            setPlayerData({
                ...playerData,
                selectedTrack: null
            });
            return;
        }

        // Play new track
        const audio = new Audio(track.path);
        audio.volume = playerData.musicVolume;
        audio.loop = true;
        audio.play().catch(err => {
            console.error('Error playing music:', err);
        });

        window.currentMusicAudio = audio;
        setCurrentlyPlaying(track.id);
        setPlayerData({
            ...playerData,
            selectedTrack: track.id
        });
    };

    const stopAllMusic = () => {
        if (window.currentMusicAudio) {
            window.currentMusicAudio.pause();
            window.currentMusicAudio = null;
        }
        setCurrentlyPlaying(null);
        setPlayerData({
            ...playerData,
            selectedTrack: null
        });
    };

    const changeVolume = (newVolume) => {
        const volume = parseFloat(newVolume);
        setPlayerData({
            ...playerData,
            musicVolume: volume
        });

        if (window.currentMusicAudio) {
            window.currentMusicAudio.volume = volume;
        }
    };

    return (
        <div className="submenu">
            <h2>MUSIC</h2>

            <div style={{
                textAlign: 'center',
                marginBottom: '30px'
            }}>
                <div className="volume-control" style={{
                    marginBottom: '20px'
                }}>
                    <label style={{
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '14px',
                        color: '#6fb880',
                        display: 'block',
                        marginBottom: '10px'
                    }}>Volume: {Math.round(playerData.musicVolume * 100)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={playerData.musicVolume}
                        onChange={(e) => changeVolume(e.target.value)}
                        className="volume-slider"
                    />
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '20px',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {MUSIC_TRACKS && MUSIC_TRACKS.length > 0 ? (
                    MUSIC_TRACKS.map(track => (
                        <div
                            key={track.id}
                            style={{
                                background: currentlyPlaying === track.id ? '#b8a586' : 'rgba(139, 111, 71, 0.5)',
                                border: currentlyPlaying === track.id ? '4px solid #6fb880' : '4px solid #8b6f47',
                                borderRadius: '8px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                boxShadow: currentlyPlaying === track.id ? '0 4px 0 #5a4530, inset 0 2px 0 rgba(245, 230, 200, 0.3)' : '0 3px 0 #5a4530',
                                imageRendering: 'pixelated',
                                fontFamily: '"Press Start 2P", monospace',
                                cursor: 'default',
                                transition: 'transform 0.1s'
                            }}
                            onClick={() => playTrack(track)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '15px'
                            }}>🎵</div>

                            <div style={{
                                fontSize: '10px',
                                color: currentlyPlaying === track.id ? '#2a5840' : '#8b6f47',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: '8px',
                                lineHeight: '1.4'
                            }}>
                                {track.name}
                            </div>

                            <div style={{
                                fontSize: '8px',
                                color: currentlyPlaying === track.id ? '#6b5545' : '#6b5545',
                                textAlign: 'center',
                                marginBottom: '12px',
                                opacity: 0.8
                            }}>
                                {track.artist || 'Unknown'}
                            </div>

                            {currentlyPlaying === track.id && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#6fb880',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    border: '2px solid #5a4530',
                                    boxShadow: '0 2px 0 #2a1a0a'
                                }}>
                                    ▶
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '40px',
                        color: '#ccc',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '12px'
                    }}>
                        <p>No music tracks available yet.</p>
                        <p style={{marginTop: '10px'}}>Add music files to see them here!</p>
                    </div>
                )}
            </div>

            <BackButton onClick={onBack} />
        </div>
    );
}

// Render the app
ReactDOM.render(<GameUI />, document.getElementById('root'));
