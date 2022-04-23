import { Badge, getGlowStyle } from "@shared/components/Badge";
import PositionSeats from "@shared/components/PositionSeats";
import { Twemoji } from "@shared/components/Twemoji";
import { render, h } from "preact";
import { PlayerMat, PlayerMatProps } from "../views/PlayerMat";

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
  avatar: string;
  name: string;
  isWaiting?: boolean;
  isCondottiere?: boolean;
};

function PlayerInfo({
  player,
  avatar,
  isWaiting,
  isCondottiere,
}: PlayerInfoProps) {
  return (
    <div class="flex justify-between">
      <div class={`${isWaiting ? "" : "invisible"}`}>
        <WaitingMarker />
      </div>
      <div class="flex items-center gap-2">
        <Badge player={player} name={null} avatar={avatar} size={24} />
        <div style={{ filter: getGlowStyle(player) }}>ABR</div>
      </div>
      <div class={`${isCondottiere ? "" : "invisible"}`}>
        <CondottiereMarker />
      </div>
    </div>
  );
}

function Test() {
  return (
    <div class="h-full bg-yellow-800">
      <PositionSeats>
        <div class="m-2">
          <Seat
            player={0}
            avatar={"🦊"}
            name={"ABR"}
            line={[1, 1, 1, 3, 10]}
            isCondottiere={true}
            isWinter={false}
          />
        </div>
        <div class="m-2">
          <Seat
            player={1}
            avatar={"🦊"}
            name={"ABR"}
            line={[1, 1, 1, 3, 10]}
            isWaiting={true}
            isWinter={false}
          />
        </div>
        <div class="m-2">
          <Seat
            player={2}
            avatar={"🦊"}
            name={"ABR"}
            line={[1, 1, 1, 3, 10]}
            isWinter={false}
          />
        </div>
      </PositionSeats>
    </div>
  );
}

render(h(Test, {}, null), document.body);
