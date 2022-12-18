import { Camera } from "@lib/camera";

export function calibrateDPI($canvas: HTMLCanvasElement) {
  // Get the device pixel ratio, falling back to 1.
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  var rect = $canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  $canvas.width = rect.width * dpr;
  $canvas.height = rect.height * dpr;
  $canvas.style.width = rect.width + "px";
  $canvas.style.height = rect.height + "px";

  var ctx = $canvas.getContext("2d")!;
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);
}

export type SpriteDimensions = {
  w: number;
  h: number;
  x: number;
  y: number;
  z?: number;
};

export type ImgSprite = SpriteDimensions & {
  img?: CanvasImageSource;
};

export type SpriteFn = (
  ctx: CanvasRenderingContext2D,
  dimensions: SpriteDimensions,
  camera: Camera
) => void;

export type FnSprite = SpriteDimensions & {
  fn: SpriteFn;
};

export type Sprite = ImgSprite | FnSprite;

export function getScreenCoords({ x, y }: { x: number; y: number }, c: Camera) {
  return [Math.round((c.x + x) * c.z), Math.round((c.y + y) * c.z)];
}

export function getScreenDimensions(
  { w, h, z }: { w: number; h: number; z?: number },
  c: Camera
) {
  if (typeof z === "number") return [w * z * c.z, h * z * c.z];
  return [w, h];
}

export function drawSprite(
  sprite: Sprite,
  camera: Camera,
  ctx: CanvasRenderingContext2D
) {
  if ("fn" in sprite) {
    sprite.fn(ctx, sprite, camera);
  } else {
    if (!sprite.img) return;
    const [w, h] = getScreenDimensions(sprite, camera);
    const [x, y] = getScreenCoords(sprite, camera);
    ctx.drawImage(sprite.img, x - 0.5 * w, y - 0.5 * h, w, h);
  }
}

export function createCanvasImg(
  [width, height]: number[],
  painter: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  const $canvas = document.createElement("canvas");
  $canvas.width = width;
  $canvas.height = height;

  const ctx = $canvas.getContext("2d")!;
  painter(ctx);

  return $canvas;
}
