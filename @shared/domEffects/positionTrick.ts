import { getElDimensionsVector } from "@lib/dom";
import { Vec, Vector } from "@lib/vector";
import {
  getSeatPosition,
  getSeatDirectionVector,
  getSeatRatio,
} from "./positionSeats";

export const getScaleAdjVector = (scaledDimensions: Vector, atScale: number) =>
  Vec.mul(
    Vec.sub(scaledDimensions, Vec.mul(scaledDimensions, 1 / atScale)),
    0.5
  );

export const getHeldPosition = (
  numPlayers: number,
  seatIndex: number,
  containerDimensions: Vector,
  childDimensions: Vector,
  atScale: number
) => {
  const [xR, yR] = getSeatRatio(numPlayers, seatIndex);
  const seat = getSeatPosition(numPlayers, seatIndex, containerDimensions);
  const adjDirVector = (() => {
    if (xR === 0) return [-1, -0.5];
    if (xR === 1) return [0, -0.5];
    if (yR === 0) return [-0.5, -1];
    return [-0.5, 0];
  })();
  const posVector = Vec.mulV(childDimensions, adjDirVector);
  return Vec.add(seat, posVector, getScaleAdjVector(childDimensions, atScale));
};

export const getCenterPlayedPosition = (
  containerDimensions: Vector,
  cardDimensions: Vector
) => {
  const screenCenter = Vec.mul(containerDimensions, 0.5);
  const cardCenter = Vec.mul(cardDimensions, -0.5);
  return Vec.add(screenCenter, cardCenter);
};

export const getPlayedPosition = (
  numPlayers: number,
  seatIndex: number,
  containerDimensions: Vector,
  cardDimensions: Vector,
  distance = [0, 0] as Vector,
  atScale: number
) => {
  const heldPosition = getHeldPosition(
    numPlayers,
    seatIndex,
    containerDimensions,
    cardDimensions,
    1
  );

  const direction = getSeatDirectionVector(numPlayers, seatIndex);

  const [cardW, cardH] = cardDimensions;
  const [dX, dY] = distance;
  const pushOut = Vec.mulV([dX + cardW, dY + cardH], direction);

  return Vec.add(
    heldPosition,
    pushOut,
    getScaleAdjVector(cardDimensions, atScale)
  );
};

export function getCardScale(
  numPlayers: number,
  containerDimensions: number[],
  cardDimensions: number[]
) {
  return Math.min(
    ...Vec.divV(
      getMaxCardDimensions(numPlayers, containerDimensions),
      cardDimensions
    )
  );
}

export function getMaxCardDimensions(
  numPlayers: number,
  containerDimensions: Vector
) {
  const cardsPerDimension = (() => {
    if (numPlayers === 2) return [1, 2];
    if (numPlayers === 3) return [3, 1];
    return [3, 2];
  })();

  return Vec.divV(containerDimensions, cardsPerDimension);
}

export function getTrickScaling(
  numPlayers: number,
  containerDimensions: number[],
  $card: HTMLElement,
  playDistanceVec: number[],
  maxScale = 1.2,
  cardPaddingVec = [16, 16]
) {
  const containerDimensionsForScaling = Vec.sub(
    containerDimensions,
    Vec.mul(playDistanceVec, 2),
    cardPaddingVec
  );

  let { width, height } = getComputedStyle($card);
  const originalCardDimensions = [parseInt(width, 10), parseInt(height, 10)];

  let scale = getCardScale(
    numPlayers,
    containerDimensionsForScaling,
    originalCardDimensions
  );

  scale = scale > maxScale ? maxScale : scale;

  return {
    scale,
    originalCardDimensions,
    containerDimensions,
    scaledDimensions: Vec.mul(originalCardDimensions, scale),
    playDistance: playDistanceVec,
  };
}
