import { WithUpdate } from "@lib/premix";
import { memoizedCreate } from "@lib/card-views/createCard";
import { positionHand } from "@lib/layouts/hand";
import { positionTrick } from "@lib/layouts/trick";

const insertCards = ($el: HTMLElement, cardIds: string[]) => {
  $el.innerHTML = "";
  if (cardIds.length > 0) {
    cardIds.forEach((id) => $el.appendChild(memoizedCreate(id)));
  }
};

type _HandBridgeProps = Parameters<typeof positionHand>[1] & { hand: string[] };
export const _HandBridge = (props: _HandBridgeProps) => {
  return (
    <WithUpdate
      fn={($el, props) => {
        insertCards($el, props.hand);
        return positionHand($el, props);
      }}
      props={props}
    >
      <div id="hand" class="absolute top-0" />
    </WithUpdate>
  );
};

type _TrickBridgeProps = Parameters<typeof positionTrick>[1] & {
  trick: string[];
};

export const _TrickBridge = (props: _TrickBridgeProps) => (
  <WithUpdate
    fn={($el, props, prev) => {
      insertCards($el, props.trick);
      return positionTrick($el, props);
    }}
    props={{ ...props }}
  >
    <div id="trick" class="absolute top-0" />
  </WithUpdate>
);
