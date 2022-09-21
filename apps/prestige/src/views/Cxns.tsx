import { useGame } from "../state/useGame";

export function Cxns() {
  const cxns = useGame((x) => x.board.cxns);
  const systems = useGame((x) => x.board.systems);
  const selectedSystem = useGame((x) =>
    x.selected && x.selected.type === "system" ? x.selected.data : false
  );
  const mode = useGame((x) => x.mode);

  return (
    <g id="cxns">
      {cxns.map((cxn) => {
        const [id1, id2] = cxn;
        const s1 = systems.find((x) => x.name === id1)!;
        const s2 = systems.find((x) => x.name === id2)!;
        const highlighted =
          mode === "moveSelect" &&
          selectedSystem &&
          cxn.includes(selectedSystem.name);

        return (
          <CxnSprite
            x1={s1.x}
            y1={s1.y}
            x2={s2.x}
            y2={s2.y}
            highlighted={highlighted}
          />
        );
      })}
    </g>
  );
}

export function CxnSprite({
  x1,
  y1,
  x2,
  y2,
  highlighted = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  highlighted?: boolean;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={highlighted ? "yellow" : "#666"}
      stroke-width={"2"}
    />
  );
}
