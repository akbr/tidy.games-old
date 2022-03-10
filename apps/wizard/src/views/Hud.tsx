import { GameProps } from "./types";
import { Twemoji } from "@lib/components/Twemoji";
import { MiniCard } from "@lib/components/cards/MiniCard";
import { splitCard } from "@lib/components/cards";

const TrumpCard = ({
  trumpCard,
  trumpSuit,
}: {
  trumpCard: string;
  trumpSuit: string | null;
}) => {
  if (!trumpSuit)
    return (
      <div class="inline align-middle">
        <Twemoji char="❌" size={16} />
      </div>
    );

  const [value, suit] = splitCard(trumpCard);
  const isWild = suit === "w" || suit === "j";

  return (
    <MiniCard
      suit={trumpSuit}
      value={isWild ? null : value}
      color={isWild ? "blue" : undefined}
    />
  );
};

export const Hud = ({ frame }: GameProps) => {
  const {
    state: [type, game],
  } = frame;

  return (
    <div class="absolute top-0 right-0 m-2 text-right">
      <div class="flex flex-col gap-1">
        <div>Round: {game.round}</div>
        {game.trumpCard && type !== "deal" && (
          <div class="align-middle">
            Trump:{" "}
            {type === "select" ? (
              <div class="inline align-middle">
                <Twemoji char="⌛" size={16} />
              </div>
            ) : (
              <TrumpCard
                trumpCard={game.trumpCard}
                trumpSuit={game.trumpSuit}
              />
            )}
          </div>
        )}
      </div>
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
