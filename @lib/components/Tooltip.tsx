import { styled } from "goober";
import { ComponentChildren } from "preact";

const Outer = styled("div")`
  position: absolute;
  background-color: #ffe5b4;
  color: black;
  padding: 5px;
  border-radius: 3px;
  white-space: nowrap;
`;

const gap = 12;
const positions: { [key: string]: any } = {
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

const Notch = styled("div")`
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: black;
  background-color: #ffe5b4;
`;
const notchPositions: { [key: string]: any } = {
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

export const Tooltip = ({
  dir,
  children,
}: {
  dir: string;
  children: ComponentChildren;
}) => {
  return (
    <Outer style={positions[dir]}>
      {children}
      <Notch style={notchPositions[dir]} />
    </Outer>
  );
};
