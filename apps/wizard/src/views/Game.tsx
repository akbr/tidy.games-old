import { ComponentChildren, h } from "preact";
import { useRef } from "preact/hooks";

import { UiButtons } from "./UiButtons";
import { Hud } from "./Hud";
import { Seats } from "./Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";

import {
  useGame,
  waitFor,
  useTableDimensions,
  TABLE_MAX_WIDTH,
} from "~src/control";
import { BADGE_PADDING } from "./uiConsts";

export const Game = () => {
  return (
    <>
      <Outer>
        <Table>
          <Seats />
          <TableCenter />
          <Trick />
        </Table>
      </Outer>
      <Hand />
      <Hud />
      <UiButtons />
      <Timings />
    </>
  );
};

function Timings() {
  const phase = useGame((x) => x.board.phase);
  if (phase === "bidded") waitFor(500);
  if (phase === "roundEnd") waitFor(4000);
  return null;
}

function Outer({ children }: { children: ComponentChildren }) {
  return (
    <div class="relative h-full w-full text-white overflow-hidden flex justify-center">
      {children}
    </div>
  );
}

function Table({ children }: { children: ComponentChildren }) {
  const { height } = useTableDimensions();
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      ref={ref}
      id="table"
      class="relative w-full"
      style={{
        height,
        padding: BADGE_PADDING,
        maxWidth: TABLE_MAX_WIDTH,
      }}
    >
      {children}
    </section>
  );
}

export default Game;
