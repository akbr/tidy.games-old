import { GameProps } from "@lib/tabletop/preact/types";
import { WizardSpec } from "src/game/spec";

import { TrumpDisplay } from "./TrumpDisplay";
import { BidDisplay } from "./BidDisplay";

export const Hud = ({ state }: GameProps<WizardSpec>) => {
  const { phase, round, bids, trumpCard, trumpSuit } = state;
  const waiting = bids.includes(null);

  const showTrumpDisplay = trumpCard && phase !== "deal";
  const showBidDisplay = ["bid", "bidded", "play", "played"].includes(phase);

  return (
    <div class="absolute top-0 right-0 p-2 text-right bg-black bg-opacity-20 rounded-bl-md">
      <div class="flex flex-col gap-1.5 items-end">
        <div>Round: {round}</div>
        {showTrumpDisplay && (
          <div class="animate-fadeIn">
            <TrumpDisplay
              phase={phase}
              trumpCard={trumpCard}
              trumpSuit={trumpSuit}
            />
          </div>
        )}
        {showBidDisplay && (
          <div class="animate-fadeIn">
            <BidDisplay round={round} bids={bids} waiting={waiting} />
          </div>
        )}
      </div>
    </div>
  );
};
