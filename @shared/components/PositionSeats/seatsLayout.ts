import { Vec } from "@lib/vector";

type Dimensions = { width: number; height: number };

const topCenter = [0.5, 0];
const leftCenter = [0, 0.5];
const leftTop = [0, 1 / 3];
const leftBottom = [0, 2 / 3];
const rightCenter = [1, 0.5];
const rightTop = [1, 1 / 3];
const rightBottom = [1, 2 / 3];
const bottomCenter = [0.5, 1];

export const seatRatios = [
  [bottomCenter],
  [bottomCenter, topCenter],
  [bottomCenter, leftCenter, rightCenter],
  [bottomCenter, leftCenter, topCenter, rightCenter],
  [bottomCenter, leftBottom, leftTop, rightTop, rightBottom],
  [bottomCenter, leftBottom, leftTop, topCenter, rightTop, rightBottom],
];

const ratio2DirectionVec = ([ratioX, ratioY]: number[]) => {
  if (ratioX === 0) return [1, 0];
  if (ratioX === 1) return [-1, 0];
  if (ratioY === 0) return [0, 1];
  /** ratioY === 1 **/ return [0, -1];
};

const ratio2CSSDirection = ([x, y]: number[]) => {
  if (x === 0 && y > 0) return "left";
  if (x === 1 && y > 0) return "right";
  if (y === 1 && x > 0) return "bottom";
  return "top";
};

export const getSeatRatio = (numPlayers: number, seatIndex: number) =>
  seatRatios[numPlayers - 1][seatIndex];

export const getSeatDirectionVector = (numPlayers: number, seatIndex: number) =>
  ratio2DirectionVec(getSeatRatio(numPlayers, seatIndex));

export const getSeatCSSDirection = (numPlayers: number, seatIndex: number) =>
  ratio2CSSDirection(getSeatRatio(numPlayers, seatIndex));

export const getSeatPosition = (
  numPlayers: number,
  seatIndex: number,
  { width, height }: Dimensions
) => Vec.mulV(getSeatRatio(numPlayers, seatIndex), [width, height]);
