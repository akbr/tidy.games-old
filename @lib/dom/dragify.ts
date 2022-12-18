type Props = {
  dX: number;
  dY: number;
  startX: number;
  startY: number;
  shiftX: number;
  shiftY: number;
};

type Options = {
  onStart?: ($selected: HTMLElement, props: Props) => void;
  onDrag?: ($selected: HTMLElement, props: Props) => void;
  onEnd?: ($selected: HTMLElement, props: Props) => void;
};

export const dragify = ($el: HTMLElement, options: Options) => {
  const {
    onStart = () => undefined,
    onDrag = () => undefined,
    onEnd = () => undefined,
  } = options;

  let $selected = $el;

  const status: Props = {
    startX: 0,
    startY: 0,
    dX: 0,
    dY: 0,
    shiftX: 0,
    shiftY: 0,
  };

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
    const rect = $selected.getBoundingClientRect();
    const tapX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const tapY = "touches" in e ? e.touches[0].clientY : e.clientY;
    status.shiftX = tapX - rect.left;
    status.shiftY = tapY - rect.top;

    toggleListeners(true);
    const { pageX, pageY } = "touches" in e ? e.touches[0] : e;
    status.startX = pageX - status.shiftX;
    status.startY = pageY - status.shiftY;
    onStart($selected, status);
  }

  function drag(e: MouseEvent | TouchEvent) {
    const { pageX, pageY } = "touches" in e ? e.touches[0] : e;
    status.dX = pageX - status.startX - status.shiftX;
    status.dY = pageY - status.startY - status.shiftY;
    onDrag($selected, status);
  }

  function dragEnd(e: MouseEvent | TouchEvent) {
    toggleListeners(false);
    onEnd($selected, status);
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
