import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

type BeeSpecies = 'common' | 'golden' | 'arctic' | 'obsidian' | 'rainbow';

interface Bee {
  x: number;
  y: number;
  vx: number;
  vy: number;
  species: BeeSpecies;
  role: 'forager' | 'worker' | 'queen';
  agitation: number; // 0-100
  sprite?: Phaser.GameObjects.Sprite;
}

interface Hive {
  x: number;
  y: number;
  species: BeeSpecies;
  population: number;
  health: number;
  discovered: boolean;
  harvested: boolean;
  queen?: Bee;
  sprite?: Phaser.GameObjects.Graphics;
}

interface Resource {
  type: 'honey' | 'wax' | 'royal_jelly' | 'propolis';
  amount: number;
  value: number;
}

interface BeelineTracker {
  active: boolean;
  startX: number;
  startY: number;
  targetHive?: Hive;
  trackedBee?: Bee;
  pathPoints: { x: number; y: number }[];
}

export class BeekeepingMinigame {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private active: boolean = false;

  // Hives
  private hives: Hive[] = [];
  private currentHive?: Hive;

  // Bees
  private bees: Bee[] = [];

  // Bee-lining system
  private beeline: BeelineTracker = {
    active: false,
    startX: 0,
    startY: 0,
    pathPoints: [],
  };

  // Cutout minigame state
  private cutoutActive: boolean = false;
  private smokerCharge: number = 100;
  private queenFound: boolean = false;
  private combExtracted: number = 0;
  private targetComb: number = 100;
  private beeAgitation: number = 0;

  // Resources
  private inventory: { [key: string]: number } = {
    honey: 0,
    wax: 0,
    royal_jelly: 0,
    propolis: 0,
  };

  // Breeding system
  private bredSpecies: BeeSpecies[] = ['common'];

  // Input
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private bKey?: Phaser.Input.Keyboard.Key;
  private sKey?: Phaser.Input.Keyboard.Key;
  private cKey?: Phaser.Input.Keyboard.Key;

  // UI
  private uiContainer?: Phaser.GameObjects.Container;
  private inventoryText?: Phaser.GameObjects.Text;
  private feedbackText?: Phaser.GameObjects.Text;
  private smokerBar?: Phaser.GameObjects.Graphics;
  private agitationBar?: Phaser.GameObjects.Graphics;
  private cutoutUI?: Phaser.GameObjects.Container;
  private beelineGraphics?: Phaser.GameObjects.Graphics;

