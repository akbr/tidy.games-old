export type DrawFn<Props = null> = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  props: Props
) => void;

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  return canvas;
}

export function setColor(
  img: ImageData,
  x: number,
  y: number,
  [r, g, b, a]: [number, number, number, number]
) {
  const index = (x + y * img.width) * 4;
  img.data[index + 0] = r;
  img.data[index + 1] = g;
  img.data[index + 2] = b;
  img.data[index + 3] = a;
}

export function getColor({ width, data }: ImageData, x: number, y: number) {
  const index = (x + y * width) * 4;
  return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}

export function forEachPixel(
  width: number,
  height: number,
  func: (x: number, y: number) => void
) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      func(x, y);
    }
  }
}
