import { ComponentChildren } from "preact";

const notchTransform = { transform: "translate(-50%, -50%) rotate(45deg)" };
const notchPositions = {
  left: {
    left: "0",
    top: "50%",
  },
  right: {
    left: "100%",
    top: "50%",
  },
  top: {
    left: "50%",
    top: "0",
  },
  bottom: {
    left: "50%",
    top: "100%",
  },
};

export const getBubblePos = (dir: keyof typeof notchPositions, amt = 16) => {
  if (dir === "left")
    return { top: "50%", left: "100%", transform: `translate(${amt}px, -50%)` };
  if (dir === "right")
    return {
      top: "50%",
      right: "100%",
      transform: `translate(${-amt}px, -50%)`,
    };
  if (dir === "top")
    return { top: "100%", left: "50%", transform: `translate(-50%, ${amt}px)` };
  return {
    bottom: "100%",
    left: "50%",
    transform: `translate(-50%, ${-amt}px)`,
  };
};

export const SpeechBubble = ({
  dir,
  children,
}: {
  dir: keyof typeof notchPositions;
  children: ComponentChildren;
}) => {
  const notchStyle = { ...notchPositions[dir], ...notchTransform };

  return (
    <div class={`relative inline-block bg-yellow-200 text-black p-1.5 rounded`}>
      {children}
      <div class="absolute w-[8px] h-[8px] bg-yellow-200" style={notchStyle} />
    </div>
  );
};
