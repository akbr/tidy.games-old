import { getArrow } from "perfect-arrows";
import { useGame } from "../state/useGame";

export function MoveOrder() {
  const moveOrder = useGame((x) =>
    x.selected?.type === "planMoveOrder" ? x.selected : null
  );

  if (!moveOrder) return null;

  const { from, to } = moveOrder;
  return (
    <g>
      <PerfectArrow
        sx={from.x}
        sy={from.y}
        ex={to.x}
        ey={to.y}
        dash={"4, 4"}
        padEnd={to.size + 24}
        color={"yellow"}
      />
    </g>
  );
}

export function ActiveMoveOrders() {
  const orders = useGame((x) => x.orders);
  const systems = useGame((x) => x.board.systems);

  return (
    <g id="moveOrders">
      {orders.map(({ to, from }) => {
        const s1 = systems.find((x) => x.id === from)!;
        const s2 = systems.find((x) => x.id === to)!;
        return (
          <PerfectArrow
            sx={s1.x}
            sy={s1.y}
            ex={s2.x}
            ey={s2.y}
            dash={"4, 4"}
            padEnd={s2.size + 24}
            color={"yellow"}
          />
        );
      })}
    </g>
  );
}

export function PerfectArrow({
  sx,
  sy,
  ex,
  ey,
  dash = "",
  padEnd = 45,
  color = "#666",
}: {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  color?: string;
  dash?: string;
  padEnd?: number;
}) {
  const arrow = getArrow(sx, sy, ex, ey, {
    bow: 0.09,
    stretch: 0.2,
    padEnd,
  });

  const [rsx, rsy, cx, cy, rex, rey, ae, as, ec] = arrow;

  const endAngleAsDegrees = ae * (180 / Math.PI);

  return (
    <g stroke={color} fill={color} stroke-width={3}>
      <path
        d={`M${rsx},${rsy} Q${cx},${cy} ${rex},${rey}`}
        fill="none"
        stroke-dasharray={dash}
      />
      <polygon
        points="0,-6 12,0, 0,6"
        transform={`translate(${rex},${rey}) rotate(${endAngleAsDegrees})`}
      />
    </g>
  );
}
