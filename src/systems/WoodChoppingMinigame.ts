import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

type TreeType = 'pine' | 'oak' | 'birch' | 'maple' | 'cedar' | 'ancient';

interface Tree {
  x: number;
  y: number;
  type: TreeType;
  health: number;
  maxHealth: number;
  chopped: boolean;
  regrowthTime: number;
  regrowthProgress: number;
  sprite?: Phaser.GameObjects.Graphics;
  canopySprite?: Phaser.GameObjects.Graphics;
}

interface ChopAction {
  timestamp: number;
  perfect: boolean;
  strength: number;
}

interface Shortcut {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number; // How long shortcut lasts
  createdAt: number;
  sprite?: Phaser.GameObjects.Graphics;
}

export class WoodChoppingMinigame {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private active: boolean = false;

  // Trees
  private trees: Tree[] = [];
  private currentTree?: Tree;

  // Chopping mechanics
  private chopping: boolean = false;
  private chopActions: ChopAction[] = [];
  private rhythmBPM: number = 100;
  private lastBeatTime: number = 0;
  private perfectWindow: number = 100; // ms
  private goodWindow: number = 200; // ms
  private combo: number = 0;
  private maxCombo: number = 0;

  // Resources
  private woodInventory: { [key: string]: number } = {
    pine: 0,
    oak: 0,
    birch: 0,
    maple: 0,
    cedar: 0,
    ancient: 0,
  };

  // Shortcuts
  private shortcuts: Shortcut[] = [];

  // Environmental impact
  private totalTreesChopped: number = 0;
  private animalSpawnReduction: number = 0;

  // Input
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private eKey?: Phaser.Input.Keyboard.Key;

  // UI
  private uiContainer?: Phaser.GameObjects.Container;
  private rhythmBar?: Phaser.GameObjects.Graphics;
  private beatIndicator?: Phaser.GameObjects.Graphics;
  private healthBar?: Phaser.GameObjects.Graphics;
  private inventoryText?: Phaser.GameObjects.Text;
  private feedbackText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;
  private impactText?: Phaser.GameObjects.Text;

  // Session stats
  private sessionChops: number = 0;
  private sessionWood: number = 0;
  private sessionValue: number = 0;

