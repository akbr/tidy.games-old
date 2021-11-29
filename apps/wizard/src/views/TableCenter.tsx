import { styled } from "goober";
import { WizardProps } from "./types";

import { DeadCenterWrapper } from "@lib/components/common";
import { Appear } from "@lib/components/common";
import { BidInput } from "./BidInput";
import { TrumpInput } from "./TrumpInput";

export function TableCenter({ state, room, actions }: WizardProps) {
  if (!state || !room) return null;

  const active = room.seatIndex === state.activePlayer;

  return (
    <>
      {state.type === "deal" ? (
        <Appear>
          <h2>Round {state.turn}</h2>
        </Appear>
      ) : state.type === "bid" ? (
        <Appear>
          <BidInput
            {...{
              active,
              numPlayers: state.numPlayers,
              bids: state.bids,
              turn: state.turn,
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
