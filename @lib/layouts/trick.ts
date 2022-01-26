import { Vec, toXY } from "@lib/vector";
import { getSeatPosition, getSeatDirectionVector } from "./seats";

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
  const minYRatio = 0.33;
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

  return toXY(Vec.add(seat, playOffset, padding, cardCenter));
};
