import { GameProps } from "./types";

import { PositionSeats } from "@lib/components/PositionSeats";
import { Badge } from "@lib/components/Badge";
import { getSeatCSSDirection } from "@lib/layouts/seats";
import { Twemoji } from "@lib/components/Twemoji";
import { rotateArray } from "@lib/array";

export const Seats = ({ frame, room, controls }: GameProps) => {
  const {
    state: [type, game],
    player,
    ctx,
  } = frame;
  const { bids, actuals } = game;

  const biddingActive = type === "bid" || type === "bidded";

  if (type === "bidded") controls.meter.waitFor(500);
  if (type == "bidsEnd") controls.meter.waitFor(2000);

  const seats = Array.from({ length: ctx.numPlayers }).map((_, idx) => (
    <div style={{ padding: "26px 12px 26px 12px" }}>
      <Badge
        avatar={room.seats[idx].avatar}
        name={`PL${idx}`}
        info={
          !biddingActive && bids[idx] !== null ? (
            <div class="text-white">{`${actuals[idx]}/${bids[idx]}`}</div>
          ) : null
        }
        say={
          biddingActive && bids[idx] !== null
            ? {
                dir: getSeatCSSDirection(ctx.numPlayers, idx),
                content: (
                  <div>
                    Bid: <div class={`inline`}>{bids[idx]}</div>
                  </div>
                ),
              }
            : undefined
        }
        tl={idx === game.trickLeader ? <Twemoji char={"1️⃣"} size={18} /> : null}
        tr={idx === game.player ? <Twemoji char={"⏳"} size={18} /> : null}
      />
    </div>
  ));
  const rotatedSeats = rotateArray(seats, -player);

  return (
    <section id="seats" class="relative h-full">
      <PositionSeats>{rotatedSeats}</PositionSeats>
    </section>
  );
};
