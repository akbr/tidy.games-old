import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";

import { Twemoji } from "@shared/components/Twemoji";
import { DialogOf } from "@shared/components/DialogOf";

import { GameProps } from "./types";
import { ScoreTable } from "./ScoreTable";
import { OptionsDisplay } from "./Options";

const Options = ({ frame, cart, controls, room }: GameProps) => {
  return (
    <>
      <div class="flex flex-col gap-2">
        <h2>{cart.meta.name}</h2>
        <div>
          <span class="font-bold">Room:</span> {room.id}
        </div>
        <div>
          <span class="font-bold">Player:</span> {room.player}
        </div>
        <div class="flex flex-col max-w-xs gap-0.5">
          <div class="font-bold">Ruleset</div>
          <div class="text-sm pl-2">
            <OptionsDisplay options={frame.ctx.options} />
          </div>
        </div>
      </div>
      <br />
      <div class="text-center">
        <button onClick={() => controls.server.leave(null)}>
          🛑 Leave game
        </button>
      </div>
    </>
  );
};

const Analysis = ({ frame }: GameProps) => {
  if (!frame.analysis) return <div>Error: No analysis data.</div>;
  return <div class="text-sm font-mono">{JSON.stringify(frame.analysis)}</div>;
};

export const UiButtons = (props: GameProps) => {
  const {
    frame: {
      state: [, game],
      analysis,
    },
  } = props;

  const [Dialog, setDialog] = useState<FunctionalComponent<GameProps> | null>(
    null
  );

  const { width } = document.body.getBoundingClientRect();

  return (
    <>
      <div class="absolute top-0 left-0 m-1">
        <div class="flex gap-2 p-2">
          <div class="cursor-pointer" onClick={() => setDialog(() => Options)}>
            <Twemoji char={"⚙️"} size={36} />
          </div>
          {game.scores.length > 0 && (
            <div
              class="cursor-pointer"
              onClick={() => setDialog(() => ScoreTable)}
            >
              <Twemoji char={"🗒️"} size={36} />
            </div>
          )}
          {analysis && (
            <div
              class="cursor-pointer"
              onClick={() => setDialog(() => Analysis)}
            >
              <Twemoji char={"📊"} size={36} />
            </div>
          )}
        </div>
      </div>
      {Dialog && (
        <DialogOf close={() => setDialog(null)}>
          <Dialog {...props} />
        </DialogOf>
      )}
    </>
  );
};
