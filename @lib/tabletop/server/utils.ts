import { randomBetween } from "@lib/random";

export const getRandomRoomID = (length = 4) =>
  String.fromCharCode(
    ...Array.from({ length }).map(() => randomBetween(65, 90))
  );

export function getSeatNumber(seats: any[], requestedSeat?: number) {
  const numSeats = seats.length;

  // If no seat requested, give first open seat.
  if (requestedSeat === undefined) {
    let firstOpenSeat = seats.indexOf(false);
    if (firstOpenSeat !== -1) return firstOpenSeat;
    // TO DO: Set a max player limit somehow
    const nextSeatIndex = numSeats;
    return nextSeatIndex;
  }

  if (requestedSeat > numSeats) {
    return `Can't skip seats. Next seat is ${numSeats}`;
  }

  if (seats[requestedSeat]) {
    return `Seat ${requestedSeat} is occupied`;
  }

  return requestedSeat;
}
