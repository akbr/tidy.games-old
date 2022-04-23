import { GameProps } from "./types";

import { is } from "@lib/compare/is";

import { PositionSeats } from "@shared/components/PositionSeats";
import { Badge, getGlowStyle } from "@shared/components/Badge";
import { Twemoji } from "@shared/components/Twemoji";

import { PlayerMat, PlayerMatProps } from "./PlayerMat";

type SeatProps = PlayerMatProps & PlayerInfoProps;

function Seat({
  player,
  avatar,
  name,
  line,
  isWinter,
  isWaiting,
  isCondottiere,
}: SeatProps) {
  return (
    <div class="relative flex flex-col gap-1.5">
      <PlayerMat player={player} line={line} isWinter={isWinter} />
      <PlayerInfo
        player={player}
        avatar={avatar}
        name={name}
        isWaiting={isWaiting}
        isCondottiere={isCondottiere}
      />
    </div>
  );
}

type PlayerInfoProps = {
  player: number;
  avatar?: string;
  name?: string;
  isWaiting?: boolean;
  isCondottiere?: boolean;
};

function PlayerInfo({
  player,
  avatar,
  isWaiting,
  name,
  isCondottiere,
}: PlayerInfoProps) {
  return (
    <div class="flex justify-between">
      <div class={`${isWaiting ? "" : "invisible"}`}>
        <WaitingMarker />
      </div>
      <div class="flex items-center gap-2">
        <Badge player={player} name={null} avatar={avatar} size={24} />
        <div style={{ filter: getGlowStyle(player) }}>{name}</div>
      </div>
      <div class={`${isCondottiere ? "" : "invisible"}`}>
        <CondottiereMarker />
      </div>
    </div>
  );
}

function CondottiereMarker() {
  return (
    <div title="This player is the Condottiere">
      <Twemoji char={"⚔️"} size={24} />
    </div>
  );
}

function WaitingMarker() {
  return (
    <div title="Waiting for player">
      <Twemoji char={"⏳"} size={24} />
    </div>
  );
}

export function Seats({ frame, room }: GameProps) {
  const [, game] = frame.state;

  const isWinter = is.defined(game.lines.flat().find((x) => x === "w"));
  return (
    <PositionSeats>
      {room.seats.map((seat, idx) => {
        const isWaiting =
          game.player === -1 ? !game.discardStatus[idx] : idx === game.player;
        return (
          <div class="m-1.5">
            <Seat
              avatar={seat?.avatar}
              name={seat?.name || `PL${idx}`}
              player={idx}
              line={game.lines[idx]}
              isWinter={isWinter}
              isCondottiere={idx === game.condottiere}
              isWaiting={isWaiting as boolean}
            />
          </div>
        );
      })}
    </PositionSeats>
  );
}

export default Seats;
