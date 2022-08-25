import { maxInt } from "../../../@lib/array";

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
