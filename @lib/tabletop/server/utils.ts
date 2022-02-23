export function randomBetween(n1: number, n2: number) {
  let max = n1 > n2 ? n1 : n2;
  let min = n1 === max ? n2 : n1;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

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
