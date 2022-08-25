import { assert, expect, test } from "vitest";
import { maxInt } from "@lib/array";

const chunkArray = <T>(arr: T[]) =>
  arr.reduce((chunked, _, idx) => {
    if (idx % 2 === 0) chunked.push(arr.slice(idx, idx + 2));
    return chunked;
  }, [] as T[][]);

const toSVGPoints = (arr: number[][]) =>
  arr.map((pts) => pts.join(",")).join(" ");

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
  xSegs = data.length,
}: LinePointProps) => {
  const pxPerXSeg = width / xSegs;
  const vRatio = maxY / height;
  return toSVGPoints(
    data.map((yPt, idx) => [idx * pxPerXSeg, (maxY - yPt) * vRatio])
  );
};

test("chunkArray", () => {
  expect(maxInt([1, 2])).toBe(2);
  expect(chunkArray([1, 2])).toEqual([[1, 2]]);
  expect(chunkArray(["a", "b", "c"])).toEqual([["a", "b"], ["c"]]);
});

test("toSVGPoints", () => {
  expect(
    toSVGPoints([
      [1, 2],
      [3, 4],
    ])
  ).toBe("1,2 3,4");
});
