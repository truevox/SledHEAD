export interface GameState {
  money: number;
  loan: number;
  stamina: number;
  maxStamina: number;
  playerPosition: { x: number; y: number; layer: number };
  mountainSeed: string;
  currentDay: number;
  upgrades: UpgradeState;
  stats: GameStats;
  newGamePlus: NewGamePlusState;
}

export interface UpgradeState {
  personal: {
    rocketSurgery: number;
    optimalOptics: number;
    sledDurability: number;
    fancierFootwear: number;
    attendLegDay: number;
    crowdHypeman: number;
    crowdWeaver: number;
    weatherWarrior: number;
  };
  mountain: {
    skiLifts: number;
    snowmobileRentals: number;
    foodStalls: number;
    groomedTrails: number;
    firstAidStations: number;
    scenicOverlooks: number;
  };
}

export interface GameStats {
  totalRuns: number;
  totalTricks: number;
  totalPhotos: number;
  bestTime: number;
  highestAltitude: number;
  totalCollisions: number;
}

export interface NewGamePlusState {
  active: boolean;
  bonuses: {
    speed: number;
    trickery: number;
    resilience: number;
    climb: number;
    charisma: number;
    rhythm: number;
  };
}

export interface MountainLayer {
  index: number;
  circumference: number;
  heightRange: { min: number; max: number };
  terrain: TerrainTile[][];
}

export interface TerrainTile {
  type: 'snow' | 'ice' | 'rock' | 'tree' | 'ramp' | 'obstacle';
  altitude: number;
  color: number;
  variant: number;
}

export interface Trick {
  name: string;
  input: string[];
  value: number;
  description: string;
  emoji: string;
  animationFrames: number[];
}

export interface Animal {
  type: 'bear' | 'bird' | 'mountainlion' | 'deer' | 'fox';
  position: { x: number; y: number };
  altitude: number;
  moving: boolean;
  speed: number;
  photographed: number;
  rarity: number;
}

export interface PhotoResult {
  success: boolean;
  animal: Animal;
  altitudeMatch: number;
  centering: number;
  movementBonus: number;
  repeatPenalty: number;
  totalEarnings: number;
}

export const TRICKS: Trick[] = [
  { name: 'Parachute', input: ['UP', 'DOWN'], value: 50, description: 'Hold sled overhead like a parachute', emoji: '🪂', animationFrames: [0, 1, 2] },
  { name: 'Air Brake', input: ['UP', 'UP'], value: 40, description: 'Use sled as air brake', emoji: '🛑', animationFrames: [3, 4, 5] },
  { name: 'Sled Flip Back', input: ['DOWN', 'LEFT'], value: 80, description: 'Full backward flip', emoji: '🔄', animationFrames: [6, 7, 8] },
  { name: 'Sled Flip Front', input: ['DOWN', 'RIGHT'], value: 80, description: 'Forward flip with rotation', emoji: '🔄', animationFrames: [9, 10, 11] },
  { name: 'Helicopter Spin Left', input: ['LEFT', 'LEFT'], value: 60, description: 'Spin horizontally left', emoji: '🚁', animationFrames: [12, 13, 14] },
  { name: 'Helicopter Spin Right', input: ['RIGHT', 'RIGHT'], value: 60, description: 'Spin horizontally right', emoji: '🚁', animationFrames: [15, 16, 17] },
  { name: 'Superman', input: ['DOWN', 'DOWN'], value: 70, description: 'Extend arms like Superman', emoji: '🦸', animationFrames: [18, 19, 20] },
  { name: 'Sky Dive Roll Right', input: ['UP', 'RIGHT'], value: 90, description: 'Roll right in mid-air', emoji: '🌪️', animationFrames: [21, 22, 23] },
  { name: 'Sky Dive Roll Left', input: ['UP', 'LEFT'], value: 90, description: 'Roll left in mid-air', emoji: '🌪️', animationFrames: [24, 25, 26] },
  { name: 'Ghost Rider', input: ['LEFT', 'RIGHT'], value: 100, description: 'Push sled away and grab back', emoji: '👻', animationFrames: [27, 28, 29] },
  { name: 'Toboggan Toss', input: ['RIGHT', 'LEFT'], value: 100, description: '360° spin and land back on sled', emoji: '🎿', animationFrames: [30, 31, 32] },
  { name: 'Corkscrew Right', input: ['RIGHT', 'DOWN'], value: 110, description: 'Diagonal barrel roll right', emoji: '🌀', animationFrames: [33, 34, 35] },
  { name: 'Corkscrew Left', input: ['LEFT', 'DOWN'], value: 110, description: 'Diagonal barrel roll left', emoji: '🌀', animationFrames: [36, 37, 38] },
  { name: 'Falling Star', input: ['DOWN', 'UP'], value: 85, description: 'Star pose in mid-air', emoji: '✨', animationFrames: [39, 40, 41] },
  { name: 'Orbit Spin Clockwise', input: ['RIGHT', 'UP'], value: 120, description: '360° clockwise orbit', emoji: '🌍', animationFrames: [42, 43, 44] },
  { name: 'Orbit Spin Counterwise', input: ['LEFT', 'UP'], value: 120, description: '360° counterclockwise orbit', emoji: '🌍', animationFrames: [45, 46, 47] },
];

export const UPGRADE_COSTS = {
  personal: {
    rocketSurgery: [100, 250, 500, 1000, 2000],
    optimalOptics: [150, 300, 600, 1200, 2400],
    sledDurability: [200, 400, 800, 1600, 3200],
    fancierFootwear: [100, 200, 400, 800, 1600],
    attendLegDay: [150, 300, 600, 1200, 2400],
    crowdHypeman: [300, 600, 1200, 2400, 4800],
    crowdWeaver: [250, 500, 1000, 2000, 4000],
    weatherWarrior: [400, 800, 1600, 3200, 6400],
  },
  mountain: {
    skiLifts: [500, 1000, 2000, 4000, 8000],
    snowmobileRentals: [800, 1600, 3200, 6400, 12800],
    foodStalls: [300, 600, 1200, 2400, 4800],
    groomedTrails: [400, 800, 1600, 3200, 6400],
    firstAidStations: [600, 1200, 2400, 4800, 9600],
    scenicOverlooks: [350, 700, 1400, 2800, 5600],
  },
};
