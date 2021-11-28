import { AppAPI } from "@lib/socket-server-interface/types";
import { WizardShape } from "./engine/types";
import { handleDrags, HandleDragProps } from "@lib/layouts/drag";

export const initDragListeners = (
  { store, manager }: AppAPI<WizardShape>,
  $el: HTMLElement
) => {
  const getHand = (store: AppAPI<WizardShape>["store"]) => {
    let { state, room } = store.getState();
    if (!room || !state) return [];
    return state.hands[room.seatIndex];
  };

  const selector = "[data-card-id]";

  const shouldDrag: HandleDragProps["shouldDrag"] = ($target) => {
    let cardEl = $target.closest(selector) as HTMLElement;
    if (!cardEl || !(typeof cardEl.dataset.cardId === "string")) return false;
    let hands = getHand(store);
    if (!hands.includes(cardEl.dataset.cardId)) return false;
    return true;
  };

  const onDrop: HandleDragProps["onDrop"] = ($target, [iX, iY], [pX, pY]) => {
    let yAmtMoved = iY - pY;
    let playAttempt = yAmtMoved > 100;
    let id = $target.dataset.cardId;
    if (typeof id !== "string") return false;
    const isValidPlay = playAttempt ? true : false;
    if (!isValidPlay) return false;
    manager.send(["engine", { type: "play", data: id }]);
    return true;
  };

  handleDrags($el, { selector, shouldDrag, onDrop });
};
