/*
 * SledHEAD Windsurf: /js/effects.js
 *
 * Integration steps:
 * - Call `await sceneFadeWithBlack()` in completeStateChange() BEFORE DOM swaps (e.g., entering House or mountain layer).
 * - Call `await sceneFadeFromBlack()` AFTER DOM swaps or when mountain-layer change has finished.
 * - Exposes `window.sceneFadeWithBlack` and `window.sceneFadeFromBlack` for dev console use.
 *
 * Handles full-viewport black fade transitions and input locking for state changes.
 *
 * Repo rules: ESLint+Prettier, comment the WHY, no global rendering logic, no CSS filters/WebGL, self-contained.
 */

let inputLocked = false;
let keydownListener = null;
let keyupListener = null;
let fadeOverlay = null;
let stickyWatcher = null; // <-- This can likely be removed now, but leave for now.

// Add a helper for timestamped logs
function logEffect(message) {
  console.log(`[Effects - ${performance.now().toFixed(2)}ms] ${message}`);
}

// WHY: Prevent user input during transitions or fades
export function lockInput() {
  if (inputLocked) return;
  logEffect("Locking input.");
  inputLocked = true;
  window.inputLocked = true;

  // WHY: Stop all key events at capture phase while locked
  keydownListener = (e) => e.stopPropagation();
  keyupListener = (e) => e.stopPropagation();
  window.addEventListener('keydown', keydownListener, true);
  window.addEventListener('keyup', keyupListener, true);
}

export function unlockInput() {
  if (!inputLocked) return;
  logEffect("Unlocking input.");
  inputLocked = false;
  window.inputLocked = false;

  // WHY: Remove input lock listeners after fade completes
  window.removeEventListener('keydown', keydownListener, true);
  window.removeEventListener('keyup', keyupListener, true);
  keydownListener = null;
  keyupListener = null;
}

function ensureFadeOverlay() {
  // WHY: Single overlay, full viewport, pointer-events:none for canvas friendliness
  if (!fadeOverlay) {
    fadeOverlay = document.getElementById('fade-overlay');
    if (!fadeOverlay) {
      fadeOverlay = document.createElement('div');
      fadeOverlay.id = 'fade-overlay';
      Object.assign(fadeOverlay.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100vw',
        height: '100vh',
        background: '#000',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '9999',
        transition: 'opacity 250ms linear',
      });
      document.body.appendChild(fadeOverlay);
    }
  }
  return fadeOverlay;
}

function animateOpacity(from, to, duration) {
  logEffect(`Animating opacity from ${from} to ${to} over ${duration}ms.`);
  // WHY: Promise-based fade for precise timing
  return new Promise((resolve) => {
    const overlay = ensureFadeOverlay();
    overlay.style.transition = 'none';
    overlay.style.opacity = from;
    // Force style flush
    void overlay.offsetWidth;
    overlay.style.transition = 'opacity 250ms linear';
    overlay.style.opacity = to;
    const handle = () => {
      overlay.removeEventListener('transitionend', handle);
      resolve();
    };
    overlay.addEventListener('transitionend', handle);
    // Add a timeout fallback in case transitionend doesn't fire (e.g., element removed)
    setTimeout(() => {
        logEffect(`Opacity animation fallback timeout triggered for ${from} -> ${to}.`);
        overlay.removeEventListener('transitionend', handle); // Clean up listener
        resolve(); // Resolve promise anyway
    }, duration + 100); // Wait a bit longer than duration
  });
}

/**
 * sceneFadeWithBlack: Fades to black, returns a promise that resolves the moment the overlay is fully black.
 * Use this to trigger scene changes (e.g. DOM swaps) at the hidden moment.
 *
 * Usage:
 *   await sceneFadeWithBlack(); // resolves when black
 *   // ...do DOM swap or scene logic...
 *   await sceneFadeFromBlack();     // resolves after fade out
 */
export function sceneFadeWithBlack() {
  // Release all held keys to prevent sticky controls after fade
  if (typeof clearAllInputStates === 'function') {
    clearAllInputStates();
  }
  const overlay = ensureFadeOverlay();
  logEffect("Starting sceneFadeWithBlack: Fading TO black.");
  lockInput();
  // Fade in (black), resolve when fully black
  return animateOpacity('0', '1', 250).then(() => {
    logEffect("sceneFadeWithBlack: Fade TO black complete. Screen is black.");
    overlay.style.opacity = '1'; // Ensure it's fully black
  });
}

/**
 * sceneFadeFromBlack: Assumes screen is already black. Holds briefly, then fades out.
 * Use this AFTER scene changes (e.g. DOM swaps) are complete.
 */
export async function sceneFadeFromBlack() {
  const overlay = ensureFadeOverlay();
  logEffect("Starting sceneFadeFromBlack: Holding black, then fading OUT.");

  // Ensure overlay is black before starting
  overlay.style.transition = 'none';
  overlay.style.opacity = '1';
  void overlay.offsetWidth; // Force style flush

  // Hold black briefly
  await new Promise((res) => setTimeout(res, 50)); // Shorter hold than before
  logEffect("sceneFadeFromBlack: Hold complete. Fading OUT now.");

  // Fade out (back to transparent)
  await animateOpacity('1', '0', 250);
  overlay.style.opacity = '0'; // Ensure it's fully transparent
  logEffect("sceneFadeFromBlack: Fade OUT complete.");
  unlockInput(); // Unlock input *after* fade out is complete
}

// WHY: Expose for dev console
window.sceneFadeWithBlack = sceneFadeWithBlack;
window.sceneFadeFromBlack = sceneFadeFromBlack; // Expose new function
