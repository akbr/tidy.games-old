type Options = {
  onStart: ($el: HTMLElement, startX: number, startY: number) => void;
  onDrag: ($el: HTMLElement, dx: number, dy: number) => void;
  onEnd: ($el: HTMLElement, dx: number, dy: number) => void;
};

const defaultOptions2: Options = {
  onStart: () => undefined,
  onDrag: () => undefined,
  onEnd: () => undefined,
};

export const dragify = (
  $el: HTMLElement,
  { onStart, onDrag, onEnd } = defaultOptions2
) => {
  let startX: number;
  let startY: number;
  let dx: number;
  let dy: number;

  const listeners = [
    ["mousemove", drag],
    ["touchmove", drag],
    ["mouseup", dragEnd],
    ["mouseleave", dragEnd],
    ["touchend", dragEnd],
  ] as const;

  function toggleListeners(toggle: boolean) {
    listeners.forEach(([type, listener]) =>
      toggle
        ? document.body.addEventListener(type, listener)
        : document.body.removeEventListener(type, listener)
    );
  }

  function dragStart(e: MouseEvent | TouchEvent) {
    toggleListeners(true);
    const { pageX, pageY } = "touches" in e ? e.touches[0] : e;
    startX = pageX;
    startY = pageY;
    onStart($el, startX, startY);
  }

  function drag(e: MouseEvent | TouchEvent) {
    const { pageX, pageY } = "touches" in e ? e.touches[0] : e;
    dx = pageX - startX;
    dy = pageY - startY;
    onDrag($el, dx, dy);
  }

  function dragEnd(e: MouseEvent | TouchEvent) {
    toggleListeners(false);
    onEnd($el, dx, dy);
  }

  $el.addEventListener("mousedown", dragStart);
  $el.addEventListener("touchstart", dragStart);
  $el.ondragstart = () => false;

  return () => {
    toggleListeners(false);
    $el.removeEventListener("mousedown", dragStart);
    $el.removeEventListener("touchstart", dragStart);
    $el.ondragstart = null;
  };
};
