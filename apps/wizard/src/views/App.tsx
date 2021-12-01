import type { AppProps } from "../types";

import { useRefreshOnResize } from "@lib/premix";
import { rotateArray, rotateIndex } from "@lib/array";
import { getDimensions, xPeek, yPeek } from "../dimensions";

import { Title } from "./Title";
import { Lobby } from "./Lobby";

import { TableCenter } from "./TableCenter";
import { Players } from "./Players";
import { UiButtons } from "./UiButtons";
import { PlayInfo } from "./PlayInfo";
import { _HandBridge, _TrickBridge } from "./bridges";

export function App(props: AppProps) {
  useRefreshOnResize();

  const { connected, room, actions, state } = props;

  if (!connected) {
    return <div style={{ fontSize: "50px" }}>🔌</div>;
  }

  if (!room) {
    return <Title join={actions.join} />;
  }

  const activePlayer = state ? state.activePlayer : null;
  const players = room.seats.map(({ avatar, name }, idx) => ({
    avatar,
    name,
    active: idx === activePlayer,
  }));

  if (!state) {
    return (
      <Lobby
        roomId={room.id}
        players={players}
        isAdmin={room.seatIndex === 0}
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

  const hand = state.hands[seatIndex];

  const { tableDimensions, appDimensions } = getDimensions(hand.length || 1);
  const tableHeight = tableDimensions[1];

  const winningIndex =
    state.type === "trickEnd"
      ? rotateIndex(state.numPlayers, state.trickWinner, -state.trickLeader)
      : undefined;

  return (
    <>
      <_TrickBridge
        containerDimensions={tableDimensions}
        trick={trick}
        numPlayers={numPlayers}
        startPlayer={trickLeader}
        playerIndex={seatIndex}
        winningIndex={winningIndex}
      />
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
    </>
  );
}
