import { AppProps } from "./types";

import { Appear } from "@lib/components/common";
import { BidInput } from "./BidInput";
import { TrumpInput } from "./TrumpInput";

export function TableCenter({ state, room, actions }: AppProps) {
  if (!state || !room) return null;

  const { data } = state;

  const active = room.seatIndex === data.activePlayer;

  return (
    <>
      {state.type === "deal" ? (
        <Appear>
          <h2>Round {data.turn}</h2>
        </Appear>
      ) : state.type === "bid" ? (
        <Appear>
          <BidInput
            {...{
              active,
              numPlayers: data.numPlayers,
              bids: data.bids,
              turn: data.turn,
              submit: actions.bid,
            }}
          />
        </Appear>
      ) : state.type === "bidEnd" ? null : state.type === "selectTrump" ? (
        <Appear>
          <TrumpInput
            {...{
              active,
              selectTrump: actions.selectTrump,
            }}
          />
        </Appear>
      ) : state.type === "turnEnd" ? (
        <Appear>
          <h2>Round Over</h2>
        </Appear>
      ) : null}
    </>
  );
}
