import type { WizardPropsPlus } from "./AppOuter";

import { rotateArray, rotateIndex } from "@lib/array";
import { Title } from "./Title";
import { Lobby } from "./Lobby";
import {
  CardsHand,
  CardsPlay,
  DragSurface,
} from "@lib/card-views/preactInterfaces";
import { TableWrapper } from "./TableWrapper";
import { TableCenter } from "./TableCenter";
import { Players } from "./Players";
import { UiButtons } from "./UiButtons";
import { PlayInfo } from "./PlayInfo";
export function AppInner(props: WizardPropsPlus) {
  const { frame, actions } = props;
  const { state, room, err } = frame;

  if (room === null) {
    return <Title join={actions.join} />;
  }

  const activePlayer = state ? state.activePlayer : null;
  const players = room.seats.map(({ avatar, name }, idx) => ({
    avatar,
    name,
    active: idx === activePlayer,
  }));

  if (state === null) {
    return (
      <Lobby
        players={players}
        isAdmin={room.seatIndex === 0}
        roomId={room.id}
        playerIndex={room.seatIndex}
        start={actions.start}
        exit={actions.exit}
        addBot={actions.addBot}
      />
    );
  }

  // Game modes
  const { waitFor } = actions;
  if (state.type === "deal") waitFor(2000);
  if (state.type === "bidEnd") waitFor(2000);
  if (state.type === "bid") waitFor(500);
  if (state.type === "turnEnd") waitFor(2000);
  if (state.type === "showScores") waitFor(3500);

  const { isInHand, play, isValidPlay, getTableDimensions } = actions;
  const { seatIndex } = room;
  const {
    type,
    numPlayers,
    turn,
    bids,
    actuals,
    trick,
    trickLeader,
    trumpCard,
    trumpSuit,
    hands,
  } = state;

  const winningIndex =
    state.type === "trickEnd"
      ? rotateIndex(state.numPlayers, state.trickWinner, -state.trickLeader)
      : undefined;
  const hand = hands[seatIndex];

  return (
    <>
      <UiButtons {...props} />
      <DragSurface {...{ isInHand, isValidPlay, play }}>
        <TableWrapper {...{ getTableDimensions }}>
          <Players
            {...{
              type,
              players: rotateArray(players, -seatIndex),
              bids: rotateArray(bids, -seatIndex),
              actuals: rotateArray(actuals, -seatIndex),
              trickLeader: rotateIndex(numPlayers, trickLeader, -seatIndex),
            }}
          />
          <TableCenter {...props} />
        </TableWrapper>
        <PlayInfo {...{ bids, turn, trumpCard, trumpSuit }} />
        <CardsPlay
          {...{
            getTableDimensions,
            trick,
            numPlayers,
            playerPerspective: seatIndex,
            startPlayer: trickLeader,
            winningIndex,
          }}
        />
        {hand.length > 0 && <CardsHand hand={hand} />}
      </DragSurface>
    </>
  );
}
