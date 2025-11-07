// Auto-attack system
function autoAttack(currentTime) {
    // Use player.weapons if available, otherwise fall back to gameState.weapons
    const weapons = gameState.player.weapons || gameState.weapons || [];
    weapons.forEach(weapon => {
        // Skip arcane orbs - they are passive
        if (weapon.type === 'arcane') return;

        if (currentTime - weapon.lastFired > weapon.cooldown) {
            // Sword Spin - activate spinning attack
            if (weapon.type === 'sword_spin') {
                if (gameState.swordSpinAttack) {
                    gameState.swordSpinAttack.activate();
                    weapon.lastFired = currentTime;
                }
                return;
            }
            // Homing missiles - just spawn them, they find targets themselves
            if (weapon.type === 'homing_missile') {
                if (gameState.enemies.length > 0) {
                    gameState.homingMissiles.push(new HomingMissile(
                        gameState.player.x,
                        gameState.player.y,
                        weapon
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Tornado - spawn towards nearest enemy
            if (weapon.type === 'tornado') {
                if (gameState.enemies.length > 0) {
                    // Find nearest enemy for direction
                    let nearestEnemy = gameState.enemies[0];
                    let nearestDist = Infinity;
                    gameState.enemies.forEach(enemy => {
                        const dist = Math.sqrt(
                            Math.pow(enemy.x - gameState.player.x, 2) +
                            Math.pow(enemy.y - gameState.player.y, 2)
                        );
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearestEnemy = enemy;
                        }
                    });

                    gameState.tornadoes.push(new Tornado(
                        gameState.player.x,
                        gameState.player.y,
                        nearestEnemy.x,
                        nearestEnemy.y,
                        weapon
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Spinning Blade - boomerang towards nearest enemy
            if (weapon.type === 'spinning_blade') {
                if (gameState.enemies.length > 0) {
                    // Find nearest enemy for direction
                    let nearestEnemy = gameState.enemies[0];
                    let nearestDist = Infinity;
                    gameState.enemies.forEach(enemy => {
                        const dist = Math.sqrt(
                            Math.pow(enemy.x - gameState.player.x, 2) +
                            Math.pow(enemy.y - gameState.player.y, 2)
                        );
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearestEnemy = enemy;
                        }
                    });

                    gameState.spinningBlades.push(new SpinningBlade(
                        gameState.player.x,
                        gameState.player.y,
                        nearestEnemy.x,
                        nearestEnemy.y,
                        weapon
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Meteor Strike - random meteor falls from sky
            if (weapon.type === 'meteor') {
                if (gameState.enemies.length > 0) {
                    // Target random enemy or random location near enemies
                    const randomEnemy = gameState.enemies[Math.floor(Math.random() * gameState.enemies.length)];

                    gameState.meteors.push(new Meteor(
                        randomEnemy.x,
                        randomEnemy.y,
                        weapon
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Chain Lightning - jumps between enemies
            if (weapon.type === 'chain_lightning') {
                if (gameState.enemies.length > 0) {
                    gameState.chainLightnings.push(new ChainLightning(
                        gameState.player.x,
                        gameState.player.y,
                        weapon
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Spirit Wolf - summon wolf companion
            if (weapon.type === 'spirit_wolf') {
                // Max 3 wolves at a time
                if (gameState.spiritWolves.length < 3) {
                    const angle = Math.random() * Math.PI * 2;
                    const spawnDist = 50;
                    gameState.spiritWolves.push(new SpiritWolf(
                        gameState.player.x + Math.cos(angle) * spawnDist,
                        gameState.player.y + Math.sin(angle) * spawnDist,
                        weapon
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Black Hole - create gravity well
            if (weapon.type === 'black_hole') {
                if (gameState.enemies.length > 0) {
                    // Target location near enemies
                    const randomEnemy = gameState.enemies[Math.floor(Math.random() * gameState.enemies.length)];
                    gameState.blackHoles.push(new BlackHole(
                        randomEnemy.x,
                        randomEnemy.y,
                        weapon
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Poison Cloud - create toxic cloud
            if (weapon.type === 'poison_cloud') {
                if (gameState.enemies.length > 0) {
                    const randomEnemy = gameState.enemies[Math.floor(Math.random() * gameState.enemies.length)];
                    gameState.poisonClouds.push(new PoisonCloud(
                        randomEnemy.x,
                        randomEnemy.y,
                        weapon
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Crystal Shard - exploding projectile
            if (weapon.type === 'crystal_shard') {
                if (gameState.enemies.length > 0) {
                    let nearestEnemy = gameState.enemies[0];
                    let nearestDist = Infinity;
                    gameState.enemies.forEach(enemy => {
                        const dist = Math.sqrt(
                            Math.pow(enemy.x - gameState.player.x, 2) +
                            Math.pow(enemy.y - gameState.player.y, 2)
                        );
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearestEnemy = enemy;
                        }
                    });

                    gameState.crystalShards.push(new CrystalShard(
                        gameState.player.x,
                        gameState.player.y,
                        nearestEnemy.x,
                        nearestEnemy.y,
                        weapon,
                        false
                    ));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Frost Nova - freeze all nearby enemies
            if (weapon.type === 'frost_nova') {
                if (gameState.enemies.length > 0) {
                    gameState.frostNovas.push(new FrostNova(weapon));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Thunder Hammer - melee AOE
            if (weapon.type === 'thunder_hammer') {
                if (gameState.enemies.length > 0) {
                    gameState.thunderHammers.push(new ThunderHammer(weapon));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Shadow Clone - summon clone
            if (weapon.type === 'shadow_clone') {
                // Max 2 clones at a time
                if (gameState.shadowClones.length < 2) {
                    gameState.shadowClones.push(new ShadowClone(weapon));
                    weapon.lastFired = currentTime;
                }
                return;
            }

            // Regular projectile weapons - find nearest enemy
            let nearestEnemy = null;
            let nearestDist = weapon.range;

            gameState.enemies.forEach(enemy => {
                const dist = Math.sqrt(
                    Math.pow(enemy.x - gameState.player.x, 2) +
                    Math.pow(enemy.y - gameState.player.y, 2)
                );
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            });

            if (nearestEnemy) {
                gameState.projectiles.push(new Projectile(
                    gameState.player.x,
                    gameState.player.y,
                    nearestEnemy.x,
                    nearestEnemy.y,
                    weapon
                ));
                weapon.lastFired = currentTime;
            }
        }
    });
}
