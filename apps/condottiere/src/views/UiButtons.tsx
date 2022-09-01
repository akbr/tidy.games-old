import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";

import { Twemoji } from "@shared/components/Twemoji";
import { DialogOf } from "@shared/components/DialogOf";

import { Map } from "./Map";
import { GameProps } from "@lib/tabletop";
import CondottiereSpec from "src/game/spec";

export const UiButtons = (props: GameProps<CondottiereSpec>) => {
  const [Dialog, setDialog] = useState<FunctionalComponent<
    GameProps<CondottiereSpec>
  > | null>(null);

  return (
    <>
      <div class="absolute top-0 left-0 m-1">
        <div class="flex gap-3 p-2">
          <div
            class="cursor-pointer"
            onClick={() => setDialog(() => OptionsDialog)}
          >
            <Twemoji char={"⚙️"} size={36} />
          </div>
          <div
            class="cursor-pointer"
            onClick={() => setDialog(() => MapDialog)}
          >
            <Twemoji char={"🗺️"} size={36} />
          </div>
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
export default UiButtons;

function MapDialog({ state, room, actions }: GameProps<CondottiereSpec>) {
  const isTurn = room.player === state.player;
  const isChoosing = isTurn && state.phase === "choose";

  return (
    <Map
      players={room.seats}
      battleLocation={state.battleLocation}
      map={state.map}
      isChoosing={isChoosing}
      choose={actions.cart.choose}
    />
  );
}

const OptionsDialog = ({ actions }: GameProps<CondottiereSpec>) => {
  return (
    <div class="text-center">
      <button onClick={() => actions.server.leave(null)}>🛑 Leave game</button>
    </div>
  );
};
