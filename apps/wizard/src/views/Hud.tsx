import { GameProps } from "./types";
import { totalBids } from "../game/logic";
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

const TrumpDisplay = ({ frame }: { frame: GameProps["frame"] }) => {
  const {
    state: [type, { trumpCard, trumpSuit }],
  } = frame;

  const shouldDisplay = trumpCard && type !== "deal";
  const trumpKnown = trumpSuit !== "w";

  return shouldDisplay ? (
    <div class="align-middle">
      Trump:{" "}
      <div class="inline align-middle">
        {trumpKnown ? (
          <TrumpCard trumpCard={trumpCard!} trumpSuit={trumpSuit} />
        ) : (
          <Twemoji char="⌛" size={16} />
        )}
      </div>
    </div>
  ) : null;
};

const BidDisplay = ({
  frame: {
    state: [type, game],
  },
}: {
  frame: GameProps["frame"];
}) => {
  const numBids = game.bids.filter((x) => x !== null).length;
  if (numBids === 0 && type !== "bid") return null;

  const total = totalBids(game.bids);
  const diff = game.round - total;
  const sign = diff > 0 ? "-" : "+";
  const str = diff !== 0 ? `${sign + Math.abs(diff)}` : "=";

  return (
    <div>
      Bids:{" "}
      {type === "bid" || type === "bidded" ? (
        <div class="inline align-middle">
          <Twemoji char="⌛" size={16} />
        </div>
      ) : (
        <span>{str}</span>
      )}
    </div>
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
        <TrumpDisplay frame={frame} />
        <BidDisplay frame={frame} />
      </div>
    </div>
  );
};
