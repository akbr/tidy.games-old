export function Planet({
  x,
  y,
  r,
  color,
}: {
  x: number;
  y: number;
  r: number;
  color: string;
}) {
  return (
    <div
      class="absolute"
      style={{ width: r * 2, height: r * 2, left: x - r / 2, top: y - r }}
    >
      <div
        class="absolute"
        style={{
          bottom: "110%",
          left: "50%",
          transform: "translateX(-50%)",
          color,
        }}
      >
        Planet
      </div>
      <div class="absolute" style={{ top: "110%", left: "100%" }}>
        20
      </div>
      <svg>
        <circle
          cx={r}
          cy={r}
          r={r}
          fill={color}
          onMouseDown={(e) => {
            console.log("hi");
            e.stopPropagation();
          }}
        />
      </svg>
    </div>
  );
}
export default Planet;
