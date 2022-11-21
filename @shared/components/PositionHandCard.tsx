import { ComponentChildren } from "preact";
import { useState, useRef, useLayoutEffect } from "preact/hooks";
import { useDrag } from "@use-gesture/react";

import { style } from "@lib/style";
import { useRefreshOnResize } from "@lib/hooks";
import { getNearestDimensions } from "@lib/dom";

import { getHandCardPosition } from "@shared/domEffects/positionHand";

export type PositionHandCardProps = {
  idx: number;
  numCards: number;
  card: string;
  shouldDrop: (mx: number, my: number) => boolean;
  onDrop: (
    $el: HTMLElement,
    card: string,
    numCards: number,
    cardPos: number[],
    dragPos: number[]
  ) => void;
  errRef: any;
  children: ComponentChildren;
};

export function PositionHandCard({
  idx,
  numCards,
  card,
  children,
  errRef,
  shouldDrop,
  onDrop,
}: PositionHandCardProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const handPosRef = useRef([0, 0, 1]);
  const dragPosRef = useRef([0, 0]);

  const resizeToken = useRefreshOnResize();
  const [state, setState] = useState<"idle" | "playing">("idle");

  // Hand positioning
  useLayoutEffect(
    function positionInHand() {
      const $el = elRef.current!;
      const $card = $el.firstChild as HTMLElement;
      const { width } = $card.getBoundingClientRect();
      const [containerWidth, containerHeight] = getNearestDimensions($el);
      handPosRef.current = getHandCardPosition(
        idx,
        numCards,
        width,
        containerWidth,
        containerHeight
      );
      const [x, y, z] = handPosRef.current;
      style($el, { x, y, zIndex: z });
    },
    [resizeToken, numCards, card]
  );

  // Triggers action when is "played"
  useLayoutEffect(
    function onStateChange() {
      if (state === "playing")
        onDrop(
          elRef.current!,
          card,
          numCards,
          handPosRef.current,
          dragPosRef.current
        );
    },
    [state]
  );

  // Reverts card on error
  useLayoutEffect(
    function onErr() {
      const relevantError = errRef && state === "playing";
      if (!relevantError) return;
      const $el = elRef.current!;
      const [x, y, z] = handPosRef.current;

      style($el, { rotate: 360 });
      style($el, { x, y, rotate: 0, zIndex: z }, { duration: 300 });
      setState("idle");
    },
    [errRef]
  );

  // Drag handlers
  const bind = useDrag(({ down, movement }) => {
    const $el = elRef.current!;
    dragPosRef.current = movement;

    const [x, y] = handPosRef.current;
    const [mx, my] = dragPosRef.current;

    if (down) {
      style($el, { x: x + mx, y: y + my });
      return;
    }

    if (shouldDrop(mx, my)) {
      setState("playing");
    } else {
      style($el, { x, y }, { duration: 300 });
    }
  });

  return (
    <div
      ref={elRef}
      style={{
        position: "absolute",
        cursor: "pointer",
        touchAction: "none",
      }}
      {...bind()}
    >
      {children}
    </div>
  );
}

export default PositionHandCard;
