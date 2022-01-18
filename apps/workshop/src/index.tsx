if (process.env.NODE_ENV === "development") require("preact/debug");
import { setup, styled, css, keyframes } from "goober";
import {
  ComponentChildren,
  h,
  render,
  cloneElement,
  VNode,
  RefObject,
} from "preact";
import { Updater, useRefreshOnResize, WithUpdate } from "@lib/premix";
import {
  useRef,
  Ref,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "preact/hooks";

setup(h);

// -------------------------------
import { Card, CardProps } from "./cards";
import { dragify } from "./dragify";
import { style } from "@lib/stylus";

const useInitDrag = (ref: RefObject<HTMLElement>) => {
  useLayoutEffect(() => {
    if (!ref.current) return;
    dragify(ref.current, {
      onStart: ($el) => {},
      onDrag: ($el, x, y) => {
        style($el, { x, y });
      },
      onEnd: ($el, x, y) => {
        const played = y < -50;
        const styles = { x: 0, y: 0 };
        style($el, played ? { ...styles, top: "0px", left: "0px" } : styles, {
          duration: 150,
        })[0]!.finished.then(() => {
          played && console.log("played", $el.dataset.card);
        });
      },
    });
  }, [ref]);
};

const usePositionInHand = (ref: RefObject<HTMLElement>, idx: number) => {
  useLayoutEffect(() => {
    if (!ref.current) return;
    style(ref.current, {
      left: idx * 100,
      top: 500,
    });
  });
};

const WizardCard = ({ suit, value, idx }: { idx: number } & CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useInitDrag(ref);
  usePositionInHand(ref, idx);

  return (
    <div ref={ref} data-card={`${value}|${suit}`} class="absolute">
      <Card suit={suit} value={value} />
    </div>
  );
};

const cards = [
  { suit: "c", value: 2 },
  { suit: "d", value: 12 },
  { suit: "d", value: 4 },
  { suit: "d", value: 5 },
];

const WIP = () => {
  useRefreshOnResize();

  return (
    <>
      {cards.map(({ suit, value }, idx) => (
        <WizardCard key={suit + value} suit={suit} value={value} idx={idx} />
      ))}
    </>
  );
};
render(<WIP />, document.getElementById("app")!);
