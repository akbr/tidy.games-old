import { useEffect } from "preact/hooks";

import { rotateIndex } from "@lib/array";

import { Badge, BadgeProps } from "@shared/components/Badge";
import { SpeechBubble, getBubblePos } from "@shared/components/SpeechBubble";
import { PositionSeats } from "@shared/components/PositionSeats";
import { Twemoji } from "@shared/components/Twemoji";
import { getSeatCSSDirection } from "@shared/domEffects/positionSeats";

import { BidDisplay } from "./BidDisplay";

import { useGame, createGameSelector, waitFor } from "~src/control";

export function Seats() {
  const [playerIndex, numPlayers] = useGame((x) => [
    x.playerIndex,
    x.ctx.numPlayers,
  ]);

  return (
    <section id="seats" class="relative h-full">
      <PositionSeats perspective={playerIndex}>
        {Array.from({ length: numPlayers }).map((_, idx) => (
          <WizardSeat
            playerIndex={idx}
            viewIdx={rotateIndex(numPlayers, idx, -playerIndex)}
          />
        ))}
      </PositionSeats>
    </section>
  );
}

const seatProps = (playerIndex: number) =>
  createGameSelector((state) => {
    const { board, ctx, socketsStatus } = state;
    const { phase, actuals, trickLeader, player } = board;
    const { name, avatar } = socketsStatus[playerIndex] || {};

    const biddingActive = ["bid", "bidded", "bidsEnd"].includes(board.phase);
    const bid = board.bids[playerIndex];

    return {
      numPlayers: ctx.numPlayers,
      name,
      avatar,
      bid,
      actual: actuals[playerIndex],
      trickLeader: trickLeader,
      isWaiting: player === playerIndex,
      showBidBubble: biddingActive && bid !== null,
      showBidDisplay: !biddingActive && bid !== null,
      shouldPop: phase === "roundEnd",
      bidPause: phase === "bidded",
    };
  });

function WizardSeat({
  playerIndex,
  viewIdx,
}: {
  playerIndex: number;
  viewIdx: number;
}) {
  const p = useGame(seatProps(playerIndex));

  if (p.bidPause) waitFor(500);

  return (
    <Seat
      player={playerIndex}
      name={p.name}
      avatar={p.avatar}
      dir={getSeatCSSDirection(p.numPlayers, viewIdx)}
      bid={p.bid}
      actual={p.actual}
      showBidBubble={p.showBidBubble}
      showBidDisplay={p.showBidDisplay}
      shouldPop={p.shouldPop}
      isLeadPlayer={p.trickLeader === playerIndex}
      isWaiting={p.isWaiting}
    />
  );
}

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
