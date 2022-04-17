import { GameProps } from "../types";

import { rotateArray, rotateIndex } from "@lib/array";
import { WaitFor } from "@lib/state/meter";

import { Badge, BadgeProps } from "@shared/components/Badge";
import { SpeechBubble, getBubblePos } from "@shared/components/SpeechBubble";
import { PositionSeats } from "@shared/components/PositionSeats";
import { getSeatCSSDirection } from "@shared/components/PositionSeats/seatsLayout";

import { BidDisplay } from "./BidDisplay";
import { Twemoji } from "@shared/components/Twemoji";
import { getPosition } from "@lib/stylus";

type SeatProps = {
  dir: "left" | "right" | "bottom" | "top";
  isLeadPlayer: boolean;
  isWaiting: boolean;
  showBidBubble: boolean;
  showBidDisplay: boolean;
  shouldPop: boolean;
  bid: number | null;
  actual: number | null;
  waitFor: WaitFor;
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
  waitFor,
}: SeatProps) => {
  return (
    <div class="flex flex-col gap-[5px] text-center m-3">
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
            style={getPosition({ left: 0, top: 0, x: "-50%", y: "-50%" })}
          >
            <Twemoji char={"🚩"} size={18} />
          </div>
        )}
        {isWaiting && (
          <div
            title="Waiting on player..."
            class="absolute animate-fadeIn"
            style={getPosition({ left: "100%", top: 0, x: "-50%", y: "-50%" })}
          >
            <div class="animate-bounce">
              <Twemoji char={"⏳"} size={18} />
            </div>
          </div>
        )}
      </div>
      {showBidDisplay ? (
        <div class="-z-10 animate-fadeIn">
          <BidDisplay
            bid={bid!}
            actual={actual!}
            waitFor={waitFor}
            shouldPop={shouldPop}
          />
        </div>
      ) : (
        <div class="invisible">_</div>
      )}
    </div>
  );
};

export const Seats = ({ frame, room, controls }: GameProps) => {
  const { player, ctx } = frame;
  const [type, game] = frame.state;
  const { bids, actuals } = game;

  const biddingActive =
    type === "bid" || type === "bidded" || type == "bidsEnd";

  let seats = room.seats.map((info, playerIdx) => {
    const { name, avatar } = info || {};
    const vIdx = rotateIndex(room.seats.length, playerIdx, -player);
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
        shouldPop={type === "roundEnd"}
        waitFor={controls.meter.waitFor}
        isLeadPlayer={game.trickLeader === playerIdx}
        isWaiting={game.player === playerIdx}
      />
    );
  });

  seats = rotateArray(seats, -player);

  return (
    <section id="seats" class="relative h-full">
      <PositionSeats>{seats}</PositionSeats>
    </section>
  );
};

export default Seats;
