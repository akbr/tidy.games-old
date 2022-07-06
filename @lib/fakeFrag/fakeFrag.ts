export function setColor(
  img: ImageData,
  x: number,
  y: number,
  [r, g, b, a]: number[]
) {
  const index = (x + y * img.width) * 4;
  img.data[index + 0] = r;
  img.data[index + 1] = g;
  img.data[index + 2] = b;
  img.data[index + 3] = a;
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

export type Varying = { gl_FragCoord: number[] };
export type Uniforms = { u_resolution: number[] };
export type FakeFrag = (varying: Varying, uniforms: Uniforms) => number[];

export function runFakeFrag(width: number, height: number, fakeFrag: FakeFrag) {
  const canvas = document.createElement("canvas");
  canvas.style.imageRendering = "pixelated";
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(width, height);

  const u_resolution = [width, height];
  const uniforms = { u_resolution };

  forEachPixel(width, height, (x, y) => {
    const gl_FragCoord = [x, height - y];
    const rgba = fakeFrag({ gl_FragCoord }, uniforms).map((i) => i * 255);
    setColor(imgData, x, y, rgba);
  });

  ctx.imageSmoothingEnabled = false;
  ctx.putImageData(imgData, 0, 0);

  return canvas;
}
