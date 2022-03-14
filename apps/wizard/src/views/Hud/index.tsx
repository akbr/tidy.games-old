import { GameProps } from "../types";
import { TrumpDisplay } from "./TrumpDisplay";
import { BidDisplay } from "./BidDisplay";

export const Hud = ({ frame }: GameProps) => {
  const {
    state: [, game],
  } = frame;

  return (
    <div class="absolute top-0 right-0 p-2 text-right bg-black bg-opacity-20 rounded-bl-md">
      <div class="flex flex-col gap-1.5">
        <div>Round: {game.round}</div>
        <TrumpDisplay frame={frame} />
        <BidDisplay frame={frame} />
      </div>
    </div>
  );
};
