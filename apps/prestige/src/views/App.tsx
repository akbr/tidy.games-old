import { ComponentChildren } from "preact";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { dragify } from "@lib/dom/simpleDragify";

import { useCamera, actions as cameraActions } from "../state/useCamera";

import { InfoBox } from "./InfoBox";
import { Systems } from "./Systems";
import { SystemLabels } from "./SystemLabels";
import { Cxns } from "./Cxns";
import { MoveOrder, ActiveMoveOrders } from "./MoveOrder";
import { TransitFleets } from "./TransitFleets";
import { Nav } from "./Nav";
import { useGame } from "../state/useGame";
import { onSelect } from "../state/onSelect";

export const App = () => {
  return (
    <>
      <GameArea />
      <Nav />
      <Dev />
      <InfoBox />
    </>
  );
};

function GameArea() {
  return (
    <EventForwarder>
      <DragContainer>
        <SystemLabels />
        <TransitFleets />
        <svg id="map" width="1000px" height="1000px">
          <Cxns />
          <MoveOrder />
          <ActiveMoveOrders />
          <Systems />
        </svg>
      </DragContainer>
    </EventForwarder>
  );
}

function EventForwarder({ children }: { children: ComponentChildren }) {
  const state = useGame((x) => x);

  return (
    <div
      class="h-full"
      data-select="clear"
      onClick={(e) => {
        const $target = e.target as HTMLElement;
        const $selectable = $target.closest("[data-select]") as HTMLElement;
        if (!$selectable) return;
        onSelect($selectable.dataset.select!, state);
      }}
    >
      {children}
    </div>
  );
}

function Dev() {
  const x = useCamera((x) => x);
  const seleced = useGame((x) => x.selected);
  return (
    <div class="absolute bottom-0 text-sm">
      <div class=" max-w-[100px]">{JSON.stringify(x)}</div>
    </div>
  );
}

export const DragContainer = ({
  children,
}: {
  children: ComponentChildren;
}) => {
  const camera = useCamera((x) => x);
  const ref = useRef(null);
  useLayoutEffect(() => dragify(ref.current!, cameraActions.pan), []);

  return (
    <div id="dragSurface" class="h-full" ref={ref}>
      <section
        id="dragContainer"
        class="h-full"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}
      >
        {children}
      </section>
    </div>
  );
};
