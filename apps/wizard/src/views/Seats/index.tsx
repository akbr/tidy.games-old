import { GameProps } from "../types";

import { rotateArray } from "@lib/array";

import { getSeatCSSDirection } from "@lib/layouts/seats";
import { PositionSeats } from "@lib/components/PositionSeats";
import { Badge } from "@lib/components/Badge";
import { Twemoji } from "@lib/components/Twemoji";

import { ScorePop } from "./ScorePop";

export const Seats = ({ frame, room, controls }: GameProps) => {
  const {
    state: [type, game],
    player,
    ctx,
  } = frame;

  const { bids, actuals } = game;

  const biddingActive =
    type === "bid" || type === "bidded" || type == "bidsEnd";

  if (type === "bidded") controls.meter.waitFor(1000);

  const seats = rotateArray(room.seats, -player).map(
    ({ name, avatar }, idx) => (
      <div style={{ padding: "26px 16px 26px 16px" }}>
        <Badge
          avatar={avatar}
          name={`PL${idx}`}
          info={
            type === "roundEnd" ? (
              <ScorePop
                bid={bids[idx]!}
                actual={actuals[idx]!}
                waitFor={controls.meter.waitFor}
              />
            ) : !biddingActive && bids[idx] !== null ? (
              <div class="text-white">{`${actuals[idx]}/${bids[idx]}`}</div>
            ) : null
          }
          say={
            biddingActive && bids[idx] !== null
              ? {
                  dir: getSeatCSSDirection(ctx.numPlayers, idx),
                  content: <div>Bid: {bids[idx]}</div>,
                }
              : undefined
          }
          tl={
            idx === game.trickLeader ? <Twemoji char={"1️⃣"} size={18} /> : null
          }
          tr={idx === game.player ? <Twemoji char={"⏳"} size={18} /> : null}
        />
      </div>
    )
  );

  return (
    <section id="seats" class="relative h-full">
      <PositionSeats>{seats}</PositionSeats>
    </section>
  );
};
