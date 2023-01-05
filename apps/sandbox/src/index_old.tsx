import "@shared/base.css";
import "./sandbox.css";

import { render } from "preact";
import { cameraEmitter } from "./space-canvas/global";
import { DragContainer } from "./space-canvas/DragContainer";
import { Camera } from "@lib/camera";
import { getScreenCoords } from "./space-canvas/canvasUtils";

function App() {
  return (
    <div class="h-full bg-black">
      <DragContainer>
        <Boxes />
      </DragContainer>
    </div>
  );
}

const boxes = Array.from({ length: 200 }).map(() => ({
  x: window.innerWidth * Math.random(),
  y: window.innerHeight * Math.random(),
}));

function Boxes() {
  return (
    <section id="boxes">
      {boxes.map(() => (
        <Box />
      ))}
    </section>
  );
}

function Box() {
  return (
    <div class="absolute text-white" style={{ border: "1px solid red" }}>
      <section>
        <div class="absolute top-0 left-0">1</div>
        <div class="absolute top-0 right-0">2</div>
        <div class="absolute bottom-0 left-0">3</div>
        <div class="absolute bottom-0 right-0">4</div>
      </section>
    </div>
  );
}

render(<App />, document.body);

const $boxes = Array.from(
  document.getElementById("boxes")?.childNodes!
) as HTMLElement[];

function intersects(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h) {
    return true;
  }
  return false;
}

function draw() {
  const c = cameraEmitter.get();
  const screen = {
    x: 0,
    y: 0,
    w: window.innerWidth,
    h: window.innerHeight,
  };

  const [aW, aH] = [10, 10];
  const [mW, mH] = [40, 40];

  const sW = c.z * aW;
  const sH = c.z * aH;

  const w = sW >= mW ? sW : mW;
  const h = sH >= mH ? sH : mH;

  $boxes.forEach(($box, idx) => {
    const [x, y] = getScreenCoords(boxes[idx], c);

    if (!intersects(screen, { x, y, w: 40, h: 40 })) {
      $box.style.display = "none";
      return;
    }

    $box.style.display = "";
    $box.style.width = `${w}px`;
    $box.style.height = `${h}px`;
    $box.style.translate = `calc(${x}px - 50%) calc(${y}px - 50%)`;

    const $child = $box.firstChild! as HTMLElement;
    if (c.z > 3) {
      $child.style.display = "";
    } else {
      $child.style.display = "none";
    }
  });
}

function createMain() {
  let prev: any = null;
  return function main() {
    const camera = cameraEmitter.get();
    if (camera === prev) return requestAnimationFrame(main);
    prev = camera;
    draw();
    requestAnimationFrame(main);
  };
}

const main = createMain();

main();
