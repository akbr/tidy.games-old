import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";

import { GameProps } from "@lib/tabletop";
import { Twemoji } from "@shared/components/Twemoji";
import { DialogOf } from "@shared/components/DialogOf";
import { WizardSpec } from "../game/spec";

import { ScoreTable } from "./ScoreTable";
import { OptionsDisplay } from "./Options";

export const UiButtons = (props: GameProps<WizardSpec>) => {
  const { state } = props.frame;
  const [Dialog, setDialog] = useState<FunctionalComponent<
    GameProps<WizardSpec>
  > | null>(null);

  return (
    <>
      <div class="absolute top-0 left-0 m-1">
        <div class="flex gap-2 p-2">
          <div
            class="cursor-pointer"
            onClick={() => {
              setDialog(() => OptionsDialog);
            }}
          >
            <Twemoji char={"⚙️"} size={36} />
          </div>
          {state.scores.length > 0 && (
            <div
              class="cursor-pointer"
              onClick={() => {
                setDialog(() => ScoreTableDialog);
              }}
            >
              <Twemoji char={"🗒️"} size={36} />
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

function OptionsDialog({ frame, actions, cart }: GameProps<WizardSpec>) {
  const { ctx, room } = frame;
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
            <OptionsDisplay options={ctx.options} />
          </div>
        </div>
      </div>
      <br />
      <div class="text-center">
        <button onClick={() => actions.server.leave()}>🛑 Leave game</button>
      </div>
    </>
  );
}

function ScoreTableDialog({ frame }: GameProps<WizardSpec>) {
  return <ScoreTable scores={frame.state.scores} room={frame.room} />;
}
