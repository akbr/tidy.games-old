import type { FunctionComponent } from "preact";
import type { ViewProps } from "./types";
import { getHandHeight } from "@lib/layouts/hand";

import { Seats } from "./Seats";
import { Hand } from "./Hand";
import { Trick } from "./Trick";
import { TableCenter } from "./TableCenter";

const Container: FunctionComponent = ({ children }) => (
  <div class="h-full bg-[#006400] overflow-hidden">{children}</div>
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

export const Game = (props: ViewProps) => {
  const { frame, room } = props;
  const [, game] = frame.gameState;

  const numCards = game.hands[room.player].length || 1;
  const tableHeight = getHandHeight(
    numCards,
    document.body.getBoundingClientRect()
  );

  return (
    <Container>
      <Table height={tableHeight}>
        <TableCenter {...props} />
        <Hand {...props} />
        <Seats {...props} />
        <Trick {...props} />
      </Table>
    </Container>
  );
};
