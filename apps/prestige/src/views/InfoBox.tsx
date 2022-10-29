import type { System } from "../game/board/board.types";
import { useTable, tableActions, clientActions } from "../state";

export function InfoBox() {
  const selected = useTable((x) => x.selected);

  if (!selected) return null;

  return (
    <div
      class="absolute bg-purple-900 bottom-0 left-[50%] p-1"
      style={{ transform: "translate(-50%)" }}
    >
      {selected.type === "system" && <SystemInfo system={selected} />}
      {selected.type === "planMove" && <SubmitMove plan={selected} />}
      {JSON.stringify(selected)}
    </div>
  );
}

function SystemInfo({ system }: { system: System }) {
  const mode = useTable((x) => x.mode);
  const isCurrentTurn = useTable((x) => x.ticks === null);

  return (
    <div>
      <h4>{system.name}</h4>
      {isCurrentTurn && (
        <button
          disabled={mode === "selectMove"}
          onClick={() => tableActions.setMode("selectMove")}
        >
          Plan move
        </button>
      )}
    </div>
  );
}

function SubmitMove({ plan }: { plan: { from: string; to: string } }) {
  const { to, from } = plan;

  return (
    <button
      onClick={() => {
        clientActions.submit({
          type: "transitOrder",
          to,
          from,
          fleets: [{ num: 1, player: 1 }],
        });
      }}
    >
      Submit order
    </button>
  );
}
