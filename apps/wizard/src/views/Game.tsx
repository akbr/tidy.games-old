import type { FunctionComponent } from "preact";
import type { GameProps } from "./types";
import { getHandHeight } from "@lib/layouts/hand";

import { Hud } from "./Hud";
import { Seats } from "./Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";

const Container: FunctionComponent = ({ children }) => (
  <div class="h-full bg-[#006400] text-white overflow-hidden">{children}</div>
);

const Table: FunctionComponent<{ height: number }> = ({ children, height }) => (
  <section
    id="table"
    class="relative"
    style={{ height: `calc(100% - ${height}px)` }}
  >
    {children}
  </section>
);

export const Game = (props: GameProps) => {
  const {
    state: [, game],
    player,
  } = props.frame;

  const numCards = game.hands[player].length || 1;
  const tableHeight = getHandHeight(
    numCards,
    document.body.getBoundingClientRect()
  );

  return (
    <Container>
      <Table height={tableHeight}>
        <Hud {...props} />
        <Hand {...props} />
        <Seats {...props} />
        <Trick {...props} />
        <TableCenter {...props} />
      </Table>
    </Container>
  );
};
