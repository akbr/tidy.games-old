import { style } from "../stylus";
import { getTransforms } from "../stylus/transforms";

type DragUpdaterProps = {
  isInHand: (cardId?: string) => boolean;
  isValidPlay: (cardId: string) => boolean;
  play: (cardId: string) => void;
};

type NewProps = {
  selector: string;
  shouldDrag: ($el: HTMLElement) => boolean;
  shouldResetPosition: (
    $el: HTMLElement,
    initialX: number,
    initialY: number
  ) => boolean;
  onClick: ($el: HTMLElement) => void;
};

export const dragUpdater = (
  el: HTMLElement,
  { isInHand = () => true, isValidPlay, play }: DragUpdaterProps,
  prev?: DragUpdaterProps
) => {
  if (prev) return;

  let active: HTMLElement | false = false;
  let animating = false;

  let initialDragX: number;
  let initialDragY: number;
  let originalTranslateX: number;
  let originalTranslateY: number;

  function dragStart(e: MouseEvent | TouchEvent) {
    if (animating || active) return;

    //@ts-ignore
    let cardEl = e.target.closest("[data-card-id]") as HTMLElement;
    if (!cardEl) return;
    if (!isInHand(cardEl.dataset.cardId)) return;

    if (cardEl) {
      active = cardEl;
    } else {
      return;
    }

    //@ts-ignore
    let { x, y } = getTransforms(cardEl);
    originalTranslateX = parseInt(x, 10);
    originalTranslateY = parseInt(y, 10);

    //@ts-ignore
    let locData = e.type === "touchstart" ? e.touches[0] : e;
    e.preventDefault();
    initialDragX = locData.pageX;
    initialDragY = locData.pageY;
  }

  function drag(e: MouseEvent | TouchEvent) {
    if (active) {
      e.preventDefault();
      //@ts-ignore
      let locData = e.type === "touchmove" ? e.touches[0] : e;
      style(active, {
        x: locData.pageX - initialDragX + originalTranslateX,
        y: locData.pageY - initialDragY + originalTranslateY,
      });
    }
  }

  function dragEnd(e: MouseEvent | TouchEvent) {
    if (!active) return;

    //@ts-ignore
    let locData = e.type === "touchend" ? e.changedTouches[0] : e;
    let yAmtMoved = initialDragY - locData.pageY;

    let vector = { x: originalTranslateX, y: originalTranslateY };
    let playAttempt = yAmtMoved > 100;
    let id = active.dataset.cardId;

    if (playAttempt && isValidPlay(id!)) {
      play(id!);
    } else {
      animating = true;
      style(active, vector, {
        duration: 200,
        easing: "ease",
      }).finished.then(() => {
        animating = false;
      });
    }

    active = false;
  }
  el.addEventListener("touchstart", dragStart, false);
  el.addEventListener("touchend", dragEnd, false);
  el.addEventListener("touchmove", drag, false);

  el.addEventListener("mousedown", dragStart, false);
  el.addEventListener("mouseup", dragEnd, false);
  el.addEventListener("mouseleave", dragEnd, false);
  el.addEventListener("mousemove", drag, false);
};
