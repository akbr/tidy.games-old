import "@shared/base.css";
import { render } from "preact";

const hsl = (d: number, s: number, l: number) => `hsl(${d}, ${s}%, ${l}%)`;

const BasicBars = ({ width, height }: { width: number; height: number }) => {
  const hue = 360 * Math.random();
  const colors = Array.from({ length: 6 }).map((_, idx) =>
    hsl(hue, 80, 100 / (idx + 2))
  );
  const num = 300 / colors.length;

  return (
    <g>
      {colors.map((color, idx) => (
        <rect width={num} height={height} x={num * idx} fill={color} />
      ))}
    </g>
  );
};

const Shade = ({ width, height }: { width: number; height: number }) => {
  return (
    <g>
      <mask id="myMask">
        <circle
          r={width / 2}
          cx={width / 2 - 40}
          cy={width / 2 - 40}
          fill="white"
        />
      </mask>
      <rect
        mask="url(#myMask)"
        width={width}
        height={height}
        fill={"black"}
        opacity={0.5}
      />
    </g>
  );
};

function App() {
  const width = 300;
  const height = 300;

  const hue = 360 * Math.random();
  const colors = Array.from({ length: 6 }).map((_, idx) =>
    hsl(hue, 80, 100 / (idx + 2))
  );
  const num = 300 / colors.length;

  return (
    <div class="inline-block border border-white border-dashed m-10">
      <svg
        style={{ width, height, verticalAlign: "top" }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <clipPath id="clipCircle">
          <circle r={width / 2} cx={width / 2} cy={width / 2} />
        </clipPath>
        <g clip-path="url(#clipCircle)">
          <BasicBars width={width} height={height} />
          <Shade width={width} height={height} />
        </g>
      </svg>
    </div>
  );
}

render(<App />, document.body);

/**
import { SVG } from "@svgdotjs/svg.js";
import { randomBetween } from "@lib/random";
import { spline } from "./spline";


const dip = (amt: number, dir = 1) =>
  `c0,${amt * dir} ${amt},${amt * dir} ${amt},0`;
const vLine = (amt: number, dir = 1) => `l0,${amt * dir}`;

function getDrip() {
  const draw = SVG();
  const path = [
    "M0,0",
    vLine(100),
    dip(20),
    vLine(50, -1),
    dip(20, -1),
    vLine(20),
    dip(20),
    vLine(10, -1),
    dip(20, -1),
    vLine(50),
    dip(20),
    vLine(20, -1),
    "c0,-30 0,-30 10,-30",
    "c6,0 6,0 6,-30",
    dip(12, -1),
    vLine(24),
    dip(18),
    vLine(100, -1),
    "Z",
  ].join();

  const group = draw.group().id("drip");

  group
    .path(path)
    .stroke({ width: 0, color: "white" })
    .fill({ color: "green" });

  return group;
}

function generate() {
  const svg = SVG().size(146, 171).viewbox(0, 0, 146, 171);
  const planet = SVG().group().id("planet");
  const extra = SVG().group().id("atmoshopere");
  const drip = getDrip();

  const atmoshopere = svg
    .circle(132)
    .cx(146 / 2)
    .cy(171 / 2)
    .fill("yellow")
    .opacity(0.8);
  extra.add(atmoshopere);

  svg.add(extra);

  const surface = svg
    .circle(120)
    .cx(146 / 2)
    .cy(171 / 2)
    .fill("lightblue");

  planet.add(surface);
  planet.add(drip);
  svg.add(planet);

  const mask = svg
    .circle(120)
    .cx(146 / 2)
    .cy(171 / 2)
    .fill("white");

  planet.clipWith(mask);

  svg.addTo("body");
}

/**
  const baseShape = SVG()
    .circle(150)
    .cx(146 / 2)
    .cy(171 / 2)
    .fill("#fff");

    .maskWith(baseShape);
 */

/**
     * 
     * 
    const width = 800;
    const numSteps = 10;
    const stepSize = width / numSteps;
    
    const cx = 400;
    const cy = 200;
    const numPoints = 12;
    // step used to place each point at equal distances
    const angleStep = (Math.PI * 2) / numPoints;
    const size = randomBetween(50, 80);
    
    var a = 160;
    var b = 40;
    
    function generate() {
      // clear the contents of the SVG
      draw.clear();
    
      const points: number[][] = [];
      for (var i = 0 * Math.PI; i < 2 * Math.PI; i += (2 * Math.PI) / numPoints) {
        // how much randomness should be added to each point
        const pullX = randomBetween(-2, 2);
        const pullY = randomBetween(-30, 30);
    
        // x & y coordinates of the current point
    
        // cos(theta) * radius + a little randomness thrown in
        //const x = cx + Math.cos(i * angleStep) * (size * pull);
        const z = angleStep / (numPoints - i);
        const x = cx - a * Math.cos(i) + pullX;
        // sin(theta) * radius + a little randomness thrown in
        // const y = cy + Math.sin(i * angleStep) * (size * pull);
        const y = cy + b * Math.sin(i) + pullY;
        // push the point to the points array
        points.push([x, y]);
      }
    
      // generate a smooth continuous curve based on the points, using bezier curves. spline() will return an svg path-data string. The arguments are (points, tension, close). Play with tension and check out the effect!
      const pathData = spline(points, 1.2, true);
    
      // render the body in the form of an svg <path /> element!
      draw.path(pathData).stroke({ width: 4, color: "lightblue" }).fill("blue");
    
      points.forEach(([x, y]) => {
        // render an svg circle at the current { x, y } position
        draw.circle(6).cx(x).cy(y).fill("deeppink");
      });
    }
      // plot 10 equally spaced points along the canvas width
      for (let x = 0; x <= width; x += stepSize) {
        // y = vertical center of the viewport (100) +/- 10
        const y = randomBetween(0, 200) + (stepSize * x) / 150;
        // store the { x, y } coordinate to use later
        points.push([x, y]);
      }
    
      // array of { x, y } coordinates, tension, "close" the shape
      const pathData = spline(points, 1, false);
      // render an svg <path> using the spline path data
      draw.path(pathData).stroke("#333").fill("none").attr({ "stroke-width": 2 });
    
      points.forEach(([x, y]) => {
        // render an svg circle at the current { x, y } position
        draw.circle(6).cx(x).cy(y).fill("deeppink");
      });
     */
