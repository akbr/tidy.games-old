import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";

import { Twemoji } from "@lib/components/Twemoji";
import { DialogOf } from "@lib/components/DialogOf";

import { GameProps } from "./types";
import { ScoreTable } from "./ScoreTable";

const Options = (props: GameProps) => {
  return (
    <div>
      <div>Maybe more here?</div>
      <button onClick={() => props.controls.server.leave(null)}>Exit</button>
    </div>
  );
};

const Analysis = ({ frame }: GameProps) => {
  if (!frame.history) return <div>Error: No history data.</div>;
  return (
    <div class="text-sm font-mono">
      {JSON.stringify(frame.history)}
      {JSON.stringify(frame.history)}
      {JSON.stringify(frame.history)}
      {JSON.stringify(frame.history)}
      {JSON.stringify(frame.history)}
      {JSON.stringify(frame.history)}
      {JSON.stringify(frame.history)}
      {JSON.stringify(frame.history)}
    </div>
  );
};

export const UiButtons = (props: GameProps) => {
  const {
    frame: {
      state: [, game],
      history,
    },
  } = props;

  const [Dialog, setDialog] = useState<FunctionalComponent<GameProps> | null>(
    null
  );

  const { width } = document.body.getBoundingClientRect();
  console.log(history);
  return (
    <>
      <div class="absolute top-0 left-0 m-1">
        <div class="flex gap-2 p-2">
          <div class="cursor-pointer" onClick={() => setDialog(() => Options)}>
            <Twemoji char={"⚙️"} size={36} />
          </div>
          {width < 1000 && game.scores.length > 0 && (
            <div
              class="cursor-pointer"
              onClick={() => setDialog(() => ScoreTable)}
            >
              <Twemoji char={"🗒️"} size={36} />
            </div>
          )}
          {history && (
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
