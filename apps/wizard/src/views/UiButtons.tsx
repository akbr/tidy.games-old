import { useApp, useGame, cart, setDialog, serverActions } from "@src/control";
import { Twemoji } from "@shared/components/Twemoji";

import { ScoreTable } from "./ScoreTable";
import { OptionsDisplay } from "./Options";
import { ComponentChildren } from "preact";

export const UiButtons = () => {
  return (
    <Position>
      <Box>
        <OptionsButton />
        <ScoresButton />
      </Box>
    </Position>
  );
};

function Position({ children }: { children: ComponentChildren }) {
  return <div class="absolute top-0 left-0 m-1">{children}</div>;
}

function Box({ children }: { children: ComponentChildren }) {
  return <div class="flex gap-2 p-2">{children}</div>;
}

function OptionsButton() {
  return (
    <div
      class="cursor-pointer"
      onClick={() => {
        setDialog(OptionsDialog);
      }}
    >
      <Twemoji char={"⚙️"} size={36} />
    </div>
  );
}

function ScoresButton() {
  const scores = useGame((x) => x.game.scores);

  return scores.length <= 0 ? null : (
    <div
      class="cursor-pointer"
      onClick={() => {
        setDialog(ScoreTableDialog);
      }}
    >
      <Twemoji char={"🗒️"} size={36} />
    </div>
  );
}

function OptionsDialog() {
  const loc = useApp((x) => x.loc);
  const [ctx, playerIndex] = useGame((x) => [x.ctx, x.playerIndex]);

  if (loc.id === "" || !ctx) {
    setDialog(null);
    return null;
  }

  return (
    <>
      <div class="flex flex-col gap-2">
        <h2>{cart.meta.name}</h2>
        <div>
          <span class="font-bold">Room:</span> {loc.id}
        </div>
        <div>
          <span class="font-bold">Player:</span> {playerIndex}
        </div>
        <div class="flex flex-col max-w-xs gap-0.5">
          <div class="font-bold">Ruleset</div>
          <div class="text-sm pl-2">
            <OptionsDisplay options={ctx.options} />
          </div>
        </div>
      </div>
      <br />
      <div class="text-center">
        <button
          onClick={() => {
            serverActions.leave();
            setDialog(null);
          }}
        >
          🛑 Leave game
        </button>
      </div>
    </>
  );
}

function ScoreTableDialog() {
  const loc = useApp((x) => x.loc);
  const scores = useGame((x) => x.game.scores);

  return <ScoreTable scores={scores} room={room} />;
}
