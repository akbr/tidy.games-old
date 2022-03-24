import { FunctionComponent } from "preact";

import { tw } from "twind";
import { fadeIn } from "@shared/twindCss";

const gap = 12;
const positions: Record<string, any> = {
  left: {
    bottom: "50%",
    left: "0",
    transform: `translateY(50%) translateX(calc(-100% + -${gap}px))`,
  },
  right: {
    bottom: "50%",
    right: "0",
    transform: `translateY(50%) translateX(calc(100% + ${gap}px))`,
  },
  top: {
    top: "0",
    right: "50%",
    transform: `translateX(50%) translateY(calc(-100% + -${gap}px))`,
  },
  bottom: {
    bottom: "0",
    right: "50%",
    transform: `translateX(50%) translateY(calc(100% + ${gap}px))`,
  },
};

const notchPositions: Record<string, any> = {
  left: {
    right: "0",
    top: "50%",
    transform: `translateX(50%) translateY(-50%) rotate(45deg)`,
  },
  right: {
    left: "0",
    top: "50%",
    transform: `translateX(-50%) translateY(-50%) rotate(45deg)`,
  },
  top: {
    left: "50%",
    bottom: "0",
    transform: `translateX(-50%) translateY(50%) rotate(45deg)`,
  },
  bottom: {
    left: "50%",
    top: "0",
    transform: `translateX(-50%) translateY(-50%) rotate(45deg)`,
  },
};

export const Tooltip: FunctionComponent<{
  dir: string;
}> = ({ dir, children }) => {
  return (
    <div
      class={`absolute bg-yellow-200 text-black p-1.5 rounded whitespace-nowrap ${tw(
        fadeIn
      )}`}
      style={positions[dir]}
    >
      {children}
      <div
        class="absolute w-[8px] h-[8px] bg-yellow-200"
        style={notchPositions[dir]}
      />
    </div>
  );
};
