import { useTable, clientActions } from "../state/";

export function Nav() {
  const isCurrentTurn = useTable((x) => x.ticks === null);
  const turn = useTable((x) => x.turn);
  const { tick, numTicks } = useTable((x) =>
    x.ticks ? x.ticks : { tick: 0, numTicks: 0 }
  );

  return (
    <section
      id="nav"
      class="absolute top-0 left-[50%] p-1 text-center"
      style={{ transform: "translate(-50%)" }}
    >
      <div class="flex flex-col justify-center items-center gap-1">
        <div class="flex justify-center items-center gap-1">
          <button
            disabled={turn === 1}
            onClick={() => clientActions.fetch(turn + -1)}
          >
            {"<"}
          </button>
          <div
            class="p-1"
            style={{ backgroundColor: isCurrentTurn ? "green" : "orange" }}
          >
            Turn {turn}
          </div>
          <button
            disabled={isCurrentTurn}
            onClick={() => clientActions.fetch(turn + 1)}
          >
            {">"}
          </button>
        </div>
        <div>
          {isCurrentTurn && (
            <button onClick={() => clientActions.resolve()}>Resolve</button>
          )}
          {!isCurrentTurn && (
            <div>
              <input
                type="range"
                min="0"
                max="10"
                step={"0.1"}
                value={tick}
                onInput={(e: any) => {
                  clientActions.updateTable(e.target.valueAsNumber);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
              <button
                disabled={tick === 0}
                onClick={() => clientActions.updateTable(tick - 0.1)}
              >
                {"<"}
              </button>
              <button
                disabled={tick === numTicks}
                onClick={() => clientActions.updateTable(tick + 0.1)}
              >
                {">"}
              </button>
 */
