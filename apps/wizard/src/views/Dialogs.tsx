import { ScoreTable } from "./ScoreTable";
import { OptionsDisplay } from "./Options";

import { useGame, game, setDialog, serverActions } from "@src/control";

export function OptionsDialog() {
  const [id, ctx, playerIndex] = useGame((x) => [x.id, x.ctx, x.playerIndex]);

  if (id === "" || !ctx) {
    setDialog(null);
    return null;
  }

  return (
    <>
      <div class="flex flex-col gap-2">
        <h2>{game.meta.name}</h2>
        <div>
          <span class="font-bold">Room:</span> {id}
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
        <br />
        <button
          onClick={() => {
            serverActions.getHistoryString();
          }}
        >
          📖 Get history
        </button>
      </div>
    </>
  );
}
