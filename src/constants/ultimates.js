// Ultimate Abilities Database
const ULTIMATES = {
    meteor_storm: {
        type: 'meteor_storm',
        name: 'Meteor Storm',
        icon: 'MTR',
        description: 'Rain down meteors across the battlefield',
        cooldown: 60000, // 60 seconds
        duration: 8000, // 8 seconds of meteor rain
        damage: 150,
        execute: () => {
            console.log('METEOR STORM ACTIVATED!');
            gameState.player.ultimateActive = true;
            gameState.meteorStormStartTime = Date.now();
            gameState.meteorStormLastSpawn = Date.now();
        }
    },
    time_freeze: {
        type: 'time_freeze',
        name: 'Temporal Freeze',
        icon: 'TMP',
        description: 'Freeze time for all enemies',
        cooldown: 90000, // 90 seconds
        duration: 5000, // 5 seconds
        execute: () => {
            console.log('TIME FREEZE ACTIVATED!');
            gameState.player.ultimateActive = true;

            // Store original enemy speeds
            gameState.enemies.forEach(enemy => {
                enemy.frozenSpeed = enemy.speed;
                enemy.speed = 0;
                enemy.isFrozen = true;
            });

            setTimeout(() => {
                gameState.enemies.forEach(enemy => {
                    if (enemy.frozenSpeed !== undefined) {
                        enemy.speed = enemy.frozenSpeed;
                        enemy.isFrozen = false;
                    }
                });
                gameState.player.ultimateActive = false;
            }, 5000);
        }
    },
    divine_wrath: {
        type: 'divine_wrath',
        name: 'Divine Wrath',
        icon: '⚡',
        description: 'Summon lightning that chains between all enemies',
        cooldown: 75000, // 75 seconds
        damage: 200,
        execute: () => {
            console.log('⚡ DIVINE WRATH ACTIVATED!');

            if (gameState.enemies.length === 0) return;

            // Create chain lightning that hits ALL enemies
            const hitEnemies = new Set();
            let currentEnemy = gameState.enemies[0];
            hitEnemies.add(currentEnemy);

            const chainInterval = setInterval(() => {
                if (hitEnemies.size >= gameState.enemies.length) {
                    clearInterval(chainInterval);
                    return;
                }

                // Find closest unhit enemy
                let closestEnemy = null;
                let minDist = Infinity;

                gameState.enemies.forEach(enemy => {
                    if (!hitEnemies.has(enemy)) {
                        const dx = enemy.x - currentEnemy.x;
                        const dy = enemy.y - currentEnemy.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) {
                            minDist = dist;
                            closestEnemy = enemy;
                        }
                    }
                });

                if (closestEnemy) {
                    // Damage enemy
                    closestEnemy.hp -= 200;

                    // Visual lightning effect
                    gameState.chainLightnings.push({
                        startX: currentEnemy.x,
                        startY: currentEnemy.y,
                        endX: closestEnemy.x,
                        endY: closestEnemy.y,
                        duration: 300
                    });

                    hitEnemies.add(closestEnemy);
                    currentEnemy = closestEnemy;
                }
            }, 100);
        }
    },
    blood_moon: {
        type: 'blood_moon',
        name: 'Blood Moon',
        icon: '🌕',
        description: 'Gain massive damage and lifesteal',
        cooldown: 120000, // 120 seconds (2 minutes)
        duration: 10000, // 10 seconds
        damageMultiplier: 3,
        lifesteal: 0.5, // 50% lifesteal
        execute: () => {
            console.log('🌕 BLOOD MOON ACTIVATED!');
            gameState.player.ultimateActive = true;
            gameState.bloodMoonActive = true;

            setTimeout(() => {
                gameState.player.ultimateActive = false;
                gameState.bloodMoonActive = false;
            }, 10000);
        }
    },
    apocalypse: {
        type: 'apocalypse',
        name: 'Apocalypse',
        icon: '💀',
        description: 'Instantly kill all enemies on screen',
        cooldown: 180000, // 180 seconds (3 minutes)
        execute: () => {
            console.log('💀 APOCALYPSE ACTIVATED!');

            const enemiesKilled = gameState.enemies.length;

            // Kill all enemies and spawn XP orbs
            gameState.enemies.forEach(enemy => {
                // Spawn XP orb
                gameState.xpOrbs.push({
                    x: enemy.x,
                    y: enemy.y,
                    value: enemy.xpValue || 1,
                    radius: 8,
                    pulsePhase: 0
                });

                // Death particles
                for (let i = 0; i < 20; i++) {
                    const angle = (Math.PI * 2 * i) / 20;
                    gameState.particles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: Math.cos(angle) * 4,
                        vy: Math.sin(angle) * 4,
                        life: 1,
                        maxLife: 1,
                        color: '#8b5cf6',
                        size: 4
                    });
                }
            });

            gameState.enemies = [];
            gameState.kills += enemiesKilled;

            console.log(`💀 Apocalypse killed ${enemiesKilled} enemies!`);
        }
    },
    phoenix_rebirth: {
        type: 'phoenix_rebirth',
        name: 'Phoenix Rebirth',
        icon: '🔥',
        description: 'Resurrect with full HP if you die within 30s',
        cooldown: 300000, // 5 minutes
        duration: 30000, // 30 seconds protection
        rarity: 'rare', // Found in chests
        execute: () => {
            console.log('🔥 PHOENIX REBIRTH ACTIVATED!');
            gameState.phoenixRebirth = true;
            gameState.phoenixRebirthExpiry = Date.now() + 30000;

            setTimeout(() => {
                if (gameState.phoenixRebirth) {
                    gameState.phoenixRebirth = false;
                    console.log('🔥 Phoenix Rebirth expired');
                }
            }, 30000);
        }
    },
    shadow_clone: {
        type: 'shadow_clone',
        name: 'Shadow Clone',
        icon: '👥',
        description: 'Summon 3 clones that copy your attacks',
        cooldown: 90000, // 90 seconds
        duration: 15000, // 15 seconds
        rarity: 'rare',
        execute: () => {
            console.log('👥 SHADOW CLONE ACTIVATED!');
            gameState.shadowClones = [];

            // Create 3 clones around player
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 / 3) * i;
                const distance = 100;
                gameState.shadowClones.push({
                    x: gameState.player.x + Math.cos(angle) * distance,
                    y: gameState.player.y + Math.sin(angle) * distance,
                    targetX: gameState.player.x + Math.cos(angle) * distance,
                    targetY: gameState.player.y + Math.sin(angle) * distance,
                    angle: angle,
                    startTime: Date.now()
                });
            }

            setTimeout(() => {
                gameState.shadowClones = [];
                console.log('👥 Shadow Clones vanished');
            }, 15000);
        }
    },
    gravity_well: {
        type: 'gravity_well',
        name: 'Gravity Well',
        icon: '🌀',
        description: 'Pull all enemies to center and deal massive damage',
        cooldown: 120000, // 2 minutes
        rarity: 'rare',
        execute: () => {
            console.log('🌀 GRAVITY WELL ACTIVATED!');

            const centerX = gameState.player.x;
            const centerY = gameState.player.y;

            // Pull enemies and damage them
            gameState.enemies.forEach(enemy => {
                const dx = centerX - enemy.x;
                const dy = centerY - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 50) {
                    // Pull towards center
                    const pullForce = 20;
                    enemy.x += (dx / distance) * pullForce;
                    enemy.y += (dy / distance) * pullForce;
                }

                // Damage based on distance (closer = more damage)
                const damage = 300 * (1 - Math.min(distance / 500, 1));
                enemy.hp -= damage;
            });

            // Visual effect
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 300;
                gameState.particles.push({
                    x: centerX + Math.cos(angle) * distance,
                    y: centerY + Math.sin(angle) * distance,
                    vx: -Math.cos(angle) * 10,
                    vy: -Math.sin(angle) * 10,
                    size: 6,
                    color: '#00d9ff',
                    alpha: 1,
                    decay: 0.03,
                    lifetime: 60
                });
            }
        }
    },
    // Achievement-exclusive ultimates (cannot be found in chests)
    titan_form: {
        type: 'titan_form',
        name: 'Titan Form',
        icon: 'TTN',
        description: 'Become invincible and deal 10x damage',
        cooldown: 240000, // 4 minutes
        duration: 10000, // 10 seconds
        achievement: 'kill_1000_enemies', // Requires achievement
        rarity: 'legendary',
        execute: () => {
            console.log('TITAN FORM ACTIVATED!');
            gameState.titanForm = true;
            gameState.player.ultimateActive = true;

            setTimeout(() => {
                gameState.titanForm = false;
                gameState.player.ultimateActive = false;
                console.log('Titan Form ended');
            }, 10000);
        }
    },
    void_rift: {
        type: 'void_rift',
        name: 'Void Rift',
        icon: 'VRF',
        description: 'Open a rift that banishes enemies to the void',
        cooldown: 180000, // 3 minutes
        duration: 8000, // 8 seconds
        achievement: 'survive_20_minutes',
        rarity: 'legendary',
        execute: () => {
            console.log('VOID RIFT ACTIVATED!');

            gameState.voidRift = {
                x: gameState.player.x,
                y: gameState.player.y,
                radius: 0,
                maxRadius: 300,
                startTime: Date.now()
            };

            const riftInterval = setInterval(() => {
                if (!gameState.voidRift) {
                    clearInterval(riftInterval);
                    return;
                }

                // Expand rift
                gameState.voidRift.radius = Math.min(
                    gameState.voidRift.radius + 10,
                    gameState.voidRift.maxRadius
                );

                // Banish enemies in rift
                for (let i = gameState.enemies.length - 1; i >= 0; i--) {
                    const enemy = gameState.enemies[i];
                    const dx = enemy.x - gameState.voidRift.x;
                    const dy = enemy.y - gameState.voidRift.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < gameState.voidRift.radius) {
                        // Banish enemy (instant kill)
                        gameState.xpOrbs.push({
                            x: enemy.x,
                            y: enemy.y,
                            value: enemy.xpValue || 1,
                            radius: 8,
                            pulsePhase: 0
                        });
                        gameState.enemies.splice(i, 1);
                        gameState.kills++;

                        // Void particles
                        for (let j = 0; j < 10; j++) {
                            gameState.particles.push({
                                x: enemy.x,
                                y: enemy.y,
                                vx: (Math.random() - 0.5) * 5,
                                vy: (Math.random() - 0.5) * 5,
                                size: 4,
                                color: '#000000',
                                alpha: 1,
                                decay: 0.05,
                                lifetime: 30
                            });
                        }
                    }
                }
            }, 100);

            setTimeout(() => {
                clearInterval(riftInterval);
                gameState.voidRift = null;
                console.log('Void Rift closed');
            }, 8000);
        }
    },
    cosmic_storm: {
        type: 'cosmic_storm',
        name: 'Cosmic Storm',
        icon: 'CSM',
        description: 'Summon stars that orbit and obliterate enemies',
        cooldown: 150000, // 2.5 minutes
        duration: 12000, // 12 seconds
        achievement: 'kill_boss_without_damage',
        rarity: 'legendary',
        execute: () => {
            console.log('COSMIC STORM ACTIVATED!');

            gameState.cosmicStorm = {
                stars: [],
                startTime: Date.now()
            };

            // Create 8 orbiting stars
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                gameState.cosmicStorm.stars.push({
                    angle: angle,
                    radius: 150,
                    speed: 0.05,
                    damage: 200
                });
            }

            const stormInterval = setInterval(() => {
                if (!gameState.cosmicStorm) {
                    clearInterval(stormInterval);
                    return;
                }

                // Update and damage with stars
                gameState.cosmicStorm.stars.forEach(star => {
                    star.angle += star.speed;
                    const starX = gameState.player.x + Math.cos(star.angle) * star.radius;
                    const starY = gameState.player.y + Math.sin(star.angle) * star.radius;

                    // Damage nearby enemies
                    gameState.enemies.forEach(enemy => {
                        const dx = enemy.x - starX;
                        const dy = enemy.y - starY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 40) {
                            enemy.hp -= star.damage * 0.1; // Damage per tick
                        }
                    });
                });
            }, 100);

            setTimeout(() => {
                clearInterval(stormInterval);
                gameState.cosmicStorm = null;
                console.log('🌌 Cosmic Storm ended');
            }, 12000);
        }
    },
    dragons_fury: {
        type: 'dragons_fury',
        name: "Dragon's Fury",
        icon: '🐉',
        description: 'Summon a dragon that breathes fire across the battlefield',
        cooldown: 200000, // 3.3 minutes
        achievement: 'reach_level_50',
        rarity: 'legendary',
        execute: () => {
            console.log('🐉 DRAGONS FURY ACTIVATED!');

            // Dragon starts from top and sweeps fire breath
            gameState.dragonFury = {
                x: gameState.player.x - 400,
                y: gameState.player.y - 400,
                targetX: gameState.player.x + 400,
                targetY: gameState.player.y + 400,
                progress: 0,
                startTime: Date.now()
            };

            const dragonInterval = setInterval(() => {
                if (!gameState.dragonFury) {
                    clearInterval(dragonInterval);
                    return;
                }

                gameState.dragonFury.progress += 0.02;

                const dx = gameState.dragonFury.targetX - gameState.dragonFury.x;
                const dy = gameState.dragonFury.targetY - gameState.dragonFury.y;

                const currentX = gameState.dragonFury.x + dx * gameState.dragonFury.progress;
                const currentY = gameState.dragonFury.y + dy * gameState.dragonFury.progress;

                // Fire breath trail
                for (let i = 0; i < 5; i++) {
                    const offsetX = (Math.random() - 0.5) * 100;
                    const offsetY = (Math.random() - 0.5) * 100;

                    gameState.particles.push({
                        x: currentX + offsetX,
                        y: currentY + offsetY,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 0.5) * 3,
                        size: 15 + Math.random() * 10,
                        color: Math.random() > 0.5 ? '#ff4500' : '#ff8c00',
                        alpha: 1,
                        decay: 0.03,
                        lifetime: 50
                    });

                    // Damage enemies near fire
                    gameState.enemies.forEach(enemy => {
                        const dist = Math.sqrt(
                            Math.pow(enemy.x - (currentX + offsetX), 2) +
                            Math.pow(enemy.y - (currentY + offsetY), 2)
                        );

                        if (dist < 80) {
                            enemy.hp -= 50; // Massive damage
                        }
                    });
                }

                if (gameState.dragonFury.progress >= 1) {
                    clearInterval(dragonInterval);
                    gameState.dragonFury = null;
                    console.log('🐉 Dragon flew away');
                }
            }, 50);
        }
    }
};

// Expose ULTIMATES to window for UI access
window.ULTIMATES = ULTIMATES;
