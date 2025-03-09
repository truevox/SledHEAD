import { TWEAK } from '../game.js';

export class UpgradeSystem {
    constructor() {
        this.personalUpgrades = {
            rocketSurgery: {
                level: 0,
                maxLevel: 10,
                description: 'Speed down the mountain with red paint, sled wax, and more!\nBoosts top speed & acceleration for faster downhill runs.',
                effect: (level) => level * TWEAK._rocketSurgeryFactorPerLevel
            },
            optimalOptics: {
                level: 0,
                maxLevel: 10,
                description: 'Go from phone to GoPro/drone for better footage!\nFrees focus & boosts fan engagement for easier weaving.',
                effect: (level) => level * TWEAK._optimalOpticsAccelFactorPerLevel
            },
            sledDurability: {
                level: 0,
                maxLevel: 10,
                description: 'Reinforce your sled to withstand bigger impacts.\n+1 collision allowed before a crash occurs.',
                effect: (level) => level
            },
            fancierFootwear: {
                level: 0,
                maxLevel: 10,
                description: 'Hike faster & slip less on icy terrain.\nLess time climbing, more time sledding.',
                effect: (level) => level * TWEAK._fancierFootwearUpSpeedPerLevel
            }
        };

        this.mountainUpgrades = {
            skiLifts: {
                level: 0,
                maxLevel: 0,
                description: 'Add lifts for more visitors & bigger crowds.\nRide lifts up the mountain faster yourself.',
                effect: (level) => level
            },
            snowmobileRentals: {
                level: 0,
                maxLevel: 0,
                description: 'Rent out snowmobiles for income & new obstacles.\nYou can also rent one to speed up your ascent.',
                effect: (level) => level
            },
            eateries: {
                level: 0,
                maxLevel: 0,
                description: 'Install stands for visitors & extra cash flow.\nEating there restores your stamina.',
                effect: (level) => level
            }
        };

        this.money = TWEAK.starterCash;
    }

    canPurchaseUpgrade(upgradeType, upgradeKey) {
        const upgrade = this[upgradeType][upgradeKey];
        if (!upgrade) return false;
        
        if (upgrade.level >= upgrade.maxLevel) return false;
        
        const cost = this.getUpgradeCost(upgrade);
        return this.money >= cost;
    }

    purchaseUpgrade(upgradeType, upgradeKey) {
        if (!this.canPurchaseUpgrade(upgradeType, upgradeKey)) return false;

        const upgrade = this[upgradeType][upgradeKey];
        const cost = this.getUpgradeCost(upgrade);
        
        this.money -= cost;
        upgrade.level++;
        
        return true;
    }

    getUpgradeCost(upgrade) {
        return Math.floor(100 * Math.pow(1.1, upgrade.level + 1));
    }

    getUpgradeEffect(upgradeType, upgradeKey) {
        const upgrade = this[upgradeType][upgradeKey];
        if (!upgrade) return 0;
        
        return upgrade.effect(upgrade.level);
    }

    getMoney() {
        return this.money;
    }

    adjustMoney(amount) {
        this.money += amount;
        return this.money;
    }
}