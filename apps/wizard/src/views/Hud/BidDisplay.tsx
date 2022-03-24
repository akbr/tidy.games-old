import { GameProps } from "../types";
import { getTotalBids } from "../../game/logic";
import { Twemoji } from "@lib/components/Twemoji";
import { tw } from "twind";
import { fadeIn } from "@shared/twindCss";

export const BidDisplay = ({
  frame: {
    state: [type, game],
  },
}: {
  frame: GameProps["frame"];
}) => {
  const numBids = game.bids.filter((x) => x !== null).length;
  if (numBids === 0 && type !== "bid") return null;

  const total = getTotalBids(game.bids);
  const diff = game.round - total;
  const sign = diff > 0 ? "-" : "+";
  const str = diff !== 0 ? `${sign + Math.abs(diff)}` : "=";

  return (
    <div class={`${tw(fadeIn)}`}>
      Bids:{" "}
      {type === "bid" || type === "bidded" ? (
        <div class="inline align-middle">
          <Twemoji char="⌛" size={16} />
        </div>
      ) : (
        <span>{str}</span>
      )}
    </div>
  );
};
