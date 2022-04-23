import { is } from "@lib/compare/is";
import { useState } from "preact/hooks";
import { canDiscard } from "../game/logic";
import { Cities, Cards, Mercenaries, cityAdjacencies } from "../game/glossary";
import { Game } from "../game/spec";
import { GameProps } from "./types";

export const CenterDisplay = (props: GameProps) => {
  const { frame, controls } = props;
  const [type, game] = frame.state;
  const { waitFor } = controls.meter;

  const vnode = (() => {
    const isTurn = frame.player === game.player;

    if (type === "choose") {
      if (!isTurn)
        return (
          <div class="text-center animate-pulse">
            Waiting for condottiere
            <br /> to choose battle city...
          </div>
        );

      return <ChooseCity map={game.map} choose={controls.game.choose} />;
    }

    if (type === "retreat") {
      if (!isTurn) return <div>Waiting for scarecrow...</div>;

      return (
        <ChooseRetreat
          line={game.lines[frame.player]}
          retreat={controls.game.retreat}
        />
      );
    }

    if (type === "discard") {
      if (game.discardStatus[frame.player])
        return <div>Waiting for other players...</div>;

      return (
        <ChooseDiscard
          hand={game.hands[frame.player]}
          discard={controls.game.discard}
        />
      );
    }

    return null;
  })();

  return (
    <div class="absolute top-1/2 left-1/2 translate-center text-black">
      {vnode}
    </div>
  );
};

export default CenterDisplay;

function ChooseCity({
  map,
  choose,
}: {
  map: Game["map"];
  choose: (c: Cities) => void;
}) {
  let cityList = Object.keys(map).sort() as Cities[];
  cityList = cityList.filter((city) => map[city] === null);

  const [city, setCity] = useState(cityList[0]);
  /**      <h3>Choose city:</h3>
      <select
        name="cities"
        style={{ maxWidth: "100px" }}
        onChange={(e) => {
          //@ts-ignore
          setCity(e.target.value);
        }}
      >
        {cityList.map((city) => (
          <option value={city}>{city}</option>
        ))}
      </select>
      <button
        onClick={() => {
          choose(city);
        }}
      >
        Choose
      </button>
   */
  return (
    <h3 class="flex flex-col items-center text-center gap-[16px] max-w-[175px] animate-pulse">
      Tap the map to choose a city.
    </h3>
  );
}

function ChooseRetreat({
  line,
  retreat,
}: {
  line: Cards[];
  retreat: (o: Mercenaries | false) => void;
}) {
  const [order, setOrder] = useState<Mercenaries | false>(false);

  const mercenaries = [...new Set(line.filter(is.number))] as Mercenaries[];

  return (
    <div class="flex flex-col items-center text-center gap-[16px] max-w-[175px]">
      <h3>Choose retreat:</h3>
      <select
        name="cities"
        style={{ maxWidth: "100px" }}
        onChange={(e: any) => {
          setOrder(
            e.target.value === "FALSE"
              ? false
              : (parseInt(e.target.value) as Mercenaries)
          );
        }}
      >
        <option value={"FALSE"}>None</option>
        {mercenaries.map((m) => (
          <option value={m}>{m}</option>
        ))}
      </select>
      <button
        onClick={() => {
          retreat(order);
        }}
      >
        Choose
      </button>
    </div>
  );
}

function ChooseDiscard({
  hand,
  discard,
}: {
  hand: Cards[];
  discard: (o: boolean) => void;
}) {
  return (
    <div class="flex flex-col items-center text-center gap-[16px] max-w-[175px]">
      <h3>Discard your hand?</h3>
      <div class="flex gap-2">
        <button
          onClick={() => {
            discard(true);
          }}
          disabled={!canDiscard(hand)}
        >
          Yes
        </button>
        <button
          onClick={() => {
            discard(false);
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}
