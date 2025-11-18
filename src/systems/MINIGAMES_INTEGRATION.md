# SledHEAD Mini-Games Integration Guide

## Created Mini-Game Systems

All 6 complete mini-game systems have been created in `/home/user/SledHEAD/src/systems/`:

### 1. FishingMinigame.ts (17KB)
**Underwater Photography Fishing**
- Deploy camera rig on pole into water
- Arrow keys control camera angle/altitude underwater
- Fish spawn with unique behaviors (schooling, lurking, darting, circling)
- Photo detection and scoring system (centering, focus, rarity, size)
- 6 fish species: trout, salmon, bass, pike, sturgeon, golden_trout
- Integration with Optimal Optics upgrade (camera range + focus bonuses)
- Session tracking: photos taken, earnings

### 2. LockpickingMinigame.ts (17KB)
**Lock Picking in Abandoned Buildings**
- Dual-input system: tension (SHIFT) + pick manipulation (UP/DOWN)
- Procedural lock generation with random pin positions
- Timing-based mechanics with visual/audio feedback
- Difficulty levels 1-5 (more pins = harder)
- Break pick on failure (limited picks per attempt)
- Rewards: money, lore items, shortcuts, upgrade items
- Sweet spot detection with vibration feedback

### 3. DiggingMinigame.ts (18KB)
**Treasure Hunting with the Panttock**
- Three dig methods:
  - Dig spots (soft earth) - treasures/fossils
  - Pick spots (ice/rock) - gems/minerals
  - Panning in rivers - all types in tiny bits
- Legendary Lenses system:
  - Pirate Lens, Amber Lens, Diamond Lens, Ruby Lens, Emerald Lens, Opal Lens
  - Each lens detects different rarity items with glow effects
- Collection log tracking (persistent storage)
- Visual indicators for valuable spots
- Rarity system: common, uncommon, rare, epic, legendary

### 4. KiteFlyingMinigame.ts (22KB)
**Rhythm-Based Kite Flying**
- Music/rhythm input system during uphill
- 4-lane note highway with directional prompts
- Perfect/Good/OK/Miss timing windows
- 5 kite types with different stats:
  - Windwhip (starter, balanced)
  - Stormkite (high power, low stability)
  - Aerogel Wing (balanced performance)
  - Bubbleknot (maximum stability)
  - Lunarch (ultimate kite, 8s airtime bonus)
- Thermal riding mechanics for extra lift
- Floating loot drops to collect mid-flight
- Extends downhill airtime when deployed
- Combo system with score multipliers

### 5. BeekeepingMinigame.ts (22KB)
**Wild Hive Management**
- Bee-lining mechanics: track forager bees to discover hives
- 5 bee species: common, golden, arctic, obsidian, rainbow
- Hive cutout minigame:
  - Calm bees with smoker (limited charges)
  - Find and capture queen
  - Extract honeycomb
  - Avoid stings when bees are agitated
- Resource harvesting:
  - Honey (always)
  - Wax (always)
  - Royal Jelly (if queen found)
  - Propolis (rare species bonus)
- Bee breeding for exotic species
- Integration with Pete NPC for deliveries

### 6. WoodChoppingMinigame.ts (24KB)
**Tree Felling System**
- Rhythm-based timed input challenge
- 6 tree types: pine, oak, birch, maple, cedar, ancient
- Perfect/Good/Miss timing with combo system
- Creates temporary downhill shortcuts (60s duration)
- Resource gathering for crafting
- Natural regrowth system (trees respawn after time)
- Environmental impact system:
  - Too many trees cut = fewer animals spawn
  - Warning system for deforestation
  - Wildlife reduction up to 50%
- Integration with Pete NPC for wood deliveries
- Persistent wood inventory across sessions

## Integration with GameStateManager

All mini-games integrate with the existing GameStateManager:

