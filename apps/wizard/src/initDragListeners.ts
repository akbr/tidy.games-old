import { AppPrimitives } from "@lib/client-setup";
import { handleDrags } from "@lib/layouts/drag";
import { ServerSlice } from "@lib/client-setup/extensions/server";
import { engine } from "./engine";
import { WizardShape } from "./engine/types";

export const initDragListeners = <Slice extends ServerSlice<WizardShape>>(
  { store, manager }: AppPrimitives<WizardShape, Slice>,
  $el: HTMLElement
) => {
  const isValidPlay = (cardId: string) => {
    let { state, room } = store.get();
    if (!room || !state) return false;
    let nextState = engine.reducer(
      state,
      { numSeats: room.seats.length },
      {
        action: { type: "play", data: cardId },
        seatIndex: room.seatIndex,
      }
    );
    if (nextState.type === "err") {
      store.set({ err: nextState });
      return false;
    } else {
      return true;
    }
  };
  const selector = "[data-card-id]";
  handleDrags($el, {
    selector,
    shouldDrag: ($target) => {
      const { state, room } = store.get();
      const cardEl = $target.closest(selector) as HTMLElement;
      if (!cardEl || !(typeof cardEl.dataset.cardId === "string")) return false;
      const hands = !room || !state ? [] : state.hands[room.seatIndex];
      return hands.includes(cardEl.dataset.cardId);
    },
    onDrop: ($target, [iX, iY], [pX, pY]) => {
      let yAmtMoved = iY - pY;
      let playAttempt = yAmtMoved > 100;

      if (!playAttempt) return false;

      let id = $target.dataset.cardId;
      if (typeof id !== "string") return false;
      if (isValidPlay(id)) {
        manager.send(["engine", { type: "play", data: id }]);
        return true;
      }
      return false;
    },
  });
};
