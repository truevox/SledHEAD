import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

type Direction = 'up' | 'down' | 'left' | 'right';
type KiteType = 'windwhip' | 'stormkite' | 'aerogel_wing' | 'bubbleknot' | 'lunarch';

interface RhythmNote {
  direction: Direction;
  timestamp: number;
  hit: boolean;
  sprite?: Phaser.GameObjects.Sprite;
}

interface KiteStats {
  name: string;
  type: KiteType;
  liftPower: number;
  stability: number;
  airtimeBonus: number;
  description: string;
  emoji: string;
  color: number;
}

interface Thermal {
  x: number;
  y: number;
  strength: number;
  radius: number;
  sprite?: Phaser.GameObjects.Graphics;
}

interface FloatingLoot {
  x: number;
  y: number;
  value: number;
  collected: boolean;
  sprite?: Phaser.GameObjects.Sprite;
}

export class KiteFlyingMinigame {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private active: boolean = false;

  // Kite types
  private kiteTypes: KiteStats[] = [
    {
      name: 'Windwhip',
      type: 'windwhip',
      liftPower: 1,
      stability: 0.8,
      airtimeBonus: 2,
      description: 'Basic kite, reliable starter',
      emoji: '🪁',
      color: 0xff6b6b,
    },
    {
      name: 'Stormkite',
      type: 'stormkite',
      liftPower: 1.5,
      stability: 0.5,
      airtimeBonus: 4,
      description: 'High power, low stability',
      emoji: '⚡',
      color: 0x4ecdc4,
    },
    {
      name: 'Aerogel Wing',
      type: 'aerogel_wing',
      liftPower: 1.2,
      stability: 1.2,
      airtimeBonus: 5,
      description: 'Balanced performance',
      emoji: '✈️',
      color: 0x95e1d3,
    },
    {
      name: 'Bubbleknot',
      type: 'bubbleknot',
      liftPower: 0.8,
      stability: 1.5,
      airtimeBonus: 3,
      description: 'Maximum stability',
      emoji: '💨',
      color: 0xf38181,
    },
    {
      name: 'Lunarch',
      type: 'lunarch',
      liftPower: 2,
      stability: 1,
      airtimeBonus: 8,
      description: 'Ultimate kite',
      emoji: '🌙',
      color: 0xaa96da,
    },
  ];

  private currentKite: KiteStats;
  private ownedKites: KiteType[] = ['windwhip']; // Start with basic kite

  // Rhythm system
  private notes: RhythmNote[] = [];
  private noteSpeed: number = 200; // pixels per second
  private bpm: number = 120;
  private beatInterval: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private perfectHits: number = 0;
  private goodHits: number = 0;
  private missedNotes: number = 0;

  // Flight mechanics
  private altitude: number = 0;
  private maxAltitude: number = 500;
  private velocity: number = 0;
  private windStrength: number = 1;
  private thermals: Thermal[] = [];

  // Loot system
  private floatingLoots: FloatingLoot[] = [];
  private collectedLoot: number = 0;

  // Input
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private kKey?: Phaser.Input.Keyboard.Key;

  // UI
  private uiContainer?: Phaser.GameObjects.Container;
  private noteTrack?: Phaser.GameObjects.Graphics;
  private hitZone?: Phaser.GameObjects.Graphics;
  private kiteSprite?: Phaser.GameObjects.Sprite;
  private altitudeText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private feedbackText?: Phaser.GameObjects.Text;
  private kiteText?: Phaser.GameObjects.Text;

