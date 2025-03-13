// Game constants
const CONSTANTS = {
    // Player
    PLAYER_SPEED: 200,
    PLAYER_JUMP_VELOCITY: -400,
    MAX_PLAYER_HEALTH: 100,
    COLLISION_DAMAGE: 10,
    
    // Physics
    GRAVITY_DOWNHILL: 300,
    GRAVITY_UPHILL: 0,
    
    // Game economy
    INITIAL_MONEY: 100,
    LOAN_AMOUNT: 5000,
    
    // Tricks
    TRICK_REWARDS: {
        LEFT_HELICOPTER: 50,
        RIGHT_HELICOPTER: 50,
        AIR_BRAKE: 30,
        PARACHUTE: 100
    },
    TRICK_COMBO_MULTIPLIER: 1.5,
    
    // Camera
    CAMERA_FOLLOW_SPEED: 0.1,
    
    // Photography
    PHOTO_BASE_REWARD: 75,
    PHOTO_CENTER_BONUS: 30,
    PHOTO_ALTITUDE_BONUS: 50,
    PHOTO_MOVING_BONUS: 25,
    PHOTO_REPEAT_PENALTY: 0.5,
    
    // Animals
    ANIMAL_SPAWN_CHANCE: 0.02,
    ANIMAL_TYPES: ['bear', 'bird'],
    ANIMAL_SPEEDS: {
        bear: 50,
        bird: 120
    },
    
    // Upgrades
    UPGRADE_COSTS: {
        ROCKET_SURGERY: [100, 300, 600, 1000, 1500],
        OPTIMAL_OPTICS: [150, 350, 700, 1200, 2000],
        SLED_DURABILITY: [200, 400, 800, 1400, 2500],
        FANCIER_FOOTWEAR: [120, 320, 650, 1100, 1800]
    },
    
    // Upgrade effects
    UPGRADE_EFFECTS: {
        ROCKET_SURGERY: [10, 20, 30, 40, 50], // % speed increase
        OPTIMAL_OPTICS: [10, 20, 30, 40, 50], // % camera accuracy
        SLED_DURABILITY: [1, 2, 3, 4, 5], // extra collisions
        FANCIER_FOOTWEAR: [10, 20, 30, 40, 50] // % uphill speed increase
    },
    
    // Mountain settings
    MOUNTAIN_HEIGHT: 5000,
    MOUNTAIN_WIDTH: 10000,
};