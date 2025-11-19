# Advanced Game Systems Documentation

This document describes the three advanced game systems implemented for SledHEAD: Modular Sled System, New Game Plus System, and Weather System.

---

## 1. Modular Sled System (`ModularSledSystem.ts`)

### Overview
The Modular Sled System allows players to customize their sled with different components across multiple slots, affecting gameplay stats and capabilities.

### Key Features

#### Sled Sizes
- **Jack Jumper** - Lightweight starter sled
- **Toboggan** - Balanced medium sled
- **Bobsled** - Speed-focused racing sled
- **Gravity-Sledge** - Heavy-duty mountain sled
- **Powered Sledge** - Advanced mechanical sled

#### Component Slots
1. **Runners/Skis** - Affects speed, traction, and terrain handling
2. **Body/Hull** - Determines durability, weight, and storage capacity
3. **Front Attachment** - Special tools (dig kit, camera rig, etc.)
4. **Rear Attachment** - Storage and utility items
5. **Side Attachments (L/R)** - Additional upgrades and enhancements

#### Component Tiers

**Early Game (Mountain 0-1):**
- Birchwood Skids, Steel Runners, Waxed Maple Rails
- Pineframe Hull, Hollowcore Deck, Woven Bark Shell
- Mini Dig Kit, Photo Crate, Bee Box Jr.
- Trail Crate, Thermos Drum, Sap Bag
- Supply Satchels, Basic Shock Pads

**Mid Game (Mountain 2-3):**
- Frostbite Rails, Sugarwax Skids, Crystal Edges
- Plastic Composite Shell, Candycar Frame, Dumpster Diver Deck
- Deluxe Dig Kit, Crane Camera Rig, Weather Vane Mount
- Coolant Tank, Gear Caddy, Stabilizer Runner

**Late Game (Mountain 4+):**
- Molten Rails, Lunar Skids, Cogwheel Runners
- Volcanic Alloy Core, Zero-G Frame, Boilplate Chassis
- Plasma Dig Spade, Drone Rig Mount, Jet Fan Housing
- Energy Amplifier, Magnetic Catcher

### Stats System

Each sled configuration calculates:
- **Total Weight** - Affects stamina drain when climbing
- **Total Capacity** - How many items you can carry
- **Speed Bonus** - Percentage increase to sled speed
- **Trick Bonus** - Improves trick performance
- **Durability** - Number of hits before sled breaks
- **Stamina Drain Rate** - Modifier for uphill climbing
- **Special Effects** - Unique abilities (treasure detection, auto-pickup, etc.)

### Integration with Steve's Shop

Players can purchase components from Steve using the `purchaseComponent(componentId)` method. Components are unlocked based on mountain progression.

### Usage Example

```typescript
import { ModularSledSystem } from './systems/ModularSledSystem';

// In your scene's create() method
const sledSystem = new ModularSledSystem(this);

// Show customization UI
sledSystem.showUI();

// Get current stats
const stats = sledSystem.calculateStats();
console.log(`Speed Bonus: +${stats.speedBonus * 100}%`);
console.log(`Capacity: ${stats.totalCapacity} items`);

// Apply stats to gameplay
const effects = sledSystem.getEffects();
playerSpeed *= (1 + stats.speedBonus);

// In update() method
sledSystem.update(delta);
```

---

## 2. New Game Plus System (`NewGamePlusSystem.ts`)

### Overview
The NG+ system reveals the universe's lore when the player pays off their loan and allows them to carry persistent bonuses into subsequent playthroughs.

### Victory Sequence

When `loan <= 0`:
1. **Victory Screen** - "LOAN PAID OFF!" celebration
2. **Lore Reveal** - Five-part cosmic story about:
   - The Computronium Core buried in Earth
   - Gravitational Resonance Coding
   - Mountains as Waveguides
   - The Core Awakening
   - Cold-Start Sequence Completion
3. **Jake's Dialogue** - Final revelation (6 dialogue lines)
4. **Bonus Selection** - Choose one of six persistent bonuses

### New Game Plus Bonuses

Players choose ONE bonus per completion:

| Bonus | Name | Effect |
|-------|------|--------|
| **Speed** | Joy of Acceleration | +10% sled speed per NG+ |
| **Trickery** | Joy of Movement | +10% trick performance |
| **Resilience** | Joy of Persistence | +1 collision tolerance |
| **Climb** | Joy of Journey | +10% uphill speed |
| **Charisma** | Joy of Community | -10% shop costs |
| **Rhythm** | Joy of Chaining | +10% combo window |

### Visual Effects

NG+ players receive special visual effects:
- **Level 1+**: Glow effect on player
- **Level 3+**: Particle effects
- **Level 5+**: Cosmic aura

### Usage Example

```typescript
import { NewGamePlusSystem } from './systems/NewGamePlusSystem';

// In your scene's create() method
const ngpSystem = new NewGamePlusSystem(this);

// Check victory condition (e.g., in update or when paying loan)
if (ngpSystem.checkVictoryCondition()) {
  ngpSystem.showVictoryScreen();
}

// Check if NG+ is active
if (ngpSystem.isNGPActive()) {
  const effects = ngpSystem.getVisualEffects();

  if (effects.glow) {
    // Add glow shader to player
  }

  if (effects.particles) {
    // Add particle trail
  }
}

// Get current bonuses
const state = ngpSystem.getState();
console.log(`Speed bonus: +${state.bonuses.speed * 100}%`);
```

---

## 3. Weather System (`WeatherSystem.ts`)

### Overview
Dynamic weather system that affects gameplay, visibility, and creates atmospheric conditions.

### Weather Types

