import { ComponentChildren } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { dragify } from "@lib/dom/simpleDragify";

import { cameraActions, useCamera } from "./global";

const r = (num: number) => Math.round(num);

export const DragContainer = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  const ref = useRef(null);
  const camera = useCamera();
  useEffect(
    () =>
      dragify(ref.current!, {
        onDrag: cameraActions.pan,
        onDragStart: () => null,
        onDragEnd: () => null,
      }),
    []
  );

  return (
    <div
      id="dragSurface"
      class="h-full"
      ref={ref}
      onWheel={(e) => {
        e.preventDefault();
        const { clientX: x, clientY: y, deltaX, deltaY, ctrlKey } = e;
        cameraActions.zoom({ x, y }, deltaY / 500);
      }}
    >
      {children}
      <div class="absolute top-0 left-0 bg-white p-1 m-1 rounded">
        {r(camera.x)}, {r(camera.y)}, x{r(camera.z)}
      </div>
    </div>
  );
};
