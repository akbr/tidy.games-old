import { GameProps } from "@lib/tabletop/preact/types";
import { WizardSpec } from "src/game/spec";

import { TrumpDisplay } from "./TrumpDisplay";
import { BidDisplay } from "./BidDisplay";

export const Hud = ({ frame }: GameProps<WizardSpec>) => {
  const { phase, round, bids, trumpCard, trumpSuit } = frame.state;

  const showTrumpDisplay = trumpCard && phase !== "deal";
  const showBidDisplay = !bids.includes(null);

  return (
    <div class="absolute top-0 right-0 p-2 text-right bg-black bg-opacity-20 rounded-bl-md animate-fadeIn">
      <div class="flex flex-col gap-1.5 items-end">
        <div class="animate-fadeIn">Round: {round}</div>
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
            <BidDisplay round={round} bids={bids} />
          </div>
        )}
      </div>
    </div>
  );
};
