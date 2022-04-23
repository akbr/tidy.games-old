import { PositionSeats } from "@shared/components/PositionSeats";
import { GameProps } from "./types";
import { PlayerMat } from "./PlayerMat";
import { is } from "@lib/compare/is";

export function Seats({ frame, room }: GameProps) {
  const [, game] = frame.state;

  const isWinter = is.defined(game.lines.flat().find((x) => x === "w"));

  return (
    <PositionSeats>
      {room.seats.map((seat, idx) => (
        <div class="m-1">
          <PlayerMat player={idx} line={game.lines[idx]} isWinter={isWinter} />
        </div>
      ))}
    </PositionSeats>
  );
}

export default Seats;
