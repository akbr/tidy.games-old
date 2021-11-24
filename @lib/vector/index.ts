export type Vector = number[];

export const Vec = {
  add: (...vecs: Vector[]): Vector =>
    vecs.reduce(([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2], [0, 0]),
  mulV: (...vecs: Vector[]): Vector =>
    vecs.reduce(([x1, y1], [x2, y2]) => [x1 * x2, y1 * y2], [1, 1]),
  mul: ([x, y]: Vector, n: number): Vector => [x * n, y * n],
};

export const toXY = ([x, y]: number[]) => ({ x, y });
