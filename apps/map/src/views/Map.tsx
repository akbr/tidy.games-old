import { Camera, panCamera } from "@lib/camera";
import { DOMEffect, RunDOMEffect } from "@lib/hooks";
import { ComponentChildren } from "preact";
import { StateUpdater, useEffect, useRef, useState } from "preact/hooks";

const trackDrags: DOMEffect<StateUpdater<Camera>> = ($el, set) => {
  console.log("hi");
  let isDown = false;
  let pageX = 0;
  let pageY = 0;

  $el.addEventListener("mousedown", (e) => {
    isDown = true;
    pageX = e.pageX;
    pageY = e.pageY;
  });

  $el.addEventListener("mouseup", () => {
    isDown = false;
  });

  $el.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const dx = e.pageX - pageX;
    const dy = e.pageY - pageY;
    pageX = e.pageX;
    pageY = e.pageY;
    set((camera) => panCamera(camera, -dx, -dy));
  });
};

function setTransform({ x, y, z }: Camera) {
  return `translate(${x}px, ${y}px) scale(${z})`;
}

export function Map({
  camera,
  set,
  children,
}: {
  camera: Camera;
  set: StateUpdater<Camera>;
  children: ComponentChildren;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //@ts-ignore
    trackDrags(ref.current, set);
  }, []);

  return (
    <div class="top-0 h-full w-full" ref={ref}>
      <div
        class="top-0 h-full w-full"
        style={{ transform: setTransform(camera) }}
      >
        {children}
      </div>
    </div>
  );
}
export default Map;
