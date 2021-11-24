export type Vector = number[];

export const Vec = {
  add: (...vecs: Vector[]): Vector =>
    vecs.reduce(([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2], [0, 0]),
  mulV: (...vecs: Vector[]): Vector =>
    vecs.reduce(([x1, y1], [x2, y2]) => [x1 * x2, y1 * y2], [1, 1]),
  mul: ([x, y]: Vector, n: number): Vector => [x * n, y * n],
};

export const toXY = ([x, y]: number[]) => ({ x, y });
export const add = (...vecs: Vector[]): Vector =>
  vecs.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }), {
    x: 0,
    y: 0,
  });

export const multiply = (...vecs: Vector[]): Vector =>
  vecs.reduce((a, b) => ({ x: a.x * b.x, y: a.y * b.y }), {
    x: 1,
    y: 1,
  });

export const invert = (a: Vector): Vector => ({
  x: a.x * -1,
  y: a.y * -1,
});
