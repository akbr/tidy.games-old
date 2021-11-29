import { AppPrimitives } from "@lib/socket-server-interface/types";
import { getHand } from "./derivations";
import { handleDrags } from "@lib/layouts/drag";
import { ServerSlice } from "@lib/socket-server-interface/storeSlices";
import { EngineTypesShape } from "@lib/socket-server/types";

export const initDragListeners = <
  ET extends EngineTypesShape,
  Slice extends ServerSlice<ET>
>(
  { store, manager }: AppPrimitives<ET, Slice>,
  $el: HTMLElement
) => {
  const selector = "[data-card-id]";
  handleDrags($el, {
    selector,
    shouldDrag: ($target) => {
      let cardEl = $target.closest(selector) as HTMLElement;
      if (!cardEl || !(typeof cardEl.dataset.cardId === "string")) return false;
      let hands = getHand(store);
      if (!hands.includes(cardEl.dataset.cardId)) return false;
      return true;
    },
    onDrop: ($target, [iX, iY], [pX, pY]) => {
      let yAmtMoved = iY - pY;
      let playAttempt = yAmtMoved > 100;
      let id = $target.dataset.cardId;
      if (typeof id !== "string") return false;
      const isValidPlay = playAttempt ? true : false;
      if (!isValidPlay) return false;
      manager.send(["engine", { type: "play", data: id }]);
      return true;
    },
  });
};
