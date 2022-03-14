import { Twemoji } from "@lib/components/Twemoji";
import { MiniCard } from "@lib/components/cards/MiniCard";
import { splitCard } from "@lib/components/cards";
import { GameProps } from "../types";

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

export const TrumpDisplay = ({ frame }: { frame: GameProps["frame"] }) => {
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
