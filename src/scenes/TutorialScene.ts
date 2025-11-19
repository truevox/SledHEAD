import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

export class TutorialScene extends Phaser.Scene {
  private gameStateManager!: GameStateManager;
  private player!: Phaser.Physics.Arcade.Sprite;
  private grandpa!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private isSleddingMode: boolean = false;
  private playerSpeed: number = 150;
  private sledSpeed: number = 0;
  private completedRuns: number = 0;
  private tutorialStep: number = 0;

  private dialogueBox!: Phaser.GameObjects.Container;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogueVisible: boolean = false;

  private hillTop: number = 100;
  private hillBottom: number = 500;
  private hillCenterX: number = 400;

  // Sunset color palette
  private readonly SUNSET_COLORS = {
    coral: 0xff6b6b,
    yellow: 0xffd93d,
    blue: 0x95afc0,
  };

  constructor() {
    super({ key: 'TutorialScene' });
  }

  create(): void {
    // Initialize game state manager
    this.gameStateManager = GameStateManager.getInstance();

    // Set world bounds for the small tutorial hill
    this.physics.world.setBounds(0, 0, 800, 600);

    // Create beautiful sunset sky gradient
    this.createSunsetBackground();

    // Create the tutorial hill terrain
    this.createHillTerrain();

    // Create player sprite at bottom of hill
    this.player = this.physics.add.sprite(this.hillCenterX, this.hillBottom, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);

    // Create Grandpa NPC at starting position
    this.grandpa = this.physics.add.sprite(this.hillCenterX - 80, this.hillBottom, 'npc_grandpa');
    this.grandpa.setScale(2);

    // Setup camera
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Setup input controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any;
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Create dialogue UI
    this.createDialogueBox();

    // Start tutorial sequence
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.showDialogue("Welcome, kiddo! Let's teach you how to sled.");
      this.tutorialStep = 1;
    });

    // Add some decorative trees
    this.addDecorativeTrees();
  }

  update(): void {
    if (this.isSleddingMode) {
      this.updateSleddingMode();
    } else {
      this.updateWalkingMode();
    }

    this.checkTutorialProgress();
  }

  private createSunsetBackground(): void {
    // Create gradient background with sunset colors
    const graphics = this.add.graphics();

    // Sky gradient from top to bottom
    for (let y = 0; y < 600; y++) {
      const percent = y / 600;

      // Interpolate between sunset colors
      if (percent < 0.3) {
        // Blue to Coral transition (top)
        const localPercent = percent / 0.3;
        const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.IntegerToColor(this.SUNSET_COLORS.blue),
          Phaser.Display.Color.IntegerToColor(this.SUNSET_COLORS.coral),
          100,
          localPercent * 100
        );
        graphics.fillStyle(colorObj.color, 1);
      } else if (percent < 0.6) {
        // Coral to Yellow transition (middle)
        const localPercent = (percent - 0.3) / 0.3;
        const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.IntegerToColor(this.SUNSET_COLORS.coral),
          Phaser.Display.Color.IntegerToColor(this.SUNSET_COLORS.yellow),
          100,
          localPercent * 100
        );
        graphics.fillStyle(colorObj.color, 1);
      } else {
        // Yellow fading to white at horizon (bottom)
        const localPercent = (percent - 0.6) / 0.4;
        const yellowColor = Phaser.Display.Color.IntegerToColor(this.SUNSET_COLORS.yellow);
        const white = Phaser.Display.Color.IntegerToColor(0xffffff);
        const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(
          yellowColor,
          white,
          100,
          localPercent * 100
        );
        graphics.fillStyle(colorObj.color, 1);
      }

      graphics.fillRect(0, y, 800, 1);
    }
  }

  private createHillTerrain(): void {
    const graphics = this.add.graphics();

    // Create hill shape with snow gradient
    const hillPoints: Phaser.Math.Vector2[] = [];

    // Generate smooth hill curve
    for (let x = 0; x <= 800; x += 10) {
      const centerDistance = Math.abs(x - this.hillCenterX);
      const hillHeight = Math.pow((1 - centerDistance / 400), 2) * 300;
      const y = this.hillBottom - hillHeight;
      hillPoints.push(new Phaser.Math.Vector2(x, y));
    }

    // Draw snow terrain with gradient (lighter at top, darker at bottom)
    for (let i = 0; i < hillPoints.length - 1; i++) {
      const point = hillPoints[i];
      const nextPoint = hillPoints[i + 1];

      // Calculate altitude-based color (lighter = higher)
      const altitude = 1 - ((point.y - this.hillTop) / (this.hillBottom - this.hillTop));
      const brightness = 0.7 + (altitude * 0.3);
      const snowColor = Phaser.Display.Color.HSVToRGB(0.6, 0.1, brightness);

      graphics.fillStyle(snowColor.color, 1);
      graphics.fillTriangle(
        point.x, point.y,
        nextPoint.x, nextPoint.y,
        nextPoint.x, 600
      );
      graphics.fillTriangle(
        point.x, point.y,
        point.x, 600,
        nextPoint.x, 600
      );
    }

    // Add sparkles to snow
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 800;
      const centerDistance = Math.abs(x - this.hillCenterX);
      const hillHeight = Math.pow((1 - centerDistance / 400), 2) * 300;
      const minY = this.hillBottom - hillHeight;
      const y = minY + Math.random() * (600 - minY);

      graphics.fillStyle(0xffffff, 0.6 + Math.random() * 0.4);
      graphics.fillCircle(x, y, 1 + Math.random() * 2);
    }
  }

  private addDecorativeTrees(): void {
    // Add a few trees around the hill for atmosphere
    const treePositions = [
      { x: 100, y: 400 },
      { x: 150, y: 450 },
      { x: 650, y: 400 },
      { x: 700, y: 450 },
      { x: 50, y: 500 },
      { x: 750, y: 500 },
    ];

    treePositions.forEach(pos => {
      const variant = Math.floor(Math.random() * 3);
      const tree = this.add.sprite(pos.x, pos.y, `tree_${variant}`);
      tree.setScale(1.5);
      tree.setAlpha(0.7);
    });
  }

  private createDialogueBox(): void {
    const boxWidth = 600;
    const boxHeight = 100;
    const boxX = 400;
    const boxY = 550;

    // Create dialogue container
    this.dialogueBox = this.add.container(boxX, boxY);

    // Background box
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.9);
    bg.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 10);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 10);

    // Grandpa name label
    const nameLabel = this.add.text(-boxWidth / 2 + 20, -boxHeight / 2 + 10, 'Grandpa:', {
      fontSize: '18px',
      color: '#ffd93d',
      fontStyle: 'bold',
    });

    // Dialogue text
    this.dialogueText = this.add.text(-boxWidth / 2 + 20, -boxHeight / 2 + 35, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: boxWidth - 40 },
    });

    this.dialogueBox.add([bg, nameLabel, this.dialogueText]);
    this.dialogueBox.setVisible(false);
    this.dialogueBox.setDepth(100);
  }

  private showDialogue(message: string): void {
    this.dialogueText.setText(message);
    this.dialogueBox.setVisible(true);
    this.dialogueVisible = true;

    // Auto-hide after 5 seconds
    this.time.delayedCall(5000, () => {
      this.hideDialogue();
    });
  }

  private hideDialogue(): void {
    this.dialogueBox.setVisible(false);
    this.dialogueVisible = false;
  }

  private updateWalkingMode(): void {
    // WASD movement for walking uphill
    let velocityX = 0;
    let velocityY = 0;

    if (this.wasdKeys.W.isDown || this.cursors.up!.isDown) {
      velocityY = -this.playerSpeed;
    } else if (this.wasdKeys.S.isDown || this.cursors.down!.isDown) {
      velocityY = this.playerSpeed;
    }

    if (this.wasdKeys.A.isDown || this.cursors.left!.isDown) {
      velocityX = -this.playerSpeed;
    } else if (this.wasdKeys.D.isDown || this.cursors.right!.isDown) {
      velocityX = this.playerSpeed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Check if player pressed SPACE at the top
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isNearTop()) {
      this.startSleddingMode();
    }
  }

  private updateSleddingMode(): void {
    // Automatic downward sledding
    this.sledSpeed += 2; // Acceleration
    this.sledSpeed = Math.min(this.sledSpeed, 400); // Max speed

    // Steer left/right while sledding
    let velocityX = 0;

    if (this.wasdKeys.A.isDown || this.cursors.left!.isDown) {
      velocityX = -200;
    } else if (this.wasdKeys.D.isDown || this.cursors.right!.isDown) {
      velocityX = 200;
    }

    this.player.setVelocity(velocityX, this.sledSpeed);

    // Rotate player sprite to show sledding
    this.player.setAngle(15);

    // Check if reached bottom
    if (this.player.y >= this.hillBottom - 20) {
      this.endSleddingMode();
    }
  }

  private startSleddingMode(): void {
    this.isSleddingMode = true;
    this.sledSpeed = 50;
    this.showDialogue("Great! Now steer with A and D!");
  }

  private endSleddingMode(): void {
    this.isSleddingMode = false;
    this.sledSpeed = 0;
    this.player.setVelocity(0, 0);
    this.player.setAngle(0);
    this.completedRuns++;

    // Complete tutorial after first run
    this.time.delayedCall(1000, () => {
      this.showDialogue("You're a natural! Time to hit Debumont!");
      this.tutorialStep = 6;

      // Complete tutorial after a moment
      this.time.delayedCall(3000, () => {
        this.completeTutorial();
      });
    });
  }

  private checkTutorialProgress(): void {
    // Progress tutorial steps based on player actions
    if (this.tutorialStep === 1 && !this.dialogueVisible) {
      this.showDialogue("Use WASD to walk around. White snow is uphill, darker snow is downhill.");
      this.tutorialStep = 2;
    }

    if (this.tutorialStep === 2 && this.hasPlayerMoved() && !this.dialogueVisible) {
      this.time.delayedCall(2000, () => {
        this.showDialogue("Walk to the top of the hill first.");
        this.tutorialStep = 3;
      });
    }

    if (this.tutorialStep === 3 && this.isNearTop() && !this.dialogueVisible) {
      this.showDialogue("Press SPACE to start sledding down!");
      this.tutorialStep = 4;
    }
  }

  private hasPlayerMoved(): boolean {
    return Math.abs(this.player.x - this.hillCenterX) > 20 ||
           Math.abs(this.player.y - this.hillBottom) > 20;
  }

  private isNearTop(): boolean {
    return this.player.y < this.hillTop + 50;
  }

  private completeTutorial(): void {
    // Mark tutorial as complete (setState automatically saves)
    this.gameStateManager.setState({ tutorialComplete: true });

    // Fade out and transition to house scene
    this.cameras.main.fadeOut(1500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Transition to HouseScene to start the real game
      this.scene.start('HouseScene');
    });
  }
}
