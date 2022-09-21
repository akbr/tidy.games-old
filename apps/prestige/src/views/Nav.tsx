import { useGame } from "../state/useGame";
import { client } from "../state/useClient";

export function Nav() {
  const turn = useGame((x) => x.turn);
  const seek = useGame((x) => x.seek);
  return (
    <section
      id="nav"
      class="absolute top-0 left-[50%] p-1 text-center"
      style={{ transform: "translate(-50%)" }}
    >
      <div class="flex flex-col justify-center items-center gap-1">
        <div class="flex justify-center items-center gap-1">
          <button disabled={turn === 1} onClick={() => client.get(turn + -1)}>
            {"<"}
          </button>
          <div
            class="p-1"
            style={{ backgroundColor: !seek ? "green" : "orange" }}
          >
            Turn {turn}
          </div>
          <button disabled={!seek} onClick={() => client.get(turn + 1)}>
            {">"}
          </button>
        </div>
        <div>
          {!seek && <button onClick={() => client.resolve()}>Resolve</button>}
          {seek && (
            <>
              <button
                disabled={seek[0] === 0}
                onClick={() => client.seekTo(seek[0] - 1)}
              >
                {"<"}
              </button>
              <button
                disabled={seek[0] === seek[1]}
                onClick={() => client.seekTo(seek[0] + 1)}
              >
                {">"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
