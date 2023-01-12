import "@shared/base.css";
import "./sandbox.css";

import { render } from "preact";
import { cameraEmitter } from "./space-canvas/global";
import { DragContainer } from "./space-canvas/DragContainer";
import { Camera } from "@lib/camera";
import { getScreenCoords } from "./space-canvas/canvasUtils";
import { randomBetween } from "@lib/random";

const boxes = Array.from({ length: 200 }).map(() => ({
  x: window.innerWidth * Math.random(),
  y: window.innerHeight * Math.random(),
}));

const boxObjs = boxes.map((_, id) => ({
  w: 0,
  h: 0,
  visible: false,
  id,
}));

let boxGraph: SceneGraph = {
  visible: new Set(),
  entered: new Set(),
  exited: new Set(),
};

function App() {
  return (
    <div class="h-full bg-black">
      <DragContainer>
        <Boxes />
      </DragContainer>
    </div>
  );
}

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
    <div class="absolute text-white" style={{ border: "1px solid red" }}></div>
  );
}

function BoxDetail() {
  return (
    <div>
      {Array.from({ length: 100 }).map(() => {
        return (
          <div
            class="absolute select-none"
            style={{
              top: `${randomBetween(0, 100)}%`,

              left: `${randomBetween(0, 100)}%`,
            }}
          >
            !
          </div>
        );
      })}
    </div>
  );
}

render(<App />, document.body);

// ---

type GraphObj = {
  w: number;
  h: number;
  visible: boolean;
  id: number;
};
type SceneGraph = {
  visible: Set<GraphObj>;
  entered: Set<GraphObj>;
  exited: Set<GraphObj>;
};

function getNextSceneGraph(
  objs: GraphObj[],
  camera: Camera,
  prevGraph: SceneGraph
) {
  const nextGraph: SceneGraph = {
    visible: new Set(),
    entered: new Set(),
    exited: new Set(),
  };

  // ---
  const [aW, aH] = [10, 10];
  const [mW, mH] = [40, 40];

  const sW = camera.z * aW;
  const sH = camera.z * aH;

  const w = sW >= mW ? sW : mW;
  const h = sH >= mH ? sH : mH;

  const screen = {
    x: 0,
    y: 0,
    w: window.innerWidth,
    h: window.innerHeight,
  };

  // ---

  objs.forEach((obj) => {
    const [x, y] = getScreenCoords(boxes[obj.id], camera);
    const visible = intersects(screen, {
      w,
      h,
      x: x - w * 0.5,
      y: y - h * 0.5,
    });
    obj.w = w;
    obj.h = h;

    if (visible) {
      nextGraph.visible.add(obj);
      if (!prevGraph.visible.has(obj)) nextGraph.entered.add(obj);
    } else {
      if (prevGraph.visible.has(obj)) nextGraph.exited.add(obj);
    }
  });

  return nextGraph;
}

// ---

const $container = document.getElementById("boxes") as HTMLElement;
const $boxes = Array.from(
  document.getElementById("boxes")?.childNodes!
) as HTMLElement[];

type Rect = { x: number; y: number; w: number; h: number };
function intersects(a: Rect, b: Rect) {
  return (
    a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h
  );
}

function setVisibility(camera: Camera, systemGraph: SceneGraph) {
  const showDetail = camera.z >= 5;

  systemGraph.entered.forEach(({ id }) => {
    const $box = $boxes[id];
    $box.style.display = "";
  });

  systemGraph.exited.forEach(({ id }) => {
    const $box = $boxes[id];
    $box.style.display = "none";
    $box.innerHTML = "";
  });

  systemGraph.visible.forEach(({ id }) => {
    const $box = $boxes[id];

    if (showDetail && $box.childNodes.length === 0) {
      render(<BoxDetail />, $box);
    }

    if (!showDetail) {
      $box.innerHTML = "";
    }
  });
}

function onPan() {
  const c = cameraEmitter.get();
  $container.style.translate = `${c.x * c.z}px ${c.y * c.z}px`;
}

function onZoom(boxObjs: GraphObj[], c: Camera) {
  $boxes.forEach(($box, id) => {
    const { w, h } = boxObjs[id];
    $box.style.width = `${w}px`;
    $box.style.height = `${h}px`;
    $box.style.translate = `${boxes[id].x * c.z - w / 2}px ${
      boxes[id].y * c.z - h / 2
    }px`;
  });
}

function createMain() {
  let prev: any = null;
  return function main() {
    const camera = cameraEmitter.get();
    if (camera === prev) return requestAnimationFrame(main);
    boxGraph = getNextSceneGraph(boxObjs, camera, boxGraph);
    console.log(boxGraph.visible.size);
    setVisibility(camera, boxGraph);
    if (!prev || prev.z !== camera.z) {
      onZoom(boxObjs, camera);
    }
    onPan();
    prev = camera;
    requestAnimationFrame(main);
  };
}

const main = createMain();

main();
