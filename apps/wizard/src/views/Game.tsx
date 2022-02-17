import { FunctionComponent } from "preact";
import { Frame } from "@lib/tabletop";
import { WizardSpec } from "src/game";
import { getHandHeight } from "@lib/layouts/hand";
import { Hand } from "./Hand";
import { Trick } from "./Trick";

export const Container: FunctionComponent = ({ children }) => (
  <div class="h-full bg-[#006400]">{children}</div>
);

export const Table: FunctionComponent<{ height: number }> = ({
  children,
  height,
}) => (
  <section id="table" style={{ height: `calc(100% - ${height}px)` }}>
    {children}
  </section>
);

export const Game = ({ frame }: { frame: Frame<WizardSpec> }) => {
  const { player } = frame;
  const [state, game] = frame.gameState;
  const tableHeight = getHandHeight(3, document.body.getBoundingClientRect());
  return (
    <Container>
      <Table height={tableHeight}>
        <Trick
          numPlayers={5}
          leadPlayer={0}
          perspective={0}
          trick={game.trick}
        />
        <Hand hand={game.hands[0]} play={() => undefined} />
      </Table>
    </Container>
  );
};
