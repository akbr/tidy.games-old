import { Vector, multiply } from "../vector";

// -----
// Seats
// [ratioVector, directionVector]
// -----
const topCenter = [
  { x: 0.5, y: 0 },
  { x: 0, y: 1 }
];
const leftCenter = [
  { x: 0, y: 0.5 },
  { x: 1, y: 0 }
];
const leftTop = [
  { x: 0, y: 1 / 3 },
  { x: 1, y: 0 }
];
const leftBottom = [
  { x: 0, y: 2 / 3 },
  { x: 1, y: 0 }
];
const rightCenter = [
  { x: 1, y: 0.5 },
  { x: -1, y: 0 }
];
const rightTop = [
  { x: 1, y: 1 / 3 },
  { x: -1, y: 0 }
];
const rightBottom = [
  { x: 1, y: 2 / 3 },
  { x: -1, y: 0 }
];
const bottomCenter = [
  { x: 0.5, y: 1 },
  { x: 0, y: -1 }
];

export const seatRatios: Vector[][][] = [
  [bottomCenter],
  [bottomCenter, topCenter],
  [bottomCenter, leftCenter, rightCenter],
  [bottomCenter, leftCenter, topCenter, rightCenter],
  [bottomCenter, leftBottom, leftTop, rightTop, rightBottom],
  [bottomCenter, leftBottom, leftTop, topCenter, rightTop, rightBottom]
];

export type Dimensions = {
  w: number;
  h: number;
};

export type SeatProps = {
  numPlayers: number;
  seatIndex: number;
};

export const getSeatPosition = (
  { numPlayers, seatIndex }: SeatProps,
  table: Dimensions
) =>
  multiply(seatRatios[numPlayers - 1][seatIndex][0], {
    x: table.w,
    y: table.h
  });

export const getSeatDirection = ({
  numPlayers,
  seatIndex
}: SeatProps): Vector => seatRatios[numPlayers - 1][seatIndex][1];
