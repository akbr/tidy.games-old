import { getTotalBids } from "../../game/logic";
import { Twemoji } from "@shared/components/Twemoji";

export const BidDisplay = ({
  round,
  bids,
  waiting,
}: {
  round: number;
  bids: (null | number)[];
  waiting: boolean;
}) => {
  const total = getTotalBids(bids);
  const diff = round - total;
  const sign = diff > 0 ? "-" : "+";
  const str = diff !== 0 ? `${sign + Math.abs(diff)}` : "=";

  return (
    <div class="flex flex-row items-center gap-1">
      Bids:
      {waiting ? (
        <div>
          <Twemoji char="⌛" size={24} />
        </div>
      ) : (
        <span>{str}</span>
      )}
    </div>
  );
};
