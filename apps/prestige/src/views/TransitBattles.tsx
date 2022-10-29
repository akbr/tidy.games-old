import { Twemoji } from "@shared/components/Twemoji";
import { angleBetween, pointAlong, toDegrees } from "@lib/geometry";
import { useTable } from "../state";
import { System, Transit } from "../game/board/board.types";
import { AbsPosition, SpriteSelect, getTransitPosition } from "./utils";
import { TransitBattle } from "src/game/events/events.types";

export function TransitBattles() {
  const transitBattles = useTable((x) =>
    x.visibleEvents.filter(
      (e): e is TransitBattle => e.type === "transitBattle"
    )
  );

  if (transitBattles.length === 0) return null;

  return (
    <section id="transitBattles">
      {transitBattles.map((tb) => (
        <TransitBattleConfig {...tb} />
      ))}
    </section>
  );
}

function TransitBattleConfig(transitBattle: TransitBattle) {
  const systems = useTable((x) => x.board.systems);

  const { x, y, angle } = getTransitPosition(
    transitBattle.transits[0],
    systems
  );

  return (
    <AbsPosition x={x} y={y} rotate={0}>
      <SpriteSelect id={transitBattle.id}>
        <TransitBattleSprite />
      </SpriteSelect>
    </AbsPosition>
  );
}

export function TransitBattleSprite() {
  return <Twemoji char="💥" size={36} />;
}
