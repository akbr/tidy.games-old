import { System } from "src/state/gameTypes";
import { client } from "src/state/useClient";
import { useGame, set, GameState } from "../state/useGame";

export function InfoBox() {
  const selected = useGame((x) => x.selected);

  if (!selected) return null;

  return (
    <div
      class="absolute bg-purple-900 bottom-0 left-[50%] p-1"
      style={{ transform: "translate(-50%)" }}
    >
      {selected.type === "system" && <SystemInfo system={selected.data} />}
      {selected.type === "planMoveOrder" && <SubmitMove plan={selected} />}
      {JSON.stringify(selected)}
    </div>
  );
}

function SystemInfo({ system }: { system: System }) {
  const mode = useGame((x) => x.mode);
  const isCurrentTurn = useGame((x) => x.turn === x.numTurns);

  return (
    <div>
      <h4>{system.name}</h4>
      {isCurrentTurn && (
        <button
          disabled={mode === "moveSelect"}
          onClick={() => set({ mode: "moveSelect" })}
        >
          Plan move
        </button>
      )}
    </div>
  );
}

function SubmitMove({
  plan,
}: {
  plan: Extract<GameState["selected"], { type: "planMoveOrder" }>;
}) {
  const { to, from } = plan;

  return (
    <button
      onClick={() => {
        client.submit({ to: to.id, from: from.id, num: 1, player: 0 });
      }}
    >
      Submit order
    </button>
  );
}
