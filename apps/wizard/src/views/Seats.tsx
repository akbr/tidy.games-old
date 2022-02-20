import { ViewProps } from "./types";

import { PositionSeats } from "@lib/components/PositionSeats";
import { Badge } from "@lib/components/Badge";
import { Twemoji } from "@lib/components/Twemoji";
import { rotateArray } from "@lib/array";

export const Seats = ({ frame, room }: ViewProps) => {
  const { player } = room;
  const { ctx, gameState } = frame;
  const [type, game] = gameState;
  const { round, bids } = game;

  const seats = Array.from({ length: ctx.numPlayers }).map((_, idx) => (
    <div style={{ padding: "24px 12px 24px 12px" }}>
      <Badge
        avatar="🐯"
        name={`PL${idx}`}
        info={
          bids[idx] ? (
            <div class="text-white">{`${bids[idx]}/${round}`}</div>
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

/**
type PlayerProps = {
  avatar: string;
  name: string;
  type: WizardShape["states"]["type"];
  bid: number | null;
  actual: number;
  leader: boolean;
  active: boolean;
  dir: "top" | "bottom" | "left" | "right";
};

export const PlayerDisplay = ({
  avatar,
  name,
  type,
  bid,
  actual,
  leader,
  active,
  dir,
}: PlayerProps) => {
  const info =
    type === "play" || type === "trickEnd" || type === "turnEnd" ? (
      <BidInfo>{`${actual} / ${bid}`}</BidInfo>
    ) : type === "showScores" ? (
      <ScorePop score={getScore(bid!, actual)} />
    ) : null;

  const say =
    (type === "bid" || type === "bidEnd") && bid !== null
      ? { dir, content: `Bid: ${bid}` }
      : null;

  return (
    <div style={{ padding: "20px 10px 24px 10px" }}>
      <Badge
        avatar={avatar}
        name={name}
        info={info}
        tl={leader ? <Twemoji char={"1️⃣"} size={18} /> : null}
        tr={active ? <Twemoji char={"⏳"} size={18} /> : null}
        say={say}
      />
    </div>
  );
};
 */
