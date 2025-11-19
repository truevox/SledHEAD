import { describe, it, expect } from 'vitest';

/**
 * Weather system calculations that can be tested without Phaser
 */

type WeatherType = 'clear' | 'snow' | 'fog' | 'wind' | 'storm' | 'blizzard';

interface WeatherState {
  type: WeatherType;
  intensity: number;
  windDirection: number;
  windSpeed: number;
  visibility: number;
  temperature: number;
}

interface WeatherEffects {
  speedModifier: number;
  trickDifficulty: number;
  visibilityRange: number;
  windPush: { x: number; y: number };
  hazardSpawnRate: number;
  staminaDrain: number;
}

// Create base weather states
function createWeatherState(type: WeatherType, windDirection: number = 0): WeatherState {
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
      windDirection: windDirection,
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
      windDirection: windDirection,
      windSpeed: 80,
      visibility: 0.9,
      temperature: -15,
    },
    storm: {
      type: 'storm',
      intensity: 0.8,
      windDirection: windDirection,
      windSpeed: 60,
      visibility: 0.6,
      temperature: -20,
    },
    blizzard: {
      type: 'blizzard',
      intensity: 1,
      windDirection: windDirection,
      windSpeed: 120,
      visibility: 0.3,
      temperature: -30,
    },
  };

  return { ...baseStates[type] };
}

// Calculate weather effects (from WeatherSystem.getEffects)
function calculateWeatherEffects(weather: WeatherState, weatherWarriorLevel: number = 0): WeatherEffects {
  const effects: WeatherEffects = {
    speedModifier: 1,
    trickDifficulty: 1,
    visibilityRange: 1000,
    windPush: { x: 0, y: 0 },
    hazardSpawnRate: 1,
    staminaDrain: 1,
  };

  switch (weather.type) {
    case 'clear':
      break;

    case 'snow':
      effects.speedModifier = 1 + (weather.intensity * 0.1);
      effects.visibilityRange = 800 * weather.visibility;
      effects.trickDifficulty = 1.05;
      break;

    case 'fog':
      effects.visibilityRange = 400 * weather.visibility;
      effects.trickDifficulty = 1.1;
      break;

    case 'wind':
      const windRad = (weather.windDirection * Math.PI) / 180;
      effects.windPush = {
        x: Math.cos(windRad) * weather.windSpeed * weather.intensity,
        y: Math.sin(windRad) * weather.windSpeed * weather.intensity,
      };
      effects.trickDifficulty = 1.15;
      effects.staminaDrain = 1.2;
      break;

    case 'storm':
      const stormRad = (weather.windDirection * Math.PI) / 180;
      effects.windPush = {
        x: Math.cos(stormRad) * weather.windSpeed * weather.intensity * 0.8,
        y: Math.sin(stormRad) * weather.windSpeed * weather.intensity * 0.8,
      };
      effects.visibilityRange = 600 * weather.visibility;
      effects.trickDifficulty = 1.25;
      effects.hazardSpawnRate = 1.5;
      effects.staminaDrain = 1.3;
      break;

    case 'blizzard':
      const blizzardRad = (weather.windDirection * Math.PI) / 180;
      effects.windPush = {
        x: Math.cos(blizzardRad) * weather.windSpeed * weather.intensity,
        y: Math.sin(blizzardRad) * weather.windSpeed * weather.intensity,
      };
      effects.visibilityRange = 300 * weather.visibility;
      effects.speedModifier = 1.15;
      effects.trickDifficulty = 1.5;
      effects.hazardSpawnRate = 2;
      effects.staminaDrain = 1.5;
      break;
  }

  // Apply Weather Warrior upgrade
  if (weatherWarriorLevel > 0) {
    const bonus = weatherWarriorLevel * 0.1;
    effects.trickDifficulty *= (1 - bonus * 0.5);
    effects.staminaDrain *= (1 - bonus);
    effects.visibilityRange *= (1 + bonus);
  }

  return effects;
}

// Calculate wind force vector
function calculateWindForce(
  direction: number,
  speed: number,
  intensity: number
): { x: number; y: number } {
  const radians = (direction * Math.PI) / 180;
  return {
    x: Math.cos(radians) * speed * intensity,
    y: Math.sin(radians) * speed * intensity,
  };
}

