import { ComponentChildren } from "preact";

import { Twemoji } from "@shared/components/Twemoji";
import { MiniCard, splitCard } from "@shared/components/Card";

import { getTotalBids } from "~src/game/logic";
import { useGame } from "~src/control";

export const Hud = () => {
  const phase = useGame((x) => x.board.phase);
  if (phase === "roundStart") return null;
  return (
    <section id="hud" class="absolute top-0 right-0 ">
      <AnimateIn>
        <div class="flex flex-col gap-2 items-end p-2 bg-black bg-opacity-20 rounded-bl-md animate-fadeIn text-right">
          <RoundDisplay />
          <TrumpDisplay />
          <BidDisplay />
        </div>
      </AnimateIn>
    </section>
  );
};

function RoundDisplay() {
  const round = useGame((x) => x.board.round);
  return (
    <AnimateIn>
      <div>Round: {round}</div>
    </AnimateIn>
  );
}

function TrumpDisplay() {
  const [phase, trumpCard, trumpSuit] = useGame((s) => [
    s.board.phase,
    s.board.trumpCard,
    s.board.trumpSuit,
  ]);

  const showTrumpDisplay =
    trumpCard && phase !== "deal" && phase !== "trumpReveal";

  if (!showTrumpDisplay) return null;

  const vdom = (() => {
    if (phase === "select") return <Twemoji char="⌛" size={16} />;

    if (!trumpSuit) return <Twemoji char="❌" size={16} align={"middle"} />;

    let card = trumpCard || `${0}|${trumpSuit}`;
    const { suit } = splitCard(card);
    const showValue = !!trumpCard && !["w", "j"].includes(suit);

    if (!showValue) card = `${0}|${trumpSuit}`;

    return (
      <div class="inline align-middle">
        <MiniCard card={card} showValue={showValue} />
      </div>
    );
  })();

  return (
    <AnimateIn>
      <div class="inline align-middle">
        Trump: <div class="inline">{vdom}</div>
      </div>
    </AnimateIn>
  );
}

function BidDisplay() {
  const [bids, round] = useGame((x) => [x.board.bids, x.board.round]);

  const showBidDisplay = !bids.includes(null);
  if (!showBidDisplay) return null;

  const total = getTotalBids(bids);
  const diff = round - total;
  const sign = diff > 0 ? "-" : "+";
  const str = diff !== 0 ? `${sign + Math.abs(diff)}` : "=";

  return (
    <AnimateIn>
      <div class="flex flex-row items-center gap-1">
        <span>Bids:</span> <span>{str}</span>
      </div>
    </AnimateIn>
  );
}

function AnimateIn({ children }: { children: ComponentChildren }) {
  return <div class="animate-fadeIn">{children}</div>;
}