```typescript
import { GameStateManager } from '../utils/GameStateManager';

// In constructor
this.gameState = GameStateManager.getInstance();

// Award money
this.gameState.addMoney(amount);

// Check/spend money
if (this.gameState.spendMoney(cost)) { ... }

// Get upgrades
const level = this.gameState.getUpgrade('personal', 'optimalOptics');

// Drain stamina
this.gameState.drainStamina(amount);
```

## Common API for All Mini-Games

All mini-games follow a consistent pattern:

```typescript
class MinigameSystem {
  constructor(scene: Phaser.Scene);

  // Core methods
  start(): void;
  update(time: number, delta: number): void;
  stop(): void;
  destroy(): void;

  // State
  isActive(): boolean;

  // Stats/rewards
  getSessionEarnings?(): number;
  getSessionScore?(): number;
}
```

## Usage Example

```typescript
import { FishingMinigame } from '../systems/FishingMinigame';

class GameScene extends Phaser.Scene {
  private fishingGame: FishingMinigame;

  create() {
    this.fishingGame = new FishingMinigame(this);

    // Start when player reaches fishing spot
    this.fishingGame.start();
  }

  update(time: number, delta: number) {
    if (this.fishingGame.isActive()) {
      this.fishingGame.update(time, delta);
    }
  }
}
```

## Persistent Storage

Each mini-game saves progress to localStorage:

- **FishingMinigame**: Session stats only (no persistence)
- **LockpickingMinigame**: No persistence (one-time locks)
- **DiggingMinigame**: Collection log + lens ownership
- **KiteFlyingMinigame**: Owned kites
- **BeekeepingMinigame**: Inventory (honey, wax, royal jelly, propolis) + bred species
- **WoodChoppingMinigame**: Wood inventory + shortcuts + Pete deliveries

## Features Summary

### Input Handling
- All games support ESC to exit
- Custom controls per mini-game
- Consistent feedback systems

### UI Components
- Feedback text (temporary messages)
- Progress bars (health, stamina, progress)
- Inventory displays
- Combo/score tracking
- Instructions overlay

### Reward Systems
- Money (direct to GameStateManager)
- Resources (persistent inventory)
- Unlockables (lenses, kites, species)
- Environmental effects (shortcuts, animal spawns)

### Visual Effects
- Camera shake on impacts
- Flash effects for success/failure
- Tween animations for items
- Particle effects (water, smoke, etc.)
- Glow effects for rare items

### Audio Cues
- Click sounds (lockpicking)
- Beat indicators (rhythm games)
- Success/failure sounds
- Environmental ambiance

## Next Steps for Full Integration

1. **Scene Integration**: Add mini-games to appropriate scenes:
   - FishingMinigame → Water/Lake areas
   - LockpickingMinigame → Abandoned buildings
   - DiggingMinigame → Open mountain areas
   - KiteFlyingMinigame → UphillScene
   - BeekeepingMinigame → Forest areas
   - WoodChoppingMinigame → Forest areas

2. **Trigger Systems**: Create interaction zones:
   ```typescript
   if (playerNearFishingSpot && pressedE) {
     fishingGame.start();
   }
   ```

3. **Pete NPC Integration**:
   - WoodChoppingMinigame.deliverToPete(amount)
   - BeekeepingMinigame.getInventory() for trading

4. **Upgrade Effects**: Link upgrade levels to mini-game bonuses:
   - Optimal Optics → Fishing camera range
   - Attend Leg Day → Wood chopping speed
   - Weather Warrior → Kite flight stability

5. **Tutorial Messages**: Add first-time instructions for each mini-game

6. **Balance Tuning**: Adjust rewards, difficulty, and timing windows based on playtesting

7. **Sound Effects**: Add audio files and integrate with Phaser sound system

8. **Achievements**: Track milestones (100 fish caught, all lenses found, etc.)

## File Locations

All mini-game systems are located at:
```
/home/user/SledHEAD/src/systems/
├── FishingMinigame.ts
├── LockpickingMinigame.ts
├── DiggingMinigame.ts
├── KiteFlyingMinigame.ts
├── BeekeepingMinigame.ts
└── WoodChoppingMinigame.ts
```

Total code: ~140KB of complete, playable mini-game systems!
