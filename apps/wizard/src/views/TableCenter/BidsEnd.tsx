import { GameProps } from "../types";
import { getTotalBids } from "../../game/logic";

export function BidsEnd({ frame }: { frame: GameProps["frame"] }) {
  const {
    state: [, { bids, round }],
  } = frame;

  const diff = round - getTotalBids(bids);

  return (
    <h3>
      {diff > 0
        ? `Underbid by ${diff}`
        : diff < 0
        ? `Overbid by ${diff}`
        : "Even bids"}
    </h3>
  );
}
