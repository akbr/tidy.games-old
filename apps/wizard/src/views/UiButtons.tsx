import { Twemoji } from "@shared/components/Twemoji";

import { ScoreTable } from "./ScoreTable";
import { OptionsDisplay } from "./Options";
import { GameProps } from "@lib/tabletop";
import { WizardSpec } from "src/game/spec";

/*
const Options = ({ state }: GameProps<WizardSpec>) => {



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
**/

export const UiButtons = ({ state }: GameProps<WizardSpec>) => {
  return (
    <div class="absolute top-0 left-0 m-1">
      <div class="flex gap-2 p-2">
        <div
          class="cursor-pointer"
          onClick={() => {
            //view.set(Options)
          }}
        >
          <Twemoji char={"⚙️"} size={36} />
        </div>
        {state.scores.length > 0 && (
          <div
            class="cursor-pointer"
            onClick={() => {
              //view.set(ScoreTable)
            }}
          >
            <Twemoji char={"🗒️"} size={36} />
          </div>
        )}
      </div>
    </div>
  );
};
