import Phaser from 'phaser';
import { GameStateManager } from '../utils/GameStateManager';

export type WeatherType = 'clear' | 'snow' | 'fog' | 'wind' | 'storm' | 'blizzard';

export interface WeatherState {
  type: WeatherType;
  intensity: number; // 0-1
  windDirection: number; // 0-360 degrees
  windSpeed: number; // pixels per second
  visibility: number; // 0-1, 1 = full visibility
  temperature: number; // -50 to 50 celsius
}

export interface WeatherEffects {
  speedModifier: number; // Multiplier for sled speed
  trickDifficulty: number; // Multiplier for trick success
  visibilityRange: number; // How far you can see in pixels
  windPush: { x: number; y: number }; // Wind force vector
  hazardSpawnRate: number; // Multiplier for hazard spawning
  staminaDrain: number; // Modifier for stamina usage
}

export class WeatherSystem {
  private scene: Phaser.Scene;
  private gameStateManager: GameStateManager;

  // Current weather state
  private currentWeather: WeatherState;
  private targetWeather: WeatherState;
  private transitionProgress: number = 1;
  private transitionDuration: number = 5000; // ms

  // Weather forecast
  private forecast: WeatherType[] = [];
  private forecastHorizon: number = 4; // Number of weather periods ahead

  // Visual effects
  private particleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private fogOverlay?: Phaser.GameObjects.Graphics;
  private windIndicator?: Phaser.GameObjects.Graphics;
  private weatherUI?: Phaser.GameObjects.Container;

  // Weather patterns (time-based)
  private dayStartTime: number = 0;
  private weatherChangeInterval: number = 120000; // 2 minutes between weather changes

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameStateManager = GameStateManager.getInstance();

    // Initialize with clear weather
    this.currentWeather = this.createWeatherState('clear');
    this.targetWeather = { ...this.currentWeather };

