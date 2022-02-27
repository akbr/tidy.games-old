import { GameProps } from "./types";
//import { MiniCard } from "@lib/components/cards/MiniCard";

export const Hud = ({ frame }: GameProps) => {
  const {
    state: [, game],
  } = frame;

  return (
    <div class="absolute top-0 right-0 m-3 text-right">
      <div>Round: {game.round}</div>
      {game.trumpCard && <div>Trump: {game.trumpCard}</div>}
    </div>
  );
};

/**
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
    <div class="flex flex-col gap-1 text-right p-2 bg-black bg-opacity-20 rounded-bl-md">
      <div>
        Round: <span>{turn}</span>
      </div>
      {displayCard && (
        <Appear>
          <div>Trump:</div>
          <div>{displayCard}</div>
        </Appear>
      )}
      {bidsComplete && (
        <Appear>
          {
            <div class="pt-1">
              Bids:{" "}
              <span>
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

 */
