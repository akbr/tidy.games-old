import { PositionSeats } from "@shared/components/PositionSeats";
import { GameProps } from "./types";
import { PlayerMat } from "./PlayerMat";

export function Seats({ frame, room }: GameProps) {
  const [, game] = frame.state;
  return (
    <PositionSeats>
      {room.seats.map((seat, idx) => (
        <div class="m-1">
          <PlayerMat
            player={idx}
            avatar={seat ? seat.avatar : undefined}
            line={game.lines[idx]}
          />
        </div>
      ))}
    </PositionSeats>
  );
}

export default Seats;