1. **Clear** - Perfect conditions, no modifiers
2. **Snow** - Slight speed increase, reduced visibility
3. **Fog** - Heavily reduced visibility
4. **Wind** - Pushes player during sledding
5. **Storm** - Multiple harsh effects, more hazards
6. **Blizzard** - Extreme conditions, very dangerous

### Weather Effects on Gameplay

Each weather type modifies:
- **Speed Modifier** - Changes sled velocity
- **Trick Difficulty** - Makes tricks harder/easier
- **Visibility Range** - How far you can see
- **Wind Push** - Force vector affecting player
- **Hazard Spawn Rate** - Frequency of obstacles
- **Stamina Drain** - Climbing cost modifier

### Weather Forecast System

- Updates every 2 minutes (configurable)
- Shows 4 periods ahead
- Weighted random selection based on:
  - Mountain difficulty
  - Weather Warrior upgrade level
  - Current conditions

### Visual Effects

The system provides:
- **Snow Particles** - Animated snowfall with wind drift
- **Lightning Flashes** - Random lightning during storms
- **Fog Overlay** - Gradient fog layer
- **Wind Indicator** - Arrow showing wind direction
- **Screen Effects** - Camera shake, tinting

### Weather Warrior Integration

The Weather Warrior upgrade reduces harsh weather:
- Each level: +5% chance of clear weather
- Reduces storm probability
- Significantly reduces blizzard chance
- Reduces negative gameplay effects by 10% per level

### Usage Example

```typescript
import { WeatherSystem } from './systems/WeatherSystem';

// In your scene's create() method
const weatherSystem = new WeatherSystem(this);

// Show weather UI
weatherSystem.showWeatherUI();

// In update() method
weatherSystem.update(delta);

// Apply weather effects to gameplay
const effects = weatherSystem.getEffects();

// Modify player speed
playerVelocity.x *= effects.speedModifier;

// Apply wind force
playerVelocity.x += effects.windPush.x * delta * 0.001;
playerVelocity.y += effects.windPush.y * delta * 0.001;

// Adjust trick difficulty
trickSuccessChance /= effects.trickDifficulty;

// Modify visibility (for rendering/culling)
renderDistance = effects.visibilityRange;

// Adjust hazard spawning
if (Math.random() < 0.01 * effects.hazardSpawnRate) {
  spawnHazard();
}

// Force weather change (testing)
weatherSystem.forceWeather('blizzard', true);

// Get current conditions
const weather = weatherSystem.getCurrentWeather();
console.log(`Temperature: ${weather.temperature}°C`);
console.log(`Wind Speed: ${weather.windSpeed} px/s`);
```

---

## Integration Guide

### Adding to Your Scene

```typescript
import { ModularSledSystem } from '../systems/ModularSledSystem';
import { NewGamePlusSystem } from '../systems/NewGamePlusSystem';
import { WeatherSystem } from '../systems/WeatherSystem';

export class GameScene extends Phaser.Scene {
  private sledSystem!: ModularSledSystem;
  private ngpSystem!: NewGamePlusSystem;
  private weatherSystem!: WeatherSystem;

  create(): void {
    // Initialize systems
    this.sledSystem = new ModularSledSystem(this);
    this.ngpSystem = new NewGamePlusSystem(this);
    this.weatherSystem = new WeatherSystem(this);

    // Load saved configuration
    this.sledSystem.loadConfiguration();

    // Show weather UI
    this.weatherSystem.showWeatherUI();

    // Set up keyboard controls
    this.input.keyboard?.on('keydown-S', () => {
      this.sledSystem.showUI();
    });
  }

  update(time: number, delta: number): void {
    // Update weather
    this.weatherSystem.update(delta);

    // Get all effects
    const sledStats = this.sledSystem.calculateStats();
    const weatherEffects = this.weatherSystem.getEffects();
    const ngpState = this.ngpSystem.getState();

    // Apply combined effects to player
    this.applyEffectsToPlayer(sledStats, weatherEffects, ngpState);

    // Check victory
    if (this.ngpSystem.checkVictoryCondition()) {
      this.ngpSystem.showVictoryScreen();
    }
  }

  private applyEffectsToPlayer(sledStats, weatherEffects, ngpState): void {
    // Combine all bonuses
    let totalSpeedBonus = sledStats.speedBonus + ngpState.bonuses.speed;
    let totalTrickBonus = sledStats.trickBonus + ngpState.bonuses.trickery;

    // Apply weather modifiers
    totalSpeedBonus *= weatherEffects.speedModifier;

    // Apply to player
    // ... your game logic here
  }

  shutdown(): void {
    // Clean up systems
    this.sledSystem.destroy();
    this.ngpSystem.destroy();
    this.weatherSystem.destroy();
  }
}
```

---

## Data Persistence

All systems use localStorage for persistence:

- **ModularSledSystem**: Saves owned components and current configuration
- **NewGamePlusSystem**: Handled by GameStateManager
- **WeatherSystem**: Weather state regenerates each session

---

## Performance Considerations

1. **Particle Emitters**: Weather system creates/destroys particle emitters dynamically. Monitor performance on low-end devices.
2. **Visual Effects**: NG+ visual effects scale with level. Consider disabling on mobile.
3. **UI Updates**: Only update UI when visible to save CPU cycles.

---

## Future Enhancements

Potential additions:
- Sled blueprints and crafting recipes
- Weather-based events and challenges
- NG+ exclusive content and secrets
- Component durability and maintenance
- Seasonal weather patterns
- Dynamic weather transitions between mountains

---

## File Locations

- `/home/user/SledHEAD/src/systems/ModularSledSystem.ts` - 880 lines
- `/home/user/SledHEAD/src/systems/NewGamePlusSystem.ts` - 713 lines
- `/home/user/SledHEAD/src/systems/WeatherSystem.ts` - 657 lines

Total: 2,250 lines of fully implemented TypeScript code.
