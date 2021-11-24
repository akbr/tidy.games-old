import { WithUpdate, useWindowSize } from "../premix";
import { ComponentChildren } from "preact";
import { dragUpdater } from "./dragUpdate";

type DragSurfaceProps = {
  isInHand: (cardId?: string) => boolean;
  play: (cardId: string) => void;
  isValidPlay: (cardId: string) => boolean;
  children?: ComponentChildren;
};

export const DragSurface = ({
  isInHand,
  play,
  isValidPlay,
  children,
}: DragSurfaceProps) => {
  return (
    <WithUpdate fn={dragUpdater} props={{ isInHand, play, isValidPlay }}>
      <div style={{ height: "100%" }}>{children}</div>
    </WithUpdate>
  );
};
