import "@shared/base.css";
import { FakeFrag, runFakeFrag } from "@lib/fakeFrag";
import { smoothstep, abs } from "@lib/fakeFrag/fns";
import { Vec } from "@lib/vector";

function plot([x, y]: number[]) {
  return smoothstep(0.02, 0.0, abs(y - x));
}

const helloWorld: FakeFrag = ({ gl_FragCoord }, { u_resolution }) => {
  const [x, y] = Vec.divV(gl_FragCoord, u_resolution);

  const y1 = x;
  let color = [y1, y1, y1];

  const pct = plot([x, y]);
  const mid = color.map((v) => v * (1 - pct));
  const mid2 = [pct * 0, pct * 1, pct * 0];
  const final = [mid[0] + mid2[0], mid[1] + mid2[1], mid[2] + mid2[2]];

  return [...final, 1.0];
};

const $canvas = runFakeFrag(300, 300, helloWorld);

document.body.appendChild($canvas);
