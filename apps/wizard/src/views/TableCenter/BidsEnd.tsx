import { GameProps } from "../types";
import { totalBids } from "../../game/logic";

export function BidsEnd({ frame }: { frame: GameProps["frame"] }) {
  const {
    state: [, { bids, round }],
  } = frame;

  const total = totalBids(bids);
  const diff = round - total;

  return (
    <h3>
      {diff > 0
        ? `Underbid by ${diff}`
        : diff < 0
        ? `Overbid by ${diff}`
        : "Even bids!"}
    </h3>
  );
}
