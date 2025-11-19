import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

// Sled component types
export type SledSize = 'jack-jumper' | 'toboggan' | 'bobsled' | 'gravity-sledge' | 'powered-sledge';
export type SledTier = 'early' | 'mid' | 'late';
export type ComponentSlot = 'runners' | 'body' | 'front' | 'rear' | 'sideLeft' | 'sideRight';

export interface SledComponent {
  id: string;
  name: string;
  slot: ComponentSlot;
  tier: SledTier;
  description: string;

  // Stats modifiers
  weight: number;
  capacity?: number;
  speedBonus?: number;
  trickBonus?: number;
  durabilityBonus?: number;
  staminaCostModifier?: number;

  // Requirements and costs
  cost: number;
  requiredMountain?: number; // Which mountain tier unlocks this

  // Special properties
  specialEffect?: string;
}

export interface SledConfiguration {
  size: SledSize;
  runners?: SledComponent;
  body?: SledComponent;
  front?: SledComponent;
  rear?: SledComponent;
  sideLeft?: SledComponent;
  sideRight?: SledComponent;
}

export interface SledStats {
  totalWeight: number;
  totalCapacity: number;
  speedBonus: number;
  trickBonus: number;
  durability: number;
  staminaDrainRate: number;
  specialEffects: string[];
}

export class ModularSledSystem {
  private scene: Phaser.Scene;
  private gameStateManager: GameStateManager;
  private currentConfig: SledConfiguration;
  private availableComponents: SledComponent[];
  private ownedComponents: Set<string>;

