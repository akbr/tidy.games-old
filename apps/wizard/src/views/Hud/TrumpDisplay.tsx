import { Twemoji } from "@lib/components/Twemoji";
import { MiniCard } from "@lib/components/cards/MiniCard";
import { splitCard } from "@lib/components/cards";
import { GameProps } from "../types";
import { DOMEffect, RunDOMEffect } from "@lib/hooks";
import { style } from "@lib/stylus";
import { delay, seq } from "@lib/async";

const delayedFade: DOMEffect<"in" | null> = ($el, prop) => {
  if (prop !== "in") return;

  style($el, { display: "none", opacity: 0 });
  return seq([
    () => delay(500),
    () => {
      style($el, { display: "" });
      return style($el, { opacity: 1 }, { duration: 300 });
    },
  ]);
};

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
    <RunDOMEffect fn={delayedFade} props={type === "trumpReveal" ? "in" : null}>
      <div>
        Trump:{" "}
        <div class="inline align-middle">
          {trumpKnown ? (
            <TrumpCard trumpCard={trumpCard!} trumpSuit={trumpSuit} />
          ) : (
            <Twemoji char="⌛" size={16} />
          )}
        </div>
      </div>
    </RunDOMEffect>
  ) : null;
};
