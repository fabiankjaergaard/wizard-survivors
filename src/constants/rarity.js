// Rarity System
const RARITY = {
    COMMON: {
        name: 'Common',
        color: '#9ca3af',
        glowColor: '#6b7280',
        weight: 60, // Drop chance weight
        statMultiplier: 1.0
    },
    RARE: {
        name: 'Rare',
        color: '#3b82f6',
        glowColor: '#60a5fa',
        weight: 25,
        statMultiplier: 1.5
    },
    EPIC: {
        name: 'Epic',
        color: '#a855f7',
        glowColor: '#c084fc',
        weight: 12,
        statMultiplier: 2.0
    },
    LEGENDARY: {
        name: 'Legendary',
        color: '#f59e0b',
        glowColor: '#fbbf24',
        weight: 3,
        statMultiplier: 3.0
    }
};

// Helper function to get random rarity based on weights
function getRandomRarity() {
    const totalWeight = Object.values(RARITY).reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;

    for (const [key, rarity] of Object.entries(RARITY)) {
        random -= rarity.weight;
        if (random <= 0) {
            return { key, ...rarity };
        }
    }
    return { key: 'COMMON', ...RARITY.COMMON };
}