  // UI elements
  private uiContainer?: Phaser.GameObjects.Container;
  private isUIVisible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameStateManager = GameStateManager.getInstance();
    this.currentConfig = this.getDefaultConfiguration();
    this.availableComponents = this.initializeComponents();
    this.ownedComponents = this.loadOwnedComponents();
  }

  private getDefaultConfiguration(): SledConfiguration {
    return {
      size: 'jack-jumper',
    };
  }

  private initializeComponents(): SledComponent[] {
    return [
      // ==================== EARLY GAME - RUNNERS ====================
      {
        id: 'birchwood-skids',
        name: 'Birchwood Skids',
        slot: 'runners',
        tier: 'early',
        description: 'Lightweight, great air, poor traction',
        weight: 5,
        speedBonus: 0.05,
        trickBonus: 0.1,
        cost: 150,
        requiredMountain: 0,
      },
      {
        id: 'steel-runners',
        name: 'Steel Runners',
        slot: 'runners',
        tier: 'early',
        description: 'Balanced grip and durability',
        weight: 8,
        speedBonus: 0,
        durabilityBonus: 1,
        cost: 200,
        requiredMountain: 0,
      },
      {
        id: 'waxed-maple-rails',
        name: 'Waxed Maple Rails',
        slot: 'runners',
        tier: 'early',
        description: 'Boosts speed on groomed trails',
        weight: 6,
        speedBonus: 0.12,
        cost: 180,
        requiredMountain: 0,
      },

      // ==================== EARLY GAME - BODY ====================
      {
        id: 'pineframe-hull',
        name: 'Pineframe Hull',
        slot: 'body',
        tier: 'early',
        description: 'Standard durability, light carry',
        weight: 12,
        capacity: 3,
        durabilityBonus: 1,
        cost: 250,
        requiredMountain: 0,
      },
      {
        id: 'hollowcore-deck',
        name: 'Hollowcore Deck',
        slot: 'body',
        tier: 'early',
        description: 'Reduces weight but fragile on impact',
        weight: 8,
        capacity: 2,
        speedBonus: 0.08,
        cost: 220,
        requiredMountain: 0,
      },
      {
        id: 'woven-bark-shell',
        name: 'Woven Bark Shell',
        slot: 'body',
        tier: 'early',
        description: 'Slightly reduces stamina cost on climb',
        weight: 10,
        capacity: 3,
        staminaCostModifier: -0.1,
        cost: 280,
        requiredMountain: 0,
      },

      // ==================== EARLY GAME - ATTACHMENTS ====================
      {
        id: 'mini-dig-kit',
        name: 'Mini Dig Kit',
        slot: 'front',
        tier: 'early',
        description: 'Small shovel & brush set for shallow treasure zones',
        weight: 3,
        specialEffect: 'treasure-detection',
        cost: 150,
        requiredMountain: 0,
      },
      {
        id: 'photo-crate',
        name: 'Photo Crate',
        slot: 'front',
        tier: 'early',
        description: 'Basic wildlife camera & lens mount',
        weight: 4,
        specialEffect: 'photo-value-boost',
        cost: 200,
        requiredMountain: 0,
      },
      {
        id: 'bee-box-jr',
        name: 'Bee Box Jr.',
        slot: 'front',
        tier: 'early',
        description: 'Compact hive box, good for early-game beekeeping',
        weight: 5,
        capacity: 1,
        specialEffect: 'beekeeping',
        cost: 175,
        requiredMountain: 0,
      },
      {
        id: 'trail-crate',
        name: 'Trail Crate',
        slot: 'rear',
        tier: 'early',
        description: 'Holds 1 extra item',
        weight: 4,
        capacity: 1,
        cost: 120,
        requiredMountain: 0,
      },
      {
        id: 'thermos-drum',
        name: 'Thermos Drum',
        slot: 'rear',
        tier: 'early',
        description: 'Provides minor stamina use reduction',
        weight: 3,
        staminaCostModifier: -0.05,
        cost: 160,
        requiredMountain: 0,
      },
      {
        id: 'sap-bag',
        name: 'Sap Bag',
        slot: 'rear',
        tier: 'early',
        description: 'Holds early-game syrup collection',
        weight: 2,
        capacity: 1,
        specialEffect: 'syrup-storage',
        cost: 100,
        requiredMountain: 0,
      },
      {
        id: 'supply-satchel',
        name: 'Supply Satchel',
        slot: 'sideLeft',
        tier: 'early',
        description: '+1 item slot',
        weight: 2,
        capacity: 1,
        cost: 100,
        requiredMountain: 0,
      },
      {
        id: 'basic-shock-pads',
        name: 'Basic Shock Pads',
        slot: 'sideRight',
        tier: 'early',
        description: 'Slightly improves trick landing control',
        weight: 3,
        trickBonus: 0.05,
        cost: 140,
        requiredMountain: 0,
      },

      // ==================== MID GAME - RUNNERS ====================
      {
        id: 'frostbite-rails',
        name: 'Frostbite Rails',
        slot: 'runners',
        tier: 'mid',
        description: 'Extra grip on ice, trick control reduced',
        weight: 10,
        speedBonus: 0.1,
        trickBonus: -0.05,
        specialEffect: 'ice-grip',
        cost: 500,
        requiredMountain: 2,
      },
      {
        id: 'sugarwax-skids',
        name: 'Sugarwax Skids',
        slot: 'runners',
        tier: 'mid',
        description: 'Boost jump height on soft terrain',
        weight: 7,
        speedBonus: 0.08,
        trickBonus: 0.15,
        cost: 550,
        requiredMountain: 2,
      },
      {
        id: 'crystal-edges',
        name: 'Crystal Edges',
        slot: 'runners',
        tier: 'mid',
        description: 'Precision sledding, fragile on landing',
        weight: 9,
        speedBonus: 0.15,
        durabilityBonus: -1,
        cost: 600,
        requiredMountain: 2,
      },

      // ==================== MID GAME - BODY ====================
      {
        id: 'plastic-composite-shell',
        name: 'Plastic Composite Shell',
        slot: 'body',
        tier: 'mid',
        description: 'Corrosion-resistant and smooth on garbage',
        weight: 14,
        capacity: 4,
        durabilityBonus: 2,
        specialEffect: 'corrosion-resist',
        cost: 700,
        requiredMountain: 2,
      },
      {
        id: 'candycar-frame',
        name: 'Candycar Frame',
        slot: 'body',
        tier: 'mid',
        description: 'Slippery but fast, themed for sweet terrain',
        weight: 11,
        capacity: 3,
        speedBonus: 0.18,
        cost: 650,
        requiredMountain: 2,
      },
      {
        id: 'dumpster-diver-deck',
        name: 'Dumpster Diver Deck',
        slot: 'body',
        tier: 'mid',
        description: 'Heavy but has bonus junk pickup radius',
        weight: 18,
        capacity: 5,
        specialEffect: 'junk-magnet',
        cost: 750,
        requiredMountain: 2,
      },

      // ==================== MID GAME - ATTACHMENTS ====================
      {
        id: 'deluxe-dig-kit',
        name: 'Deluxe Dig Kit',
        slot: 'front',
        tier: 'mid',
        description: 'Panning & pick support included',
        weight: 6,
        specialEffect: 'advanced-treasure',
        cost: 450,
        requiredMountain: 2,
      },
      {
        id: 'crane-camera-rig',
        name: 'Crane Camera Rig',
        slot: 'front',
        tier: 'mid',
        description: 'Boosts wildlife photo value and rare animal spawn',
        weight: 8,
        specialEffect: 'photo-master',
        cost: 600,
        requiredMountain: 2,
      },
      {
        id: 'weather-vane-mount',
        name: 'Weather Vane Mount',
        slot: 'front',
        tier: 'mid',
        description: 'Improves weather prediction and storm nav',
        weight: 5,
        specialEffect: 'weather-sense',
        cost: 500,
        requiredMountain: 2,
      },
      {
        id: 'coolant-tank',
        name: 'Coolant Tank',
        slot: 'rear',
        tier: 'mid',
        description: 'Slows stamina drain in hot zones',
        weight: 7,
        staminaCostModifier: -0.15,
        specialEffect: 'heat-resist',
        cost: 480,
        requiredMountain: 2,
      },
      {
        id: 'gear-caddy',
        name: 'Gear Caddy',
        slot: 'sideLeft',
        tier: 'mid',
        description: 'Organize and swap minigame kits mid-run',
        weight: 4,
        capacity: 2,
        specialEffect: 'quick-swap',
        cost: 400,
        requiredMountain: 2,
      },
      {
        id: 'stabilizer-runner',
        name: 'Stabilizer Runner',
        slot: 'sideRight',
        tier: 'mid',
        description: 'Enhance cornering at high speeds',
        weight: 5,
        speedBonus: 0.1,
        cost: 450,
        requiredMountain: 2,
      },

      // ==================== LATE GAME - RUNNERS ====================
      {
        id: 'molten-rails',
        name: 'Molten Rails',
        slot: 'runners',
        tier: 'late',
        description: 'Immune to lava, boosts downhill acceleration',
        weight: 15,
        speedBonus: 0.25,
        specialEffect: 'lava-immunity',
        cost: 2000,
        requiredMountain: 4,
      },
      {
        id: 'lunar-skids',
        name: 'Lunar Skids',
        slot: 'runners',
        tier: 'late',
        description: 'Floaty with huge airtime, bad handling on Earth',
        weight: 6,
        speedBonus: 0.15,
        trickBonus: 0.3,
        specialEffect: 'low-gravity',
        cost: 2200,
        requiredMountain: 4,
      },
      {
        id: 'cogwheel-runners',
        name: 'Cogwheel Runners',
        slot: 'runners',
        tier: 'late',
        description: 'Self-adjusting mechanical rails that grip terrain dynamically',
        weight: 12,
        speedBonus: 0.2,
        durabilityBonus: 2,
        specialEffect: 'adaptive-grip',
        cost: 2400,
        requiredMountain: 4,
      },

      // ==================== LATE GAME - BODY ====================
      {
        id: 'volcanic-alloy-core',
        name: 'Volcanic Alloy Core',
        slot: 'body',
        tier: 'late',
        description: 'Insane durability, massive weight',
        weight: 25,
        capacity: 8,
        durabilityBonus: 5,
        cost: 2500,
        requiredMountain: 4,
      },
      {
        id: 'zero-g-frame',
        name: 'Zero-G Frame',
        slot: 'body',
        tier: 'late',
        description: 'No weight cost, but no storage or defense',
        weight: 0,
        capacity: 0,
        speedBonus: 0.3,
        trickBonus: 0.2,
        cost: 2800,
        requiredMountain: 4,
      },
      {
        id: 'boilplate-chassis',
        name: 'Boilplate Chassis',
        slot: 'body',
        tier: 'late',
        description: 'Brass-plated hull with integrated gearboxes',
        weight: 20,
        capacity: 6,
        durabilityBonus: 3,
        specialEffect: 'auto-loadout',
        cost: 2700,
        requiredMountain: 4,
      },

      // ==================== LATE GAME - ATTACHMENTS ====================
      {
        id: 'plasma-dig-spade',
        name: 'Plasma Dig Spade',
        slot: 'front',
        tier: 'late',
        description: 'Cuts through crystal & magma zones',
        weight: 10,
        specialEffect: 'ultimate-treasure',
        cost: 1800,
        requiredMountain: 4,
      },
      {
        id: 'drone-rig-mount',
        name: 'Drone Rig Mount',
        slot: 'front',
        tier: 'late',
        description: 'Deploys recon sled drone for photo or scouting',
        weight: 12,
        specialEffect: 'drone-recon',
        cost: 2000,
        requiredMountain: 4,
      },
      {
        id: 'jet-fan-housing',
        name: 'Jet Fan Housing',
        slot: 'rear',
        tier: 'late',
        description: 'Trick lift boost, doubles as mid-air air brake',
        weight: 15,
        trickBonus: 0.25,
        specialEffect: 'air-brake',
        cost: 1900,
        requiredMountain: 4,
      },
      {
        id: 'energy-amplifier',
        name: 'Energy Amplifier',
        slot: 'sideLeft',
        tier: 'late',
        description: 'Boost trick multiplier thresholds',
        weight: 8,
        trickBonus: 0.2,
        specialEffect: 'combo-boost',
        cost: 1700,
        requiredMountain: 4,
      },
      {
        id: 'magnetic-catcher',
        name: 'Magnetic Catcher',
        slot: 'sideRight',
        tier: 'late',
        description: 'Auto-grab dropped treasure or gear',
        weight: 7,
        capacity: 1,
        specialEffect: 'auto-pickup',
        cost: 1600,
        requiredMountain: 4,
      },
    ];
  }

  private loadOwnedComponents(): Set<string> {
    const saved = localStorage.getItem('sledhead_owned_components');
    if (saved) {
      return new Set(JSON.parse(saved));
    }

    // Start with basic components
    return new Set([
      'birchwood-skids',
      'pineframe-hull',
      'mini-dig-kit',
      'trail-crate',
      'supply-satchel',
    ]);
  }

  private saveOwnedComponents(): void {
    localStorage.setItem('sledhead_owned_components', JSON.stringify([...this.ownedComponents]));
  }

  private saveConfiguration(): void {
    localStorage.setItem('sledhead_sled_config', JSON.stringify(this.currentConfig));
  }

  loadConfiguration(): void {
    const saved = localStorage.getItem('sledhead_sled_config');
    if (saved) {
      this.currentConfig = JSON.parse(saved);
    }
  }

  /**
   * Calculate current sled stats based on configuration
   */
  calculateStats(): SledStats {
    const stats: SledStats = {
      totalWeight: this.getSizeWeight(this.currentConfig.size),
      totalCapacity: this.getSizeCapacity(this.currentConfig.size),
      speedBonus: 0,
      trickBonus: 0,
      durability: this.getSizeDurability(this.currentConfig.size),
      staminaDrainRate: 1.0,
      specialEffects: [],
    };

    // Add stats from each component
    const slots: ComponentSlot[] = ['runners', 'body', 'front', 'rear', 'sideLeft', 'sideRight'];

    for (const slot of slots) {
      const component = this.currentConfig[slot];
      if (component) {
        stats.totalWeight += component.weight;
        stats.totalCapacity += component.capacity || 0;
        stats.speedBonus += component.speedBonus || 0;
        stats.trickBonus += component.trickBonus || 0;
        stats.durability += component.durabilityBonus || 0;
        stats.staminaDrainRate *= (1 + (component.staminaCostModifier || 0));

        if (component.specialEffect) {
          stats.specialEffects.push(component.specialEffect);
        }
      }
    }

    // Apply NewGame+ bonuses
    const state = this.gameStateManager.getState();
    if (state.newGamePlus.active) {
      stats.speedBonus += state.newGamePlus.bonuses.speed;
      stats.trickBonus += state.newGamePlus.bonuses.trickery;
    }

    return stats;
  }

  private getSizeWeight(size: SledSize): number {
    const weights = {
      'jack-jumper': 5,
      'toboggan': 10,
      'bobsled': 15,
      'gravity-sledge': 20,
      'powered-sledge': 25,
    };
    return weights[size];
  }

  private getSizeCapacity(size: SledSize): number {
    const capacities = {
      'jack-jumper': 2,
      'toboggan': 4,
      'bobsled': 6,
      'gravity-sledge': 8,
      'powered-sledge': 10,
    };
    return capacities[size];
  }

  private getSizeDurability(size: SledSize): number {
    const durabilities = {
      'jack-jumper': 2,
      'toboggan': 3,
      'bobsled': 4,
      'gravity-sledge': 5,
      'powered-sledge': 6,
    };
    return durabilities[size];
  }

  /**
   * Purchase a component from Steve's shop
   */
  purchaseComponent(componentId: string): boolean {
    const component = this.availableComponents.find(c => c.id === componentId);
    if (!component) return false;

    if (this.ownedComponents.has(componentId)) {
      console.log('Already own this component');
      return false;
    }

    if (this.gameStateManager.spendMoney(component.cost)) {
      this.ownedComponents.add(componentId);
      this.saveOwnedComponents();
      return true;
    }

    return false;
  }

  /**
   * Equip a component to the sled
   */
  equipComponent(componentId: string): boolean {
    const component = this.availableComponents.find(c => c.id === componentId);
    if (!component || !this.ownedComponents.has(componentId)) {
      return false;
    }

    this.currentConfig[component.slot] = component;
    this.saveConfiguration();
    return true;
  }

  /**
   * Unequip a component from the sled
   */
  unequipComponent(slot: ComponentSlot): void {
    this.currentConfig[slot] = undefined;
    this.saveConfiguration();
  }

  /**
   * Get components available for purchase (filtered by mountain progress)
   */
  getAvailableForPurchase(): SledComponent[] {
    const state = this.gameStateManager.getState();
    const currentMountain = Math.min(4, Math.floor(state.currentDay / 10)); // Rough estimate

    return this.availableComponents.filter(c => {
      const meetsRequirement = !c.requiredMountain || c.requiredMountain <= currentMountain;
      const notOwned = !this.ownedComponents.has(c.id);
      return meetsRequirement && notOwned;
    });
  }

  /**
   * Get owned components that can be equipped
   */
  getOwnedComponents(slot?: ComponentSlot): SledComponent[] {
    return this.availableComponents.filter(c => {
      const isOwned = this.ownedComponents.has(c.id);
      const matchesSlot = !slot || c.slot === slot;
      return isOwned && matchesSlot;
    });
  }

  /**
   * Show the sled customization UI
   */
  showUI(): void {
    if (this.isUIVisible) return;

    this.isUIVisible = true;
    const { width, height } = this.scene.cameras.main;

    this.uiContainer = this.scene.add.container(0, 0).setDepth(1000);

    // Background overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    this.uiContainer.add(overlay);

    // Main panel
    const panelWidth = 900;
    const panelHeight = 600;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x2c3e50, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    panel.lineStyle(4, 0x3498db, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    this.uiContainer.add(panel);

    // Title
    const title = this.scene.add.text(width / 2, panelY + 30, 'SLED CUSTOMIZATION', {
      fontSize: '36px',
      color: '#ecf0f1',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.uiContainer.add(title);

    // Stats display
    const stats = this.calculateStats();
    const statsY = panelY + 80;
    const statsText = this.scene.add.text(panelX + 30, statsY, this.formatStats(stats), {
      fontSize: '16px',
      color: '#ecf0f1',
      lineSpacing: 8,
    });
    this.uiContainer.add(statsText);

    // Component slots display
    this.renderComponentSlots(panelX, panelY);

    // Close button
    const closeBtn = this.createButton(
      width / 2,
      panelY + panelHeight - 40,
      'CLOSE',
      0xe74c3c,
      () => this.hideUI()
    );
    closeBtn.forEach(obj => this.uiContainer!.add(obj));

    // Make overlay close UI
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => this.hideUI());
  }

  private formatStats(stats: SledStats): string {
    return `
Weight: ${stats.totalWeight.toFixed(1)} kg
Capacity: ${stats.totalCapacity} items
Speed Bonus: +${(stats.speedBonus * 100).toFixed(0)}%
Trick Bonus: +${(stats.trickBonus * 100).toFixed(0)}%
Durability: ${stats.durability} hits
Stamina Drain: ${(stats.staminaDrainRate * 100).toFixed(0)}%
Special: ${stats.specialEffects.length > 0 ? stats.specialEffects.join(', ') : 'None'}
    `.trim();
  }

  private renderComponentSlots(panelX: number, panelY: number): void {
    const slotY = panelY + 250;
    const slots: ComponentSlot[] = ['runners', 'body', 'front', 'rear', 'sideLeft', 'sideRight'];
    const slotLabels = {
      runners: 'Runners',
      body: 'Body',
      front: 'Front',
      rear: 'Rear',
      sideLeft: 'Side L',
      sideRight: 'Side R',
    };

    slots.forEach((slot, index) => {
      const x = panelX + 50 + (index % 3) * 280;
      const y = slotY + Math.floor(index / 3) * 100;

      const label = this.scene.add.text(x, y, slotLabels[slot], {
        fontSize: '16px',
        color: '#95a5a6',
      });
      this.uiContainer!.add(label);

      const component = this.currentConfig[slot];
      const componentText = this.scene.add.text(
        x,
        y + 25,
        component ? component.name : '(Empty)',
        {
          fontSize: '14px',
          color: component ? '#3498db' : '#7f8c8d',
        }
      );
      this.uiContainer!.add(componentText);
    });
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.GameObject[] {
    const buttonWidth = 200;
    const buttonHeight = 40;

    const button = this.scene.add.graphics();
    button.fillStyle(color, 1);
    button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);

    const buttonText = this.scene.add.text(x, y, text, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const zone = this.scene.add.zone(x, y, buttonWidth, buttonHeight);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerdown', callback);

    return [button, buttonText, zone];
  }

  /**
   * Hide the customization UI
   */
  hideUI(): void {
    if (this.uiContainer) {
      this.uiContainer.destroy();
      this.uiContainer = undefined;
    }
    this.isUIVisible = false;
  }

  /**
   * Get current configuration
   */
  getConfiguration(): SledConfiguration {
    return { ...this.currentConfig };
  }

  /**
   * Check if UI is visible
   */
  isVisible(): boolean {
    return this.isUIVisible;
  }

  destroy(): void {
    this.hideUI();
  }
}
