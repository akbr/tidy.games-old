import { FunctionalComponent } from "preact";
import { memoizedCreate } from "@lib/card-views/createCard";
import { positionHand } from "@lib/layouts/hand";
import { useRefreshOnResize, WithUpdate } from "@lib/premix";
import { positionTrick } from "@lib/layouts/trick";
import { dragUpdater } from "@lib/card-views/dragUpdate";

export const insertCards = ($el: HTMLElement, cardIds: string[]) => {
  $el.innerHTML = "";
  if (cardIds.length > 0) {
    cardIds.forEach((id) => $el.appendChild(memoizedCreate(id)));
  }
};

type _HandBridgeProps = Parameters<typeof positionHand>[1] & { hand: string[] };

export const _HandBridge: FunctionalComponent<_HandBridgeProps> = ({
  children,
  hand,
  anim,
}) => {
  const didRefresh = useRefreshOnResize();
  return (
    <WithUpdate fn={positionHand} props={{ anim, didRefresh, hand }}>
      <WithUpdate fn={insertCards} props={hand}>
        {children}
      </WithUpdate>
    </WithUpdate>
  );
};
type _TrickBridgeProps = Parameters<typeof positionTrick>[1] & {
  trick: string[];
};

export const _TrickBridge: FunctionalComponent<_TrickBridgeProps> = ({
  numPlayers,
  startPlayer,
  playerIndex,
  winningIndex,
  trick,
  children,
}) => {
  const didRefresh = useRefreshOnResize();
  return (
    <WithUpdate
      fn={positionTrick}
      props={{
        numPlayers,
        startPlayer,
        playerIndex,
        winningIndex,
        trick,
        didRefresh,
      }}
    >
      <WithUpdate fn={insertCards} props={trick}>
        {children}
      </WithUpdate>
    </WithUpdate>
  );
};

type DragSurfaceProps = {
  isInHand: (cardId?: string) => boolean;
  play: (cardId: string) => void;
  isValidPlay: (cardId: string) => boolean;
};

export const _DragSurfaceBridge: FunctionalComponent<DragSurfaceProps> = ({
  isInHand,
  play,
  isValidPlay,
  children,
}) => {
  return (
    <WithUpdate fn={dragUpdater} props={{ isInHand, play, isValidPlay }}>
      <div style={{ height: "100%" }}>{children}</div>
    </WithUpdate>
  );
};
