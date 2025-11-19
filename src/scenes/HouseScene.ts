import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';
import { UPGRADE_COSTS } from '../types';

interface UpgradeInfo {
  key: string;
  label: string;
  description: string;
  icon: string;
}

const PERSONAL_UPGRADES: UpgradeInfo[] = [
  {
    key: 'rocketSurgery',
    label: 'Rocket Surgery',
    description: 'Boosts top speed & acceleration for faster downhill runs.',
    icon: '🚀',
  },
  {
    key: 'optimalOptics',
    label: 'Optimal Optics',
    description: 'Frees focus & boosts fan engagement for easier weaving.',
    icon: '📸',
  },
  {
    key: 'sledDurability',
    label: 'Sled Durability',
    description: 'Reinforce your sled to withstand bigger impacts.',
    icon: '🛷',
  },
  {
    key: 'fancierFootwear',
    label: 'Fancier Footwear',
    description: 'Less time climbing, more time sledding.',
    icon: '👢',
  },
  {
    key: 'attendLegDay',
    label: 'Attend Leg Day',
    description: 'Increase your max stamina for longer uphill pushes.',
    icon: '🏋️',
  },
  {
    key: 'crowdHypeman',
    label: 'Crowd Hypeman',
    description: 'Perform tricks near fans for boosts.',
    icon: '📣',
  },
  {
    key: 'crowdWeaver',
    label: 'Crowd Weaver',
    description: 'Crowds move aside more often.',
    icon: '🧍',
  },
  {
    key: 'weatherWarrior',
    label: 'Weather Warrior',
    description: 'Storms & blizzards barely slow you down.',
    icon: '🌨️',
  },
];

const MOUNTAIN_UPGRADES: UpgradeInfo[] = [
  {
    key: 'skiLifts',
    label: 'High-Speed Ski Lift',
    description: 'Ride lifts faster & attract more visitors.',
    icon: '🎿',
  },
  {
    key: 'snowmobileRentals',
    label: 'Snowmobile Rentals',
    description: 'Rent them out or ride them yourself.',
    icon: '🏍️',
  },
  {
    key: 'foodStalls',
    label: 'Food Stalls',
    description: 'Restore stamina and make money.',
    icon: '🍔',
  },
  {
    key: 'groomedTrails',
    label: 'Groomed Trails',
    description: 'Smoothed paths with boosty sections.',
    icon: '🥾',
  },
  {
    key: 'firstAidStations',
    label: 'First-Aid Stations',
    description: 'Heal and reduce collision penalties.',
    icon: '⛑️',
  },
  {
    key: 'scenicOverlooks',
    label: 'Scenic Overlooks',
    description: 'Lure tourists or use as shortcuts.',
    icon: '📷',
  },
];

export class HouseScene extends Phaser.Scene {
  private gameStateManager: GameStateManager;
  private moneyText?: Phaser.GameObjects.Text;
  private loanText?: Phaser.GameObjects.Text;
  private staminaText?: Phaser.GameObjects.Text;
  private tooltipBg?: Phaser.GameObjects.Graphics;
  private tooltipText?: Phaser.GameObjects.Text;
  private upgradeElements: Map<string, {
    button: Phaser.GameObjects.Graphics;
    zone: Phaser.GameObjects.Zone;
    levelText: Phaser.GameObjects.Text;
    costText: Phaser.GameObjects.Text;
  }> = new Map();

