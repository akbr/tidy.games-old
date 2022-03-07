import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";

const Outer: FunctionComponent = ({ children }) => (
  <div class="flex flex-col gap-[16px] text-center">{children}</div>
);
const Console: FunctionComponent = ({ children }) => (
  <div class="flex justify-center items-center gap-[12px]">{children}</div>
);
const BidDisplay: FunctionComponent = ({ children }) => (
  <div class="inline">{children}</div>
);

type BidInputProps = {
  canadian?: boolean;
  bids: (number | null)[];
  turn: number;
  numPlayers: number;
  submit: (bid: number) => void;
};

export function BidInput({ turn, submit }: BidInputProps) {
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
