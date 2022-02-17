import { FunctionComponent } from "preact";
import { getHandHeight } from "@lib/layouts/hand";
import { Hand } from "./Hand";
import { Trick } from "./Trick";

export const Container: FunctionComponent = ({ children }) => (
  <div class="h-full bg-green-800">{children}</div>
);

export const Table: FunctionComponent<{ height: number }> = ({
  children,
  height,
}) => (
  <section id="table" style={{ height: `calc(100% - ${height}px)` }}>
    {children}
  </section>
);

export const Game = () => {
  const tableHeight = getHandHeight(3, document.body.getBoundingClientRect());
  return (
    <Container>
      <Table height={tableHeight}>
        <Trick
          numPlayers={5}
          leadPlayer={0}
          perspective={0}
          trick={["2|d", "5|d", "8|s", "12|d"]}
          effect={{ type: "played", player: 3 }}
        />
        <Hand hand={["2|c", "5|c", "8|h"]} play={() => undefined} />
      </Table>
    </Container>
  );
};
