import type { System } from "../game/board/board.types";
import { useTable } from "../state";

export function Systems() {
  const systems = useTable((x) => x.board.systems);
  return (
    <g id="systems">
      {systems.map((system) => (
        <ConfigSystem system={system} />
      ))}
    </g>
  );
}

export function ConfigSystem({ system }: { system: System }) {
  const selectedSystem = useTable((x) =>
    x.selected && x.selected.type === "system" ? x.selected : false
  );
  const highlighted = selectedSystem && selectedSystem.id === system.id;
  const props = { ...system, highlighted };
  return <SystemSprite {...props} />;
}

export function SystemSprite({
  x,
  y,
  size,
  color,
  highlighted = false,
}: System & { highlighted?: boolean }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      stroke={highlighted ? "yellow" : ""}
      stroke-width={highlighted ? "2" : "0"}
    />
  );
}
