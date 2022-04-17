import type { GameProps } from "../types";

import { Twemoji } from "@shared/components/Twemoji";
import { splitCard } from "@shared/components/Card";
import { suits, values, colors } from "@shared/components/Card/glyphs";

import { DOMEffect, RunDOMEffect } from "@lib/hooks";
import { style } from "@lib/stylus";
import { delay, seq } from "@lib/async/task";

export const MiniCard = ({ glyphs }: { glyphs: (string | number)[] }) => {
  return (
    <div class="inline-block">
      <div class="bg-[#fffff4] rounded flex justify-center items-center p-[3px]">
        {glyphs.map((g) => {
          const Icon =
            suits[g as keyof typeof suits] || values[g as keyof typeof values];
          if (!Icon) return null;
          return (
            <div
              class="w-4 h-4"
              style={{ fill: colors[g as keyof typeof colors] }}
            >
              <Icon />
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  let glyphs = [suit === "w" ? "w" : value, trumpSuit];

  return <MiniCard glyphs={glyphs} />;
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
