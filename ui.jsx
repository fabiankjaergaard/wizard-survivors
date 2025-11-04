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

// Weapon icon mapping - returns image path or text
const getWeaponIcon = (weaponType) => {
    const icons = {
        'magic_missile': { type: 'image', src: 'assets/MagicMisileGame.png' },
        'lightning': { type: 'text', value: 'LTG' },
        'fireball': { type: 'text', value: 'FIR' },
        'ice': { type: 'text', value: 'ICE' },
        'arcane': { type: 'text', value: 'ARC' },
        'homing_missile': { type: 'text', value: 'HMS' },
        'chain_lightning': { type: 'text', value: 'CLG' },
        'spirit_wolf': { type: 'text', value: 'WLF' },
        'black_hole': { type: 'text', value: 'BHO' }
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
        }, 100);

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
                magic_missile: { type: 'magic_missile', damage: 10, cooldown: 500, range: 300, lastFired: 0 },
                lightning: { type: 'lightning', damage: 15, cooldown: 1000, range: 300, lastFired: 0 },
                fireball: { type: 'fireball', damage: 25, cooldown: 1500, range: 300, explosionRadius: 50, lastFired: 0 },
                ice: { type: 'ice', damage: 12, cooldown: 800, range: 300, lastFired: 0 },
                arcane: { type: 'arcane', damage: 8, cooldown: 100, lastFired: 0 },
                homing_missile: { type: 'homing_missile', damage: 15, cooldown: 800, lastFired: 0 },
                tornado: { type: 'tornado', damage: 20, cooldown: 2000, lastFired: 0 },
                spinning_blade: { type: 'spinning_blade', damage: 18, cooldown: 1200, lastFired: 0 },
                meteor: { type: 'meteor', damage: 35, cooldown: 2500, lastFired: 0 },
                sword_spin: { type: 'sword_spin', damage: 12, cooldown: 3000, lastFired: 0 },
                chain_lightning: { type: 'chain_lightning', name: 'Chain Lightning', damage: 20, range: 200, cooldown: 2000, level: 1, lastFired: 0 },
                spirit_wolf: { type: 'spirit_wolf', name: 'Spirit Wolf', damage: 18, range: 0, cooldown: 5000, level: 1, lastFired: 0 },
                black_hole: { type: 'black_hole', name: 'Black Hole', damage: 100, range: 250, cooldown: 8000, level: 1, lastFired: 0 }
            };

            const newWeapon = weaponConfigs[weaponType];
            if (newWeapon) {
                // Check if weapon already exists
                const hasWeapon = window.gameState.player.weapons.some(w => w.type === weaponType);
                if (!hasWeapon) {
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
                    <h1 className="game-title">[GAME TITLE]</h1>

                    {currentMenuView === 'main' && (
                        <div className="menu-content">
                            <button className="menu-button primary-menu-button" onClick={startGame}>
                                PLAY GAME
                            </button>
                            <button className="menu-button" onClick={() => setCurrentMenuView('character')}>
                                GEAR
                            </button>
                            <button className="menu-button" onClick={() => setCurrentMenuView('skills')}>
                                SKILL TREE
                            </button>
                            <button className="menu-button" onClick={() => setCurrentMenuView('shop')}>
                                SHOP
                            </button>
                            <button className="menu-button" onClick={() => setCurrentMenuView('achievements')}>
                                ACHIEVEMENTS
                            </button>
                            <button className="menu-button" onClick={() => setCurrentMenuView('music')}>
                                MUSIC
                            </button>

                            <div className="player-stats-summary">
                                <div className="stat-summary-item">
                                    {playerData.coins} Coins
                                </div>
                                <div className="stat-summary-item">
                                    {playerData.skillPoints} Skill Points
                                </div>
                                <div className="stat-summary-item">
                                    {playerData.gamesPlayed} Games Played
                                </div>
                            </div>
                        </div>
                    )}

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

                    {currentMenuView === 'shop' && (
                        <ShopMenu
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

                    {/* Other Stats */}
                    <div className="stat-row">
                        <div className="stat-item">
                            <span className="stat-icon"></span>
                            <span>{gameStats.kills} Kills</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon"></span>
                            <span>{gameStats.time}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon"></span>
                            <span>{coins} Coins</span>
                        </div>
                    </div>

                    {/* Music Mute/Unmute Button */}
                    <div
                        className={`music-mute-button ${playerData.musicVolume > 0 ? 'unmuted' : 'muted'}`}
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
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            {playerData.musicVolume > 0 && (
                                <>
                                    <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </>
                            )}
                            {playerData.musicVolume === 0 && (
                                <line x1="23" y1="1" x2="1" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            )}
                        </svg>
                    </div>
                </div>

                {/* Active Weapons Display */}
                <div className="weapons-hud">
                    {window.gameState && window.gameState.player.weapons.map((weapon, index) => {
                        const cooldownPercent = ((Date.now() - weapon.lastFired) / weapon.cooldown) * 100;
                        const isReady = cooldownPercent >= 100;

                        const weaponIcon = getWeaponIcon(weapon.type);

                        return (
                            <div
                                key={index}
                                className={`weapon-slot ${isReady ? 'ready' : 'cooldown'}`}
                                style={{
                                    borderColor: isReady ? '#00ff88' : `rgba(255, 165, 0, ${Math.min(cooldownPercent / 100, 1)})`,
                                    boxShadow: isReady ? '0 0 15px rgba(0, 255, 136, 0.3)' : 'none'
                                }}
                            >
                                <div className="weapon-icon-display">
                                    {weaponIcon.type === 'image' ? (
                                        <img
                                            src={weaponIcon.src}
                                            alt={weapon.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        weaponIcon.value
                                    )}
                                </div>
                                <div className="weapon-info">
                                    <div className="weapon-name">{weapon.name}</div>
                                    <div className="weapon-level">Lv.{weapon.level}</div>
                                    {weapon.projectileCount > 1 && (
                                        <div className="weapon-projectiles">×{weapon.projectileCount}</div>
                                    )}
                                </div>
                                <div className="weapon-cooldown-bar">
                                    <div
                                        className="weapon-cooldown-fill"
                                        style={{
                                            width: `${Math.min(cooldownPercent, 100)}%`,
                                            backgroundColor: isReady ? '#00ff88' : '#ffa500'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty slots */}
                    {window.gameState && [...Array(window.gameState.player.maxWeapons - window.gameState.player.weapons.length)].map((_, index) => (
                        <div key={`empty-${index}`} className="weapon-slot empty">
                            <div className="weapon-icon-display">?</div>
                            <div className="weapon-info">
                                <div className="weapon-name">Empty Slot</div>
                            </div>
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

                        return (
                            <div
                                className="weapon-slot ultimate-slot"
                                style={{
                                    position: 'relative',
                                    background: `conic-gradient(
                                        #ec4899 0deg ${progressDegrees}deg,
                                        rgba(236, 72, 153, 0.2) ${progressDegrees}deg 360deg
                                    )`,
                                    padding: '3px',
                                    boxShadow: isReady ? '0 0 15px rgba(236, 72, 153, 0.3)' : 'none'
                                }}
                            >
                                <div style={{
                                    background: 'rgba(26, 26, 46, 0.95)',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '5px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px',
                                    position: 'relative'
                                }}>
                                    <div className="weapon-keybind" style={{ position: 'absolute', top: '2px', right: '2px' }}>R</div>
                                    <div className="weapon-icon-display ultimate-icon">
                                        {ultimateIcon.type === 'image' ? (
                                            <img
                                                src={ultimateIcon.src}
                                                alt={window.gameState.player.ultimate.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        ) : (
                                            ultimateIcon.value
                                        )}
                                    </div>
                                    <div className="weapon-info">
                                        <div className="weapon-name">{window.gameState.player.ultimate.name}</div>
                                    </div>
                                </div>
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

                {/* Level Up Screen */}
                {showLevelUp && (
                    <div className="modal-overlay">
                        <div className="modal level-up-modal">
                            <h2>Level Up!</h2>
                            <div className="upgrade-options">
                                {upgrades.map((upgrade, index) => {
                                    const rarityClass = upgrade.rarity ? `rarity-${upgrade.rarity.key.toLowerCase()}` : '';
                                    return (
                                        <div
                                            key={index}
                                            className={`upgrade-option ${rarityClass}`}
                                            onClick={() => window.selectUpgrade(index)}
                                        >
                                            <h3>
                                                {upgrade.name}
                                                {upgrade.rarity && (
                                                    <span className="upgrade-rarity-badge">
                                                        {upgrade.rarity.name.toUpperCase()}
                                                    </span>
                                                )}
                                            </h3>
                                            <p>{upgrade.desc}</p>
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

                {/* Pause Screen */}
                {showPaused && !showLevelUp && !showGameOver && !showChestPopup && !showMysteryBoxSpinner && (
                    <div className="modal-overlay">
                        <div className="modal pause-modal">
                            <h2>PAUSED</h2>
                            <p style={{color: '#ccc', textAlign: 'center', marginBottom: '20px'}}>
                                Press ESC to resume
                            </p>

                            {/* Music Selection in Pause Menu */}
                            <div className="pause-music-section">
                                <h3 style={{color: '#22c55e', fontSize: '16px', marginBottom: '15px'}}>🎵 Music</h3>
                                <div className="pause-music-volume">
                                    <label style={{color: '#ccc', fontSize: '12px', marginBottom: '8px', display: 'block'}}>
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
                                        className="volume-slider"
                                        style={{width: '100%'}}
                                    />
                                </div>
                                <div className="pause-music-tracks">
                                    {MUSIC_TRACKS.map(track => {
                                        const isPlaying = playerData.selectedTrack === track.id;
                                        return (
                                            <div
                                                key={track.id}
                                                className={`pause-music-track ${isPlaying ? 'playing' : ''}`}
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
                                            >
                                                <span>{track.name}</span>
                                                {isPlaying && <span style={{color: '#22c55e'}}>▶</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                                {playerData.selectedTrack && (
                                    <button
                                        className="stop-music-btn"
                                        onClick={() => {
                                            if (window.currentMusicAudio) {
                                                window.currentMusicAudio.pause();
                                                window.currentMusicAudio = null;
                                            }
                                            setPlayerData({...playerData, selectedTrack: null});
                                        }}
                                        style={{width: '100%', marginTop: '10px', fontSize: '10px', padding: '8px'}}
                                    >
                                        STOP MUSIC
                                    </button>
                                )}
                            </div>

                            <button
                                className="primary-button"
                                onClick={() => {
                                    if (window.gameState) {
                                        window.gameState.isPaused = false;
                                    }
                                }}
                                style={{marginBottom: '15px', marginTop: '20px'}}
                            >
                                Resume
                            </button>
                            <button
                                className="primary-button"
                                onClick={() => window.location.reload()}
                                style={{background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.8) 0%, rgba(255, 107, 129, 0.8) 100%)'}}
                            >
                                Main Menu
                            </button>
                        </div>
                    </div>
                )}

                {/* Game Over Screen */}
                {showGameOver && (
                    <div className="modal-overlay">
                        <div className="modal game-over-modal">
                            <h2>Game Over!</h2>
                            <div className="final-stats">
                                <div className="final-stat">
                                    <span>Survived</span>
                                    <strong>{gameStats.time}</strong>
                                </div>
                                <div className="final-stat">
                                    <span>Kills</span>
                                    <strong>{gameStats.kills}</strong>
                                </div>
                                <div className="final-stat">
                                    <span>Level Reached</span>
                                    <strong>{gameStats.level}</strong>
                                </div>
                            </div>
                            <button
                                className="primary-button"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Character/Gear Menu Component
function CharacterMenu({ playerData, setPlayerData, onBack }) {
    const [hoveredItem, setHoveredItem] = React.useState(null);
    const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

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
        return (
            <div
                key={slot.id}
                className={`gear-slot ${equippedItem ? 'filled' : 'empty'}`}
                style={{
                    aspectRatio: '1',
                    width: '50px',
                    border: equippedItem ? `2px solid ${equippedItem.rarity === 'legendary' ? '#FFD700' : equippedItem.rarity === 'rare' ? '#4169E1' : '#666'}` : '2px solid #555',
                    borderRadius: '4px',
                    background: equippedItem ? '#1a1a2e' : '#2a2a4a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: equippedItem ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    position: 'relative',
                    padding: '4px'
                }}
                onClick={() => equippedItem && unequipGear(slot.id)}
                onMouseEnter={(e) => equippedItem && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => equippedItem && (e.currentTarget.style.transform = 'scale(1)')}
            >
                <div style={{fontSize: '20px'}}>{equippedItem ? equippedItem.icon : slot.icon}</div>
                <div style={{fontSize: '7px', color: '#999', marginTop: '1px', fontWeight: '600', textAlign: 'center'}}>{slot.name}</div>
                {equippedItem && (
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: equippedItem.rarity === 'legendary' ? '#FFD700' :
                                   equippedItem.rarity === 'rare' ? '#4169E1' :
                                   '#808080',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#000',
                        border: '2px solid #000'
                    }}>
                        {equippedItem.rarity === 'legendary' ? 'L' : equippedItem.rarity === 'rare' ? 'R' : 'C'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="submenu gear-menu" style={{width: '100%', maxWidth: '1600px', margin: '0 auto'}}>
            <h2 style={{marginBottom: '8px', fontSize: '20px'}}>EQUIPMENT</h2>

            {/* Main Grid: Character on Left, Inventory on Right */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '20px'
            }}>
                {/* Character Sheet - LEFT SIDE */}
                <div style={{
                    background: '#2a2a4a',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '2px solid #444',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h3 style={{marginBottom: '10px', color: '#fff', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>Equipped Gear</h3>

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

                        {/* Wizard Sprite in Center */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '0 8px'
                        }}>
                            <div style={{
                                position: 'relative',
                                width: '90px',
                                height: '90px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                filter: 'drop-shadow(0 0 10px rgba(74, 157, 95, 0.6))'
                            }}>
                                <img
                                    src="assets/wizard/Idle.png"
                                    alt="Wizard"
                                    style={{
                                        width: '231px',
                                        height: '190px',
                                        objectFit: 'none',
                                        objectPosition: '0 0',
                                        transform: 'scale(0.55)',
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
                        padding: '10px',
                        background: '#1a1a2e',
                        borderRadius: '6px',
                        border: '2px solid #4a9d5f'
                    }}>
                        <h4 style={{color: '#4a9d5f', marginBottom: '6px', textAlign: 'center', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>Total Stats</h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '5px',
                            fontSize: '10px',
                            color: '#fff'
                        }}>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px'}}>
                                <span style={{color: '#999', fontSize: '8px', marginBottom: '2px'}}>Damage</span>
                                <span style={{color: '#4a9d5f', fontWeight: '700', fontSize: '12px'}}>+{totalStats.damage}</span>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px'}}>
                                <span style={{color: '#999', fontSize: '8px', marginBottom: '2px'}}>Max HP</span>
                                <span style={{color: '#4a9d5f', fontWeight: '700', fontSize: '12px'}}>+{totalStats.maxHp}</span>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px'}}>
                                <span style={{color: '#999', fontSize: '8px', marginBottom: '2px'}}>Speed</span>
                                <span style={{color: '#4a9d5f', fontWeight: '700', fontSize: '12px'}}>+{totalStats.speed.toFixed(1)}</span>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px'}}>
                                <span style={{color: '#999', fontSize: '8px', marginBottom: '2px'}}>Luck</span>
                                <span style={{color: '#4a9d5f', fontWeight: '700', fontSize: '12px'}}>+{totalStats.luck}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory - RIGHT SIDE */}
                <div style={{
                    background: '#2a2a4a',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '2px solid #444'
                }}>
                    <h3 style={{marginBottom: '10px', color: '#fff', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>Inventory ({playerData.inventory.length}/32)</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(16, 1fr)',
                        gap: '5px'
                    }}>
                        {/* Render all 32 slots (4 rows x 8 columns) */}
                        {Array.from({ length: 32 }).map((_, index) => {
                            const item = playerData.inventory[index];

                            if (item) {
                                // Filled slot with item
                                return (
                                    <div
                                        key={index}
                                        className={`inventory-item rarity-${item.rarity}`}
                                        onClick={() => equipGear(item.slot, item)}
                                        style={{
                                            aspectRatio: '1',
                                            padding: '4px',
                                            background: '#1a1a2e',
                                            border: `2px solid ${item.rarity === 'legendary' ? '#FFD700' : item.rarity === 'rare' ? '#4169E1' : '#666'}`,
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.borderColor = item.rarity === 'legendary' ? '#FFD700' : item.rarity === 'rare' ? '#6495ED' : '#999';
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
                                            setHoveredItem(item);
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.borderColor = item.rarity === 'legendary' ? '#FFD700' : item.rarity === 'rare' ? '#4169E1' : '#666';
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
                                            background: '#1a1a2e',
                                            border: '2px solid #444',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0.5
                                        }}
                                    >
                                        <div style={{fontSize: '14px', color: '#333'}}>+</div>
                                    </div>
                                );
                            }
                        })}
                </div>
            </div>
            </div>

            <button className="back-button" onClick={onBack} style={{marginTop: '20px'}}>BACK</button>

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

// Skill Tree Menu Component
function SkillTreeMenu({ playerData, setPlayerData, onBack }) {
    const skills = [
        { id: 'maxHp', name: 'Max HP', icon: 'HP', desc: '+10 HP per level', maxLevel: 10 },
        { id: 'damage', name: 'Damage', icon: 'DMG', desc: '+5% damage per level', maxLevel: 10 },
        { id: 'speed', name: 'Speed', icon: 'SPD', desc: '+3% speed per level', maxLevel: 10 },
        { id: 'xpGain', name: 'XP Gain', icon: 'XP', desc: '+10% XP per level', maxLevel: 5 },
        { id: 'luck', name: 'Luck', icon: 'LCK', desc: '+5% better drops', maxLevel: 5 }
    ];

    const upgradeSkill = (skillId) => {
        const currentLevel = playerData.skills[skillId] || 0;
        const skill = skills.find(s => s.id === skillId);

        if (playerData.skillPoints > 0 && currentLevel < skill.maxLevel) {
            setPlayerData({
                ...playerData,
                skillPoints: playerData.skillPoints - 1,
                skills: {
                    ...playerData.skills,
                    [skillId]: currentLevel + 1
                }
            });
        }
    };

    return (
        <div className="submenu">
            <h2>SKILL TREE</h2>
            <div className="skill-points-display">
                Available Points: <span className="highlight">{playerData.skillPoints}</span>
            </div>
            <div className="skills-grid">
                {skills.map(skill => {
                    const currentLevel = playerData.skills[skill.id] || 0;
                    const maxed = currentLevel >= skill.maxLevel;

                    return (
                        <div key={skill.id} className="skill-card">
                            <div className="skill-icon">{skill.icon}</div>
                            <h3>{skill.name}</h3>
                            <p>{skill.desc}</p>
                            <div className="skill-level">
                                Level: {currentLevel}/{skill.maxLevel}
                            </div>
                            <div className="skill-progress">
                                <div
                                    className="skill-progress-bar"
                                    style={{width: `${(currentLevel / skill.maxLevel) * 100}%`}}
                                />
                            </div>
                            <button
                                className="upgrade-skill-btn"
                                onClick={() => upgradeSkill(skill.id)}
                                disabled={maxed || playerData.skillPoints === 0}
                            >
                                {maxed ? 'MAXED' : 'UPGRADE'}
                            </button>
                        </div>
                    );
                })}
            </div>
            <button className="back-button" onClick={onBack}>BACK</button>
        </div>
    );
}

// Shop Menu Component
function ShopMenu({ playerData, setPlayerData, onBack }) {
    const [showMysteryBox, setShowMysteryBox] = useState(false);

    const shopItems = [
        { id: 'mysterybox', name: 'Mystery Box', icon: 'BOX', cost: 100, desc: 'Spin for random rewards!', special: true },
        { id: 'skillpoint', name: 'Skill Point', icon: 'SP', cost: 200, desc: 'Get 1 skill point' },
        { id: 'xpboost', name: 'XP Boost', icon: 'XP', cost: 150, desc: '+50% XP for next game' },
        { id: 'startweapon', name: 'Extra Start Weapon', icon: 'WPN', cost: 300, desc: 'Start with 2 weapons' },
        { id: 'goldboost', name: 'Gold Boost', icon: 'GLD', cost: 100, desc: '+50% gold for next game' },
        { id: 'revive', name: 'Revive Token', icon: 'REV', cost: 250, desc: 'Revive once when you die' }
    ];

    const buyItem = (item) => {
        if (playerData.coins >= item.cost) {
            // Special handling for mystery box
            if (item.id === 'mysterybox') {
                setPlayerData({
                    ...playerData,
                    coins: playerData.coins - item.cost
                });
                setShowMysteryBox(true);
                return;
            }

            let newPlayerData = {
                ...playerData,
                coins: playerData.coins - item.cost
            };

            // Apply item effect
            if (item.id === 'skillpoint') {
                newPlayerData.skillPoints += 1;
            } else {
                newPlayerData.shopItems = [...(playerData.shopItems || []), item.id];
            }

            setPlayerData(newPlayerData);
        }
    };

    if (showMysteryBox) {
        return (
            <MysteryBoxSpinner
                playerData={playerData}
                setPlayerData={setPlayerData}
                onClose={() => setShowMysteryBox(false)}
            />
        );
    }

    return (
        <div className="submenu">
            <h2>SHOP</h2>
            <div className="coins-display">
                Your Coins: <span className="highlight">{playerData.coins}</span>
            </div>
            <div className="shop-grid">
                {shopItems.map(item => (
                    <div key={item.id} className={`shop-item-card ${item.special ? 'special-item' : ''}`}>
                        <div className="shop-item-icon" style={{fontSize: item.special ? '48px' : '32px'}}>{item.icon}</div>
                        <h3>{item.name}</h3>
                        <p>{item.desc}</p>
                        <button
                            className="buy-button"
                            onClick={() => buyItem(item)}
                            disabled={playerData.coins < item.cost}
                            style={{
                                background: item.special ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : '',
                                border: item.special ? '3px solid #FFD700' : ''
                            }}
                        >
                            {item.special ? '🎰 ' : ''}BUY - {item.cost} 💰
                        </button>
                    </div>
                ))}
            </div>
            <button className="back-button" onClick={onBack}>BACK</button>
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
                        cursor: 'pointer',
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
                            cursor: 'pointer',
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
                        cursor: 'pointer',
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
    const achievements = [
        { id: 'firstkill', name: 'First Blood', icon: 'FB', desc: 'Kill your first enemy', reward: '50 coins', unlocked: playerData.totalKills > 0 },
        { id: 'kills100', name: 'Slayer', icon: 'SLY', desc: 'Kill 100 enemies', reward: '100 coins', unlocked: playerData.totalKills >= 100 },
        { id: 'kills500', name: 'Destroyer', icon: 'DST', desc: 'Kill 500 enemies', reward: '250 coins', unlocked: playerData.totalKills >= 500 },
        { id: 'level10', name: 'Experienced', icon: 'EXP', desc: 'Reach level 10', reward: '1 skill point', unlocked: false },
        { id: 'survive10min', name: 'Survivor', icon: 'SRV', desc: 'Survive for 10 minutes', reward: '200 coins', unlocked: false },
        { id: 'allweapons', name: 'Arsenal', icon: 'ARS', desc: 'Unlock all weapons in one game', reward: '300 coins', unlocked: false }
    ];

    return (
        <div className="submenu">
            <h2>ACHIEVEMENTS</h2>
            <div className="achievements-grid">
                {achievements.map(ach => (
                    <div key={ach.id} className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
                        <div className="achievement-icon">{ach.icon}</div>
                        <h3>{ach.name}</h3>
                        <p>{ach.desc}</p>
                        <div className="achievement-reward">
                            Reward: {ach.reward}
                        </div>
                        {ach.unlocked && <div className="unlocked-badge">UNLOCKED</div>}
                    </div>
                ))}
            </div>
            <button className="back-button" onClick={onBack}>BACK</button>
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

            <div className="music-controls">
                <div className="volume-control">
                    <label>Volume: {Math.round(playerData.musicVolume * 100)}%</label>
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
                {currentlyPlaying && (
                    <button className="stop-music-button" onClick={stopAllMusic}>
                        STOP MUSIC
                    </button>
                )}
            </div>

            <div className="music-tracks-list">
                {MUSIC_TRACKS && MUSIC_TRACKS.length > 0 ? (
                    MUSIC_TRACKS.map(track => (
                        <div
                            key={track.id}
                            className={`music-track-item ${currentlyPlaying === track.id ? 'playing' : ''}`}
                            onClick={() => playTrack(track)}
                        >
                            <div className="track-icon">🎵</div>
                            <div className="track-info">
                                <div className="track-name">{track.name}</div>
                                <div className="track-artist">{track.artist || 'Unknown Artist'}</div>
                            </div>
                            {currentlyPlaying === track.id && (
                                <div className="playing-indicator">▶ PLAYING</div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-tracks-message">
                        <p>No music tracks available yet.</p>
                        <p>Add music files to your game folder to see them here!</p>
                    </div>
                )}
            </div>

            <button className="back-button" onClick={onBack}>BACK</button>
        </div>
    );
}

// Render the app
ReactDOM.render(<GameUI />, document.getElementById('root'));
