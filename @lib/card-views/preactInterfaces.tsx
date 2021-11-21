import { WithUpdate, useWindowSize } from "../premix";
import { ComponentChildren } from "preact";
import { Dimensions } from "./types";
import { playUpdate } from "./playUpdate";
import { handUpdate } from "./handUpdate";
import { dragUpdater } from "./dragUpdate";

type CardUpdateProps<T extends (...args: any) => any> = Omit<
  Parameters<T>[1],
  "tableDimensions" | "appDimensions"
>;

export const CardsPlay = ({
  getTableDimensions,
  ...rest
}: CardUpdateProps<typeof playUpdate> & {
  getTableDimensions: (width: number, height: number) => Dimensions;
}) => {
  const [innerWidth, innerHeight] = useWindowSize();
  return (
    <WithUpdate
      fn={playUpdate}
      props={{
        ...rest,
        tableDimensions: getTableDimensions(innerWidth, innerHeight),
      }}
    >
      <div />
    </WithUpdate>
  );
};

const getAppDimensions = (innerWidth: number, innerHeight: number) => ({
  w: innerWidth > 700 ? 700 : innerWidth,
  h: innerHeight,
});

export const CardsHand = (props: CardUpdateProps<typeof handUpdate>) => {
  const [innerWidth, innerHeight] = useWindowSize();
  return (
    <WithUpdate
      fn={handUpdate}
      props={{
        ...props,
        appDimensions: getAppDimensions(innerWidth, innerHeight),
      }}
    >
      <div
        id="hand"
        style={{
          position: "absolute",
        }}
      />
    </WithUpdate>
  );
};

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
