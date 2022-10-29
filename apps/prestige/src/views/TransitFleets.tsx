import { Twemoji } from "@shared/components/Twemoji";
import { useTable } from "../state";
import { Transit } from "../game/board/board.types";
import { AbsPosition, SpriteSelect, getTransitPosition } from "./utils";

export function TransitFleets() {
  const transit = useTable((x) => x.board.transit);
  return (
    <section id="transit">
      {transit.map((fleet) => (
        <TransitFleetConfig {...fleet} />
      ))}
    </section>
  );
}

function TransitFleetConfig(transit: Transit) {
  const systems = useTable((x) => x.board.systems);
  const { x, y, angle } = getTransitPosition(transit, systems);

  return (
    <AbsPosition x={x} y={y} rotate={angle + 45}>
      <SpriteSelect id={transit.id}>
        <TransitFleetSprite />
      </SpriteSelect>
    </AbsPosition>
  );
}

export function TransitFleetSprite() {
  return <Twemoji char="🚀" size={28} />;
}
