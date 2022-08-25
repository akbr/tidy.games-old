import "@shared/base.css";
import { h, render } from "preact";
import { setup } from "@twind/preact";
import { maxInt } from "@lib/array";
import { randomBetween } from "@lib/random";

setup({
  preflight: false,
  props: { className: true },
});

const $app = document.getElementById("app")!;

type LinePointProps = {
  data: number[];
  width: number;
  height: number;
  maxY?: number;
  xSegs?: number;
};
export const getLinePoints = ({
  data,
  width,
  height,
  maxY = maxInt(data),
  xSegs = data.length - 1,
}: LinePointProps) => {
  const pxPerXSeg = width / xSegs;
  const vRatio = height / maxY;
  return toSVGPoints(
    data.map((yPt, idx) => [idx * pxPerXSeg, (maxY - yPt) * vRatio])
  );
};

const toSVGPoints = (arr: number[][]) =>
  arr.map((pts) => pts.join(",")).join(" ");

const PolyLine = (props: LinePointProps & { color?: string }) => {
  return (
    <polyline
      fill="none"
      stroke={props.color || "black"}
      stroke-width="1"
      points={getLinePoints(props)}
    />
  );
};

const App = () => {
  const width = 500;
  const height = 100;

  const input = [
    {
      data: [20, 40, 60, 50, 80, 110, 160, 150],
      color: "purple",
    },
    {
      data: [20, 10, 0, 20, 30, 20, 40, 30],
      color: "green",
    },
  ];
  const xSegs = maxInt(input.map((x) => x.data.length - 1));
  const maxY = maxInt(input.map((x) => x.data).flat());

  return (
    <div class="p-5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ borderLeft: "1px solid #555", borderBottom: "1px solid #555" }}
      >
        {input.map(({ data, color }) => (
          <PolyLine
            width={width}
            height={height}
            data={data}
            color={color}
            xSegs={xSegs}
            maxY={maxY}
          />
        ))}
      </svg>
    </div>
  );
};

render(<App />, $app);

/**
const App = () => {
  return (
    <div class="p-5">
      <svg width="420" height="150" role="img">
        <desc id="desc">
          4 apples; 8 bananas; 15 kiwis; 16 oranges; 23 lemons
        </desc>
        <g style={{ fill: "blue" }}>
          <rect width="40" height="19"></rect>
          <text x="45" y="9.5" dy=".35em">
            4 apples
          </text>
        </g>
        <g style={{ fill: "red" }}>
          <rect width="80" height="19" y="20"></rect>
          <text x="85" y="28" dy=".35em">
            8 bananas
          </text>
        </g>
        <g style={{ fill: "green" }}>
          <rect width="150" height="19" y="40"></rect>
          <text x="150" y="48" dy=".35em">
            15 kiwis
          </text>
        </g>
        <g style={{ fill: "purple" }}>
          <rect width="160" height="19" y="60"></rect>
          <text x="161" y="68" dy=".35em">
            16 oranges
          </text>
        </g>
        <g style={{ fill: "orange" }}>
          <rect width="230" height="19" y="80"></rect>
          <text x="235" y="88" dy=".35em">
            23 lemons
          </text>
        </g>
      </svg>
    </div>
  );
};

 */
