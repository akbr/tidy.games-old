import { style } from "@lib/stylus";
import { getTransforms } from "@lib/stylus/transforms";

/**
 * TO do:
 * - dragleave should never trigger a "drop"
 * - onClick should only be fired if there was no dragging
 */

export type HandleDragProps = {
  selector: string;
  shouldDrag?: ($target: HTMLElement) => boolean;
  onDrop?: (
    $el: HTMLElement,
    initialCoords: number[],
    pageCoords: number[]
  ) => boolean;
  onClick?: ($el: HTMLElement) => void;
};

const returnTrue = () => true;
const noop = () => undefined;

export const handleDrags = (
  el: HTMLElement,
  {
    selector,
    shouldDrag = returnTrue,
    onDrop = returnTrue,
    onClick = noop,
  }: HandleDragProps,
  prev?: HandleDragProps
) => {
  if (prev) return;

  let active: HTMLElement | false = false;
  let animating = false;

  let initialDragX: number;
  let initialDragY: number;
  let originalTranslateX: number;
  let originalTranslateY: number;

  function getTarget(e: MouseEvent | TouchEvent) {
    //@ts-ignore
    let $el = e.target.closest(selector) as HTMLElement | undefined;
    return $el || null;
  }

  function dragStart(e: MouseEvent | TouchEvent) {
    if (animating || active) return;

    //@ts-ignore
    const $el = getTarget(e);
    if (!$el || !shouldDrag($el)) return;

    active = $el;

    //@ts-ignore
    let { x, y } = getTransforms($el);
    originalTranslateX = parseInt(x, 10);
    originalTranslateY = parseInt(y, 10);

    //@ts-ignore
    let locData = e.type === "touchstart" ? e.touches[0] : e;
    //e.preventDefault();
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

    const shouldRevert = !onDrop(
      active,
      [initialDragX, initialDragY],
      [locData.pageX, locData.pageY]
    );

    if (shouldRevert) {
      animating = true;
      style(
        active,
        { x: originalTranslateX, y: originalTranslateY },
        {
          duration: 200,
          easing: "ease",
        }
      ).finished.then(() => {
        animating = false;
      });
    }

    active = false;
  }

  function checkOnClick(e: MouseEvent | TouchEvent) {
    // check to see if draggted and return
    const $el = getTarget(e);
    if ($el) onClick($el);
  }

  //el.addEventListener("click", checkOnClick, false);

  el.addEventListener("touchstart", dragStart, false);
  el.addEventListener("touchend", dragEnd, false);
  el.addEventListener("touchmove", drag, false);

  el.addEventListener("mousedown", dragStart, false);
  el.addEventListener("mouseup", dragEnd, false);
  el.addEventListener("mouseleave", dragEnd, false);
  el.addEventListener("mousemove", drag, false);
};
