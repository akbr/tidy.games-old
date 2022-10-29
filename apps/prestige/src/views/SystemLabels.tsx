import { System } from "../game/board/board.types";
import { useTable } from "../state";

export function SystemLabels() {
  const systems = useTable((x) => x.board.systems);

  return (
    <section id="SystemLabels">
      {systems.map((system) => (
        <SystemLabel {...system} />
      ))}
    </section>
  );
}

export function SystemLabel(system: System) {
  const { name, x, y, id, size } = system;

  return (
    <div
      class="absolute"
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        width: size * 2 + 6,
        height: size * 2 + 6,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "100%",
          transform: "translate(-50%, -2px)",
        }}
      >
        {name}
      </div>
      {system.fleets.length > 0 && (
        <div
          class="text-xs"
          style={{
            position: "absolute",
            left: "100%",
            top: "100%",
          }}
        >
          {JSON.stringify(system.fleets)}
        </div>
      )}
      <div data-select={id} class="h-full" />
    </div>
  );
}