  // Session stats
  private sessionScore: number = 0;
  private airtimeEarned: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameStateManager.getInstance();
    this.currentKite = this.kiteTypes[0]; // Start with Windwhip
    this.beatInterval = 60000 / this.bpm;
    this.loadOwnedKites();
  }

  private loadOwnedKites(): void {
    try {
      const saved = localStorage.getItem('sledhead_kites');
      if (saved) {
        this.ownedKites = JSON.parse(saved);
      }
    } catch (_e) {
      console.error('Failed to load kites:', _e);
    }
  }

  private saveOwnedKites(): void {
    try {
      localStorage.setItem('sledhead_kites', JSON.stringify(this.ownedKites));
    } catch (_e) {
      console.error('Failed to save kites:', _e);
    }
  }

  start(kiteType?: KiteType): void {
    this.active = true;
    this.altitude = 0;
    this.velocity = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.missedNotes = 0;
    this.sessionScore = 0;
    this.airtimeEarned = 0;
    this.collectedLoot = 0;
    this.notes = [];
    this.thermals = [];
    this.floatingLoots = [];

    // Set kite
    if (kiteType && this.ownedKites.includes(kiteType)) {
      this.currentKite = this.kiteTypes.find(k => k.type === kiteType) || this.kiteTypes[0];
    }

    this.setupInput();
    this.createUI();
    this.generateThermals();
    this.spawnFloatingLoot();
    this.startRhythmSequence();
  }

  private setupInput(): void {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    this.kKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.K);
  }

  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.uiContainer = this.scene.add.container(0, 0).setDepth(1000);

    // Note track (vertical scrolling track)
    this.noteTrack = this.scene.add.graphics().setDepth(999);
    this.drawNoteTrack();

    // Hit zone (where player needs to hit notes)
    this.hitZone = this.scene.add.graphics().setDepth(1001);
    this.drawHitZone();

    // Kite sprite
    this.kiteSprite = this.scene.add.sprite(width / 2, height - 200, '');
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(this.currentKite.color, 1);
    graphics.fillTriangle(0, -20, -15, 20, 15, 20);
    graphics.generateTexture('kite_sprite', 30, 40);
    graphics.destroy();
    this.kiteSprite.setTexture('kite_sprite');
    this.kiteSprite.setDepth(1000);

    // Altitude meter
    this.altitudeText = this.scene.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setDepth(1002);
    this.uiContainer.add(this.altitudeText);

    // Combo text
    this.comboText = this.scene.add.text(width / 2, 50, '', {
      fontSize: '36px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 5,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1002);
    this.uiContainer.add(this.comboText);

    // Score text
    this.scoreText = this.scene.add.text(width - 20, 20, '', {
      fontSize: '20px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(1002);
    this.uiContainer.add(this.scoreText);

    // Kite info
    this.kiteText = this.scene.add.text(20, 50, '', {
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setDepth(1002);
    this.uiContainer.add(this.kiteText);
    this.updateKiteText();

    // Feedback text
    this.feedbackText = this.scene.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1003);
    this.uiContainer.add(this.feedbackText);

    // Instructions
    const instructions = this.scene.add.text(width / 2, height - 30,
      'Arrow Keys: Hit Notes | K: Change Kite | ESC: Exit', {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1002);
    this.uiContainer.add(instructions);
  }

  private drawNoteTrack(): void {
    if (!this.noteTrack) return;

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.noteTrack.clear();

    // Four lanes for up, down, left, right
    const laneWidth = 80;
    const startX = width / 2 - (laneWidth * 2);

    for (let i = 0; i < 4; i++) {
      const x = startX + i * laneWidth;
      this.noteTrack.lineStyle(2, 0x444444, 0.8);
      this.noteTrack.strokeRect(x, 0, laneWidth, height);
    }
  }

  private drawHitZone(): void {
    if (!this.hitZone) return;

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const hitY = height - 150;

    this.hitZone.clear();

    // Hit zone indicator
    const laneWidth = 80;
    const startX = width / 2 - (laneWidth * 2);

    this.hitZone.lineStyle(4, 0x00ff00, 0.8);
    this.hitZone.strokeRect(startX, hitY - 30, laneWidth * 4, 60);

    // Direction labels
    const directions = ['↑', '↓', '←', '→'];
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf];

    for (let i = 0; i < 4; i++) {
      const x = startX + i * laneWidth + laneWidth / 2;
      this.scene.add.text(x, hitY, directions[i], {
        fontSize: '32px',
        color: `#${colors[i].toString(16).padStart(6, '0')}`,
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(1001);
    }
  }

  private startRhythmSequence(): void {
    this.scheduleNextNote();
  }

  private scheduleNextNote(): void {
    if (!this.active) return;

    // Random direction
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    const direction = Phaser.Utils.Array.GetRandom(directions);

    const note: RhythmNote = {
      direction,
      timestamp: Date.now(),
      hit: false,
    };

    this.createNoteSprite(note);
    this.notes.push(note);

    // Schedule next note
    const delay = this.beatInterval + Phaser.Math.Between(-100, 100); // Add variation
    setTimeout(() => this.scheduleNextNote(), delay);
  }

  private createNoteSprite(note: RhythmNote): void {
    const width = this.scene.cameras.main.width;
    const laneWidth = 80;
    const startX = width / 2 - (laneWidth * 2);

    const laneIndex = ['up', 'down', 'left', 'right'].indexOf(note.direction);
    const x = startX + laneIndex * laneWidth + laneWidth / 2;

    // Create note sprite
    const sprite = this.scene.add.sprite(x, -50, '');

    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf];
    graphics.fillStyle(colors[laneIndex], 1);
    graphics.fillCircle(0, 0, 25);
    graphics.generateTexture(`note_${Date.now()}_${Math.random()}`, 50, 50);
    graphics.destroy();

    sprite.setTexture(`note_${Date.now()}_${Math.random()}`);
    sprite.setDepth(1000);

    note.sprite = sprite;
  }

  private updateNotes(delta: number): void {
    const height = this.scene.cameras.main.height;
    const hitY = height - 150;

    // Update note positions
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];
      if (!note.sprite) continue;

      // Move note down
      note.sprite.y += this.noteSpeed * (delta / 1000);

      // Check if note passed hit zone
      if (note.sprite.y > hitY + 100 && !note.hit) {
        this.missNote(note);
        this.notes.splice(i, 1);
      }

      // Remove if off screen
      if (note.sprite.y > height + 100) {
        note.sprite.destroy();
        this.notes.splice(i, 1);
      }
    }
  }

  private handleInput(): void {
    if (!this.cursors) return;

    const height = this.scene.cameras.main.height;
    const hitY = height - 150;

    // Check for arrow key presses
    const inputs: { key: Phaser.Input.Keyboard.Key, direction: Direction }[] = [
      { key: this.cursors.up!, direction: 'up' },
      { key: this.cursors.down!, direction: 'down' },
      { key: this.cursors.left!, direction: 'left' },
      { key: this.cursors.right!, direction: 'right' },
    ];

    for (const input of inputs) {
      if (Phaser.Input.Keyboard.JustDown(input.key)) {
        this.tryHitNote(input.direction, hitY);
      }
    }

    // Change kite
    if (Phaser.Input.Keyboard.JustDown(this.kKey!)) {
      this.cycleKite();
    }
  }

  private tryHitNote(direction: Direction, hitY: number): void {
    // Find closest note in this direction
    const matchingNotes = this.notes.filter(n => n.direction === direction && !n.hit);

    if (matchingNotes.length === 0) return;

    // Find note closest to hit zone
    let closestNote: RhythmNote | null = null;
    let closestDistance = Infinity;

    for (const note of matchingNotes) {
      if (!note.sprite) continue;
      const distance = Math.abs(note.sprite.y - hitY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNote = note;
      }
    }

    if (!closestNote) return;

    // Check timing
    const perfectWindow = 30;
    const goodWindow = 60;
    const okWindow = 100;

    if (closestDistance < perfectWindow) {
      this.hitNote(closestNote, 'perfect');
    } else if (closestDistance < goodWindow) {
      this.hitNote(closestNote, 'good');
    } else if (closestDistance < okWindow) {
      this.hitNote(closestNote, 'ok');
    }
  }

  private hitNote(note: RhythmNote, quality: 'perfect' | 'good' | 'ok'): void {
    note.hit = true;
    note.sprite?.destroy();

    // Update combo
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    // Calculate score
    const baseScore = quality === 'perfect' ? 100 : quality === 'good' ? 75 : 50;
    const comboBonus = Math.min(this.combo * 10, 500);
    const score = baseScore + comboBonus;
    this.sessionScore += score;

    // Update stats
    if (quality === 'perfect') this.perfectHits++;
    if (quality === 'good') this.goodHits++;

    // Increase altitude
    const lift = this.currentKite.liftPower * (quality === 'perfect' ? 15 : quality === 'good' ? 10 : 5);
    this.velocity += lift;

    // Visual feedback
    this.showHitFeedback(quality, score);
    this.updateComboText();
  }

  private missNote(note: RhythmNote): void {
    note.sprite?.destroy();
    this.combo = 0;
    this.missedNotes++;
    this.showHitFeedback('miss', 0);
  }

  private showHitFeedback(quality: 'perfect' | 'good' | 'ok' | 'miss', score: number): void {
    if (!this.feedbackText) return;

    const colors = {
      perfect: 0xff00ff,
      good: 0x00ff00,
      ok: 0xffff00,
      miss: 0xff0000,
    };

    const texts = {
      perfect: `PERFECT! +${score}`,
      good: `GOOD! +${score}`,
      ok: `OK +${score}`,
      miss: 'MISS!',
    };

    this.feedbackText.setText(texts[quality]);
    this.feedbackText.setColor(`#${colors[quality].toString(16).padStart(6, '0')}`);
    this.feedbackText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.feedbackText,
      y: this.feedbackText.y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        if (this.feedbackText) {
          this.feedbackText.y += 30;
        }
      }
    });
  }

  private updateComboText(): void {
    if (!this.comboText) return;

    if (this.combo > 1) {
      this.comboText.setText(`COMBO x${this.combo}`);
      this.comboText.setAlpha(1);

      this.scene.tweens.add({
        targets: this.comboText,
        scale: { from: 1.3, to: 1 },
        duration: 200,
        ease: 'Back.easeOut',
      });
    } else {
      this.comboText.setText('');
    }
  }

  private updateKiteText(): void {
    if (!this.kiteText) return;
    this.kiteText.setText(
      `${this.currentKite.emoji} ${this.currentKite.name} | Airtime: +${this.currentKite.airtimeBonus}s`
    );
  }

  private cycleKite(): void {
    const ownedKiteStats = this.kiteTypes.filter(k => this.ownedKites.includes(k.type));

    if (ownedKiteStats.length <= 1) return;

    const currentIndex = ownedKiteStats.indexOf(this.currentKite);
    const nextIndex = (currentIndex + 1) % ownedKiteStats.length;
    this.currentKite = ownedKiteStats[nextIndex];

    this.updateKiteText();
    this.showFeedback(`Switched to ${this.currentKite.name}`, this.currentKite.color);
  }

  private generateThermals(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    for (let i = 0; i < 3; i++) {
      const thermal: Thermal = {
        x: Phaser.Math.Between(100, width - 100),
        y: Phaser.Math.Between(100, height - 200),
        strength: Phaser.Math.FloatBetween(0.5, 2),
        radius: Phaser.Math.Between(80, 150),
      };

      // Create visual
      const graphics = this.scene.add.graphics().setDepth(800);
      graphics.fillStyle(0xffaa00, 0.2);
      graphics.fillCircle(thermal.x, thermal.y, thermal.radius);
      thermal.sprite = graphics;

      this.thermals.push(thermal);
    }
  }

  private checkThermals(): void {
    if (!this.kiteSprite) return;

    for (const thermal of this.thermals) {
      const distance = Phaser.Math.Distance.Between(
        this.kiteSprite.x,
        this.kiteSprite.y,
        thermal.x,
        thermal.y
      );

      if (distance < thermal.radius) {
        this.velocity += thermal.strength * 0.5;

        // Pulse effect
        if (thermal.sprite) {
          const scale = 1 + Math.sin(Date.now() / 200) * 0.1;
          thermal.sprite.setScale(scale);
        }
      }
    }
  }

  private spawnFloatingLoot(): void {
    const width = this.scene.cameras.main.width;

    for (let i = 0; i < 5; i++) {
      const loot: FloatingLoot = {
        x: Phaser.Math.Between(50, width - 50),
        y: Phaser.Math.Between(50, 400),
        value: Phaser.Math.Between(10, 50),
        collected: false,
      };

      // Create sprite
      const sprite = this.scene.add.sprite(loot.x, loot.y, '');
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xffff00, 1);
      graphics.fillCircle(0, 0, 8);
      graphics.generateTexture(`loot_${i}`, 30, 30);
      graphics.destroy();

      sprite.setTexture(`loot_${i}`);
      sprite.setDepth(900);
      loot.sprite = sprite;

      this.floatingLoots.push(loot);
    }
  }

  private checkLootCollection(): void {
    if (!this.kiteSprite) return;

    for (const loot of this.floatingLoots) {
      if (loot.collected || !loot.sprite) continue;

      const distance = Phaser.Math.Distance.Between(
        this.kiteSprite.x,
        this.kiteSprite.y,
        loot.x,
        loot.y
      );

      if (distance < 40) {
        loot.collected = true;
        this.collectedLoot += loot.value;
        this.gameState.addMoney(loot.value);

        // Visual effect
        this.scene.tweens.add({
          targets: loot.sprite,
          scale: 2,
          alpha: 0,
          duration: 300,
          onComplete: () => loot.sprite?.destroy()
        });

        this.showFeedback(`+$${loot.value}`, 0xffff00);
      }
    }
  }

  private updateFlight(delta: number): void {
    // Apply physics
    const gravity = 5 * (1 / this.currentKite.stability);
    this.velocity -= gravity * (delta / 1000);

    // Wind effect
    this.velocity += this.windStrength * (delta / 1000);

    // Update altitude
    this.altitude += this.velocity * (delta / 1000);
    this.altitude = Math.max(0, Math.min(this.maxAltitude, this.altitude));

    // Stop at ground
    if (this.altitude <= 0) {
      this.velocity = Math.max(0, this.velocity);
    }

    // Update kite position
    if (this.kiteSprite) {
      const height = this.scene.cameras.main.height;
      const visualY = height - 200 - (this.altitude / this.maxAltitude) * 300;
      this.kiteSprite.setY(visualY);

      // Tilt based on velocity
      const tilt = Math.min(30, Math.max(-30, this.velocity * 2));
      this.kiteSprite.setAngle(tilt);
    }

    // Calculate airtime earned
    if (this.altitude > 100) {
      this.airtimeEarned += (delta / 1000) * this.currentKite.airtimeBonus;
    }

    this.updateAltitudeText();
  }

  private updateAltitudeText(): void {
    if (!this.altitudeText) return;
    this.altitudeText.setText(
      `Altitude: ${Math.floor(this.altitude)}m\nAirtime: ${this.airtimeEarned.toFixed(1)}s`
    );
  }

  private showFeedback(text: string, color: number): void {
    // Create temporary text
    const tempText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2 - 100,
      text,
      {
        fontSize: '24px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setDepth(1003);

    this.scene.tweens.add({
      targets: tempText,
      y: tempText.y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => tempText.destroy()
    });
  }

  update(_time: number, delta: number): void {
    if (!this.active) return;

    this.handleInput();
    this.updateNotes(delta);
    this.updateFlight(delta);
    this.checkThermals();
    this.checkLootCollection();

    // Update score
    if (this.scoreText) {
      this.scoreText.setText(
        `Score: ${this.sessionScore}\nLoot: $${this.collectedLoot}\nMax Combo: ${this.maxCombo}`
      );
    }
  }

  stop(): void {
    this.active = false;

    // Cleanup
    this.notes.forEach(n => n.sprite?.destroy());
    this.notes = [];

    this.thermals.forEach(t => t.sprite?.destroy());
    this.thermals = [];

    this.floatingLoots.forEach(l => l.sprite?.destroy());
    this.floatingLoots = [];

    this.uiContainer?.destroy();
    this.noteTrack?.destroy();
    this.hitZone?.destroy();
    this.kiteSprite?.destroy();
  }

  isActive(): boolean {
    return this.active;
  }

  getAirtimeEarned(): number {
    return this.airtimeEarned;
  }

  getSessionScore(): number {
    return this.sessionScore;
  }

  unlockKite(type: KiteType): void {
    if (!this.ownedKites.includes(type)) {
      this.ownedKites.push(type);
      this.saveOwnedKites();
    }
  }

  destroy(): void {
    this.stop();
  }
}
