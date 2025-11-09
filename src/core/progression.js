// XP System
function addXP(amount) {
    gameState.player.xp += amount;
    if (gameState.player.xp >= gameState.player.xpToLevel) {
        levelUp();
    }
}

function levelUp() {
    gameState.player.level++;
    gameState.player.xp = 0;
    gameState.player.xpToLevel = Math.floor(gameState.player.xpToLevel * 1.5);
    gameState.isPaused = true;

    // Check which weapons player already has
    const hasWeapon = (type) => gameState.player.weapons.some(w => w.type === type);
    const getWeapon = (type) => gameState.player.weapons.find(w => w.type === type);
    const canAddWeapon = () => gameState.player.weapons.length < gameState.player.maxWeapons;

    // Generate 3 random upgrades for React UI
    const allUpgrades = [
        { name: 'Max HP +20', desc: 'Increase maximum health', type: 'stat', apply: () => { gameState.player.maxHp += 20; gameState.player.hp += 20; } },
        { name: 'Speed +0.5', desc: 'Move faster', type: 'stat', apply: () => { gameState.player.speed += 0.5; } },
        { name: 'All Weapons Damage +5', desc: 'More damage with all weapons', type: 'stat', apply: () => { gameState.player.weapons.forEach(w => w.damage += 5); } },
        { name: 'All Weapons Speed +10%', desc: 'Attack faster with all weapons', type: 'stat', apply: () => { gameState.player.weapons.forEach(w => w.cooldown *= 0.9); } },
        { name: 'All Weapons Range +30', desc: 'Longer attack range', type: 'stat', apply: () => { gameState.player.weapons.forEach(w => w.range += 30); } },
        { name: 'Heal 50 HP', desc: 'Restore health', type: 'stat', apply: () => { gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 50); } }
    ];

    // Add XP Magnet upgrade if player doesn't have it yet
    if (!gameState.player.hasXPMagnet) {
        allUpgrades.push({
            name: 'XP Magnet',
            desc: 'Attract XP orbs automatically',
            type: 'stat',
            apply: () => { gameState.player.hasXPMagnet = true; }
        });
    }

    // Add weapon-specific upgrades for existing weapons
    gameState.player.weapons.forEach(weapon => {
        // Level up existing weapon
        allUpgrades.push({
            name: `${weapon.name} Level ${weapon.level + 1}`,
            desc: `+3 damage, -5% cooldown`,
            type: 'weapon_upgrade',
            weaponType: weapon.type,
            apply: () => {
                weapon.level++;
                weapon.damage += 3;
                weapon.cooldown *= 0.95;
            }
        });

        // Add projectile count upgrade for certain weapons
        if (['magic_missile', 'fireball', 'ice', 'homing_missile'].includes(weapon.type)) {
            if (!weapon.projectileCount) weapon.projectileCount = 1;
            if (weapon.projectileCount < 5) { // Max 5 projectiles
                allUpgrades.push({
                    name: `${weapon.name} +1 Projectile`,
                    desc: `${weapon.projectileCount + 1} ${weapon.name}s at once`,
                    type: 'weapon_upgrade',
                    weaponType: weapon.type,
                    apply: () => {
                        weapon.projectileCount++;
                    }
                });
            }
        }

        // Weapon-specific upgrades
        if (weapon.type === 'arcane' && gameState.orbitingOrbs.length < 8) {
            allUpgrades.push({
                name: 'Arcane Orb +1 Orb',
                desc: `Add 1 orb (now ${gameState.orbitingOrbs.length})`,
                type: 'weapon_upgrade',
                weaponType: weapon.type,
                apply: () => {
                    const currentCount = gameState.orbitingOrbs.length;
                    gameState.orbitingOrbs.push(new OrbitingOrb(currentCount, currentCount + 1, weapon));
                }
            });
        }

        if (weapon.type === 'fireball' && weapon.explosionRadius) {
            allUpgrades.push({
                name: 'Fireball +20 Explosion Radius',
                desc: `Bigger explosions (${weapon.explosionRadius}px)`,
                type: 'weapon_upgrade',
                weaponType: weapon.type,
                apply: () => {
                    weapon.explosionRadius += 20;
                }
            });
        }
    });

    // New weapon upgrades (only show if player can add more weapons AND doesn't have them yet)
    if (canAddWeapon() && !hasWeapon('lightning')) {
        allUpgrades.push({
            name: '⚡ Lightning Bolt',
            desc: 'Chain lightning jumps between foes',
            type: 'new_weapon',
            weaponType: 'lightning',
            apply: () => {
                gameState.player.weapons.push({
                    type: 'lightning',
                    name: 'Lightning Bolt',
                    damage: 15,
                    range: 250,
                    cooldown: 1000,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                });
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('fireball')) {
        allUpgrades.push({
            name: '🔥 Fireball',
            desc: 'Explosive fireballs hit multiple foes',
            type: 'new_weapon',
            weaponType: 'fireball',
            apply: () => {
                gameState.player.weapons.push({
                    type: 'fireball',
                    name: 'Fireball',
                    damage: 25,
                    range: 200,
                    cooldown: 1500,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0,
                    explosionRadius: 50
                });
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('ice')) {
        allUpgrades.push({
            name: 'Ice Spikes',
            desc: 'Freezing spikes slow enemies',
            type: 'new_weapon',
            weaponType: 'ice',
            apply: () => {
                gameState.player.weapons.push({
                    type: 'ice',
                    name: 'Ice Spikes',
                    damage: 12,
                    range: 180,
                    cooldown: 800,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                });
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('arcane')) {
        allUpgrades.push({
            name: '🌀 Arcane Orb',
            desc: 'Three orbiting orbs protect and damage',
            type: 'new_weapon',
            weaponType: 'arcane',
            apply: () => {
                const weapon = {
                    type: 'arcane',
                    name: 'Arcane Orb',
                    damage: 8,
                    range: 100,
                    cooldown: 100,
                    level: 1,
                    projectileCount: 3,
                    lastFired: 0
                };
                gameState.player.weapons.push(weapon);

                // Create 3 orbiting orbs
                for (let i = 0; i < 3; i++) {
                    gameState.orbitingOrbs.push(new OrbitingOrb(i, 3, weapon));
                }
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('homing_missile')) {
        allUpgrades.push({
            name: '🚀 Homing Missiles',
            desc: 'Missiles track and chase enemies',
            type: 'new_weapon',
            weaponType: 'homing_missile',
            apply: () => {
                gameState.player.weapons.push({
                    type: 'homing_missile',
                    name: 'Homing Missiles',
                    damage: 15,
                    range: 0, // Not used for missiles
                    cooldown: 800, // Fire every 0.8 seconds
                    level: 1,
                    lastFired: 0
                });
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('chain_lightning')) {
        allUpgrades.push({
            name: '⚡ Chain Lightning',
            desc: 'Lightning jumps between 5 enemies',
            type: 'new_weapon',
            weaponType: 'chain_lightning',
            apply: () => {
                gameState.player.weapons.push({
                    type: 'chain_lightning',
                    name: 'Chain Lightning',
                    damage: 20,
                    range: 200,
                    cooldown: 2000,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                });
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('ghost_wolf')) {
        allUpgrades.push({
            name: '🐺 Ghost Wolf',
            desc: 'Summon ghost wolves (max 3)',
            type: 'new_weapon',
            weaponType: 'ghost_wolf',
            apply: () => {
                gameState.player.weapons.push({
                    type: 'ghost_wolf',
                    name: 'Ghost Wolf',
                    damage: 18,
                    range: 0,
                    cooldown: 5000,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                });
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('black_hole')) {
        allUpgrades.push({
            name: 'Black Hole',
            desc: 'Gravity well pulls and damages enemies',
            type: 'new_weapon',
            weaponType: 'black_hole',
            apply: () => {
                gameState.player.weapons.push({
                    type: 'black_hole',
                    name: 'Black Hole',
                    damage: 100,
                    range: 250,
                    cooldown: 8000,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                });
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('poison_cloud')) {
        allUpgrades.push({
            name: '☠️ Poison Cloud',
            desc: 'Toxic clouds damage over time',
            type: 'new_weapon',
            weaponType: 'poison_cloud',
            apply: () => {
                const weapon = {
                    type: 'poison_cloud',
                    name: 'Poison Cloud',
                    damage: 30,
                    range: 250,
                    cooldown: 3000,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                };
                weapon.lastFired = Date.now() - weapon.cooldown; // Start ready
                gameState.player.weapons.push(weapon);
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('crystal_shard')) {
        allUpgrades.push({
            name: '💎 Crystal Shard',
            desc: 'Crystals split into fragments',
            type: 'new_weapon',
            weaponType: 'crystal_shard',
            apply: () => {
                const weapon = {
                    type: 'crystal_shard',
                    name: 'Crystal Shard',
                    damage: 20,
                    range: 300,
                    cooldown: 1500,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                };
                weapon.lastFired = Date.now() - weapon.cooldown; // Start ready
                gameState.player.weapons.push(weapon);
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('frost_nova')) {
        allUpgrades.push({
            name: '❄️ Frost Nova',
            desc: 'Freezes all nearby enemies',
            type: 'new_weapon',
            weaponType: 'frost_nova',
            apply: () => {
                const weapon = {
                    type: 'frost_nova',
                    name: 'Frost Nova',
                    damage: 40,
                    range: 200,
                    cooldown: 4000,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                };
                weapon.lastFired = Date.now() - weapon.cooldown; // Start ready
                gameState.player.weapons.push(weapon);
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('thunder_hammer')) {
        allUpgrades.push({
            name: '⚡ Thunder Hammer',
            desc: 'Melee AOE attack stuns enemies',
            type: 'new_weapon',
            weaponType: 'thunder_hammer',
            apply: () => {
                const weapon = {
                    type: 'thunder_hammer',
                    name: 'Thunder Hammer',
                    damage: 50,
                    range: 120,
                    cooldown: 3500,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                };
                weapon.lastFired = Date.now() - weapon.cooldown; // Start ready
                gameState.player.weapons.push(weapon);
            }
        });
    }

    if (canAddWeapon() && !hasWeapon('shadow_clone')) {
        allUpgrades.push({
            name: '👤 Shadow Clone',
            desc: 'Summon clones that mimic attacks',
            type: 'new_weapon',
            weaponType: 'shadow_clone',
            apply: () => {
                const weapon = {
                    type: 'shadow_clone',
                    name: 'Shadow Clone',
                    damage: 15,
                    range: 0,
                    cooldown: 15000,
                    level: 1,
                    projectileCount: 1,
                    lastFired: 0
                };
                weapon.lastFired = Date.now() - weapon.cooldown; // Start ready
                gameState.player.weapons.push(weapon);
            }
        });
    }

    // Select 3 unique upgrades and assign rarities
    const selectedUpgrades = [];
    while (selectedUpgrades.length < 3 && allUpgrades.length > 0) {
        const upgrade = allUpgrades[Math.floor(Math.random() * allUpgrades.length)];
        if (!selectedUpgrades.includes(upgrade)) {
            // Assign random rarity to this upgrade
            const rarity = getRandomRarity();
            upgrade.rarity = rarity;

            // Apply rarity multiplier to stat bonuses
            if (upgrade.type === 'stat' && !upgrade.name.includes('Heal')) {
                // Create a new apply function that uses rarity multiplier
                const originalApply = upgrade.apply;
                const multiplier = rarity.statMultiplier;

                // Update description to show boosted value
                if (upgrade.name.includes('Max HP')) {
                    const baseValue = 20;
                    const boostedValue = Math.floor(baseValue * multiplier);
                    upgrade.name = `Max HP +${boostedValue}`;
                    upgrade.apply = () => {
                        gameState.player.maxHp += boostedValue;
                        gameState.player.hp += boostedValue;
                    };
                } else if (upgrade.name.includes('Speed')) {
                    const baseValue = 0.5;
                    const boostedValue = +(baseValue * multiplier).toFixed(1);
                    upgrade.name = `Speed +${boostedValue}`;
                    upgrade.apply = () => {
                        gameState.player.speed += boostedValue;
                    };
                } else if (upgrade.name.includes('All Weapons Damage')) {
                    const baseValue = 5;
                    const boostedValue = Math.floor(baseValue * multiplier);
                    upgrade.name = `All Weapons Damage +${boostedValue}`;
                    upgrade.apply = () => {
                        gameState.player.weapons.forEach(w => w.damage += boostedValue);
                    };
                } else if (upgrade.name.includes('All Weapons Range')) {
                    const baseValue = 30;
                    const boostedValue = Math.floor(baseValue * multiplier);
                    upgrade.name = `All Weapons Range +${boostedValue}`;
                    upgrade.apply = () => {
                        gameState.player.weapons.forEach(w => w.range += boostedValue);
                    };
                } else if (upgrade.name.includes('weapon_upgrade') || upgrade.name.includes('Level')) {
                    // Weapon upgrade bonuses scale with rarity
                    const baseDamage = 3;
                    const boostedDamage = Math.floor(baseDamage * multiplier);
                    if (upgrade.weaponType) {
                        const weaponName = upgrade.name.split(' Level')[0];
                        upgrade.name = `${weaponName} Level ${getWeapon(upgrade.weaponType).level + 1}`;
                        upgrade.desc = `Upgrade: +${boostedDamage} damage, -5% cooldown`;
                        upgrade.apply = () => {
                            const weapon = getWeapon(upgrade.weaponType);
                            weapon.level++;
                            weapon.damage += boostedDamage;
                            weapon.cooldown *= 0.95;
                        };
                    }
                }
            }

            selectedUpgrades.push(upgrade);
        }
    }

    // Expose upgrades to React UI
    gameState.currentUpgrades = selectedUpgrades;
    gameState.showLevelUp = true;
}

// Expose selectUpgrade to window for UI
window.selectUpgrade = function(index) {
    if (gameState.currentUpgrades && gameState.currentUpgrades[index]) {
        gameState.currentUpgrades[index].apply();
        gameState.showLevelUp = false;
        gameState.currentUpgrades = null;
        gameState.isPaused = false;
    }
};
