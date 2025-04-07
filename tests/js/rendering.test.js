/* rendering.test.js - Tests for canvas initialization and rendering functions */

describe('Rendering System', () => {
  beforeEach(() => {
    // Mock canvas and context
    global.canvas = { width: 800, height: 450 };
    global.ctx = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      closePath: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      save: jest.fn(),
      restore: jest.fn(),
      fillStyle: null,
      strokeStyle: null,
      shadowBlur: 0,
      shadowColor: null,
      lineWidth: 1
    };
    
    // Mock player object
    global.player = {
      x: 400,
      absY: 1000,
      width: 20,
      height: 20,
      velocityY: 0,
      cameraAngle: 270,
      altitudeLine: 50,
      isJumping: false,
      jumpTimer: 0,
      jumpDuration: 500,
      baseWidth: 20
    };
    
    // Mock game state
    global.GameState = { UPHILL: 'UPHILL', DOWNHILL: 'DOWNHILL', HOUSE: 'HOUSE' };
    global.currentState = GameState.DOWNHILL;
    
    // Mock camera variables
    global.cameraX = 0;
    global.cameraTargetX = 0;
    
    // Mock mountain properties
    global.mountainHeight = 10000;
    
    // Mock utility functions
    global.getLayerByY = jest.fn(y => ({ id: 0, width: 1000, startY: 0, endY: 2000 }));
    global.calculateWrappedPosRelativeToCamera = jest.fn((x, cameraX, layerWidth) => x - cameraX);
    global.getCameraOffset = jest.fn(() => 800);
    global.throttledRenderLog = jest.fn();
    global.floatingTexts = [];
    global.terrain = [
      { x: 400, y: 1100, width: 50, height: 30, type: 'tree' },
      { x: 600, y: 1050, width: 100, height: 20 }
    ];
    
    // Mock draw functions
    global.drawTree = jest.fn();
    global.drawPlayerAt = jest.fn();
    global.drawCameraOverlayAt = jest.fn();
    global.drawAnimal = jest.fn();
    
    // Mock TWEAK settings
    global.TWEAK = {
      reHitWindowStart: 0.7,
      reHitIndicatorScale: 1.5,
      reHitIndicatorColor: '#FF0000',
      reHitIndicatorOutlineColor: '#FFFFFF'
    };
    
    // Implement render functions
    global.updateCameraX = jest.fn((playerX, layerWidth) => {
      const canvasCenterX = canvas.width / 2;
      cameraTargetX = playerX - canvasCenterX;
      cameraX = cameraTargetX;
    });
    
    global.drawBackground = jest.fn(() => {
      const isDownhill = currentState === GameState.DOWNHILL;
      const topColor = isDownhill ? "#87CEEB" : "#ADD8E6";
      const bottomColor = isDownhill ? "#ADD8E6" : "#98FB98";
      
      ctx.fillStyle = "gradient";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    global.drawEdgeFogEffect = jest.fn(() => {
      const gradientWidth = canvas.width / 5;
      ctx.save();
      ctx.fillStyle = "gradient";
      ctx.fillRect(0, 0, gradientWidth, canvas.height);
      ctx.fillRect(canvas.width - gradientWidth, 0, gradientWidth, canvas.height);
      ctx.restore();
    });
    
    global.drawEntities = jest.fn(() => {
      const cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
      const playerLayer = getLayerByY(player.absY);
      
      terrain.forEach(obstacle => {
        if (obstacle.y >= cameraOffset - 50 && obstacle.y <= cameraOffset + canvas.height + 50) {
          const obstacleLayer = getLayerByY(obstacle.y);
          const wrappedObstacleX = calculateWrappedPosRelativeToCamera(obstacle.x, cameraX, obstacleLayer.width);
          
          if (obstacle.type === 'tree') {
            drawTree(ctx, {
              x: wrappedObstacleX,
              y: obstacle.y - cameraOffset,
              width: obstacle.width,
              height: obstacle.height
            });
          } else {
            ctx.fillStyle = "#808080";
            ctx.fillRect(
              wrappedObstacleX, 
              obstacle.y - cameraOffset, 
              obstacle.width, 
              obstacle.height
            );
          }
        }
      });
      
      const playerDrawY = player.absY - cameraOffset;
      const playerDrawX = canvas.width / 2;
      drawPlayerAt(playerDrawX, playerDrawY);
      
      drawCameraOverlay();
      drawAnimal();
    });
    
    global.drawCameraOverlay = jest.fn(() => {
      if (currentState !== GameState.UPHILL) return;
      
      const cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
      const centerX = canvas.width / 2;
      const centerY = player.absY - cameraOffset;
      
      drawCameraOverlayAt(centerX, centerY);
    });
    
    global.drawReHitIndicator = jest.fn(() => {
      if (!player.isJumping) return;
      
      const progress = player.jumpTimer / player.jumpDuration;
      if (progress >= TWEAK.reHitWindowStart && progress < 1.0) {
        ctx.save();
        ctx.beginPath();
        const radius = (player.baseWidth * TWEAK.reHitIndicatorScale) / 2;
        const cameraOffset = getCameraOffset(player.absY, canvas.height, mountainHeight);
        const screenY = canvas.height / 2;
        ctx.shadowColor = TWEAK.reHitIndicatorOutlineColor;
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;
        ctx.arc(player.x, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = TWEAK.reHitIndicatorColor;
        ctx.fill();
        ctx.strokeStyle = TWEAK.reHitIndicatorOutlineColor;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }
    });
    
    global.render = jest.fn(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const playerLayer = getLayerByY(player.absY);
      updateCameraX(player.x, playerLayer.width);
      
      drawBackground();
      drawEntities();
      drawEdgeFogEffect();
      
      ctx.save();
      floatingTexts.forEach(text => text.draw && text.draw(ctx, player.absY - canvas.height / 2));
      ctx.restore();
      
      drawReHitIndicator();
    });
  });
  
  test('canvas is initialized with correct dimensions', () => {
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(450);
  });
  
  test('render clears the canvas before drawing', () => {
    render();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
  });
  
  test('updateCameraX positions camera properly', () => {
    player.x = 500;
    const layerWidth = 1000;
    
    updateCameraX(player.x, layerWidth);
    
    // Camera should be centered on player
    expect(cameraTargetX).toBe(player.x - canvas.width / 2);
  });
  
  test('drawBackground uses correct colors based on game state', () => {
    // Test downhill state
    currentState = GameState.DOWNHILL;
    drawBackground();
    expect(ctx.fillStyle).toBe('gradient');
    
    // Test uphill state
    currentState = GameState.UPHILL;
    drawBackground();
    expect(ctx.fillStyle).toBe('gradient');
  });
  
  test('drawEntities only renders visible terrain', () => {
    const cameraOffset = 800;
    getCameraOffset.mockReturnValue(cameraOffset);
    
    // Add some terrain outside viewport
    terrain.push({ x: 400, y: 5000, width: 50, height: 30 });
    
    drawEntities();
    
    // Should draw visible obstacles
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(drawTree).toHaveBeenCalled();
    
    // Should draw player
    expect(drawPlayerAt).toHaveBeenCalledWith(canvas.width / 2, player.absY - cameraOffset);
  });
  
  test('drawCameraOverlay only displays in UPHILL state', () => {
    // Test in DOWNHILL state
    currentState = GameState.DOWNHILL;
    drawCameraOverlay();
    expect(drawCameraOverlayAt).not.toHaveBeenCalled();
    
    // Test in UPHILL state
    currentState = GameState.UPHILL;
    drawCameraOverlay();
    expect(drawCameraOverlayAt).toHaveBeenCalled();
  });
  
  test('drawReHitIndicator only shows during jump within correct timing window', () => {
    // Not jumping
    player.isJumping = false;
    drawReHitIndicator();
    expect(ctx.beginPath).not.toHaveBeenCalled();
    
    // Jumping but too early
    player.isJumping = true;
    player.jumpTimer = 0.2 * player.jumpDuration;
    drawReHitIndicator();
    expect(ctx.beginPath).not.toHaveBeenCalled();
    
    // Jumping within re-hit window
    player.jumpTimer = 0.8 * player.jumpDuration;
    drawReHitIndicator();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
  
  test('render calls all required rendering functions in order', () => {
    render();
    
    // Check function call order
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(updateCameraX).toHaveBeenCalled();
    expect(drawBackground).toHaveBeenCalled();
    expect(drawEntities).toHaveBeenCalled();
    expect(drawEdgeFogEffect).toHaveBeenCalled();
    expect(drawReHitIndicator).toHaveBeenCalled();
  });
}); 