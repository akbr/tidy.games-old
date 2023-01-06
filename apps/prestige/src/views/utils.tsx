import { ComponentChildren } from "preact";
import { useTable } from "../state";
import { angleBetween, pointAlong, toDegrees } from "@lib/gfx";
import { Transit, System } from "../game/board/board.types";

export function getTransitPosition(transit: Transit, systems: System[]) {
  const { from, to, distance } = transit;
  const s1 = systems.find((x) => x.id === from)!;
  const s2 = systems.find((x) => x.id === to)!;

  const angle = toDegrees(angleBetween(s1.x, s1.y, s2.x, s2.y));
  const [x, y] = pointAlong(s1.x, s1.y, s2.x, s2.y, distance);
  return { x, y, angle };
}

export function AbsPosition({
  children,
  x,
  y,
  rotate,
}: {
  children: ComponentChildren;
  x: number;
  y: number;
  rotate: number;
}) {
  return (
    <div
      class="absolute"
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) rotate(${rotate}deg)`,
      }}
    >
      {children}
    </div>
  );
}

export function SpriteSelect({
  id,
  children,
}: {
  id: string;
  children: ComponentChildren;
}) {
  const selected = useTable((x) => x.selected);
  const isSelected = !!(selected && "id" in selected && selected.id === id);

  return (
    <div
      data-select={id}
      style={{ border: isSelected ? "2px solid yellow" : "" }}
    >
      {children}
    </div>
  );
}
