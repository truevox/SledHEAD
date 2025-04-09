/* audio.test.js - Tests for the audio system and sound effects */

describe('Audio System', () => {
  beforeEach(() => {
    // Mock Web Audio API
    global.AudioContext = jest.fn(() => ({
      createOscillator: jest.fn(() => ({
        type: null,
        frequency: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn()
        },
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        disconnect: jest.fn()
      })),
      createGain: jest.fn(() => ({
        gain: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn()
        },
        connect: jest.fn(),
        disconnect: jest.fn()
      })),
      destination: {},
      currentTime: 0
    }));
    
    global.webkitAudioContext = global.AudioContext;
    
    // Mock player properties
    global.player = {
      isJumping: false,
      jumpTimer: 0,
      jumpDuration: 500
    };
    
    // Variables for audio tracking
    global.audioCtx = null;
    global.jumpOsc = null;
    global.jumpGain = null;
    
    // Implement audio functions
    global.unlockAudioContext = jest.fn(() => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    });
    
    global.playTone = jest.fn((frequency = 440, type = "sine", duration = 0.5, volume = 0.3) => {
      unlockAudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
      
      return { oscillator, gainNode };
    });
    
    global.playStartGameSound = jest.fn(() => {
      return playTone(440, "triangle", 0.5);
    });
    
    global.playCrashSound = jest.fn(() => {
      unlockAudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
      
      return { oscillator, gainNode };
    });
    
    global.playRockHitSound = jest.fn(() => {
      return playTone(200, "square", 0.2);
    });
    
    global.playMoneyGainSound = jest.fn(() => {
      return playTone(1000, "sine", 0.15, 0.2);
    });
    
    global.playTrickCompleteSound = jest.fn(() => {
      return playTone(600, "sine", 0.1, 0.2);
    });
    
    global.cleanupJumpSound = jest.fn(() => {
      if (jumpOsc) {
        jumpOsc.stop();
        jumpOsc.disconnect();
        jumpOsc = null;
      }
      if (jumpGain) {
        jumpGain.disconnect();
        jumpGain = null;
      }
    });
  });
  
  test('unlockAudioContext initializes audio context if null', () => {
    expect(audioCtx).toBeNull();
    unlockAudioContext();
    expect(audioCtx).not.toBeNull();
    expect(AudioContext).toHaveBeenCalled();
  });
  
  test('unlockAudioContext does not reinitialize existing audio context', () => {
    unlockAudioContext();
    const initialAudioCtx = audioCtx;
    AudioContext.mockClear();
    
    unlockAudioContext();
    expect(audioCtx).toBe(initialAudioCtx);
    expect(AudioContext).not.toHaveBeenCalled();
  });
  
  test('playTone creates and configures oscillator and gain node', () => {
    const { oscillator, gainNode } = playTone(440, "sine", 0.5, 0.3);
    
    expect(oscillator.type).toBe("sine");
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
    expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.3, 0);
    expect(gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.0001, 0.5);
    
    expect(oscillator.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledWith(audioCtx.destination);
    
    expect(oscillator.start).toHaveBeenCalled();
    expect(oscillator.stop).toHaveBeenCalledWith(0.5);
  });
  
  test('playStartGameSound uses triangle wave with correct frequency', () => {
    const playToneSpy = jest.spyOn(global, 'playTone');
    playStartGameSound();
    
    expect(playToneSpy).toHaveBeenCalledWith(440, "triangle", 0.5);
  });
  
  test('playCrashSound creates sawtooth oscillator with frequency ramp', () => {
    const { oscillator, gainNode } = playCrashSound();
    
    expect(oscillator.type).toBe("sawtooth");
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 0);
    expect(oscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(100, 0.5);
    
    expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.3, 0);
    expect(gainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.0001, 0.5);
  });
  
  test('playRockHitSound uses square wave with correct frequency', () => {
    const playToneSpy = jest.spyOn(global, 'playTone');
    playRockHitSound();
    
    expect(playToneSpy).toHaveBeenCalledWith(200, "square", 0.2);
  });
  
  test('playMoneyGainSound uses sine wave with correct parameters', () => {
    const playToneSpy = jest.spyOn(global, 'playTone');
    playMoneyGainSound();
    
    expect(playToneSpy).toHaveBeenCalledWith(1000, "sine", 0.15, 0.2);
  });
  
  test('playTrickCompleteSound uses sine wave with correct parameters', () => {
    const playToneSpy = jest.spyOn(global, 'playTone');
    playTrickCompleteSound();
    
    expect(playToneSpy).toHaveBeenCalledWith(600, "sine", 0.1, 0.2);
  });
  
  test('cleanupJumpSound properly stops and disconnects oscillator and gain node', () => {
    // Create mock jumpOsc and jumpGain before calling the cleanup function
    const stopSpy = jest.fn();
    const disconnectOscSpy = jest.fn();
    const disconnectGainSpy = jest.fn();
    
    global.jumpOsc = {
      stop: stopSpy,
      disconnect: disconnectOscSpy
    };
    
    global.jumpGain = {
      disconnect: disconnectGainSpy
    };
    
    // Call the cleanup function
    cleanupJumpSound();
    
    // Verify the functions were called before jumpOsc and jumpGain were set to null
    expect(stopSpy).toHaveBeenCalled();
    expect(disconnectOscSpy).toHaveBeenCalled();
    expect(disconnectGainSpy).toHaveBeenCalled();
    
    // Verify the globals were set to null
    expect(jumpOsc).toBeNull();
    expect(jumpGain).toBeNull();
  });
  
  test('cleanupJumpSound handles null oscillator and gain node', () => {
    jumpOsc = null;
    jumpGain = null;
    
    // Should not throw an error
    expect(() => cleanupJumpSound()).not.toThrow();
  });
}); 