import { System } from "../state/gameTypes";
import { useGame, GameState } from "../state/useGame";

export function Systems() {
  const systems = useGame((x) => x.board.systems);
  return (
    <g id="systems">
      {systems.map((system) => (
        <ConfigSystem system={system} />
      ))}
    </g>
  );
}

const qSelectedSystem = ({ selected }: GameState) =>
  selected && selected.type === "system" ? selected.data : false;

export function ConfigSystem({ system }: { system: System }) {
  const selectedSystem = useGame(qSelectedSystem);
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
