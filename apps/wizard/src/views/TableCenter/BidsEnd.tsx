import { getTotalBids } from "../../game/logic";

export function BidsEnd({
  bids,
  round,
}: {
  bids: (number | null)[];
  round: number;
}) {
  const diff = round - getTotalBids(bids);

  return (
    <h3>
      {diff > 0
        ? `Underbid by ${diff}`
        : diff < 0
        ? `Overbid by ${Math.abs(diff)}`
        : "Even bids"}
    </h3>
  );
}
