import { useRefreshOnResize } from "@lib/premix";
import { rotateArray, rotateIndex } from "@lib/array";

import type { WizardPropsPlus } from "./AppOuter";

import { Title } from "./Title";
import { Lobby } from "./Lobby";
import { TableCenter } from "./TableCenter";
import { Players } from "./Players";
import { UiButtons } from "./UiButtons";
import { PlayInfo } from "./PlayInfo";
import { _HandBridge, _TrickBridge, _DragSurfaceBridge } from "./bridges";

import { getDimensions, xPeek, yPeek } from "../dimensions";

export function AppInner(props: WizardPropsPlus) {
  useRefreshOnResize();

  const { frame, actions } = props;
  const { state, room, err } = frame;

  const hands = state ? state.hands : [];

  const { tableDimensions, appDimensions } = getDimensions(hands.length);
  const [_, tableHeight] = tableDimensions;

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
    <_DragSurfaceBridge {...{ isInHand, isValidPlay, play }}>
      <div id="tableArea" class={"relative"} style={{ height: tableHeight }}>
        <Players
          {...{
            type,
            players: rotateArray(players, -seatIndex),
            bids: rotateArray(bids, -seatIndex),
            actuals: rotateArray(actuals, -seatIndex),
            trickLeader: rotateIndex(numPlayers, trickLeader, -seatIndex),
          }}
        />
        <div
          id="tableCenter"
          className="absolute top-1/2 left-1/2 transform-centering"
        >
          <TableCenter {...props} />
        </div>
      </div>
      <div id="uiButtons" class="absolute top-0">
        <UiButtons {...props} />
      </div>
      <div id="playInfo" class="absolute top-0 right-0">
        <PlayInfo {...{ bids, turn, trumpCard, trumpSuit }} />
      </div>
      <_HandBridge
        containerDimensions={appDimensions}
        xPeek={xPeek}
        yPeek={yPeek}
        anim={null}
        hand={hand}
      />
      <_TrickBridge
        containerDimensions={tableDimensions}
        trick={trick}
        numPlayers={numPlayers}
        startPlayer={trickLeader}
        playerIndex={seatIndex}
      />
    </_DragSurfaceBridge>
  );
}
