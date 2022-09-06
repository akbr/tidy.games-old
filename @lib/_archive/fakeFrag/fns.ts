// Bare-bones smoothstep function (cubic Hermite interpolation), returning a value in the range 0.0 to 1.0.
export function smoothstep(min: number, max: number, value: number) {
  var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export function abs(n: number) {
  return Math.abs(n);
}
