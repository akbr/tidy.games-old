import { rotateIndex } from "@lib/array";

import { Badge, BadgeProps } from "@shared/components/Badge";
import { SpeechBubble, getBubblePos } from "@shared/components/SpeechBubble";
import { PositionSeats } from "@shared/components/PositionSeats";
import { getSeatCSSDirection } from "@shared/domEffects/positionSeats";
import { Twemoji } from "@shared/components/Twemoji";

import { BidDisplay } from "./BidDisplay";

import { useGame, waitFor } from "@src/control";
import { useEffect } from "preact/hooks";

export const Seats = () => {
  const { board, ctx, playerIndex, socketsStatus } = useGame();
  const { phase, bids, actuals, trickLeader } = board;

  useEffect(() => {
    if (phase === "bidded") waitFor(1000);
  }, [phase]);

  const biddingActive = ["bid", "bidded", "bidsEnd"].includes(phase);

  let seats = Array.from({ length: ctx.numPlayers }).map((_, playerIdx) => {
    const { name, avatar } = socketsStatus[playerIdx] || {};
    const vIdx = rotateIndex(ctx.numPlayers, playerIdx, -playerIndex);
    const bid = bids[playerIdx];

    return (
      <Seat
        player={playerIdx}
        name={name}
        avatar={avatar}
        dir={getSeatCSSDirection(ctx.numPlayers, vIdx)}
        bid={bids[playerIdx]}
        actual={actuals[playerIdx]}
        showBidBubble={biddingActive && bid !== null}
        showBidDisplay={!biddingActive && bid !== null}
        shouldPop={phase === "roundEnd"}
        isLeadPlayer={trickLeader === playerIdx}
        isWaiting={board.player === playerIdx}
      />
    );
  });

  return (
    <section id="seats" class="relative h-full">
      <PositionSeats perspective={playerIndex}>{seats}</PositionSeats>
    </section>
  );
};

type SeatProps = {
  dir: "left" | "right" | "bottom" | "top";
  isLeadPlayer: boolean;
  isWaiting: boolean;
  showBidBubble: boolean;
  showBidDisplay: boolean;
  shouldPop: boolean;
  bid: number | null;
  actual: number | null;
} & BadgeProps;

export const Seat = ({
  player,
  name,
  avatar,
  dir,
  bid,
  actual,
  showBidBubble,
  showBidDisplay,
  shouldPop,
  isLeadPlayer,
  isWaiting,
}: SeatProps) => {
  return (
    <div class="flex flex-col gap-[5px] text-center m-4">
      <div class="relative">
        <Badge player={player} name={name} avatar={avatar} />
        {showBidBubble && (
          <div class="absolute animate-fadeIn" style={getBubblePos(dir)}>
            <SpeechBubble dir={dir}>
              <div class="whitespace-nowrap">Bid: {bid}</div>
            </SpeechBubble>
          </div>
        )}
        {isLeadPlayer && (
          <div
            title="Trick leader"
            class="absolute animate-fadeIn"
            style={{ left: 0, top: 0, transform: "translate(-50%, -50%)" }}
          >
            <Twemoji char={"🚩"} size={24} />
          </div>
        )}
        {isWaiting && (
          <div
            title="Waiting on player..."
            class="absolute animate-fadeIn"
            style={{ left: "100%", top: 0, transform: "translate(-50%, -50%)" }}
          >
            <div class="animate-bounce">
              <Twemoji char={"⏳"} size={24} />
            </div>
          </div>
        )}
      </div>
      {showBidDisplay ? (
        <div class="-z-10 animate-fadeIn">
          <BidDisplay bid={bid!} actual={actual!} shouldPop={shouldPop} />
        </div>
      ) : (
        <div class="invisible">_</div>
      )}
    </div>
  );
};

export default Seats;
