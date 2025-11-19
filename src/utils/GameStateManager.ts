import { GameState, UpgradeState, GameStats, NewGamePlusState } from '../types';

export class GameStateManager {
  private static instance: GameStateManager;
  private state: GameState;

  private constructor() {
    this.state = this.getDefaultState();
    this.loadState();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  private getDefaultState(): GameState {
    return {
      money: 200,
      loan: 100000,
      stamina: 100,
      maxStamina: 100,
      playerPosition: { x: 640, y: 600, layer: 0 },
      mountainSeed: this.generateSeed(),
      currentDay: 1,
      tutorialComplete: false,
      upgrades: this.getDefaultUpgrades(),
      stats: this.getDefaultStats(),
      newGamePlus: this.getDefaultNewGamePlus(),
    };
  }

  private getDefaultUpgrades(): UpgradeState {
    return {
      personal: {
        rocketSurgery: 0,
        optimalOptics: 0,
        sledDurability: 0,
        fancierFootwear: 0,
        attendLegDay: 0,
        crowdHypeman: 0,
        crowdWeaver: 0,
        weatherWarrior: 0,
      },
      mountain: {
        skiLifts: 0,
        snowmobileRentals: 0,
        foodStalls: 0,
        groomedTrails: 0,
        firstAidStations: 0,
        scenicOverlooks: 0,
      },
    };
  }

  private getDefaultStats(): GameStats {
    return {
      totalRuns: 0,
      totalTricks: 0,
      totalPhotos: 0,
      bestTime: 0,
      highestAltitude: 0,
      totalCollisions: 0,
    };
  }

  private getDefaultNewGamePlus(): NewGamePlusState {
    return {
      active: false,
      bonuses: {
        speed: 0,
        trickery: 0,
        resilience: 0,
        climb: 0,
        charisma: 0,
        rhythm: 0,
      },
    };
  }

  private generateSeed(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  getState(): GameState {
    return { ...this.state };
  }

  setState(newState: Partial<GameState>): void {
    this.state = { ...this.state, ...newState };
    this.saveState();
  }

  getMoney(): number {
    return this.state.money;
  }

  addMoney(amount: number): void {
    this.state.money += amount;
    this.saveState();
  }

  spendMoney(amount: number): boolean {
    if (this.state.money >= amount) {
      this.state.money -= amount;
      this.saveState();
      return true;
    }
    return false;
  }

  getLoan(): number {
    return this.state.loan;
  }

  payLoan(amount: number): void {
    this.state.loan = Math.max(0, this.state.loan - amount);
    this.saveState();
  }

  getStamina(): number {
    return this.state.stamina;
  }

  setStamina(value: number): void {
    this.state.stamina = Math.max(0, Math.min(this.state.maxStamina, value));
    this.saveState();
  }

  drainStamina(amount: number): void {
    this.setStamina(this.state.stamina - amount);
  }

  restoreStamina(amount: number): void {
    this.setStamina(this.state.stamina + amount);
  }

  getUpgrade(category: 'personal' | 'mountain', name: string): number {
    return (this.state.upgrades[category] as any)[name] || 0;
  }

  upgradeItem(category: 'personal' | 'mountain', name: string): void {
    const current = (this.state.upgrades[category] as any)[name] || 0;
    (this.state.upgrades[category] as any)[name] = Math.min(5, current + 1);
    this.saveState();
  }

  incrementStat(stat: keyof GameStats, amount: number = 1): void {
    (this.state.stats[stat] as number) += amount;
    this.saveState();
  }

  getStats(): GameStats {
    return { ...this.state.stats };
  }

  newGame(seed?: string): void {
    const ngpBonuses = this.state.newGamePlus.bonuses;
    this.state = this.getDefaultState();
    if (seed) {
      this.state.mountainSeed = seed;
    }
    // Preserve NewGame+ bonuses if active
    if (Object.values(ngpBonuses).some(v => v > 0)) {
      this.state.newGamePlus.active = true;
      this.state.newGamePlus.bonuses = ngpBonuses;
    }
    this.saveState();
  }

  startNewGamePlus(bonusChoice: keyof NewGamePlusState['bonuses']): void {
    const ngpBonuses = this.state.newGamePlus.bonuses;
    ngpBonuses[bonusChoice] += 0.1; // 10% bonus per completion
    this.newGame();
  }

  private saveState(): void {
    try {
      localStorage.setItem('sledhead_save', JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem('sledhead_save');
      if (saved) {
        const loaded = JSON.parse(saved);
        // Merge with defaults to handle version updates
        this.state = { ...this.getDefaultState(), ...loaded };
      }
    } catch (e) {
      console.error('Failed to load game state:', e);
    }
  }

  resetState(): void {
    this.state = this.getDefaultState();
    this.saveState();
  }
}
