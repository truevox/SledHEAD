# SledHEAD

**An epic arcade-style sledding adventure game** where you play as an aspiring sledding champion who has purchased an entire procedurally-generated mountain. Master your runs, perform spectacular tricks, photograph wildlife, and pay off your mountain loan!

## Features

### Core Gameplay
- **⬆️ Uphill Phase**: Climb the mountain, manage stamina, and photograph wildlife
- **⬇️ Downhill Phase**: Race down performing 16 unique tricks and avoiding obstacles
- **🏠 Management Phase**: Upgrade your equipment and mountain infrastructure

### Procedural Mountain Generation
- 10 distinct layers with cylindrical wrapping
- Seed-based generation for reproducible mountains
- Dynamic terrain (snow, ice, rock, ramps, obstacles)
- Decreasing circumference as you ascend

### Trick System
- 16 unique tricks with combo system
- Input-based trick detection (arrow key combinations)
- Combo multipliers for chaining tricks
- Tricks include: Parachute, Air Brake, Helicopter Spins, Corkscrews, Superman, and more!

### Wildlife Photography
- 5 animal species with unique behaviors (Bear, Bird, Mountain Lion, Deer, Fox)
- Camera reticle with altitude matching
- Earnings based on centering, altitude match, movement, and rarity
- Repeat photo penalties

### Upgrade Systems
- **8 Personal Upgrades**: Rocket Surgery, Optimal Optics, Sled Durability, Fancier Footwear, Attend Leg Day, Crowd Hypeman, Crowd Weaver, Weather Warrior
- **6 Mountain Upgrades**: High-Speed Ski Lifts, Snowmobile Rentals, Food Stalls, Groomed Trails, First-Aid Stations, Scenic Overlooks

### 6 Complete Mini-Games
1. **Fishing** - Underwater photography fishing
2. **Lockpicking** - Break into abandoned buildings
3. **Digging** - Treasure hunting with legendary lenses
4. **Kite Flying** - Rhythm-based flight mechanics
5. **Beekeeping** - Wild hive management and bee-lining
6. **Wood Chopping** - Rhythm-based tree felling for shortcuts

### Advanced Systems
- **Modular Sled System**: 5 sled tiers, 45+ parts across early/mid/late game
- **NewGame+ System**: Universe lore revelation with 6 persistent bonus types
- **Weather System**: 6 weather types affecting gameplay (Clear, Snow, Fog, Wind, Storm, Blizzard)
- **NPC Dialogue**: 7 unique NPCs with personality-appropriate dialogue
- **Tourist & Fan System**: Dynamic crowds with AI, cheering, tips, and speed boosts

### NPCs
- **Grandpa** 👴 - Your mentor and guide
- **Jake** 🏂 - Trick master and builder
- **Sled Tech Steve** 🔧 - Mechanic and engineer
- **Minnie** 👧 - Convenience store owner
- **Encyclopedia Pete** 🐝 - Beekeeper and logger
- **Aria** 👩‍🍳 - Hotel manager and chef
- **Jay** 🪁 - Lift operator and kite enthusiast

## Tech Stack

- **Framework**: Phaser 3.80.1
- **Language**: TypeScript
- **Build Tool**: Vite 5
- **Testing**: Vitest
- **Art**: 100% procedurally generated using code

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open http://localhost:3000

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

## Controls

### Uphill Phase
- **WASD** - Move around
- **Arrow Keys** - Adjust camera for photography
- **SPACE** - Take photo
- **E** - Start downhill run
- **H** - Return to house

### Downhill Phase
- **Left/Right Arrows** - Steer
- **SPACE** - Jump
- **Arrow Keys (in air)** - Perform tricks

### Trick Combinations
- **UP, DOWN** - Parachute
- **UP, UP** - Air Brake
- **LEFT, LEFT** - Helicopter Spin Left
- **RIGHT, RIGHT** - Helicopter Spin Right
- **DOWN, LEFT** - Sled Flip Back
- **DOWN, RIGHT** - Sled Flip Front
- **DOWN, DOWN** - Superman
- **UP, RIGHT** - Sky Dive Roll Right
- **UP, LEFT** - Sky Dive Roll Left
- **LEFT, RIGHT** - Ghost Rider
- **RIGHT, LEFT** - Toboggan Toss
- **RIGHT, DOWN** - Corkscrew Right
- **LEFT, DOWN** - Corkscrew Left
- **DOWN, UP** - Falling Star
- **RIGHT, UP** - Orbit Spin Clockwise
- **LEFT, UP** - Orbit Spin Counterwise

## Game Progression

1. **Tutorial**: Learn the basics with Grandpa on a small hill
2. **Main Game**: Climb and sled the procedural mountain
3. **Earn Money**: Through tricks, photography, and mini-games
4. **Upgrade**: Improve your equipment and mountain
5. **Pay Loan**: Reduce your $100,000 mountain loan to $0
6. **Victory**: Unlock the universe lore and NewGame+
7. **NewGame+**: Choose a persistent bonus and play again with cumulative benefits

## Project Structure

```
src/
├── main.ts                 - Entry point
├── types/                  - TypeScript type definitions
├── scenes/                 - Game scenes
│   ├── BootScene.ts       - Asset loading
│   ├── MenuScene.ts       - Main menu
│   ├── TutorialScene.ts   - Tutorial level
│   ├── UphillScene.ts     - Climbing phase
│   ├── DownhillScene.ts   - Sledding phase
│   └── HouseScene.ts      - Management/upgrades
├── systems/               - Game systems
│   ├── MountainGenerator.ts
│   ├── TrickSystem.ts
│   ├── NPCDialogueSystem.ts
│   ├── TouristSystem.ts
│   ├── ModularSledSystem.ts
│   ├── NewGamePlusSystem.ts
│   ├── WeatherSystem.ts
│   └── [6 mini-game systems]
└── utils/                 - Utilities
    ├── ProceduralArt.ts  - Asset generation
    └── GameStateManager.ts
```

## Design Documents

See `/docs` folder for comprehensive design documentation:
- `README.md` - Core concept and gameplay loops
- `ROADMAP.md` - Detailed feature roadmap
- `CONTROLS.md` - Control scheme
- `NEW.GAME.PLUS.SPOILERS.md` - Universe lore (spoilers!)

## Contributing

This is a complete implementation. Feel free to fork and extend!

## License

See LICENSE.md

## Credits

Built from scratch based on the SledHEAD design documents.
All art procedurally generated. No external assets used.

---

**Enjoy sledding! 🛷⛰️**
