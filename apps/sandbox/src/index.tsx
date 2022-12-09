import "@shared/base.css";
import "./sandbox.css";

import { render } from "preact";
import Container from "@lib/tabletop/preact/views/Backdrop";
import { Seat } from "../../wizard/src/views/Seat";

function App() {
  return (
    <Container>
      <div class="flex justify-center items-center h-full p-2 gap-10">
        <Seat
          avatar="🦊"
          playerIndex={0}
          isDealer={true}
          direction={"right"}
          display={{ type: "bidProgress", data: [2, 4] }}
          alert={{ type: "waiting" }}
        />
      </div>
    </Container>
  );
}

render(<App />, document.body);
