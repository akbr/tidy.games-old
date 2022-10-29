import { ComponentChildren } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { dragify } from "@lib/dom/simpleDragify";

import { InfoBox } from "./InfoBox";
import { Systems } from "./Systems";
import { SystemLabels } from "./SystemLabels";
import { Cxns } from "./Cxns";
import { MoveOrder, ActiveMoveOrders } from "./MoveOrder";
import { TransitFleets } from "./TransitFleets";
import { TransitBattles } from "./TransitBattles";
import { Nav } from "./Nav";
import { Assets } from "./Assets";
import { useCamera, cameraActions, tableActions } from "../state";
import { Dev } from "./Dev";

export const App = () => {
  return (
    <>
      <GameArea />
      <Nav />
      <Assets />
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
        <TransitBattles />
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
  return (
    <div
      class="h-full"
      data-select="clear"
      onClick={(e) => {
        const $target = e.target as HTMLElement;
        const $selectable = $target.closest("[data-select]") as HTMLElement;
        if (!$selectable) return;
        const str = $selectable.dataset.select!;
        if (str === "clear") {
          tableActions.select(null);
        } else {
          tableActions.select(str);
        }
      }}
    >
      {children}
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
