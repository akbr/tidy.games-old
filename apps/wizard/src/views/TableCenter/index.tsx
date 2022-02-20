import { FunctionComponent } from "preact";
import { ViewProps } from "../types";
import { RoundStart } from "./RoundStart";
import { TrumpReveal } from "./TrumpReveal";

const Center: FunctionComponent = ({ children }) => (
  <div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
    {children}
  </div>
);

export const TableCenter = ({ frame, meter }: ViewProps) => {
  const [type, game] = frame.gameState;

  return (
    <Center>
      {type === "roundStart" ? (
        <RoundStart num={game.round} waitFor={meter.waitFor} />
      ) : type === "deal" && game.trumpCard ? (
        <TrumpReveal cardId={game.trumpCard} waitFor={meter.waitFor} />
      ) : null}
    </Center>
  );
};
