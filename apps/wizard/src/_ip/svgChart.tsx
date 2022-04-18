//@ts-nocheck

import { render, h } from "preact";
import { WizardSpec } from "./game/spec";
import { maxInt, minInt } from "@lib/array";
import { Twemoji } from "@shared/components/Twemoji";

type LinePointProps = {
  data: number[];
  width: number;
  height: number;
  margin?: number;
  maxY?: number;
  minY?: number;
  xSegs?: number;
};

export const getLinePoints = ({
  data,
  width,
  height,
  margin = 0,
  maxY = maxInt(data),
  minY = 0,
  xSegs = data.length - 1,
}: LinePointProps & {}) => {
  width = width - 20;
  maxY = maxY + 5;
  const pxPerXSeg = (width - margin) / xSegs;
  const vRatio = (height - margin) / (maxY - minY);
  return toSVGPoints(
    data.map((yPt, idx) => [
      idx * pxPerXSeg + margin + 0.5,
      (maxY - yPt) * vRatio,
    ])
  );
};

export const LineGraphPips = ({
  data,
  height,
  width,

  margin = 0,
  maxY = maxInt(data),
  minY = 0,
}: LinePointProps) => {
  const vRatio = (height - margin) / (maxY - minY);

  const sX = margin - 4;
  const eY = margin + 0.5;
  const tX = margin - 6;

  const bottomY = height - margin;
  const middleY = bottomY - (0 - minY) * vRatio;
  const topY = 0.5 + 5;

  return (
    <>
      <g class="stroke-slate-500 stroke-1">
        <line x1={sX} x2={eY} y1={middleY} y2={middleY} />
        <line x1={sX} x2={eY} y1={topY} y2={topY} />
      </g>
      <g
        class="stroke-slate-700"
        style={{ strokeWidth: 0.5, strokeDasharray: 1 }}
      >
        <line x1={eY} x2={width} y1={topY} y2={topY} />
        <line x1={eY} x2={width} y1={middleY} y2={middleY} />
      </g>
      <g class="fill-white font-mono text-[8px]">
        <text x={tX} y={middleY} text-anchor="end" alignment-baseline="middle">
          0
        </text>
        <text x={tX} y={topY} text-anchor="end" alignment-baseline="middle">
          {maxY}
        </text>
      </g>
    </>
  );
};

const toSVGPoints = (arr: number[][]) =>
  arr.map((pts) => pts.join(",")).join(" ");

// ---

const PolyLine = (props: LinePointProps & { color?: string }) => (
  <polyline
    fill="none"
    stroke={props.color || "black"}
    stroke-width="1"
    points={getLinePoints(props)}
  />
);

const analysis: WizardSpec["analysis"] = {
  numWizards: [0, 0, 1, 0],
  numJesters: [2, 1, 0, 0],
  runningScore: [
    [0, -20, 40, 30, 50, 90, 120, 100],
    [0, 10, 10, 30, 20, 30, 50, 40],
    [0, 0, 0, 20, 10, 20, 90, 110],
    [0, 48, 20, 22, 30, 50, 80, 50],
  ],
};

const colors = [
  "#e6194B",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
];

const WizardAnalysis = ({ runningScore }: WizardSpec["analysis"]) => {
  const width = 500;
  const height = 100;
  const margin = 20;

  const xSegs = runningScore[0].length - 1;
  const maxY = maxInt(runningScore.flat());
  const minY = minInt(runningScore.flat());

  const graphProps = {
    width,
    height,
    margin,
    xSegs,
    maxY,
    minY,
  };

  return (
    <div class="p-2 bg-gray-900">
      <h2 class="mb-10">A graph!</h2>
      <svg viewBox={`0 0 ${width} ${height}`}>
        <g class="stroke-slate-500 stroke-1">
          <line x1={margin} x2={margin} y1={5} y2={height - margin} />
          <line
            x1={margin}
            x2={width}
            y1={height - margin}
            y2={height - margin}
          />
        </g>

        {runningScore.map((data, idx) => (
          <LineGraphPips {...{ ...graphProps, data }} />
        ))}
        {runningScore.map((data, idx) => (
          <PolyLine {...{ ...graphProps, data, color: colors[idx] }} />
        ))}
      </svg>
    </div>
  );
};

render(h(WizardAnalysis, analysis, null), document.getElementById("app")!);
