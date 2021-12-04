import type { AppProps, DialogProps } from "./types";
import { Twemoji } from "@lib/components/Twemoji";
import { ScoreTable } from "./ScoreTable";

function Scorez({ state, room }: DialogProps) {
  if (room && state) {
    return (
      <div style={{ display: "grid", placeContent: "center" }}>
        <ScoreTable
          scores={state.scores}
          avatars={room.seats.map(({ avatar }) => avatar)}
          playerIndex={room.seatIndex}
        />
      </div>
    );
  }
  return <div>No scores yet!</div>;
}

export const UiButtons = ({ actions }: AppProps) => {
  const { setDialog } = actions;

  return (
    <div class="flex gap-2 p-2">
      <div
        class="cursor-pointer"
        onClick={() => setDialog(<div>Options!</div>)}
      >
        <Twemoji char={"⚙️"} size={36} />
      </div>
      <div class="cursor-pointer" onClick={() => setDialog(Scorez)}>
        <Twemoji char={"🗒️"} size={36} />
      </div>
    </div>
  );
};
