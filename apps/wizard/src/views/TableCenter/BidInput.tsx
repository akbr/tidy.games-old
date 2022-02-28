import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";

const Outer: FunctionComponent = ({ children }) => (
  <div class="flex flex-column align-center gap-[16px]">{children}</div>
);
const Console: FunctionComponent = ({ children }) => (
  <div class="flex flex-column justify-center gap-[12px]">{children}</div>
);
const BidDisplay: FunctionComponent = ({ children }) => (
  <div class="inline vertical-center">{children}</div>
);

type BidInputProps = {
  canadian?: boolean;
  active: boolean;
  bids: (number | null)[];
  turn: number;
  numPlayers: number;
  submit: (bid: number) => void;
};
/**
  const bidIsvalid = isValidBid(bid, {
    canadian,
    turn,
    bids,
  });
 */

export function BidInput({
  canadian = false,
  active,
  bids,
  turn,
  submit,
}: BidInputProps) {
  const [bid, setBid] = useState(0);

  return (
    <Outer>
      <h3>Enter bid:</h3>
      <Console>
        <button
          style={{ minWidth: "36px", minHeight: "36px" }}
          onClick={() => setBid(bid + 1)}
          disabled={bid === turn}
        >
          +
        </button>
        <BidDisplay>{bid}</BidDisplay>
        <button
          style={{ minWidth: "36px", minHeight: "36px" }}
          onClick={() => setBid(bid - 1)}
          disabled={bid === 0}
        >
          -
        </button>
      </Console>
      <button style={{ minWidth: "100px" }} onClick={() => submit(bid)}>
        Bid
      </button>
    </Outer>
  );
}
