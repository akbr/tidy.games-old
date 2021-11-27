import { FunctionalComponent } from "preact";
import { WithUpdate } from "@lib/premix";
import { memoizedCreate } from "@lib/card-views/createCard";
import { positionHand } from "@lib/layouts/hand";
import { positionTrick } from "@lib/layouts/trick";
import { dragUpdater } from "@lib/card-views/dragUpdate";

const insertCards = ($el: HTMLElement, cardIds: string[]) => {
  $el.innerHTML = "";
  if (cardIds.length > 0) {
    cardIds.forEach((id) => $el.appendChild(memoizedCreate(id)));
  }
};

type _HandBridgeProps = Parameters<typeof positionHand>[1] & { hand: string[] };

const handUpdate = ($el: HTMLElement, props: _HandBridgeProps) => {
  insertCards($el, props.hand);
  positionHand($el, props);
};

export const _HandBridge: FunctionalComponent<_HandBridgeProps> = (props) => (
  <WithUpdate fn={handUpdate} props={{ ...props }}>
    <div id="hand" class="absolute top-0" />
  </WithUpdate>
);

type _TrickBridgeProps = Parameters<typeof positionTrick>[1] & {
  trick: string[];
};

const trickUpdate = ($el: HTMLElement, props: _TrickBridgeProps) => {
  insertCards($el, props.trick);
  positionTrick($el, props);
};

export const _TrickBridge: FunctionalComponent<_TrickBridgeProps> = (props) => (
  <WithUpdate fn={trickUpdate} props={{ ...props }}>
    <div id="trick" class="absolute top-0" />
  </WithUpdate>
);

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
      <div id="gameArea" style={{ height: "100%" }}>
        {children}
      </div>
    </WithUpdate>
  );
};
