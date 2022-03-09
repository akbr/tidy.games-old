import { GameProps } from "./types";

import { PositionSeats } from "@lib/components/PositionSeats";
import { Badge } from "@lib/components/Badge";
import { getSeatCSSDirection } from "@lib/layouts/seats";
import { Twemoji } from "@lib/components/Twemoji";
import { rotateArray } from "@lib/array";

export const Seats = ({ frame, controls }: GameProps) => {
  const {
    state: [type, game],
    player,
    ctx,
    action,
  } = frame;
  const { round, bids, actuals } = game;

  const bidsVisible = type === "bid" || type === "bidsEnd";
  if (bidsVisible && action) controls.meter.waitFor(500);
  if (type == "bidsEnd" && !action) controls.meter.waitFor(2000);

  const seats = Array.from({ length: ctx.numPlayers }).map((_, idx) => (
    <div style={{ padding: "26px 12px 26px 12px" }}>
      <Badge
        avatar="🐯"
        name={`PL${idx}`}
        info={
          !bidsVisible && bids[idx] !== null ? (
            <div class="text-white">{`${actuals[idx]}/${bids[idx]}`}</div>
          ) : null
        }
        say={
          bidsVisible && bids[idx] !== null
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
