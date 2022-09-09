import { WizardSpec } from "src/game/spec";

import { Twemoji } from "@shared/components/Twemoji";
import { splitCard } from "@shared/components/Card";
import { suits, values, colors } from "@shared/components/Card/glyphs";

import { style } from "@lib/style";
import { delay, seq } from "@lib/async/task";
import { createRef } from "preact";
import { useLayoutEffect } from "preact/hooks";

type Glyph = (string | number)[];
export const MiniCard = ({ glyphs }: { glyphs: Glyph[] }) => {
  return (
    <div class="inline-block">
      <div class="bg-[#fffff4] rounded flex justify-center items-center p-[3px]">
        {glyphs.map(([icon, color]) => {
          const Icon =
            suits[icon as keyof typeof suits] ||
            values[icon as keyof typeof values];
          if (!Icon) return null;
          return (
            <div
              class="w-4 h-4"
              style={{ fill: color || colors[icon as keyof typeof colors] }}
            >
              <Icon />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const delayedFade = ($el: HTMLElement, prop: "in" | null) => {
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
  if (!trumpSuit) return <Twemoji char="❌" size={16} align={"middle"} />;

  const [value, suit] = splitCard(trumpCard);

  const glyphs = (() => {
    if (suit === "w" && trumpSuit !== "w") return [["w"], [trumpSuit]];
    if (suit === "w" && trumpSuit === "w") return [["w"]];
    if (suit === "j") return [["j"]];
    return [[value, colors[trumpSuit as keyof typeof colors]], [trumpSuit]];
  })();

  return (
    <div class="inline align-middle">
      <MiniCard glyphs={glyphs} />
    </div>
  );
};

export const TrumpDisplay = ({
  phase,
  trumpSuit,
  trumpCard,
}: {
  phase: WizardSpec["phases"];
  trumpSuit: WizardSpec["game"]["trumpSuit"];
  trumpCard: WizardSpec["game"]["trumpCard"];
}) => {
  return (
    <div class="align-middle">
      Trump:{" "}
      <div class="inline">
        {phase !== "select" ? (
          <TrumpCard trumpCard={trumpCard!} trumpSuit={trumpSuit} />
        ) : (
          <Twemoji char="⌛" size={16} />
        )}
      </div>
    </div>
  );
};
