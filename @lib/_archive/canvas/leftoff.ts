import "@shared/base.css";
import { createCanvas, DrawFn, forEachPixel, setColor } from "@lib/canvas";
import SimplexNoise from "@lib/canvas/lib/simplex-noise";

function getNoise(
  gen: SimplexNoise,
  x: number,
  y: number,
  iterations: number,
  persistence: number,
  scale: number
) {
  let maxAmp = 0;
  let amp = 1;
  let freq = scale;
  let noise = 0;

  // add successively smaller, higher-frequency terms
  for (let i = 0; i < iterations; i++) {
    noise += gen.noise2D(x * freq, y * freq) * amp;
    maxAmp += amp;
    amp *= persistence;
    freq *= 2;
  }

  // take the average value of the iterations
  noise /= maxAmp;

  //normalize the result
  const high = 1;
  const low = 0;
  noise = (noise * (high - low)) / 2 + (high + low) / 2;

  return noise;
}

const displayCanvas = createCanvas(64, 64);
displayCanvas.style.imageRendering = "pixelated";

type DrawCircleProps = {
  color?: string;
  radius?: number;
};
const drawCircle: DrawFn<DrawCircleProps> = (ctx, { width, height }) => {
  const xm = width / 2;
  const ym = height / 2;
  let r = width / 2 - 1;

  const imgData = ctx.getImageData(0, 0, width, height);
  var x = -r,
    y = 0,
    err = 2 - 2 * r; /* bottom left to top right */

  ctx.strokeStyle = "red";
  ctx.beginPath();
  do {
    /**
    ctx.moveTo(xm + x, ym + y + 0.5);
    ctx.lineTo(xm - x, ym + y + 0.5);
    ctx.moveTo(xm + y, ym + x + 0.5);
    ctx.lineTo(xm - y, ym + x + 0.5);
     */
    setColor(imgData, xm - x, ym + y, [255, 0, 0, 255]);
    setColor(imgData, xm - y, ym - x, [255, 0, 0, 255]);
    setColor(imgData, xm + x, ym - y, [255, 0, 0, 255]);
    setColor(imgData, xm + y, ym + x, [255, 0, 0, 255]);
    r = err;
    if (r <= y) err += ++y * 2 + 1;
    if (r > x || err > y) err += ++x * 2 + 1;
  } while (x < 0);

  ctx.stroke();
  ctx.putImageData(imgData, 0, 0);
};

type DrawGlitterProps = {};
const drawNoise: DrawFn<DrawGlitterProps> = (ctx, canvas) => {
  const gen = new SimplexNoise("test");

  const { width, height } = canvas;

  const imageData = ctx.createImageData(width, height);
  forEachPixel(width, height, (x, y) => {
    let noise = getNoise(gen, x, y, 2, 0.8, 0.05);
    setColor(imageData, x, y, [255, 255, 255, noise * 255]);
  });

  ctx.putImageData(imageData, 0, 0);
};

const now = Date.now();
drawCircle(displayCanvas.getContext("2d")!, displayCanvas, {});
console.log(Date.now() - now);

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
canvas.style.imageRendering = "pixelated";
ctx.imageSmoothingEnabled = false;

var size = 100;
canvas.width = 128;
canvas.height = 128;
ctx.imageSmoothingEnabled = false;
ctx.drawImage(displayCanvas, 0, 0, 128, 128);

document.body.appendChild(canvas);

/**
import Map from "./views/Map";
import Planet from "./views/Planet";

import { Camera } from "@lib/camera";

import { render } from "preact";
import { useState } from "preact/hooks";

function App() {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, z: 1 });

  return (
    <div class="w-full h-full  bg-black text-white">
      <div class="absolute top-0">{JSON.stringify(camera)}</div>
      <Map camera={camera} set={setCamera}>
        <Planet x={100} y={100} r={20} color={"green"} />
        <Planet x={300} y={120} r={10} color={"red"} />
        <Planet x={600} y={320} r={30} color={"pink"} />
        <Planet x={320} y={520} r={40} color={"orange"} />
      </Map>
    </div>
  );
}

render(<App />, document.body);

 */