  // Session stats
  private sessionHarvests: number = 0;
  private sessionValue: number = 0;
  private stingsTaken: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameStateManager.getInstance();
    this.loadInventory();
  }

  private loadInventory(): void {
    try {
      const saved = localStorage.getItem('sledhead_beekeeping');
      if (saved) {
        const data = JSON.parse(saved);
        this.inventory = data.inventory || this.inventory;
        this.bredSpecies = data.bredSpecies || this.bredSpecies;
      }
    } catch (_e) {
      console.error('Failed to load beekeeping data:', _e);
    }
  }

  private saveInventory(): void {
    try {
      const data = {
        inventory: this.inventory,
        bredSpecies: this.bredSpecies,
      };
      localStorage.setItem('sledhead_beekeeping', JSON.stringify(data));
    } catch (_e) {
      console.error('Failed to save beekeeping data:', _e);
    }
  }

  start(): void {
    this.active = true;
    this.cutoutActive = false;
    this.sessionHarvests = 0;
    this.sessionValue = 0;
    this.stingsTaken = 0;

    this.setupInput();
    this.createUI();
    this.generateHives();
    this.spawnForagerBees();
  }

  private setupInput(): void {
    this.spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.bKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.sKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.cKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.C);
  }

  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.uiContainer = this.scene.add.container(0, 0).setDepth(1000);

    // Inventory display
    this.inventoryText = this.scene.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(1001);
    this.updateInventoryText();
    this.uiContainer.add(this.inventoryText);

    // Feedback text
    this.feedbackText = this.scene.add.text(width / 2, height - 100, '', {
      fontSize: '24px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1002);
    this.uiContainer.add(this.feedbackText);

    // Beeline graphics
    this.beelineGraphics = this.scene.add.graphics().setDepth(999);

    // Instructions
    const instructions = this.scene.add.text(width / 2, height - 50,
      'B: Start Bee-lining | C: Cutout Hive | S: Use Smoker | ESC: Exit', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1001);
    this.uiContainer.add(instructions);
  }

  private generateHives(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Generate 3-5 wild hives
    const numHives = Phaser.Math.Between(3, 5);

    for (let i = 0; i < numHives; i++) {
      const species = this.getRandomSpecies();
      const hive: Hive = {
        x: Phaser.Math.Between(100, width - 100),
        y: Phaser.Math.Between(100, height - 150),
        species,
        population: Phaser.Math.Between(50, 200),
        health: 100,
        discovered: false,
        harvested: false,
      };

      // Create visual
      const graphics = this.scene.add.graphics().setDepth(900);
      const color = this.getSpeciesColor(species);

      graphics.fillStyle(color, 0.8);
      graphics.fillCircle(hive.x, hive.y, 30);
      graphics.lineStyle(3, 0x000000, 1);
      graphics.strokeCircle(hive.x, hive.y, 30);

      // Hidden until discovered
      graphics.setAlpha(0.1);

      hive.sprite = graphics;
      this.hives.push(hive);
    }
  }

  private getRandomSpecies(): BeeSpecies {
    const species: BeeSpecies[] = ['common', 'golden', 'arctic', 'obsidian', 'rainbow'];
    const weights = [0.5, 0.25, 0.15, 0.08, 0.02];

    const roll = Math.random();
    let cumulative = 0;

    for (let i = 0; i < species.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) {
        return species[i];
      }
    }

    return 'common';
  }

  private getSpeciesColor(species: BeeSpecies): number {
    const colors = {
      common: 0xffcc00,
      golden: 0xffd700,
      arctic: 0x87ceeb,
      obsidian: 0x1a1a1a,
      rainbow: 0xff69b4,
    };
    return colors[species];
  }

  private spawnForagerBees(): void {
    // Spawn forager bees from each hive
    for (const hive of this.hives) {
      const numForagers = Math.floor(hive.population / 20);

      for (let i = 0; i < numForagers; i++) {
        this.spawnBee(hive, 'forager');
      }
    }
  }

  private spawnBee(hive: Hive, role: 'forager' | 'worker' | 'queen'): Bee {
    const bee: Bee = {
      x: hive.x + Phaser.Math.Between(-50, 50),
      y: hive.y + Phaser.Math.Between(-50, 50),
      vx: Phaser.Math.FloatBetween(-2, 2),
      vy: Phaser.Math.FloatBetween(-2, 2),
      species: hive.species,
      role,
      agitation: 0,
    };

    // Create sprite
    const sprite = this.scene.add.sprite(bee.x, bee.y, '');
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });

    const color = this.getSpeciesColor(bee.species);
    graphics.fillStyle(color, 1);

    if (role === 'queen') {
      graphics.fillCircle(0, 0, 8);
      graphics.fillStyle(0xff0000, 1);
      graphics.fillCircle(0, 0, 3);
    } else {
      graphics.fillEllipse(0, 0, 6, 4);
    }

    graphics.generateTexture(`bee_${Date.now()}_${Math.random()}`, 16, 16);
    graphics.destroy();

    sprite.setTexture(`bee_${Date.now()}_${Math.random()}`);
    sprite.setDepth(950);

    bee.sprite = sprite;
    this.bees.push(bee);

    return bee;
  }

  private updateBees(delta: number): void {
    for (const bee of this.bees) {
      if (!bee.sprite) continue;

      // Forager behavior: fly to hive and back
      if (bee.role === 'forager') {
        const hive = this.hives.find(h => h.species === bee.species);
        if (hive) {
          // Random wandering with tendency toward hive
          if (Math.random() < 0.1) {
            const dx = hive.x - bee.x;
            const dy = hive.y - bee.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 200) {
              // Far from hive, go back
              bee.vx = (dx / distance) * 3;
              bee.vy = (dy / distance) * 3;
            } else {
              // Near hive, wander
              bee.vx = Phaser.Math.FloatBetween(-2, 2);
              bee.vy = Phaser.Math.FloatBetween(-2, 2);
            }
          }
        }
      }

      // Update position
      bee.x += bee.vx;
      bee.y += bee.vy;

      // Bounds
      const width = this.scene.cameras.main.width;
      const height = this.scene.cameras.main.height;

      if (bee.x < 0 || bee.x > width) bee.vx *= -1;
      if (bee.y < 0 || bee.y > height) bee.vy *= -1;

      bee.x = Math.max(0, Math.min(width, bee.x));
      bee.y = Math.max(0, Math.min(height, bee.y));

      bee.sprite.setPosition(bee.x, bee.y);

      // Agitation decay
      bee.agitation = Math.max(0, bee.agitation - delta * 0.01);
    }
  }

  private handleInput(): void {
    if (this.cutoutActive) {
      this.handleCutoutInput();
      return;
    }

    // Start bee-lining
    if (Phaser.Input.Keyboard.JustDown(this.bKey!)) {
      this.startBeelining();
    }

    // Start cutout on nearby hive
    if (Phaser.Input.Keyboard.JustDown(this.cKey!)) {
      const nearbyHive = this.findNearbyHive();
      if (nearbyHive && nearbyHive.discovered) {
        this.startCutout(nearbyHive);
      } else if (nearbyHive) {
        this.showFeedback('Hive not discovered yet! Use bee-lining first.', 0xff0000);
      }
    }
  }

  private findNearbyHive(): Hive | undefined {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const centerX = width / 2;
    const centerY = height / 2;

    return this.hives.find(hive => {
      const distance = Phaser.Math.Distance.Between(centerX, centerY, hive.x, hive.y);
      return distance < 100 && !hive.harvested;
    });
  }

  private startBeelining(): void {
    this.beeline.active = true;
    this.beeline.pathPoints = [];
    this.showFeedback('Following forager bee...', 0x00ffff);

    // Find a nearby forager
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const foragers = this.bees.filter(b => b.role === 'forager');
    let closestBee: Bee | undefined;
    let closestDist = Infinity;

    for (const bee of foragers) {
      const dist = Phaser.Math.Distance.Between(centerX, centerY, bee.x, bee.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestBee = bee;
      }
    }

    if (closestBee) {
      this.beeline.trackedBee = closestBee;
      this.beeline.startX = closestBee.x;
      this.beeline.startY = closestBee.y;
    } else {
      this.showFeedback('No forager bees nearby!', 0xff0000);
      this.beeline.active = false;
    }
  }

  private updateBeelining(): void {
    if (!this.beeline.active || !this.beeline.trackedBee) return;

    const bee = this.beeline.trackedBee;

    // Track path
    this.beeline.pathPoints.push({ x: bee.x, y: bee.y });

    // Draw path
    if (this.beelineGraphics) {
      this.beelineGraphics.clear();
      this.beelineGraphics.lineStyle(2, 0x00ffff, 0.8);

      for (let i = 1; i < this.beeline.pathPoints.length; i++) {
        const prev = this.beeline.pathPoints[i - 1];
        const curr = this.beeline.pathPoints[i];
        this.beelineGraphics.lineBetween(prev.x, prev.y, curr.x, curr.y);
      }
    }

    // Check if bee returned to hive
    for (const hive of this.hives) {
      const distance = Phaser.Math.Distance.Between(bee.x, bee.y, hive.x, hive.y);

      if (distance < 40 && this.beeline.pathPoints.length > 50) {
        // Found the hive!
        this.discoverHive(hive);
        this.beeline.active = false;
        this.beeline.trackedBee = undefined;
      }
    }
  }

  private discoverHive(hive: Hive): void {
    if (hive.discovered) return;

    hive.discovered = true;
    hive.sprite?.setAlpha(1);

    this.showFeedback(`Hive discovered! ${this.getSpeciesEmoji(hive.species)} ${hive.species.toUpperCase()}`, 0x00ff00);
    this.scene.cameras.main.flash(300, 0, 255, 0);
  }

  private getSpeciesEmoji(species: BeeSpecies): string {
    const emojis = {
      common: '🐝',
      golden: '✨🐝',
      arctic: '❄️🐝',
      obsidian: '🖤🐝',
      rainbow: '🌈🐝',
    };
    return emojis[species];
  }

  private startCutout(hive: Hive): void {
    this.cutoutActive = true;
    this.currentHive = hive;
    this.smokerCharge = 100;
    this.queenFound = false;
    this.combExtracted = 0;
    this.beeAgitation = 0;
    this.targetComb = hive.population;

    // Spawn worker bees
    for (let i = 0; i < Math.min(10, hive.population / 10); i++) {
      this.spawnBee(hive, 'worker');
    }

    // Spawn queen
    const queen = this.spawnBee(hive, 'queen');
    this.currentHive.queen = queen;

    this.createCutoutUI();
    this.showFeedback('Cutout started! Find the queen and extract comb!', 0xffaa00);
  }

  private createCutoutUI(): void {
    this.cutoutUI = this.scene.add.container(0, 0).setDepth(1001);

    // Smoker bar
    this.smokerBar = this.scene.add.graphics().setDepth(1002);

    // Agitation bar
    this.agitationBar = this.scene.add.graphics().setDepth(1002);

    // Progress text
    const centerX = this.scene.cameras.main.width / 2;
    const progressText = this.scene.add.text(centerX, 100, '', {
      fontSize: '24px',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1002);
    progressText.setName('progressText');
    this.cutoutUI.add(progressText);

    this.updateCutoutUI();
  }

  private handleCutoutInput(): void {
    if (!this.currentHive) return;

    // Use smoker
    if (Phaser.Input.Keyboard.JustDown(this.sKey!) && this.smokerCharge > 0) {
      this.useSmoker();
    }

    // Extract comb (automatic over time)
    if (this.beeAgitation < 50) {
      this.combExtracted += 0.5;
    }

    // Check for queen capture
    if (this.currentHive.queen && !this.queenFound) {
      const width = this.scene.cameras.main.width;
      const height = this.scene.cameras.main.height;
      const centerX = width / 2;
      const centerY = height / 2;

      const distance = Phaser.Math.Distance.Between(
        centerX,
        centerY,
        this.currentHive.queen.x,
        this.currentHive.queen.y
      );

      if (distance < 30 && Phaser.Input.Keyboard.JustDown(this.spaceKey!)) {
        this.captureQueen();
      }
    }

    // Bees get agitated over time
    this.beeAgitation = Math.min(100, this.beeAgitation + 0.1);

    // Stings if too agitated
    if (this.beeAgitation > 80 && Math.random() < 0.01) {
      this.takeSting();
    }

    // Check completion
    if (this.queenFound && this.combExtracted >= this.targetComb) {
      this.completeCutout();
    }

    this.updateCutoutUI();
  }

  private useSmoker(): void {
    this.smokerCharge = Math.max(0, this.smokerCharge - 20);
    this.beeAgitation = Math.max(0, this.beeAgitation - 30);

    // Calm nearby bees
    for (const bee of this.bees) {
      bee.agitation = Math.max(0, bee.agitation - 50);
    }

    this.showFeedback('💨 Smoker used! Bees calmed.', 0x00ffff);
  }

  private captureQueen(): void {
    this.queenFound = true;
    this.showFeedback('👑 Queen captured!', 0xffaa00);

    if (this.currentHive?.queen?.sprite) {
      this.scene.tweens.add({
        targets: this.currentHive.queen.sprite,
        scale: 2,
        alpha: 0,
        duration: 500,
        onComplete: () => this.currentHive?.queen?.sprite?.destroy()
      });
    }
  }

  private takeSting(): void {
    this.stingsTaken++;
    this.showFeedback('🐝 STUNG! Ouch!', 0xff0000);
    this.scene.cameras.main.shake(200, 0.01);
    this.gameState.drainStamina(5);
  }

  private completeCutout(): void {
    if (!this.currentHive) return;

    this.cutoutActive = false;
    this.currentHive.harvested = true;
    this.sessionHarvests++;

    // Calculate resources
    const resources = this.calculateHarvestResources(this.currentHive);

    for (const resource of resources) {
      this.inventory[resource.type] += resource.amount;
      this.sessionValue += resource.value;
      this.gameState.addMoney(Math.floor(resource.value));
    }

    // Breeding opportunity
    if (!this.bredSpecies.includes(this.currentHive.species)) {
      this.bredSpecies.push(this.currentHive.species);
      this.showFeedback(`New species bred: ${this.currentHive.species}!`, 0xff00ff);
    }

    this.saveInventory();
    this.showFeedback('Cutout complete! Resources harvested.', 0x00ff00);

    // Cleanup
    this.cleanupCutout();
    this.updateInventoryText();
  }

  private calculateHarvestResources(hive: Hive): Resource[] {
    const resources: Resource[] = [];

    // Honey (always)
    resources.push({
      type: 'honey',
      amount: Math.floor(hive.population / 2),
      value: hive.population / 2 * 2,
    });

    // Wax (always)
    resources.push({
      type: 'wax',
      amount: Math.floor(hive.population / 4),
      value: hive.population / 4 * 3,
    });

    // Royal jelly (if queen found)
    if (this.queenFound) {
      resources.push({
        type: 'royal_jelly',
        amount: Phaser.Math.Between(1, 3),
        value: Phaser.Math.Between(50, 150),
      });
    }

    // Propolis (rare species bonus)
    if (hive.species !== 'common') {
      resources.push({
        type: 'propolis',
        amount: Phaser.Math.Between(1, 5),
        value: Phaser.Math.Between(20, 80),
      });
    }

    return resources;
  }

  private cleanupCutout(): void {
    this.cutoutUI?.destroy();
    this.smokerBar?.destroy();
    this.agitationBar?.destroy();

    // Remove worker bees
    this.bees = this.bees.filter(bee => {
      if (bee.role === 'worker' || bee.role === 'queen') {
        bee.sprite?.destroy();
        return false;
      }
      return true;
    });

    this.currentHive = undefined;
  }

  private updateCutoutUI(): void {
    if (!this.cutoutUI) return;

    // Update smoker bar
    if (this.smokerBar) {
      this.smokerBar.clear();
      this.smokerBar.fillStyle(0x333333, 1);
      this.smokerBar.fillRect(20, 100, 200, 20);
      this.smokerBar.fillStyle(0x00ffff, 1);
      this.smokerBar.fillRect(20, 100, (this.smokerCharge / 100) * 200, 20);
      this.smokerBar.lineStyle(2, 0xffffff, 1);
      this.smokerBar.strokeRect(20, 100, 200, 20);
    }

    // Update agitation bar
    if (this.agitationBar) {
      this.agitationBar.clear();
      this.agitationBar.fillStyle(0x333333, 1);
      this.agitationBar.fillRect(20, 130, 200, 20);

      const color = this.beeAgitation > 80 ? 0xff0000 : this.beeAgitation > 50 ? 0xffaa00 : 0x00ff00;
      this.agitationBar.fillStyle(color, 1);
      this.agitationBar.fillRect(20, 130, (this.beeAgitation / 100) * 200, 20);
      this.agitationBar.lineStyle(2, 0xffffff, 1);
      this.agitationBar.strokeRect(20, 130, 200, 20);
    }

    // Update progress text
    const progressText = this.cutoutUI.getByName('progressText') as Phaser.GameObjects.Text;
    if (progressText) {
      progressText.setText(
        `Comb: ${Math.floor(this.combExtracted)}/${this.targetComb} | Queen: ${this.queenFound ? '✓' : '✗'}`
      );
    }
  }

  private updateInventoryText(): void {
    if (!this.inventoryText) return;

    this.inventoryText.setText(
      `🍯 Honey: ${this.inventory.honey} | 🕯️ Wax: ${this.inventory.wax}\n` +
      `👑 Royal Jelly: ${this.inventory.royal_jelly} | 🟤 Propolis: ${this.inventory.propolis}\n` +
      `Session: ${this.sessionHarvests} hives | $${Math.floor(this.sessionValue)}`
    );
  }

  private showFeedback(text: string, color: number): void {
    if (!this.feedbackText) return;

    this.feedbackText.setText(text);
    this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    this.feedbackText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: 2500,
      ease: 'Power2',
    });
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;

    this.handleInput();
    this.updateBees(delta);
    this.updateBeelining();
  }

  stop(): void {
    this.active = false;
    this.cutoutActive = false;

    // Cleanup
    this.bees.forEach(bee => bee.sprite?.destroy());
    this.bees = [];

    this.hives.forEach(hive => hive.sprite?.destroy());
    this.hives = [];

    this.uiContainer?.destroy();
    this.beelineGraphics?.destroy();
    this.cleanupCutout();
  }

  isActive(): boolean {
    return this.active;
  }

  getInventory(): { [key: string]: number } {
    return { ...this.inventory };
  }

  destroy(): void {
    this.stop();
  }
}
