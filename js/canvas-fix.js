/* canvas-fix.js - Fix willReadFrequently on all canvas elements */

// Keep track of which canvases we've already fixed
const fixedCanvases = new WeakSet();
let initialLog = true;

// Function to set willReadFrequently on all canvas elements
function fixAllCanvasElements() {
  // Get all canvas elements on the page
  const canvasElements = document.querySelectorAll('canvas');
  let count = 0;
  let needsFixing = 0;
  
  canvasElements.forEach(canvas => {
    // Skip if we've already fixed this canvas
    if (fixedCanvases.has(canvas)) return;
    
    needsFixing++;
    
    // Set the attribute on the element
    canvas.setAttribute('willReadFrequently', 'true');
    
    // Also set it on the context if possible
    try {
      const ctx2d = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx2d) {
        ctx2d.willReadFrequently = true;
        count++;
        fixedCanvases.add(canvas);
      }
    } catch (e) {
      // Silently ignore - we'll try again later
    }
  });
  
  // Only log if there are new canvases to fix or on first run
  if (initialLog || needsFixing > 0) {
    if (initialLog) {
      console.log("🖌️ Canvas fix loaded - all canvas elements will use willReadFrequently");
      initialLog = false;
    }
    
    if (needsFixing > 0) {
      console.log(`✅ Fixed willReadFrequently on ${count} of ${needsFixing} new canvas elements`);
    }
  }
}

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fixAllCanvasElements);

// Also run periodically to catch dynamically created canvas elements, but less frequently
setInterval(fixAllCanvasElements, 5000);

// Patch the canvas creation method to always use willReadFrequently
const originalCreateElement = document.createElement;
document.createElement = function(tagName) {
  const element = originalCreateElement.call(document, tagName);
  
  if (tagName.toLowerCase() === 'canvas') {
    element.setAttribute('willReadFrequently', 'true');
    
    // Patch the getContext method of this canvas
    const originalGetContext = element.getContext;
    element.getContext = function(contextType, contextAttributes) {
      if (contextType === '2d') {
        contextAttributes = contextAttributes || {};
        contextAttributes.willReadFrequently = true;
      }
      return originalGetContext.call(this, contextType, contextAttributes);
    };
  }
  
  return element;
}; 