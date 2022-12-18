export const dragify = (
  $el: HTMLElement,
  {
    onDrag,
    onDragStart,
    onDragEnd,
  }: {
    onDrag: (dx: number, dy: number) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
  }
) => {
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

  let lastX = 0;
  let lastY = 0;
  function updateLast(e: MouseEvent | TouchEvent) {
    const { pageX, pageY } = "touches" in e ? e.touches[0] : e;
    lastX = pageX;
    lastY = pageY;
  }

  function dragStart(e: MouseEvent | TouchEvent) {
    onDragStart();
    updateLast(e);
    toggleListeners(true);
  }

  function drag(e: MouseEvent | TouchEvent) {
    const { pageX, pageY } = "touches" in e ? e.touches[0] : e;
    const dx = lastX - pageX;
    const dy = lastY - pageY;
    updateLast(e);
    onDrag(dx, dy);
  }

  function dragEnd(e: MouseEvent | TouchEvent) {
    onDragEnd();
    toggleListeners(false);
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