  // Pete NPC integration
  private peteQuota: number = 0;
  private peteDelivered: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameStateManager.getInstance();
    this.loadWoodData();
  }

  private loadWoodData(): void {
    try {
      const saved = localStorage.getItem('sledhead_woodchopping');
      if (saved) {
        const data = JSON.parse(saved);
        this.woodInventory = data.inventory || this.woodInventory;
        this.totalTreesChopped = data.totalChopped || 0;
        this.peteQuota = data.peteQuota || 0;
        this.peteDelivered = data.peteDelivered || 0;
      }
    } catch (e) {
      console.error('Failed to load wood data:', e);
    }
  }

  private saveWoodData(): void {
    try {
      const data = {
        inventory: this.woodInventory,
        totalChopped: this.totalTreesChopped,
        peteQuota: this.peteQuota,
        peteDelivered: this.peteDelivered,
      };
      localStorage.setItem('sledhead_woodchopping', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save wood data:', e);
    }
  }

  start(): void {
    this.active = true;
    this.chopping = false;
    this.combo = 0;
    this.maxCombo = 0;
    this.sessionChops = 0;
    this.sessionWood = 0;
    this.sessionValue = 0;
    this.chopActions = [];

    this.setupInput();
    this.createUI();
    this.generateTrees();
    this.loadShortcuts();
    this.calculateEnvironmentalImpact();
  }

  private setupInput(): void {
    this.spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.eKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.uiContainer = this.scene.add.container(0, 0).setDepth(1000);

    // Rhythm bar
    this.rhythmBar = this.scene.add.graphics().setDepth(1001);

    // Beat indicator
    this.beatIndicator = this.scene.add.graphics().setDepth(1002);

    // Health bar
    this.healthBar = this.scene.add.graphics().setDepth(1001);

    // Inventory
    this.inventoryText = this.scene.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#8B4513',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(1003);
    this.updateInventoryText();
    this.uiContainer.add(this.inventoryText);

    // Combo text
    this.comboText = this.scene.add.text(width / 2, 50, '', {
      fontSize: '36px',
      color: '#ff6600',
      stroke: '#000000',
      strokeThickness: 5,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1003);
    this.uiContainer.add(this.comboText);

    // Feedback text
    this.feedbackText = this.scene.add.text(width / 2, height / 2, '', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1003);
    this.uiContainer.add(this.feedbackText);

    // Environmental impact warning
    this.impactText = this.scene.add.text(width - 20, 20, '', {
      fontSize: '16px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(1003);
    this.updateImpactText();
    this.uiContainer.add(this.impactText);

    // Instructions
    const instructions = this.scene.add.text(width / 2, height - 30,
      'E: Start Chopping | SPACE: Chop (on beat) | ESC: Exit', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1003);
    this.uiContainer.add(instructions);
  }

  private generateTrees(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Generate 15-20 trees
    const numTrees = Phaser.Math.Between(15, 20);

    for (let i = 0; i < numTrees; i++) {
      const type = this.getRandomTreeType();
      const tree: Tree = {
        x: Phaser.Math.Between(50, width - 50),
        y: Phaser.Math.Between(100, height - 100),
        type,
        health: this.getTreeHealth(type),
        maxHealth: this.getTreeHealth(type),
        chopped: false,
        regrowthTime: this.getRegrowthTime(type),
        regrowthProgress: 0,
      };

      this.createTreeSprite(tree);
      this.trees.push(tree);
    }
  }

  private getRandomTreeType(): TreeType {
    const types: TreeType[] = ['pine', 'oak', 'birch', 'maple', 'cedar', 'ancient'];
    const weights = [0.35, 0.25, 0.2, 0.1, 0.08, 0.02];

    const roll = Math.random();
    let cumulative = 0;

    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) {
        return types[i];
      }
    }

    return 'pine';
  }

  private getTreeHealth(type: TreeType): number {
    const healths = {
      pine: 100,
      oak: 150,
      birch: 80,
      maple: 120,
      cedar: 130,
      ancient: 200,
    };
    return healths[type];
  }

  private getRegrowthTime(type: TreeType): number {
    const times = {
      pine: 30000,   // 30 seconds
      oak: 60000,    // 60 seconds
      birch: 25000,  // 25 seconds
      maple: 45000,  // 45 seconds
      cedar: 50000,  // 50 seconds
      ancient: 120000, // 120 seconds
    };
    return times[type];
  }

  private getTreeColor(type: TreeType): number {
    const colors = {
      pine: 0x228B22,
      oak: 0x8B4513,
      birch: 0xF5F5DC,
      maple: 0xFF4500,
      cedar: 0x6B8E23,
      ancient: 0x4B0082,
    };
    return colors[type];
  }

  private createTreeSprite(tree: Tree): void {
    // Tree trunk
    tree.sprite = this.scene.add.graphics().setDepth(900);
    tree.sprite.fillStyle(0x8B4513, 1);
    tree.sprite.fillRect(tree.x - 10, tree.y - 40, 20, 60);

    // Tree canopy
    tree.canopySprite = this.scene.add.graphics().setDepth(901);
    const color = this.getTreeColor(tree.type);
    tree.canopySprite.fillStyle(color, 1);
    tree.canopySprite.fillCircle(tree.x, tree.y - 50, 40);

    // Ancient trees get special glow
    if (tree.type === 'ancient') {
      tree.canopySprite.lineStyle(3, 0xFFD700, 0.5);
      tree.canopySprite.strokeCircle(tree.x, tree.y - 50, 45);
    }
  }

  private findNearbyTree(): Tree | undefined {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const centerX = width / 2;
    const centerY = height / 2;

    return this.trees.find(tree => {
      if (tree.chopped) return false;
      const distance = Phaser.Math.Distance.Between(centerX, centerY, tree.x, tree.y);
      return distance < 80;
    });
  }

  private handleInput(): void {
    if (this.chopping) {
      this.handleChoppingInput();
      return;
    }

    // Start chopping
    if (Phaser.Input.Keyboard.JustDown(this.eKey!)) {
      const nearbyTree = this.findNearbyTree();
      if (nearbyTree) {
        this.startChopping(nearbyTree);
      } else {
        this.showFeedback('No tree nearby!', 0xff0000);
      }
    }
  }

  private startChopping(tree: Tree): void {
    this.chopping = true;
    this.currentTree = tree;
    this.combo = 0;
    this.chopActions = [];
    this.lastBeatTime = Date.now();

    this.showFeedback(`Chopping ${tree.type} tree... Match the rhythm!`, 0xffaa00);
  }

  private handleChoppingInput(): void {
    if (!this.currentTree) return;

    // Chop with SPACE
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey!)) {
      this.performChop();
    }

    // Update beat
    this.updateRhythmIndicator();
  }

  private performChop(): void {
    if (!this.currentTree) return;

    const now = Date.now();
    const timeSinceLastBeat = now - this.lastBeatTime;
    const beatInterval = 60000 / this.rhythmBPM;

    // Check timing
    const beatOffset = timeSinceLastBeat % beatInterval;
    const distanceFromBeat = Math.min(beatOffset, beatInterval - beatOffset);

    let perfect = false;
    let good = false;

    if (distanceFromBeat <= this.perfectWindow) {
      perfect = true;
    } else if (distanceFromBeat <= this.goodWindow) {
      good = true;
    }

    // Calculate damage
    let damage = 10;
    if (perfect) {
      damage = 20;
      this.combo++;
      this.showChopFeedback('PERFECT! 💥', 0xff00ff);
    } else if (good) {
      damage = 15;
      this.combo++;
      this.showChopFeedback('GOOD! 💪', 0x00ff00);
    } else {
      damage = 5;
      this.combo = 0;
      this.showChopFeedback('Miss...', 0xff0000);
    }

    // Combo bonus
    damage += this.combo * 2;

    // Record action
    this.chopActions.push({
      timestamp: now,
      perfect,
      strength: damage,
    });

    // Deal damage to tree
    this.currentTree.health -= damage;

    // Update UI
    this.updateComboText();
    this.updateHealthBar();

    // Screen shake
    this.scene.cameras.main.shake(100, 0.005);

    // Check if tree is felled
    if (this.currentTree.health <= 0) {
      this.fellTree();
    }
  }

  private updateRhythmIndicator(): void {
    if (!this.rhythmBar || !this.beatIndicator) return;

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    const now = Date.now();
    const beatInterval = 60000 / this.rhythmBPM;
    const timeSinceLastBeat = (now - this.lastBeatTime) % beatInterval;
    const progress = timeSinceLastBeat / beatInterval;

    // Rhythm bar
    this.rhythmBar.clear();
    this.rhythmBar.fillStyle(0x333333, 1);
    this.rhythmBar.fillRect(width / 2 - 200, height - 100, 400, 30);

    // Perfect zone
    this.rhythmBar.fillStyle(0xff00ff, 0.5);
    this.rhythmBar.fillRect(width / 2 - 30, height - 100, 60, 30);

    // Good zones
    this.rhythmBar.fillStyle(0x00ff00, 0.3);
    this.rhythmBar.fillRect(width / 2 - 60, height - 100, 30, 30);
    this.rhythmBar.fillRect(width / 2 + 30, height - 100, 30, 30);

    // Border
    this.rhythmBar.lineStyle(3, 0xffffff, 1);
    this.rhythmBar.strokeRect(width / 2 - 200, height - 100, 400, 30);

    // Beat indicator
    this.beatIndicator.clear();
    const indicatorX = width / 2 - 200 + (progress * 400);
    this.beatIndicator.fillStyle(0xffff00, 1);
    this.beatIndicator.fillRect(indicatorX - 3, height - 105, 6, 40);
  }

  private updateHealthBar(): void {
    if (!this.healthBar || !this.currentTree) return;

    const width = this.scene.cameras.main.width;

    this.healthBar.clear();

    // Background
    this.healthBar.fillStyle(0x333333, 1);
    this.healthBar.fillRect(width / 2 - 200, 100, 400, 25);

    // Health
    const healthPercent = this.currentTree.health / this.currentTree.maxHealth;
    const color = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffaa00 : 0xff0000;
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(width / 2 - 200, 100, 400 * healthPercent, 25);

    // Border
    this.healthBar.lineStyle(3, 0xffffff, 1);
    this.healthBar.strokeRect(width / 2 - 200, 100, 400, 25);
  }

  private fellTree(): void {
    if (!this.currentTree) return;

    this.chopping = false;
    this.currentTree.chopped = true;
    this.sessionChops++;
    this.totalTreesChopped++;

    // Calculate wood yield
    const baseYield = Math.floor(this.currentTree.maxHealth / 10);
    const perfectBonus = this.chopActions.filter(a => a.perfect).length * 2;
    const comboBonus = Math.floor(this.maxCombo / 2);
    const totalYield = baseYield + perfectBonus + comboBonus;

    // Award wood
    this.woodInventory[this.currentTree.type] += totalYield;
    this.sessionWood += totalYield;

    // Calculate value
    const value = this.getWoodValue(this.currentTree.type) * totalYield;
    this.sessionValue += value;
    this.gameState.addMoney(Math.floor(value));

    // Show feedback
    this.showFeedback(
      `${this.getTreeEmoji(this.currentTree.type)} Tree felled! +${totalYield} ${this.currentTree.type} wood ($${Math.floor(value)})`,
      0x00ff00
    );

    // Animate tree falling
    this.animateTreeFall(this.currentTree);

    // Create shortcut
    this.createShortcut(this.currentTree);

    // Update environmental impact
    this.calculateEnvironmentalImpact();
    this.updateInventoryText();
    this.updateImpactText();
    this.saveWoodData();

    this.currentTree = undefined;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
  }

  private getWoodValue(type: TreeType): number {
    const values = {
      pine: 5,
      oak: 10,
      birch: 7,
      maple: 12,
      cedar: 15,
      ancient: 50,
    };
    return values[type];
  }

  private getTreeEmoji(type: TreeType): string {
    const emojis = {
      pine: '🌲',
      oak: '🌳',
      birch: '🌳',
      maple: '🍁',
      cedar: '🌲',
      ancient: '🌴',
    };
    return emojis[type];
  }

  private animateTreeFall(tree: Tree): void {
    if (!tree.sprite || !tree.canopySprite) return;

    // Animate falling
    this.scene.tweens.add({
      targets: [tree.sprite, tree.canopySprite],
      angle: 90,
      x: tree.x + 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        // Leave stump
        const stump = this.scene.add.graphics().setDepth(900);
        stump.fillStyle(0x8B4513, 1);
        stump.fillCircle(tree.x, tree.y + 20, 15);
        tree.sprite = stump;
        tree.canopySprite = undefined;
      }
    });

    // Camera shake
    this.scene.cameras.main.shake(500, 0.01);
  }

  private createShortcut(tree: Tree): void {
    // Create a temporary downhill shortcut
    const height = this.scene.cameras.main.height;

    const shortcut: Shortcut = {
      startX: tree.x,
      startY: tree.y,
      endX: tree.x + Phaser.Math.Between(-100, 100),
      endY: Math.min(height, tree.y + 200),
      duration: 60000, // 60 seconds
      createdAt: Date.now(),
    };

    // Create visual
    const graphics = this.scene.add.graphics().setDepth(850);
    graphics.lineStyle(5, 0x00ff00, 0.5);
    graphics.lineBetween(shortcut.startX, shortcut.startY, shortcut.endX, shortcut.endY);
    graphics.fillStyle(0x00ff00, 0.3);
    graphics.fillCircle(shortcut.endX, shortcut.endY, 20);

    shortcut.sprite = graphics;
    this.shortcuts.push(shortcut);

    this.saveShortcuts();
    this.showFeedback('Shortcut created! ⬇️', 0x00ffff);
  }

  private loadShortcuts(): void {
    try {
      const saved = localStorage.getItem('sledhead_shortcuts');
      if (saved) {
        const data = JSON.parse(saved);
        const now = Date.now();

        // Only load shortcuts that haven't expired
        for (const shortcut of data) {
          if (now - shortcut.createdAt < shortcut.duration) {
            this.shortcuts.push(shortcut);
            // Recreate sprite
            const graphics = this.scene.add.graphics().setDepth(850);
            graphics.lineStyle(5, 0x00ff00, 0.5);
            graphics.lineBetween(shortcut.startX, shortcut.startY, shortcut.endX, shortcut.endY);
            shortcut.sprite = graphics;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load shortcuts:', e);
    }
  }

  private saveShortcuts(): void {
    try {
      localStorage.setItem('sledhead_shortcuts', JSON.stringify(this.shortcuts));
    } catch (e) {
      console.error('Failed to save shortcuts:', e);
    }
  }

  private calculateEnvironmentalImpact(): void {
    // More trees chopped = fewer animals spawn
    const choppedTrees = this.trees.filter(t => t.chopped).length;
    const totalTrees = this.trees.length;
    const deforestationPercent = choppedTrees / totalTrees;

    this.animalSpawnReduction = deforestationPercent * 0.5; // Up to 50% reduction

    // Warn if too much deforestation
    if (deforestationPercent > 0.5) {
      this.showFeedback('⚠️ Warning: Heavy deforestation reducing wildlife!', 0xff0000);
    }
  }

  private updateImpactText(): void {
    if (!this.impactText) return;

    const choppedTrees = this.trees.filter(t => t.chopped).length;
    const totalTrees = this.trees.length;
    const percent = Math.floor((choppedTrees / totalTrees) * 100);

    if (percent > 50) {
      this.impactText.setText(`⚠️ Deforestation: ${percent}%\nWildlife: -${Math.floor(this.animalSpawnReduction * 100)}%`);
      this.impactText.setColor('#ff0000');
    } else if (percent > 25) {
      this.impactText.setText(`⚠️ Trees cut: ${percent}%`);
      this.impactText.setColor('#ffaa00');
    } else {
      this.impactText.setText('');
    }
  }

  private updateInventoryText(): void {
    if (!this.inventoryText) return;

    this.inventoryText.setText(
      `🪵 Wood: Pine ${this.woodInventory.pine} | Oak ${this.woodInventory.oak} | Birch ${this.woodInventory.birch}\n` +
      `Maple ${this.woodInventory.maple} | Cedar ${this.woodInventory.cedar} | Ancient ${this.woodInventory.ancient}\n` +
      `Session: ${this.sessionChops} trees | ${this.sessionWood} wood | $${Math.floor(this.sessionValue)}`
    );
  }

  private updateComboText(): void {
    if (!this.comboText) return;

    if (this.combo > 1) {
      this.comboText.setText(`COMBO x${this.combo}! 🔥`);
      this.comboText.setAlpha(1);

      this.scene.tweens.add({
        targets: this.comboText,
        scale: { from: 1.3, to: 1 },
        duration: 200,
        ease: 'Back.easeOut',
      });
    } else {
      this.comboText.setText('');
    }
  }

  private showChopFeedback(text: string, color: number): void {
    // Create temporary text
    const width = this.scene.cameras.main.width;
    const tempText = this.scene.add.text(
      width / 2,
      300,
      text,
      {
        fontSize: '28px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        stroke: '#000000',
        strokeThickness: 5,
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(1004);

    this.scene.tweens.add({
      targets: tempText,
      y: tempText.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => tempText.destroy()
    });
  }

  private showFeedback(text: string, color: number): void {
    if (!this.feedbackText) return;

    this.feedbackText.setText(text);
    this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    this.feedbackText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 3000,
      ease: 'Power2',
    });
  }

  private updateTrees(delta: number): void {
    for (const tree of this.trees) {
      if (tree.chopped) {
        // Natural regrowth
        tree.regrowthProgress += delta;

        if (tree.regrowthProgress >= tree.regrowthTime) {
          this.regrowTree(tree);
        }
      }
    }
  }

  private regrowTree(tree: Tree): void {
    tree.chopped = false;
    tree.health = tree.maxHealth;
    tree.regrowthProgress = 0;

    // Recreate tree sprite
    this.createTreeSprite(tree);

    this.showFeedback(`${this.getTreeEmoji(tree.type)} Tree regrown!`, 0x00ff00);
    this.calculateEnvironmentalImpact();
  }

  private updateShortcuts(_delta: number): void {
    const now = Date.now();

    for (let i = this.shortcuts.length - 1; i >= 0; i--) {
      const shortcut = this.shortcuts[i];

      // Remove expired shortcuts
      if (now - shortcut.createdAt > shortcut.duration) {
        shortcut.sprite?.destroy();
        this.shortcuts.splice(i, 1);
      } else {
        // Fade out as they expire
        const remaining = shortcut.duration - (now - shortcut.createdAt);
        const alpha = Math.min(1, remaining / 10000);
        shortcut.sprite?.setAlpha(alpha);
      }
    }
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;

    this.handleInput();
    this.updateTrees(delta);
    this.updateShortcuts(delta);

    if (this.chopping) {
      this.updateRhythmIndicator();
    } else {
      // Clear rhythm UI when not chopping
      this.rhythmBar?.clear();
      this.beatIndicator?.clear();
      this.healthBar?.clear();
    }
  }

  stop(): void {
    this.active = false;
    this.chopping = false;

    // Cleanup
    this.trees.forEach(tree => {
      tree.sprite?.destroy();
      tree.canopySprite?.destroy();
    });
    this.trees = [];

    this.shortcuts.forEach(s => s.sprite?.destroy());

    this.uiContainer?.destroy();
    this.rhythmBar?.destroy();
    this.beatIndicator?.destroy();
    this.healthBar?.destroy();

    this.saveWoodData();
    this.saveShortcuts();
  }

  isActive(): boolean {
    return this.active;
  }

  getWoodInventory(): { [key: string]: number } {
    return { ...this.woodInventory };
  }

  getEnvironmentalImpact(): number {
    return this.animalSpawnReduction;
  }

  setPeteQuota(amount: number): void {
    this.peteQuota = amount;
    this.saveWoodData();
  }

  deliverToPete(amount: number): boolean {
    // Check if player has enough wood
    const totalWood = Object.values(this.woodInventory).reduce((a, b) => a + b, 0);

    if (totalWood < amount) {
      return false;
    }

    // Deduct wood (from any type)
    let remaining = amount;
    for (const type in this.woodInventory) {
      if (remaining <= 0) break;

      const available = this.woodInventory[type];
      const toTake = Math.min(available, remaining);
      this.woodInventory[type] -= toTake;
      remaining -= toTake;
    }

    this.peteDelivered += amount;
    this.saveWoodData();
    return true;
  }

  destroy(): void {
    this.stop();
  }
}
