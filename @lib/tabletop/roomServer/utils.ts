import { randomBetween } from "@lib/random";

export const getRandomRoomID = (length = 4) =>
  String.fromCharCode(
    ...Array.from({ length }).map(() => randomBetween(65, 90))
  );

export function getSeatNumber(
  seats: any[],
  players: [number, number],
  requestedSeat?: number
) {
  const numSeats = seats.length;
  const numOccupied = seats.filter((x) => x).length;

  if (numOccupied === players[1]) return "Room is full.";

  // If no seat requested, give first open seat.
  if (requestedSeat === undefined) {
    let firstOpenSeat = seats.indexOf(null);
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
