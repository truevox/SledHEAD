/*
 * SledHEAD Windsurf: /js/effects.js
 *
 * Integration steps:
 * - Call `await sceneFade(true)` in completeStateChange() BEFORE DOM swaps (e.g., entering House or mountain layer).
 * - Call `await sceneFade(false)` AFTER DOM swaps or when mountain-layer change has finished.
 * - Exposes `window.sceneFade` for dev console use.
 *
 * Handles full-viewport black fade transitions and input locking for state changes.
 *
 * Repo rules: ESLint+Prettier, comment the WHY, no global rendering logic, no CSS filters/WebGL, self-contained.
 */

let inputLocked = false;
let keydownListener = null;
let keyupListener = null;
let fadeOverlay = null;
let stickyWatcher = null;

// WHY: Prevent user input during transitions or fades
export function lockInput() {
  if (inputLocked) return;
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
  });
}

/**
 * sceneFadeWithBlack: Fades to black, returns a promise that resolves the moment the overlay is fully black.
 * Use this to trigger scene changes (e.g. DOM swaps) at the hidden moment.
 *
 * Usage:
 *   await sceneFadeWithBlack(); // resolves when black
 *   // ...do DOM swap or scene logic...
 *   await sceneFade(false);     // resolves after fade out
 */
export function sceneFadeWithBlack() {
  const overlay = ensureFadeOverlay();
  lockInput();
  // Fade in (black), resolve when fully black
  return animateOpacity('0', '1', 250);
}

/**
 * sceneFade: Handles both sticky and non-sticky fades.
 * - In non-sticky mode, fades to black, holds, then fades out.
 * - In sticky mode, stays black until window.fadedToBlack = false.
 *
 * For scene transitions, use sceneFadeWithBlack() to know when to swap.
 */
export async function sceneFade(sticky = false) {
  const overlay = ensureFadeOverlay();

  if (!sticky) {
    await sceneFadeWithBlack();
    // WHY: Unlock input at first frame of fade-in for responsive chaining
    unlockInput();
    // Hold black
    await new Promise((res) => setTimeout(res, 500));
    // Fade out
    await animateOpacity('1', '0', 250);
    overlay.style.opacity = '0';
    return;
  }

  // Sticky mode: fade to black and stay until window.fadedToBlack = false
  window.fadedToBlack = true;
  lockInput();
  await animateOpacity('0', '1', 250);
  overlay.style.opacity = '1';

  // WHY: Watch for external code to set fadedToBlack = false
  if (stickyWatcher) {
    clearInterval(stickyWatcher);
    stickyWatcher = null;
  }
  await new Promise((resolve) => {
    stickyWatcher = setInterval(() => {
      if (!window.fadedToBlack) {
        clearInterval(stickyWatcher);
        stickyWatcher = null;
        // Fade out
        animateOpacity('1', '0', 250).then(() => {
          overlay.style.opacity = '0';
          unlockInput();
          resolve();
        });
      }
    }, 50);
  });
}

// WHY: Expose for dev console
window.sceneFade = sceneFade;
window.sceneFadeWithBlack = sceneFadeWithBlack;


// WHY: Expose for dev console
window.sceneFade = sceneFade;
