import { Vector, add, multiply, invert } from "../vector";
import {
  SeatProps,
  Dimensions,
  getSeatPosition,
  getSeatDirection
} from "./layout";

const getCenterCardOffset = (card: Dimensions): Vector => ({
  x: -card.w / 2,
  y: -card.h / 2
});

export const getHeldPosition = (
  seatProps: SeatProps,
  surface: Dimensions,
  card: Dimensions
) => {
  let buffer = 1.3;
  let seat = getSeatPosition(seatProps, surface);
  let direction = getSeatDirection(seatProps);
  let heldOffset = multiply(
    invert(direction),
    { x: card.w, y: card.h },
    { x: buffer, y: buffer }
  );
  let cardCenter = getCenterCardOffset(card);

  return add(seat, heldOffset, cardCenter);
};

export const getPlayedPosition = (
  seatProps: SeatProps,
  surface: Dimensions,
  card: Dimensions
) => {
  let minYRatio = 0.33;

  let seat = getSeatPosition(seatProps, surface);
  let direction = getSeatDirection(seatProps);
  let playOffset = multiply(direction, {
    x: surface.w / 2,
    y: surface.h * minYRatio
  });
  let padding = multiply(invert(direction), { x: card.w + 12, y: card.h / 2 });
  let cardCenter = getCenterCardOffset(card);

  return add(seat, playOffset, padding, cardCenter);
};