    this.dayStartTime = Date.now();
    this.generateForecast();
  }

  /**
   * Create a weather state object
   */
  private createWeatherState(type: WeatherType): WeatherState {
    const baseStates: Record<WeatherType, WeatherState> = {
      clear: {
        type: 'clear',
        intensity: 0,
        windDirection: 0,
        windSpeed: 0,
        visibility: 1,
        temperature: 0,
      },
      snow: {
        type: 'snow',
        intensity: 0.5,
        windDirection: Math.random() * 360,
        windSpeed: 20,
        visibility: 0.85,
        temperature: -10,
      },
      fog: {
        type: 'fog',
        intensity: 0.7,
        windDirection: 0,
        windSpeed: 5,
        visibility: 0.4,
        temperature: -5,
      },
      wind: {
        type: 'wind',
        intensity: 0.6,
        windDirection: Math.random() * 360,
        windSpeed: 80,
        visibility: 0.9,
        temperature: -15,
      },
      storm: {
        type: 'storm',
        intensity: 0.8,
        windDirection: Math.random() * 360,
        windSpeed: 60,
        visibility: 0.6,
        temperature: -20,
      },
      blizzard: {
        type: 'blizzard',
        intensity: 1,
        windDirection: Math.random() * 360,
        windSpeed: 120,
        visibility: 0.3,
        temperature: -30,
      },
    };

    return { ...baseStates[type] };
  }

  /**
   * Generate weather forecast
   */
  private generateForecast(): void {
    this.forecast = [];

    const weatherTypes: WeatherType[] = ['clear', 'snow', 'fog', 'wind', 'storm', 'blizzard'];
    const weights = this.getWeatherWeights();

    for (let i = 0; i < this.forecastHorizon; i++) {
      // Weighted random selection
      const roll = Math.random();
      let cumulative = 0;

      for (let j = 0; j < weatherTypes.length; j++) {
        cumulative += weights[j];
        if (roll < cumulative) {
          this.forecast.push(weatherTypes[j]);
          break;
        }
      }
    }
  }

  /**
   * Get weather weights based on upgrades and mountain level
   */
  private getWeatherWeights(): number[] {
    const state = this.gameStateManager.getState();
    const weatherWarriorLevel = state.upgrades.personal.weatherWarrior || 0;

    // Base weights: [clear, snow, fog, wind, storm, blizzard]
    let weights = [0.4, 0.25, 0.15, 0.1, 0.07, 0.03];

    // Weather Warrior upgrade reduces harsh weather
    if (weatherWarriorLevel > 0) {
      const reduction = weatherWarriorLevel * 0.05;
      weights[0] += reduction * 3; // More clear weather
      weights[4] -= reduction; // Less storms
      weights[5] -= reduction * 2; // Much less blizzards
    }

    // Normalize weights
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => w / sum);
  }

  /**
   * Update weather system
   */
  update(delta: number): void {
    // Check if it's time to change weather
    const elapsed = Date.now() - this.dayStartTime;
    const currentPeriod = Math.floor(elapsed / this.weatherChangeInterval);
    const nextWeatherType = this.forecast[currentPeriod % this.forecastHorizon];

    if (nextWeatherType && nextWeatherType !== this.targetWeather.type) {
      this.transitionToWeather(nextWeatherType);
    }

    // Update transition
    if (this.transitionProgress < 1) {
      this.transitionProgress += delta / this.transitionDuration;
      this.transitionProgress = Math.min(1, this.transitionProgress);

      // Interpolate weather state
      this.currentWeather = this.interpolateWeather(
        this.currentWeather,
        this.targetWeather,
        this.transitionProgress
      );
    }

    // Update visual effects
    this.updateVisualEffects();
  }

  /**
   * Transition to new weather
   */
  transitionToWeather(weatherType: WeatherType): void {
    this.targetWeather = this.createWeatherState(weatherType);
    this.transitionProgress = 0;

    // Regenerate forecast if we're running low
    const elapsed = Date.now() - this.dayStartTime;
    const currentPeriod = Math.floor(elapsed / this.weatherChangeInterval);

    if (currentPeriod >= this.forecastHorizon - 2) {
      this.generateForecast();
    }
  }

  /**
   * Interpolate between two weather states
   */
  private interpolateWeather(from: WeatherState, to: WeatherState, t: number): WeatherState {
    return {
      type: t < 0.5 ? from.type : to.type,
      intensity: from.intensity + (to.intensity - from.intensity) * t,
      windDirection: from.windDirection + (to.windDirection - from.windDirection) * t,
      windSpeed: from.windSpeed + (to.windSpeed - from.windSpeed) * t,
      visibility: from.visibility + (to.visibility - from.visibility) * t,
      temperature: from.temperature + (to.temperature - from.temperature) * t,
    };
  }

  /**
   * Get current weather effects for gameplay
   */
  getEffects(): WeatherEffects {
    const w = this.currentWeather;
    const effects: WeatherEffects = {
      speedModifier: 1,
      trickDifficulty: 1,
      visibilityRange: 1000,
      windPush: { x: 0, y: 0 },
      hazardSpawnRate: 1,
      staminaDrain: 1,
    };

    switch (w.type) {
      case 'clear':
        // No modifiers, perfect conditions
        break;

      case 'snow':
        // Snow increases slide speed slightly
        effects.speedModifier = 1 + (w.intensity * 0.1);
        effects.visibilityRange = 800 * w.visibility;
        effects.trickDifficulty = 1.05;
        break;

      case 'fog':
        // Fog heavily reduces visibility
        effects.visibilityRange = 400 * w.visibility;
        effects.trickDifficulty = 1.1;
        break;

      case 'wind':
        // Wind pushes player
        const windRad = (w.windDirection * Math.PI) / 180;
        effects.windPush = {
          x: Math.cos(windRad) * w.windSpeed * w.intensity,
          y: Math.sin(windRad) * w.windSpeed * w.intensity,
        };
        effects.trickDifficulty = 1.15;
        effects.staminaDrain = 1.2;
        break;

      case 'storm':
        // Storm combines multiple harsh effects
        const stormRad = (w.windDirection * Math.PI) / 180;
        effects.windPush = {
          x: Math.cos(stormRad) * w.windSpeed * w.intensity * 0.8,
          y: Math.sin(stormRad) * w.windSpeed * w.intensity * 0.8,
        };
        effects.visibilityRange = 600 * w.visibility;
        effects.trickDifficulty = 1.25;
        effects.hazardSpawnRate = 1.5;
        effects.staminaDrain = 1.3;
        break;

      case 'blizzard':
        // Blizzard is the harshest weather
        const blizzardRad = (w.windDirection * Math.PI) / 180;
        effects.windPush = {
          x: Math.cos(blizzardRad) * w.windSpeed * w.intensity,
          y: Math.sin(blizzardRad) * w.windSpeed * w.intensity,
        };
        effects.visibilityRange = 300 * w.visibility;
        effects.speedModifier = 1.15; // Fast but dangerous
        effects.trickDifficulty = 1.5;
        effects.hazardSpawnRate = 2;
        effects.staminaDrain = 1.5;
        break;
    }

    // Apply Weather Warrior upgrade bonuses
    const state = this.gameStateManager.getState();
    const weatherWarriorLevel = state.upgrades.personal.weatherWarrior || 0;

    if (weatherWarriorLevel > 0) {
      const bonus = weatherWarriorLevel * 0.1;
      effects.trickDifficulty *= (1 - bonus * 0.5);
      effects.staminaDrain *= (1 - bonus);
      effects.visibilityRange *= (1 + bonus);
    }

    return effects;
  }

  /**
   * Update visual effects based on current weather
   */
  private updateVisualEffects(): void {
    const w = this.currentWeather;

    // Clear old particle emitters
    this.particleEmitters.forEach(emitter => emitter.stop());

    switch (w.type) {
      case 'snow':
      case 'blizzard':
        this.createSnowEffect(w);
        break;

      case 'storm':
        this.createStormEffect(w);
        break;
    }

    // Update fog overlay
    this.updateFogEffect(w);

    // Update wind indicator
    this.updateWindIndicator(w);

    // Update screen tint
    this.updateScreenTint(w);
  }

  /**
   * Create snow particle effect
   */
  private createSnowEffect(weather: WeatherState): void {
    const { width } = this.scene.cameras.main;

    // Calculate wind offset
    const windRad = (weather.windDirection * Math.PI) / 180;
    const windX = Math.cos(windRad) * weather.windSpeed * 0.5;

    const snowEmitter = this.scene.add.particles(0, -20, 'white', {
      x: { min: -100, max: width + 100 },
      y: 0,
      speedX: { min: windX - 10, max: windX + 10 },
      speedY: { min: 50 * weather.intensity, max: 150 * weather.intensity },
      scale: { min: 0.1, max: 0.4 },
      alpha: { min: 0.3, max: 0.8 },
      lifespan: 3000,
      frequency: weather.type === 'blizzard' ? 10 : 50,
      blendMode: 'ADD',
    }).setDepth(900);

    this.particleEmitters.push(snowEmitter);
  }

  /**
   * Create storm effect (snow + lightning)
   */
  private createStormEffect(weather: WeatherState): void {
    this.createSnowEffect(weather);

    // Occasional lightning flashes
    if (Math.random() < 0.002) {
      this.flashLightning();
    }
  }

  /**
   * Flash lightning effect
   */
  private flashLightning(): void {
    const { width, height } = this.scene.cameras.main;

    const flash = this.scene.add.graphics().setDepth(950);
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRect(0, 0, width, height);

    // Random lightning bolt shape (simplified)
    flash.lineStyle(4, 0xffffff, 1);
    const startX = width * (0.3 + Math.random() * 0.4);
    let x = startX;
    let y = 0;

    flash.beginPath();
    flash.moveTo(x, y);

    while (y < height) {
      y += 50 + Math.random() * 100;
      x += (Math.random() - 0.5) * 100;
      flash.lineTo(x, y);
    }

    flash.strokePath();

    // Quick fade out
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // Camera shake
    this.scene.cameras.main.shake(100, 0.005);
  }

  /**
   * Update fog overlay
   */
  private updateFogEffect(weather: WeatherState): void {
    const { width, height } = this.scene.cameras.main;

    if (!this.fogOverlay) {
      this.fogOverlay = this.scene.add.graphics().setDepth(920);
    }

    this.fogOverlay.clear();

    if (weather.type === 'fog' || weather.visibility < 0.7) {
      const fogAlpha = Math.min(0.7, 1 - weather.visibility);

      // Gradient fog
      this.fogOverlay.fillGradientStyle(
        0xcccccc,
        0xcccccc,
        0x888888,
        0x888888,
        fogAlpha * 0.3,
        fogAlpha * 0.3,
        fogAlpha * 0.5,
        fogAlpha * 0.5
      );
      this.fogOverlay.fillRect(0, 0, width, height);
    }
  }

  /**
   * Update wind direction indicator
   */
  private updateWindIndicator(weather: WeatherState): void {
    if (weather.windSpeed < 30) {
      if (this.windIndicator) {
        this.windIndicator.setVisible(false);
      }
      return;
    }

    const { width } = this.scene.cameras.main;

    if (!this.windIndicator) {
      this.windIndicator = this.scene.add.graphics().setDepth(1100);
    }

    this.windIndicator.setVisible(true);
    this.windIndicator.clear();

    // Draw wind arrow in top-right corner
    const arrowX = width - 80;
    const arrowY = 80;
    const arrowLength = 30;

    const windRad = (weather.windDirection * Math.PI) / 180;
    const endX = arrowX + Math.cos(windRad) * arrowLength;
    const endY = arrowY + Math.sin(windRad) * arrowLength;

    // Arrow shaft
    this.windIndicator.lineStyle(3, 0xffffff, 0.8);
    this.windIndicator.beginPath();
    this.windIndicator.moveTo(arrowX, arrowY);
    this.windIndicator.lineTo(endX, endY);
    this.windIndicator.strokePath();

    // Arrowhead
    const headSize = 8;
    const angle1 = windRad + (Math.PI * 3) / 4;
    const angle2 = windRad - (Math.PI * 3) / 4;

    this.windIndicator.beginPath();
    this.windIndicator.moveTo(endX, endY);
    this.windIndicator.lineTo(endX + Math.cos(angle1) * headSize, endY + Math.sin(angle1) * headSize);
    this.windIndicator.moveTo(endX, endY);
    this.windIndicator.lineTo(endX + Math.cos(angle2) * headSize, endY + Math.sin(angle2) * headSize);
    this.windIndicator.strokePath();
  }

  /**
   * Update screen tint based on weather
   */
  private updateScreenTint(weather: WeatherState): void {
    const camera = this.scene.cameras.main;

    // Reset tint
    camera.setAlpha(1);

    // Apply subtle tint based on weather
    switch (weather.type) {
      case 'storm':
      case 'blizzard':
        // Slight blue-gray tint
        // Note: Phaser camera tint is limited, this is more of a placeholder
        break;
    }
  }

  /**
   * Show weather UI (forecast, current conditions)
   */
  showWeatherUI(): void {
    if (this.weatherUI) return;

    const { width } = this.scene.cameras.main;

    this.weatherUI = this.scene.add.container(width - 220, 20).setDepth(1100);

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2c3e50, 0.9);
    bg.fillRoundedRect(0, 0, 200, 180, 8);
    bg.lineStyle(2, 0x3498db, 1);
    bg.strokeRoundedRect(0, 0, 200, 180, 8);
    this.weatherUI.add(bg);

    // Title
    const title = this.scene.add.text(100, 15, 'WEATHER', {
      fontSize: '16px',
      color: '#ecf0f1',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.weatherUI.add(title);

    // Current weather
    const currentLabel = this.scene.add.text(10, 40, 'Current:', {
      fontSize: '12px',
      color: '#95a5a6',
    });
    this.weatherUI.add(currentLabel);

    const currentWeather = this.scene.add.text(10, 55, this.formatWeatherName(this.currentWeather.type), {
      fontSize: '14px',
      color: '#ecf0f1',
      fontStyle: 'bold',
    });
    this.weatherUI.add(currentWeather);

    // Temperature
    const tempText = this.scene.add.text(10, 75, `${this.currentWeather.temperature.toFixed(0)}°C`, {
      fontSize: '12px',
      color: '#3498db',
    });
    this.weatherUI.add(tempText);

    // Forecast
    const forecastLabel = this.scene.add.text(10, 100, 'Forecast:', {
      fontSize: '12px',
      color: '#95a5a6',
    });
    this.weatherUI.add(forecastLabel);

    this.forecast.slice(0, 3).forEach((weather, index) => {
      const forecastText = this.scene.add.text(
        10,
        120 + index * 18,
        `${index + 1}h: ${this.formatWeatherName(weather)}`,
        {
          fontSize: '11px',
          color: '#bdc3c7',
        }
      );
      this.weatherUI?.add(forecastText);
    });
  }

  /**
   * Hide weather UI
   */
  hideWeatherUI(): void {
    if (this.weatherUI) {
      this.weatherUI.destroy();
      this.weatherUI = undefined;
    }
  }

  /**
   * Format weather type name for display
   */
  private formatWeatherName(type: WeatherType): string {
    const names: Record<WeatherType, string> = {
      clear: 'Clear',
      snow: 'Snowing',
      fog: 'Foggy',
      wind: 'Windy',
      storm: 'Storm',
      blizzard: 'Blizzard',
    };
    return names[type];
  }

  /**
   * Get current weather state
   */
  getCurrentWeather(): WeatherState {
    return { ...this.currentWeather };
  }

  /**
   * Get weather forecast
   */
  getForecast(): WeatherType[] {
    return [...this.forecast];
  }

  /**
   * Force weather change (for testing or special events)
   */
  forceWeather(type: WeatherType, immediate: boolean = false): void {
    this.targetWeather = this.createWeatherState(type);

    if (immediate) {
      this.currentWeather = { ...this.targetWeather };
      this.transitionProgress = 1;
    } else {
      this.transitionProgress = 0;
    }
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    this.particleEmitters.forEach(emitter => {
      if (emitter) {
        emitter.stop();
        emitter.destroy();
      }
    });
    this.particleEmitters = [];

    if (this.fogOverlay) {
      this.fogOverlay.destroy();
      this.fogOverlay = undefined;
    }

    if (this.windIndicator) {
      this.windIndicator.destroy();
      this.windIndicator = undefined;
    }

    this.hideWeatherUI();
  }
}
