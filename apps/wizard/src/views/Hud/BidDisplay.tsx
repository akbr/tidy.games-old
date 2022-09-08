import { getTotalBids } from "../../game/logic";

export const BidDisplay = ({
  round,
  bids,
}: {
  round: number;
  bids: (null | number)[];
}) => {
  const total = getTotalBids(bids);
  const diff = round - total;
  const sign = diff > 0 ? "-" : "+";
  const str = diff !== 0 ? `${sign + Math.abs(diff)}` : "=";

  return (
    <div class="flex flex-row items-center gap-1">
      <span>Bids:</span> <span>{str}</span>
    </div>
  );
};
