import "@shared/base.css";
import "./sandbox.css";

import { render } from "preact";
import {
  calibrateDPI,
  createCanvasImg,
  drawSprite,
  SpriteFn,
  getScreenCoords,
  getScreenDimensions,
} from "./space-canvas/canvasUtils";
import { cameraEmitter, useCamera } from "./space-canvas/global";
import { DragContainer } from "./space-canvas/DragContainer";

const planetState = Array.from({ length: 120 }).map((_, idx) => ({
  idx,
  x: (Math.random() * window.innerWidth) / 2,
  y: (Math.random() * window.innerHeight) / 2,
}));

const iconImg = createCanvasImg([8, 8], (ctx) => {
  ctx.beginPath();
  ctx.arc(4, 4, 4, 0, 2 * Math.PI, true);
  ctx.fillStyle = "#E2FFC6";
  ctx.fill();
});

const planetBackdropFn: SpriteFn = (ctx, d, c) => {
  const [w, h] = getScreenDimensions(d, c);
  if (w < 5) return;

  const [x, y] = getScreenCoords(d, c);

  ctx.beginPath();
  ctx.arc(x, y, w, 0, 2 * Math.PI, true);
  ctx.fillStyle = "rgba(250, 244, 211 ,0.5)";
  ctx.fill();
};

export const iconSprites = planetState.map((planet) => ({
  ...planet,
  img: iconImg,
  w: 10,
  h: 10,
}));

export const bgSprites = planetState.map((planet) => ({
  ...planet,
  fn: planetBackdropFn,
  w: 10,
  h: 10,
  z: 0.3,
}));

function App() {
  return (
    <div class="h-full bg-black">
      <DragContainer>
        <canvas id="canvas" />
      </DragContainer>
    </div>
  );
}

function Planets({ planets }: { planets: Planet[] }) {
  const c = useCamera();

  if (c.panning) return null;

  return (
    <section id="planetLabels" class="absolute top-0 left-0">
      {planets.map((planet) => {
        const { x, y } = planet;

        const mx = Math.round((c.x + x) * c.z);
        const my = Math.round((c.y + y) * c.z);

        return (
          <div
            class="absolute bg-green-700 rounded"
            style={{ translate: `${mx}px ${my}px` }}
          >
            <Planet planet={planet} />
          </div>
        );
      })}
    </section>
  );
}

function Planet({ planet }: { planet: Planet }) {
  return <div class="text-sm text-white">{planet.idx}</div>;
}

render(<App />, document.body);

const cWidth = window.innerWidth;
const cHeight = window.innerHeight;

const $canvas = document.getElementById("canvas") as HTMLCanvasElement;
$canvas.width = cWidth;
$canvas.height = cHeight;
calibrateDPI($canvas);
const ctx = $canvas.getContext("2d")!;

function createMain() {
  let prev: any = null;
  return function main() {
    const camera = cameraEmitter.get();
    if (camera !== prev) {
      prev = camera;
      ctx.clearRect(0, 0, cWidth, cHeight);
      bgSprites.forEach((sprite) => drawSprite(sprite, camera, ctx));
      iconSprites.forEach((sprite) => drawSprite(sprite, camera, ctx));
    }

    requestAnimationFrame(main);
  };
}

const main = createMain();

main();
