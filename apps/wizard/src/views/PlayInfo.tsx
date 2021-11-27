import { getBidsDiff, getBidsStatus } from "../derivations";
import { Appear } from "@lib/components/common";
import { MiniCard } from "@lib/card-views/MiniCard";
import { getTuple } from "../engine/logic";

const getDisplayCard = (trumpCard: string | null, trumpSuit: string | null) => {
  if (trumpCard === null) return null;
  let [value, suit] = getTuple(trumpCard);
  return suit === "w" ? (
    <MiniCard suit={suit} value={trumpSuit !== null ? trumpSuit : undefined} />
  ) : suit === "j" ? (
    <MiniCard suit={suit} />
  ) : (
    <MiniCard suit={suit} value={value} />
  );
};

type PlayInfoProps = {
  turn: number;
  trumpCard: string | null;
  trumpSuit: string | null;
  bids: (number | null)[];
};

export const PlayInfo = ({
  turn,
  bids,
  trumpCard,
  trumpSuit,
}: PlayInfoProps) => {
  const bidsComplete = getBidsStatus(bids);
  const bidsDiff = getBidsDiff(bids, turn);
  const displayCard = getDisplayCard(trumpCard, trumpSuit);

  return (
    <div class="flex flex-col gap-0 text-right p-2 bg-black bg-opacity-30 rounded-bl-md">
      <div>
        Round: <span class="font-semibold">{turn}</span>
      </div>
      {displayCard && (
        <Appear>
          <div>Trump:</div>
          <div class="pb-2">{displayCard}</div>
        </Appear>
      )}
      {bidsComplete && (
        <Appear>
          {
            <div>
              Bids:{" "}
              <span class="font-semibold">
                {bidsDiff === 0
                  ? "Even"
                  : bidsDiff > 0
                  ? `+${bidsDiff}`
                  : `-${Math.abs(bidsDiff)}`}
              </span>
            </div>
          }
        </Appear>
      )}
    </div>
  );
};
