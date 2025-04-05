/*
// registry.js
export const functionRegistry = {};

export function register(name) {
  return function(target, key, descriptor) {
    const fnName = name || key;
    functionRegistry[fnName] = descriptor.value;
    return descriptor;
  };
}
*/

// registry.js
export const functionRegistry = {};

export function register(name, fn) {
  functionRegistry[name] = fn;
}
