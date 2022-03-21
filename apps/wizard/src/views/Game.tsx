import type { GameProps } from "./types";
import { getHandHeight } from "@lib/layouts/hand";
import { useRefreshOnResize } from "@lib/hooks";

import { UiButtons } from "./UiButtons";
import { Hud } from "./Hud";
import { Seats } from "./Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";
import { ScoreTable } from "./ScoreTable";
import { Disconnected } from "@lib/tabletop/views/Disconnected";

export const GameView = (props: GameProps) => {
  const {
    state: [, game],
    player,
  } = props.frame;

  const numCards = game.hands[player].length || 1;
  const rect = document.body.getBoundingClientRect();
  const tableHeight = getHandHeight(numCards, rect);

  return (
    <div class="h-full w-full max-w-[650px]">
      <div
        class="relative h-full text-white overflow-hidden"
        style={{
          background: "radial-gradient(circle,#00850b 20%,#005c09 100%)",
        }}
      >
        <section
          id="table"
          class="relative w-full"
          style={{ height: `calc(100% - ${tableHeight}px)` }}
        >
          <Hand {...props} />
          <Seats {...props} />
          <Hud {...props} />
          <Trick {...props} />
          <TableCenter {...props} />
        </section>
        <UiButtons {...props} />
      </div>
    </div>
  );
};

export const Game = (props: GameProps) => {
  useRefreshOnResize();

  if (!props.connected) {
    return (
      <div>
        <div class="bg-red-500">Whoops, you got disconnected...</div>
        <Disconnected />
      </div>
    );
  }

  const { width } = document.body.getBoundingClientRect();

  return (
    <div class="h-full flex justify-center gap-6 ">
      <GameView {...props} />
      {width > 1000 && (
        <div class="p-3 overflow-y-auto">
          <ScoreTable {...props} />
        </div>
      )}
    </div>
  );
};
