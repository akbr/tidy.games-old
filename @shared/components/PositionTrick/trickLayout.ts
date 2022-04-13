import { Vec, toXY } from "@lib/vector";
import { randomBetween } from "@lib/random";

import {
  getSeatPosition,
  getSeatDirectionVector,
} from "../PositionSeats/seatsLayout";

type Dimensions = { width: number; height: number };
const CHILD_DIMENSIONS = [80, 112];

export const getHeldPosition = (
  numPlayers: number,
  seatIndex: number,
  dimensions: Dimensions,
  childDimensions = CHILD_DIMENSIONS
) => {
  const buffer = [1.3, 1.3];
  const seat = getSeatPosition(numPlayers, seatIndex, dimensions);
  const direction = getSeatDirectionVector(numPlayers, seatIndex);
  const heldOffset = Vec.mulV(Vec.mul(direction, -1), childDimensions, buffer);
  const cardCenter = Vec.mul(childDimensions, -0.5);

  return toXY(Vec.add(seat, heldOffset, cardCenter));
};

export const getPlayedPosition = (
  numPlayers: number,
  seatIndex: number,
  dimensions: Dimensions,
  childDimensions = CHILD_DIMENSIONS
) => {
  const minYRatio = 0.35;
  const seat = getSeatPosition(numPlayers, seatIndex, dimensions);
  const direction = getSeatDirectionVector(numPlayers, seatIndex);

  const playOffset = Vec.mulV(direction, [
    dimensions.width / 2,
    dimensions.height * minYRatio,
  ]);
  const padding = Vec.mulV(Vec.mul(direction, -1), [
    childDimensions[0] + 12,
    childDimensions[1] / 2,
  ]);
  const cardCenter = Vec.mul(childDimensions, -0.5);
  const positionVector = Vec.add(seat, playOffset, padding, cardCenter);

  return toXY(positionVector);
};

export const getWaggle = (amt: number, amt2: number) => {
  const getAmt = () => randomBetween(amt, amt2);
  return [0, getAmt(), 0, -getAmt(), 0, getAmt(), -getAmt() / 4].map(
    (rotate) => ({
      rotate,
    })
  );
};
