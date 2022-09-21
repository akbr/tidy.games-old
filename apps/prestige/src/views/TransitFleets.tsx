import { Twemoji } from "@shared/components/Twemoji";
import { angleBetween, pointAlong, toDegrees } from "@lib/geometry";
import { useGame } from "../state/useGame";
import { TransitFleet } from "../state/gameTypes";

export function TransitFleets() {
  const transit = useGame((x) => x.board.transit);

  return (
    <section id="transit">
      {transit.map((fleet) => {
        return (
          <div data-select={fleet.id}>
            <TransitFleetConfig {...fleet} />
          </div>
        );
      })}
    </section>
  );
}

function TransitFleetConfig({ from, to, distance, id }: TransitFleet) {
  const systems = useGame((x) => x.board.systems);
  const selectedId = useGame((x) =>
    x.selected?.type === "transit" ? x.selected?.data.id : -1
  );

  const s1 = systems.find((x) => x.id === from)!;
  const s2 = systems.find((x) => x.id === to)!;

  const rotation = toDegrees(angleBetween(s1.x, s1.y, s2.x, s2.y));
  const [x, y] = pointAlong(s1.x, s1.y, s2.x, s2.y, distance);

  return (
    <TransitFleetSprite
      x={x}
      y={y}
      rotation={rotation}
      selected={selectedId === id}
    />
  );
}

export function TransitFleetSprite({
  x,
  y,
  rotation = 0,
  selected = false,
}: {
  x: number;
  y: number;
  rotation?: number;
  selected?: boolean;
}) {
  return (
    <div
      class="absolute"
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) rotate(${
          rotation + 45
        }deg)`,
        border: selected ? "2px solid yellow" : "",
      }}
    >
      <Twemoji char="🚀" size={28} />
    </div>
  );
}
