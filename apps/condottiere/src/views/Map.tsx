import { getPosition } from "@lib/style";

import { Badge } from "@shared/components/Badge";
import { Twemoji } from "@shared/components/Twemoji";

import mapImg from "../assets/map.jpg";
import { GameProps } from "@lib/tabletop";
import CondottiereSpec from "src/game/spec";

const mapCoords = {
  tor: [45, 90],
  mil: [190, 70],
  ven: [480, 155],
  man: [320, 195],
  gen: [75, 255],
  par: [180, 350],
  mod: [305, 275],
  fer: [405, 285],
  luc: [175, 430],
  bol: [350, 335],
  fir: [330, 440],
  sie: [240, 555],
  urb: [470, 510],
  spo: [420, 630],
  anc: [570, 565],
  rom: [390, 785],
  nap: [540, 815],
};

type MapProps = {
  players: GameProps<CondottiereSpec>["room"]["seats"];
  map: CondottiereSpec["game"]["map"];
  isChoosing: boolean;
  choose: GameProps<CondottiereSpec>["actions"]["cart"]["choose"];
  battleLocation: CondottiereSpec["game"]["battleLocation"];
};

export const Map = ({
  players,
  map,
  isChoosing,
  choose,
  battleLocation,
}: MapProps) => (
  <div>
    <div class="relative">
      {(Object.keys(map) as Array<keyof typeof map>).map((city) => {
        const status = map[city];
        const [left, top] = mapCoords[city];

        return (
          <div
            class="absolute"
            style={getPosition({
              left,
              top,
              x: "-50%",
              y: "-50%",
            })}
          >
            {city === battleLocation ? (
              <BattleIcon />
            ) : status === null && isChoosing ? (
              <ChooseIcon city={city} choose={choose} />
            ) : typeof status === "number" ? (
              <Badge
                player={status}
                name={players[status]?.name}
                avatar={players[status]?.avatar}
              />
            ) : null}
          </div>
        );
      })}
    </div>
    <img src={mapImg} />
  </div>
);

function ChooseIcon({
  city,
  choose,
}: {
  city: keyof CondottiereSpec["game"]["map"];
  choose: GameProps<CondottiereSpec>["actions"]["cart"]["choose"];
}) {
  return (
    <div
      class="animate-pulse cursor-pointer"
      onClick={() => {
        choose(city);
      }}
    >
      <Twemoji char={"⬇️"} size={24} />
    </div>
  );
}

function BattleIcon() {
  return (
    <div class="animate-spin">
      <Twemoji char={"⚔️"} size={32} />
    </div>
  );
}

export function MapDialog({
  state,
  room,
  actions,
}: GameProps<CondottiereSpec>) {
  const isTurn = room.player === state.player;
  const isChoosing = isTurn && state.phase === "choose";

  return (
    <Map
      players={room.seats}
      battleLocation={state.battleLocation}
      map={state.map}
      isChoosing={isChoosing}
      choose={actions.cart.choose}
    />
  );
}
