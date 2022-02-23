import { FunctionComponent } from "preact";
import { ViewProps } from "../types";
import { RoundStart } from "./RoundStart";
import { TrumpReveal } from "./TrumpReveal";

const Center: FunctionComponent = ({ children }) => (
  <div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
    {children}
  </div>
);

export const TableCenter = ({ state, waitFor }: ViewProps) => {
  const [type, game] = state;

  return (
    <Center>
      {type === "roundStart" ? (
        <RoundStart num={game.round} waitFor={waitFor} />
      ) : type === "deal" && game.trumpCard ? (
        <TrumpReveal cardId={game.trumpCard} waitFor={waitFor} />
      ) : null}
    </Center>
  );
};
