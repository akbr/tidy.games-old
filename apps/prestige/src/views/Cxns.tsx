import { useTable } from "../state";

export function Cxns() {
  const cxns = useTable((x) => x.board.cxns);
  const systems = useTable((x) => x.board.systems);
  const selectedSystem = useTable((x) =>
    x.selected && x.selected.type === "system" ? x.selected : false
  );
  const mode = useTable((x) => x.mode);

  return (
    <g id="cxns">
      {cxns.map((cxn) => {
        const [s1, s2] = cxn.systems.map(
          (name) => systems.find((x) => x.name === name)!
        );
        const highlighted =
          mode === "selectMove" &&
          selectedSystem &&
          (s1.name === selectedSystem.name || s2.name === selectedSystem.name);

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
