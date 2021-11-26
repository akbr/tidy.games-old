import { styled } from "goober";
import { rotateArray, rotateIndex } from "@lib/array";

import type { WizardPropsPlus } from "./AppOuter";

import { Title } from "./Title";
import { Lobby } from "./Lobby";
import { TableCenter } from "./TableCenter";
import { Players } from "./Players";
import { UiButtons } from "./UiButtons";
import { PlayInfo } from "./PlayInfo";
import { _HandBridge, _TrickBridge, _DragSurfaceBridge } from "./bridges";
import { useOnResize, useRefreshOnResize } from "@lib/premix";
import { getDimensions } from "../dimensions";

const GameContainer = styled("div")`
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
`;

const TableArea = styled("div")`
  position: relative;
`;

const HandArea = styled("div")`
  position: relative;
  flex: 0 1 auto;
  margin-top: 10px;
  min-height: 50px;
`;

const Fill = styled("div")`
  position: absolute;
  height: 100%;
  width: 100%;
`;

export function AppInner(props: WizardPropsPlus) {
  useRefreshOnResize();

  const { frame, actions } = props;
  const { state, room, err } = frame;

  const hands = state ? state.hands : [];

  const { tableDimensions } = getDimensions(hands.length);

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

  const { isInHand, play, isValidPlay } = actions;
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
  } = state;

  const winningIndex =
    state.type === "trickEnd"
      ? rotateIndex(state.numPlayers, state.trickWinner, -state.trickLeader)
      : undefined;
  const hand = hands[seatIndex];

  return (
    <>
      <TableArea style={{ height: tableDimensions[1] }}>
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
      </TableArea>

      <UiButtons {...props} />
      <PlayInfo {...{ bids, turn, trumpCard, trumpSuit }} />
    </>
  );
}

/**
      <_DragSurfaceBridge {...{ isInHand, isValidPlay, play }}>
        <GameContainer>
          <_HandBridge anim={null} hand={hand}>
            <HandArea />
          </_HandBridge>
          <TableArea>
            <_TrickBridge
              {...{
                trick,
                numPlayers,
                playerIndex: seatIndex,
                startPlayer: trickLeader,
                winningIndex,
              }}
            >
              <Fill />
            </_TrickBridge>
            <Fill>
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
            </Fill>
          </TableArea>
        </GameContainer>
      </_DragSurfaceBridge>
 */
