// src/mechanics/StaminaSystem.js
export let stamina = 100;

export function updateStamina(deltaTime) {
  // Decrease stamina over time (e.g., while climbing)
  stamina = Math.max(0, stamina - deltaTime * 0.01);
}

export function resetStamina() {
  stamina = 100;
}
