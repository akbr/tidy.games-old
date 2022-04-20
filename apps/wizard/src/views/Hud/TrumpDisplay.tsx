import type { GameProps } from "../types";

import { Twemoji } from "@shared/components/Twemoji";
import { splitCard } from "@shared/components/Card";
import { suits, values, colors } from "@shared/components/Card/glyphs";

import { DOMEffect, RunDOMEffect } from "@lib/hooks";
import { style } from "@lib/stylus";
import { delay, seq } from "@lib/async/task";

export const MiniCard = ({
  glyphs,
  color,
}: {
  glyphs: (string | number)[];
  color: string;
}) => {
  return (
    <div class="inline-block">
      <div class="bg-[#fffff4] rounded flex justify-center items-center p-[3px]">
        {glyphs.map((g) => {
          const Icon =
            suits[g as keyof typeof suits] || values[g as keyof typeof values];
          if (!Icon) return null;
          return (
            <div class="w-4 h-4" style={{ fill: color }}>
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
  const glyphs = (() => {
    if (suit === "w") return ["w", value];
    if (suit === "j") return ["j"];
    return [value, trumpSuit];
  })();
  const color = (() => {
    if (suit === "w") return colors["w"];
    if (suit === "j") return colors["j"];
    return colors[trumpSuit as keyof typeof colors];
  })();

  return <MiniCard glyphs={glyphs} color={color} />;
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