  constructor() {
    super({ key: 'HouseScene' });
    this.gameStateManager = GameStateManager.getInstance();
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x34495e, 0x34495e, 0x2c3e50, 0x2c3e50, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 30, 'Lodge & Upgrades', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats panel
    this.createStatsPanel(30, 70);

    // Upgrades sections
    const scrollStart = 180;
    this.createUpgradeSection(
      30,
      scrollStart,
      'Personal Upgrades',
      PERSONAL_UPGRADES,
      'personal'
    );

    this.createUpgradeSection(
      660,
      scrollStart,
      'Mountain Upgrades',
      MOUNTAIN_UPGRADES,
      'mountain'
    );

    // Action buttons at bottom
    this.createActionButtons(width, height);

    // Tooltip (initially hidden)
    this.tooltipBg = this.add.graphics();
    this.tooltipBg.setDepth(1000);
    this.tooltipBg.setVisible(false);

    this.tooltipText = this.add.text(0, 0, '', {
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 250 },
      padding: { x: 10, y: 8 },
    });
    this.tooltipText.setDepth(1001);
    this.tooltipText.setVisible(false);

    // Game stats display
    this.createGameStats(width / 2, height - 130);
  }

  private createStatsPanel(x: number, y: number): void {
    const state = this.gameStateManager.getState();

    // Panel background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x2c3e50, 0.95);
    panelBg.fillRoundedRect(x, y, 1220, 80, 10);
    panelBg.lineStyle(2, 0x3498db, 0.8);
    panelBg.strokeRoundedRect(x, y, 1220, 80, 10);

    // Money
    this.add.text(x + 20, y + 15, '💰 Money:', {
      fontSize: '20px',
      color: '#f39c12',
      fontStyle: 'bold',
    });
    this.moneyText = this.add.text(x + 20, y + 45, `$${state.money.toFixed(2)}`, {
      fontSize: '24px',
      color: '#f1c40f',
      fontStyle: 'bold',
    });

    // Loan
    this.add.text(x + 320, y + 15, '🏦 Loan:', {
      fontSize: '20px',
      color: '#e74c3c',
      fontStyle: 'bold',
    });
    this.loanText = this.add.text(x + 320, y + 45, `$${state.loan.toFixed(2)}`, {
      fontSize: '24px',
      color: '#c0392b',
      fontStyle: 'bold',
    });

    // Stamina
    this.add.text(x + 620, y + 15, '⚡ Stamina:', {
      fontSize: '20px',
      color: '#2ecc71',
      fontStyle: 'bold',
    });
    this.staminaText = this.add.text(
      x + 620,
      y + 45,
      `${state.stamina}/${state.maxStamina}`,
      {
        fontSize: '24px',
        color: '#27ae60',
        fontStyle: 'bold',
      }
    );

    // Day counter
    this.add.text(x + 920, y + 15, '📅 Day:', {
      fontSize: '20px',
      color: '#9b59b6',
      fontStyle: 'bold',
    });
    this.add.text(x + 920, y + 45, `${state.currentDay}`, {
      fontSize: '24px',
      color: '#8e44ad',
      fontStyle: 'bold',
    });
  }

  private createUpgradeSection(
    x: number,
    y: number,
    title: string,
    upgrades: UpgradeInfo[],
    category: 'personal' | 'mountain'
  ): void {
    // Section title
    this.add.text(x + 300, y, title, {
      fontSize: '26px',
      color: '#ecf0f1',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Section background
    const sectionBg = this.add.graphics();
    sectionBg.fillStyle(0x2c3e50, 0.7);
    sectionBg.fillRoundedRect(x, y + 35, 600, 420, 10);
    sectionBg.lineStyle(2, 0x34495e, 1);
    sectionBg.strokeRoundedRect(x, y + 35, 600, 420, 10);

    // Create upgrade items
    upgrades.forEach((upgrade, index) => {
      const itemY = y + 50 + index * 52;
      this.createUpgradeItem(x + 10, itemY, upgrade, category);
    });
  }

  private createUpgradeItem(
    x: number,
    y: number,
    upgrade: UpgradeInfo,
    category: 'personal' | 'mountain'
  ): void {
    const state = this.gameStateManager.getState();
    const currentLevel = this.gameStateManager.getUpgrade(category, upgrade.key);
    const costs = (UPGRADE_COSTS[category] as any)[upgrade.key] || [];
    const maxLevel = costs.length;
    const cost = currentLevel < maxLevel ? costs[currentLevel] : 0;
    const canAfford = state.money >= cost;
    const isMaxLevel = currentLevel >= maxLevel;

    // Item background
    const itemBg = this.add.graphics();
    const bgColor = isMaxLevel ? 0x27ae60 : canAfford ? 0x34495e : 0x2c3e50;
    itemBg.fillStyle(bgColor, 0.8);
    itemBg.fillRoundedRect(x, y, 580, 45, 6);

    // Icon and name
    this.add.text(x + 10, y + 12, upgrade.icon, {
      fontSize: '24px',
    });

    this.add.text(x + 50, y + 12, upgrade.label, {
      fontSize: '16px',
      color: '#ecf0f1',
      fontStyle: 'bold',
    });

    // Level indicator
    const levelText = this.add.text(
      x + 300,
      y + 12,
      `Lv ${currentLevel}/${maxLevel}`,
      {
        fontSize: '16px',
        color: '#95a5a6',
      }
    );

    // Cost or Max label
    const costText = this.add.text(
      x + 410,
      y + 12,
      isMaxLevel ? 'MAX' : `$${cost}`,
      {
        fontSize: '16px',
        color: isMaxLevel ? '#2ecc71' : canAfford ? '#f1c40f' : '#e74c3c',
        fontStyle: 'bold',
      }
    );

    // Buy button
    if (!isMaxLevel) {
      const buttonWidth = 80;
      const buttonHeight = 35;
      const buttonX = x + 490;
      const buttonY = y + 5;

      const button = this.add.graphics();
      const buttonColor = canAfford ? 0x27ae60 : 0x7f8c8d;
      button.fillStyle(buttonColor, 1);
      button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

      const buttonText = this.add.text(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, 'BUY', {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Make interactive
      const zone = this.add.zone(buttonX, buttonY, buttonWidth, buttonHeight).setOrigin(0, 0);
      zone.setInteractive({ useHandCursor: canAfford });

      // Store for updating later
      this.upgradeElements.set(`${category}_${upgrade.key}`, {
        button,
        zone,
        levelText,
        costText,
      });

      if (canAfford) {
        zone.on('pointerover', () => {
          button.clear();
          button.fillStyle(0x2ecc71, 1);
          button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
          buttonText.setScale(1.1);
        });

        zone.on('pointerout', () => {
          button.clear();
          button.fillStyle(0x27ae60, 1);
          button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
          buttonText.setScale(1);
        });

        zone.on('pointerdown', () => {
          this.purchaseUpgrade(category, upgrade.key);
        });
      }
    }

    // Tooltip on hover
    const tooltipZone = this.add.zone(x, y, 400, 45).setOrigin(0, 0);
    tooltipZone.setInteractive();

    tooltipZone.on('pointerover', () => {
      this.showTooltip(upgrade.description, tooltipZone.x + 10, tooltipZone.y + 50);
    });

    tooltipZone.on('pointerout', () => {
      this.hideTooltip();
    });
  }

  private purchaseUpgrade(category: 'personal' | 'mountain', upgradeKey: string): void {
    const currentLevel = this.gameStateManager.getUpgrade(category, upgradeKey);
    const costs = (UPGRADE_COSTS[category] as any)[upgradeKey] || [];
    const cost = costs[currentLevel];

    if (this.gameStateManager.spendMoney(cost)) {
      this.gameStateManager.upgradeItem(category, upgradeKey);

      // Update UI
      this.updateStatsDisplay();
      this.refreshUpgradeButtons();

      // Flash effect
      this.cameras.main.flash(200, 46, 204, 113, false);
    }
  }

  private updateStatsDisplay(): void {
    const state = this.gameStateManager.getState();
    this.moneyText?.setText(`$${state.money.toFixed(2)}`);
    this.loanText?.setText(`$${state.loan.toFixed(2)}`);
    this.staminaText?.setText(`${state.stamina}/${state.maxStamina}`);
  }

  private refreshUpgradeButtons(): void {
    // Recreate the entire scene to refresh all upgrade buttons
    // In a production app, you'd want to update individual elements
    this.scene.restart();
  }

  private createActionButtons(width: number, height: number): void {
    const buttonY = height - 55;
    const state = this.gameStateManager.getState();

    // Pay Loan button
    const canPayLoan = state.money >= 1000 && state.loan > 0;
    this.createActionButton(
      200,
      buttonY,
      'Pay Loan ($1000)',
      canPayLoan ? 0xe74c3c : 0x7f8c8d,
      canPayLoan,
      () => this.payLoan()
    );

    // Start Run button
    this.createActionButton(
      width / 2,
      buttonY,
      'Start Run ⛷️',
      0x2ecc71,
      true,
      () => this.startRun()
    );

    // Back to Menu button
    this.createActionButton(
      width - 200,
      buttonY,
      'Back to Menu',
      0x95a5a6,
      true,
      () => this.backToMenu()
    );
  }

  private createActionButton(
    x: number,
    y: number,
    text: string,
    color: number,
    enabled: boolean,
    callback: () => void
  ): void {
    const buttonWidth = 200;
    const buttonHeight = 45;

    const button = this.add.graphics();
    button.fillStyle(color, 1);
    button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (enabled) {
      const zone = this.add.zone(x, y, buttonWidth, buttonHeight);
      zone.setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        button.clear();
        button.fillStyle(color, 0.8);
        button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        button.lineStyle(3, 0xffffff, 0.5);
        button.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        buttonText.setScale(1.05);
      });

      zone.on('pointerout', () => {
        button.clear();
        button.fillStyle(color, 1);
        button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
        buttonText.setScale(1);
      });

      zone.on('pointerdown', () => {
        buttonText.setScale(0.95);
      });

      zone.on('pointerup', () => {
        buttonText.setScale(1.05);
        callback();
      });
    }
  }

  private payLoan(): void {
    if (this.gameStateManager.spendMoney(1000)) {
      this.gameStateManager.payLoan(1000);
      this.updateStatsDisplay();
      this.cameras.main.flash(200, 46, 204, 113, false);

      // Refresh to update button state
      this.scene.restart();
    }
  }

  private startRun(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('UphillScene');
    });
  }

  private backToMenu(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }

  private createGameStats(x: number, y: number): void {
    const stats = this.gameStateManager.getStats();

    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x2c3e50, 0.9);
    statsBg.fillRoundedRect(x - 350, y, 700, 50, 8);

    const statsText = [
      `Runs: ${stats.totalRuns}`,
      `Tricks: ${stats.totalTricks}`,
      `Photos: ${stats.totalPhotos}`,
      `Best Time: ${stats.bestTime > 0 ? stats.bestTime.toFixed(1) + 's' : 'N/A'}`,
      `Peak Alt: ${stats.highestAltitude.toFixed(0)}m`,
    ].join('  |  ');

    this.add.text(x, y + 25, statsText, {
      fontSize: '16px',
      color: '#bdc3c7',
    }).setOrigin(0.5);
  }

  private showTooltip(text: string, x: number, y: number): void {
    if (!this.tooltipBg || !this.tooltipText) return;

    this.tooltipText.setText(text);
    const bounds = this.tooltipText.getBounds();

    this.tooltipBg.clear();
    this.tooltipBg.fillStyle(0x2c3e50, 0.95);
    this.tooltipBg.fillRoundedRect(x - 5, y - 5, bounds.width + 20, bounds.height + 16, 6);
    this.tooltipBg.lineStyle(2, 0x3498db, 1);
    this.tooltipBg.strokeRoundedRect(x - 5, y - 5, bounds.width + 20, bounds.height + 16, 6);

    this.tooltipText.setPosition(x + 5, y + 3);
    this.tooltipBg.setVisible(true);
    this.tooltipText.setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltipBg?.setVisible(false);
    this.tooltipText?.setVisible(false);
  }
}
