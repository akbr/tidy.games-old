import { useState } from "preact/hooks";
import { styled } from "goober";
import { Button, Throb } from "@lib/components/common";
import { isValidBid } from "../engine/logic";

const Outer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Console = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const BidDisplay = styled("div")`
  display: inline-block;
  vertical-align: center;
  font-size: 2em;
`;

type BidInputProps = {
  canadian?: boolean;
  active: boolean;
  bids: (number | null)[];
  turn: number;
  numPlayers: number;
  submit: (bid: number) => void;
};

export function BidInput({
  canadian = false,
  active,
  bids,
  turn,
  submit,
}: BidInputProps) {
  const [bid, setBid] = useState(0);

  if (!active) {
    return (
      <Throb>
        <h3>Waiting for bids...</h3>
      </Throb>
    );
  }

  const bidIsvalid = isValidBid(bid, {
    canadian,
    turn,
    bids,
  });

  return (
    <Outer>
      <h3>Enter bid:</h3>
      <Console>
        <Button
          style={{ minWidth: "36px", minHeight: "36px" }}
          onClick={() => setBid(bid + 1)}
          disabled={bid === turn}
        >
          +
        </Button>
        <BidDisplay style={{ color: bidIsvalid ? "" : "red" }}>
          {bid}
        </BidDisplay>
        <Button
          style={{ minWidth: "36px", minHeight: "36px" }}
          onClick={() => setBid(bid - 1)}
          disabled={bid === 0}
        >
          -
        </Button>
      </Console>
      <Button
        style={{ minWidth: "100px" }}
        onClick={() => submit(bid)}
        disabled={!isValidBid}
      >
        Bid
      </Button>
    </Outer>
  );
}
