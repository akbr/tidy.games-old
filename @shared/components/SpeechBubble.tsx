import { ComponentChildren } from "preact";
import { getPosition } from "@lib/stylus";

const notchTransform = getPosition({ x: "-50%", y: "-50%", rotate: 45 });
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
    return getPosition({ top: "50%", left: "100%", y: "-50%", x: amt });
  if (dir === "right")
    return getPosition({ top: "50%", right: "100%", y: "-50%", x: -amt });
  if (dir === "top")
    return getPosition({ top: "100%", left: "50%", x: "-50%", y: amt });
  return getPosition({ bottom: "100%", left: "50%", x: "-50%", y: -amt });
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
