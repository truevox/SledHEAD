/***********************************************
 * Sledding Roguelike - Phaser Version (Revised)
 * Bubbles is proud of ya, bud! 🎿🔥
 ***********************************************/

window.onload = () => {
  // Phaser config
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container", // Attach the game to our <div id="game-container">
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }, // We'll apply custom gravity in the scene
        debug: true        // Turn on debugging so you can see bounding boxes
      }
    },
    scene: [SleddingGame, UpgradeShop]
  };

  new Phaser.Game(config);
};

class SleddingGame extends Phaser.Scene {
  constructor() {
    super({ key: "SleddingGame" });
  }

  preload() {
    // Load images (make sure these files exist or adjust paths)
    this.load.image("player", "assets/player.png");
    this.load.image("obstacle", "assets/obstacle.png");
  }

  create() {
    // Pull upgrade data from the registry or create defaults
    // We'll store them as dictionaries:
    //   - "equipmentUpgrades"
    //   - "mountainUpgrades"
    let equipmentUpgrades = this.registry.get("equipmentUpgrades") || {};
    let mountainUpgrades = this.registry.get("mountainUpgrades") || {};

    // If they're not set, initialize them with some sample keys
    // e.g., "WaxedSled", "GrapplingHook", etc.
    if (!Object.keys(equipmentUpgrades).length) {
      equipmentUpgrades = {
        WaxedSled: 0,
        GrapplingHook: 0
      };
      this.registry.set("equipmentUpgrades", equipmentUpgrades);
    }

    // e.g., "AvalancheBeacon", "BetterBoots", etc.
    if (!Object.keys(mountainUpgrades).length) {
      mountainUpgrades = {
        AvalancheBeacon: 0,
        BetterBoots: 0
      };
      this.registry.set("mountainUpgrades", mountainUpgrades);
    }

    // Set up a bestTime in the registry if it doesn't exist
    if (this.registry.get("bestTime") === undefined) {
      this.registry.set("bestTime", Infinity);
    }

    // Keep track of collisions in this scene
    this.collisions = 0;
    this.maxCollisions = 3;

    // Start time for the run
    this.startTime = this.time.now;

    // Create a random "mountain" full of obstacles
    this.mountainHeight = 2000;
    this.physics.world.setBounds(0, 0, 800, this.mountainHeight);

    // Create the player (center at x=400, y=0)
    this.player = this.physics.add.sprite(400, 0, "player");
    this.player.setCollideWorldBounds(true);

    // Example: Let's make WaxedSled level boost downward speed
    let waxedLevel = equipmentUpgrades.WaxedSled || 0;
    // Increase gravity based on waxedLevel
    this.player.setGravityY(200 + waxedLevel * 50);

    // A little bounciness for collisions
    this.player.setBounce(0.3);

    // Set up camera to follow the player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, 800, this.mountainHeight);

    // A group for obstacles
    this.obstacles = this.physics.add.staticGroup();

    // Generate random obstacles
    for (let i = 0; i < 40; i++) {
      let x = Phaser.Math.Between(50, 750);
      let y = Phaser.Math.Between(50, this.mountainHeight - 50);
      let obs = this.obstacles.create(x, y, "obstacle");
      // If you have a bigger sprite, you might scale it
      obs.setScale(0.5).refreshBody();
    }

    // Add collision detection
    this.physics.add.collider(this.player, this.obstacles, this.handleCollision, null, this);

    // Basic cursor input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  handleCollision(player, obstacle) {
    this.collisions++;
    console.log(`Collision ${this.collisions} of ${this.maxCollisions}, bud!`);

    if (this.collisions >= this.maxCollisions) {
      console.log("Too many collisions—run ended early!");
      this.endRun();
    }
  }

  update() {
    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // Minimal "downhill" check:
    // If the player goes past mountainHeight, end the run
    if (this.player.y >= this.mountainHeight) {
      console.log("Reached bottom, bud!");
      this.endRun();
    }
  }

  endRun() {
    let timeTaken = (this.time.now - this.startTime) / 1000;
    let bestTime = this.registry.get("bestTime");

    if (timeTaken < bestTime) {
      this.registry.set("bestTime", timeTaken);
      console.log(`New best time: ${timeTaken.toFixed(2)} s`);
    }
    // Switch to shop scene
    this.scene.start("UpgradeShop");
  }
}

class UpgradeShop extends Phaser.Scene {
  constructor() {
    super({ key: "UpgradeShop" });
  }

  create() {
    // Retrieve best time
    let bestTime = this.registry.get("bestTime");
    let displayTime = bestTime === Infinity ? "N/A" : bestTime.toFixed(2) + " s";

    this.add.text(100, 100, `Best Time: ${displayTime}`, { fontSize: "24px", fill: "#fff" });

    // Retrieve upgrade dictionaries
    let equipmentUpgrades = this.registry.get("equipmentUpgrades");
    let mountainUpgrades = this.registry.get("mountainUpgrades");

    // Show & increment Equipment Upgrades
    // We'll demonstrate WaxedSled and GrapplingHook
    let eqTextY = 160;
    for (let eqKey in equipmentUpgrades) {
      this.add.text(100, eqTextY, `${eqKey} Lv: ${equipmentUpgrades[eqKey]}`, { fill: "#ff9900" })
        .setInteractive()
        .on("pointerdown", () => {
          equipmentUpgrades[eqKey] += 1;
          this.registry.set("equipmentUpgrades", equipmentUpgrades);
          console.log(`Upgraded ${eqKey} to Lv ${equipmentUpgrades[eqKey]}!`);
          // Restart the run
          this.scene.start("SleddingGame");
        });
      eqTextY += 40;
    }

    // Show & increment Mountain Upgrades
    // We'll demonstrate AvalancheBeacon and BetterBoots
    let mtTextY = eqTextY + 40;
    for (let mtKey in mountainUpgrades) {
      this.add.text(100, mtTextY, `${mtKey} Lv: ${mountainUpgrades[mtKey]}`, { fill: "#ff9900" })
        .setInteractive()
        .on("pointerdown", () => {
          mountainUpgrades[mtKey] += 1;
          this.registry.set("mountainUpgrades", mountainUpgrades);
          console.log(`Upgraded ${mtKey} to Lv ${mountainUpgrades[mtKey]}!`);
          // Restart the run
          this.scene.start("SleddingGame");
        });
      mtTextY += 40;
    }

    // "Play Again" text if they don't wanna upgrade
    this.add.text(100, mtTextY + 60, "Click to Play Again", { fill: "#fff" })
      .setInteractive()
      .on("pointerdown", () => {
        this.scene.start("SleddingGame");
      });
  }
}

