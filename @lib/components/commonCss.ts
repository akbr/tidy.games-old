import { css, keyframes } from "goober";

export const a = css({
  position: "absolute",
});

export const topMargins = css({
  margin: "0.4em",
});

export const innerCenter = css({
  display: "grid",
  placeContent: "center",
});

const getPos = (d: number, offset: number) =>
  `calc(${d * 100}% + ${d === 0 ? offset : -offset}px)`;
export const overParentEdge = ({
  x,
  y,
  offset = 0,
}: {
  x: number;
  y: number;
  offset?: number;
}) =>
  css({
    transform: `translate(${-50}%, ${-50}%)`,
    left: getPos(x, offset),
    top: getPos(y, offset),
  });
