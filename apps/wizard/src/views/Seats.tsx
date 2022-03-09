import { GameProps } from "./types";

import { PositionSeats } from "@lib/components/PositionSeats";
import { Badge } from "@lib/components/Badge";
import { Twemoji } from "@lib/components/Twemoji";
import { rotateArray } from "@lib/array";

export const Seats = ({ frame }: GameProps) => {
  const {
    state: [type, game],
    player,
    ctx,
  } = frame;
  const { round, bids, actuals } = game;
  const seats = Array.from({ length: ctx.numPlayers }).map((_, idx) => (
    <div style={{ padding: "26px 12px 26px 12px" }}>
      <Badge
        avatar="🐯"
        name={`PL${idx}`}
        info={
          type === "bid" || type === "bidsEnd" ? (
            bids[idx] !== null ? (
              <div class="text-white">{`Bid: ${bids[idx]}`}</div>
            ) : null
          ) : bids[idx] !== null ? (
            <div class="text-white">{`${actuals[idx]}/${bids[idx]}`}</div>
          ) : null
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