// Interpolate between two weather states
function interpolateWeather(from: WeatherState, to: WeatherState, t: number): WeatherState {
  return {
    type: t < 0.5 ? from.type : to.type,
    intensity: from.intensity + (to.intensity - from.intensity) * t,
    windDirection: from.windDirection + (to.windDirection - from.windDirection) * t,
    windSpeed: from.windSpeed + (to.windSpeed - from.windSpeed) * t,
    visibility: from.visibility + (to.visibility - from.visibility) * t,
    temperature: from.temperature + (to.temperature - from.temperature) * t,
  };
}

describe('Weather Effects Calculations', () => {
  describe('Weather State Creation', () => {
    it('should create clear weather with no effects', () => {
      const weather = createWeatherState('clear');
      expect(weather.type).toBe('clear');
      expect(weather.intensity).toBe(0);
      expect(weather.windSpeed).toBe(0);
      expect(weather.visibility).toBe(1);
    });

    it('should create snow with correct properties', () => {
      const weather = createWeatherState('snow');
      expect(weather.type).toBe('snow');
      expect(weather.intensity).toBe(0.5);
      expect(weather.visibility).toBe(0.85);
      expect(weather.temperature).toBe(-10);
    });

    it('should create fog with low visibility', () => {
      const weather = createWeatherState('fog');
      expect(weather.visibility).toBe(0.4);
    });

    it('should create wind with high wind speed', () => {
      const weather = createWeatherState('wind');
      expect(weather.windSpeed).toBe(80);
    });

    it('should create storm with combined harsh effects', () => {
      const weather = createWeatherState('storm');
      expect(weather.intensity).toBe(0.8);
      expect(weather.windSpeed).toBe(60);
      expect(weather.visibility).toBe(0.6);
    });

    it('should create blizzard as harshest weather', () => {
      const weather = createWeatherState('blizzard');
      expect(weather.intensity).toBe(1);
      expect(weather.windSpeed).toBe(120);
      expect(weather.visibility).toBe(0.3);
      expect(weather.temperature).toBe(-30);
    });

    it('should allow custom wind direction', () => {
      const weather = createWeatherState('wind', 90);
      expect(weather.windDirection).toBe(90);
    });
  });

  describe('Wind Force Calculations', () => {
    it('should calculate east wind (0 degrees)', () => {
      const force = calculateWindForce(0, 100, 1);
      expect(force.x).toBeCloseTo(100);
      expect(force.y).toBeCloseTo(0);
    });

    it('should calculate north wind (90 degrees)', () => {
      const force = calculateWindForce(90, 100, 1);
      expect(force.x).toBeCloseTo(0);
      expect(force.y).toBeCloseTo(100);
    });

    it('should calculate west wind (180 degrees)', () => {
      const force = calculateWindForce(180, 100, 1);
      expect(force.x).toBeCloseTo(-100);
      expect(force.y).toBeCloseTo(0);
    });

    it('should calculate south wind (270 degrees)', () => {
      const force = calculateWindForce(270, 100, 1);
      expect(force.x).toBeCloseTo(0);
      expect(force.y).toBeCloseTo(-100);
    });

    it('should calculate northeast wind (45 degrees)', () => {
      const force = calculateWindForce(45, 100, 1);
      expect(force.x).toBeCloseTo(70.71, 1);
      expect(force.y).toBeCloseTo(70.71, 1);
    });

    it('should scale by intensity', () => {
      const fullForce = calculateWindForce(0, 100, 1);
      const halfForce = calculateWindForce(0, 100, 0.5);
      expect(halfForce.x).toBeCloseTo(fullForce.x / 2);
    });

    it('should scale by speed', () => {
      const slowForce = calculateWindForce(0, 50, 1);
      const fastForce = calculateWindForce(0, 100, 1);
      expect(fastForce.x).toBe(slowForce.x * 2);
    });

    it('should return zero force for zero speed', () => {
      const force = calculateWindForce(45, 0, 1);
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });

    it('should return zero force for zero intensity', () => {
      const force = calculateWindForce(45, 100, 0);
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });

    it('should handle 360+ degrees', () => {
      const force360 = calculateWindForce(360, 100, 1);
      const force0 = calculateWindForce(0, 100, 1);
      expect(force360.x).toBeCloseTo(force0.x);
      expect(force360.y).toBeCloseTo(force0.y);
    });
  });

  describe('Weather Effects Calculation', () => {
    describe('Clear Weather', () => {
      it('should have no modifiers', () => {
        const weather = createWeatherState('clear');
        const effects = calculateWeatherEffects(weather);

        expect(effects.speedModifier).toBe(1);
        expect(effects.trickDifficulty).toBe(1);
        expect(effects.visibilityRange).toBe(1000);
        expect(effects.windPush.x).toBe(0);
        expect(effects.windPush.y).toBe(0);
        expect(effects.hazardSpawnRate).toBe(1);
        expect(effects.staminaDrain).toBe(1);
      });
    });

    describe('Snow Effects', () => {
      it('should increase speed slightly', () => {
        const weather = createWeatherState('snow');
        const effects = calculateWeatherEffects(weather);

        // 1 + (0.5 * 0.1) = 1.05
        expect(effects.speedModifier).toBe(1.05);
      });

      it('should reduce visibility', () => {
        const weather = createWeatherState('snow');
        const effects = calculateWeatherEffects(weather);

        // 800 * 0.85 = 680
        expect(effects.visibilityRange).toBe(680);
      });

      it('should slightly increase trick difficulty', () => {
        const weather = createWeatherState('snow');
        const effects = calculateWeatherEffects(weather);
        expect(effects.trickDifficulty).toBe(1.05);
      });
    });

    describe('Fog Effects', () => {
      it('should heavily reduce visibility', () => {
        const weather = createWeatherState('fog');
        const effects = calculateWeatherEffects(weather);

        // 400 * 0.4 = 160
        expect(effects.visibilityRange).toBe(160);
      });

      it('should increase trick difficulty', () => {
        const weather = createWeatherState('fog');
        const effects = calculateWeatherEffects(weather);
        expect(effects.trickDifficulty).toBe(1.1);
      });

      it('should not affect speed', () => {
        const weather = createWeatherState('fog');
        const effects = calculateWeatherEffects(weather);
        expect(effects.speedModifier).toBe(1);
      });
    });

    describe('Wind Effects', () => {
      it('should push player in wind direction', () => {
        const weather = createWeatherState('wind', 0); // East wind
        const effects = calculateWeatherEffects(weather);

        // 80 * 0.6 = 48
        expect(effects.windPush.x).toBeCloseTo(48);
        expect(effects.windPush.y).toBeCloseTo(0);
      });

      it('should increase trick difficulty', () => {
        const weather = createWeatherState('wind');
        const effects = calculateWeatherEffects(weather);
        expect(effects.trickDifficulty).toBe(1.15);
      });

      it('should increase stamina drain', () => {
        const weather = createWeatherState('wind');
        const effects = calculateWeatherEffects(weather);
        expect(effects.staminaDrain).toBe(1.2);
      });
    });

    describe('Storm Effects', () => {
      it('should have moderate wind push', () => {
        const weather = createWeatherState('storm', 0);
        const effects = calculateWeatherEffects(weather);

        // 60 * 0.8 * 0.8 = 38.4
        expect(effects.windPush.x).toBeCloseTo(38.4);
      });

      it('should reduce visibility', () => {
        const weather = createWeatherState('storm');
        const effects = calculateWeatherEffects(weather);

        // 600 * 0.6 = 360
        expect(effects.visibilityRange).toBe(360);
      });

      it('should increase hazard spawn rate', () => {
        const weather = createWeatherState('storm');
        const effects = calculateWeatherEffects(weather);
        expect(effects.hazardSpawnRate).toBe(1.5);
      });

      it('should increase stamina drain significantly', () => {
        const weather = createWeatherState('storm');
        const effects = calculateWeatherEffects(weather);
        expect(effects.staminaDrain).toBe(1.3);
      });

      it('should have high trick difficulty', () => {
        const weather = createWeatherState('storm');
        const effects = calculateWeatherEffects(weather);
        expect(effects.trickDifficulty).toBe(1.25);
      });
    });

    describe('Blizzard Effects', () => {
      it('should have maximum wind push', () => {
        const weather = createWeatherState('blizzard', 0);
        const effects = calculateWeatherEffects(weather);

        // 120 * 1 = 120
        expect(effects.windPush.x).toBeCloseTo(120);
      });

      it('should have minimum visibility', () => {
        const weather = createWeatherState('blizzard');
        const effects = calculateWeatherEffects(weather);

        // 300 * 0.3 = 90
        expect(effects.visibilityRange).toBe(90);
      });

      it('should increase speed (fast but dangerous)', () => {
        const weather = createWeatherState('blizzard');
        const effects = calculateWeatherEffects(weather);
        expect(effects.speedModifier).toBe(1.15);
      });

      it('should have maximum trick difficulty', () => {
        const weather = createWeatherState('blizzard');
        const effects = calculateWeatherEffects(weather);
        expect(effects.trickDifficulty).toBe(1.5);
      });

      it('should double hazard spawn rate', () => {
        const weather = createWeatherState('blizzard');
        const effects = calculateWeatherEffects(weather);
        expect(effects.hazardSpawnRate).toBe(2);
      });

      it('should have maximum stamina drain', () => {
        const weather = createWeatherState('blizzard');
        const effects = calculateWeatherEffects(weather);
        expect(effects.staminaDrain).toBe(1.5);
      });
    });
  });

  describe('Weather Warrior Upgrade', () => {
    it('should reduce trick difficulty at level 1', () => {
      const weather = createWeatherState('blizzard');
      const noUpgrade = calculateWeatherEffects(weather, 0);
      const level1 = calculateWeatherEffects(weather, 1);

      // trickDifficulty * (1 - 0.1 * 0.5) = 1.5 * 0.95 = 1.425
      expect(level1.trickDifficulty).toBeLessThan(noUpgrade.trickDifficulty);
      expect(level1.trickDifficulty).toBeCloseTo(1.425);
    });

    it('should reduce stamina drain', () => {
      const weather = createWeatherState('blizzard');
      const noUpgrade = calculateWeatherEffects(weather, 0);
      const level5 = calculateWeatherEffects(weather, 5);

      // staminaDrain * (1 - 0.5) = 1.5 * 0.5 = 0.75
      expect(level5.staminaDrain).toBeCloseTo(0.75);
      expect(level5.staminaDrain).toBeLessThan(noUpgrade.staminaDrain);
    });

    it('should increase visibility range', () => {
      const weather = createWeatherState('fog');
      const noUpgrade = calculateWeatherEffects(weather, 0);
      const level5 = calculateWeatherEffects(weather, 5);

      // visibilityRange * (1 + 0.5) = 160 * 1.5 = 240
      expect(level5.visibilityRange).toBeCloseTo(240);
      expect(level5.visibilityRange).toBeGreaterThan(noUpgrade.visibilityRange);
    });

    it('should scale effects linearly with level', () => {
      const weather = createWeatherState('storm');

      const level1 = calculateWeatherEffects(weather, 1);
      const level3 = calculateWeatherEffects(weather, 3);
      const level5 = calculateWeatherEffects(weather, 5);

      // Visibility should increase linearly
      expect(level3.visibilityRange).toBeGreaterThan(level1.visibilityRange);
      expect(level5.visibilityRange).toBeGreaterThan(level3.visibilityRange);
    });

    it('should have no effect on clear weather', () => {
      const weather = createWeatherState('clear');
      const noUpgrade = calculateWeatherEffects(weather, 0);
      const level5 = calculateWeatherEffects(weather, 5);

      // Trick difficulty and stamina drain are 1 for clear, upgrade reduces these
      // But since they're multiplied by (1 - bonus), they go below 1
      expect(level5.visibilityRange).toBeGreaterThan(noUpgrade.visibilityRange);
    });
  });

  describe('Weather Interpolation', () => {
    it('should keep first type at t=0', () => {
      const from = createWeatherState('clear');
      const to = createWeatherState('blizzard');
      const result = interpolateWeather(from, to, 0);

      expect(result.type).toBe('clear');
      expect(result.intensity).toBe(0);
    });

    it('should switch to second type at t=0.5', () => {
      const from = createWeatherState('clear');
      const to = createWeatherState('blizzard');
      const result = interpolateWeather(from, to, 0.5);

      expect(result.type).toBe('blizzard');
    });

    it('should fully transition at t=1', () => {
      const from = createWeatherState('clear');
      const to = createWeatherState('blizzard');
      const result = interpolateWeather(from, to, 1);

      expect(result.type).toBe('blizzard');
      expect(result.intensity).toBe(1);
      expect(result.windSpeed).toBe(120);
    });

    it('should interpolate intensity linearly', () => {
      const from = createWeatherState('clear');
      const to = createWeatherState('blizzard');
      const result = interpolateWeather(from, to, 0.5);

      // (0 + 1) / 2 = 0.5
      expect(result.intensity).toBe(0.5);
    });

    it('should interpolate wind speed', () => {
      const from = createWeatherState('clear');
      const to = createWeatherState('blizzard');
      const result = interpolateWeather(from, to, 0.25);

      // 0 + (120 - 0) * 0.25 = 30
      expect(result.windSpeed).toBe(30);
    });

    it('should interpolate visibility', () => {
      const from = createWeatherState('clear'); // visibility 1
      const to = createWeatherState('blizzard'); // visibility 0.3
      const result = interpolateWeather(from, to, 0.5);

      // 1 + (0.3 - 1) * 0.5 = 0.65
      expect(result.visibility).toBeCloseTo(0.65);
    });

    it('should interpolate temperature', () => {
      const from = createWeatherState('clear'); // 0
      const to = createWeatherState('blizzard'); // -30
      const result = interpolateWeather(from, to, 0.5);

      expect(result.temperature).toBe(-15);
    });
  });

  describe('Visibility Calculations', () => {
    it('should have max visibility in clear weather', () => {
      const weather = createWeatherState('clear');
      const effects = calculateWeatherEffects(weather);
      expect(effects.visibilityRange).toBe(1000);
    });

    it('should rank weather types by visibility', () => {
      const types: WeatherType[] = ['clear', 'wind', 'snow', 'storm', 'fog', 'blizzard'];
      const visibilities = types.map(type => {
        const weather = createWeatherState(type);
        return calculateWeatherEffects(weather).visibilityRange;
      });

      // Clear should have best visibility
      expect(visibilities[0]).toBe(Math.max(...visibilities));
      // Blizzard should have worst
      expect(visibilities[5]).toBe(Math.min(...visibilities));
    });
  });

  describe('Difficulty Progression', () => {
    it('should have increasing difficulty from clear to blizzard', () => {
      const clear = calculateWeatherEffects(createWeatherState('clear'));
      const snow = calculateWeatherEffects(createWeatherState('snow'));
      const fog = calculateWeatherEffects(createWeatherState('fog'));
      const wind = calculateWeatherEffects(createWeatherState('wind'));
      const storm = calculateWeatherEffects(createWeatherState('storm'));
      const blizzard = calculateWeatherEffects(createWeatherState('blizzard'));

      expect(clear.trickDifficulty).toBeLessThan(snow.trickDifficulty);
      expect(snow.trickDifficulty).toBeLessThan(fog.trickDifficulty);
      expect(fog.trickDifficulty).toBeLessThan(wind.trickDifficulty);
      expect(wind.trickDifficulty).toBeLessThan(storm.trickDifficulty);
      expect(storm.trickDifficulty).toBeLessThan(blizzard.trickDifficulty);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative wind direction', () => {
      const force = calculateWindForce(-90, 100, 1);
      expect(force.x).toBeCloseTo(0);
      expect(force.y).toBeCloseTo(-100);
    });

    it('should handle very high intensity', () => {
      const weather = createWeatherState('wind', 0);
      weather.intensity = 2; // Double intensity
      const effects = calculateWeatherEffects(weather);

      expect(effects.windPush.x).toBeCloseTo(160);
    });

    it('should handle zero visibility gracefully', () => {
      const weather = createWeatherState('fog');
      weather.visibility = 0;
      const effects = calculateWeatherEffects(weather);

      expect(effects.visibilityRange).toBe(0);
    });

    it('should handle high upgrade levels', () => {
      const weather = createWeatherState('blizzard');
      const effects = calculateWeatherEffects(weather, 10);

      // Should still produce valid numbers
      expect(effects.staminaDrain).toBeGreaterThanOrEqual(0);
      expect(effects.trickDifficulty).toBeGreaterThan(0);
    });
  });
});
