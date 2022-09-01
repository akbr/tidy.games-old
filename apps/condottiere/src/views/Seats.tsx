import { is } from "@lib/compare/is";

import { PositionSeats } from "@shared/components/PositionSeats";
import { Badge, getGlowStyle } from "@shared/components/Badge";
import { Twemoji } from "@shared/components/Twemoji";

import { PlayerMat, PlayerMatProps } from "./PlayerMat";
import { GameProps } from "@lib/tabletop";
import CondottiereSpec from "src/game/spec";

type SeatProps = PlayerMatProps & PlayerInfoProps;

function Seat({
  player,
  avatar,
  name,
  line,
  isWinter,
  isWaiting,
  isCondottiere,
  isActive,
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
        isActive={isActive}
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
  isActive: boolean;
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
    <div title="Waiting for player" class="animate-bounce">
      <Twemoji char={"⏳"} size={24} />
    </div>
  );
}

export function Seats({ state, room }: GameProps<CondottiereSpec>) {
  const isWinter = is.defined(state.lines.flat().find((x) => x === "w"));
  return (
    <PositionSeats perspective={room.player}>
      {room.seats.map((seat, idx) => {
        const isWaiting =
          state.player === -1
            ? !state.discardStatus[idx]
            : idx === state.player;
        return (
          <div class="m-1.5">
            <Seat
              avatar={seat?.avatar}
              name={seat?.name || `PL${idx}`}
              player={idx}
              line={state.lines[idx]}
              isWinter={isWinter}
              isCondottiere={idx === state.condottiere}
              isWaiting={isWaiting}
              isActive={state.playStatus[idx]}
            />
          </div>
        );
      })}
    </PositionSeats>
  );
}

export default Seats;
