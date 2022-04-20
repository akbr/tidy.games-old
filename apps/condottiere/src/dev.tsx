import { render, h } from "preact";
import { PlayerMat } from "./views/PlayerMat";

import { PositionSeats } from "@shared/components/PositionSeats";
function Test() {
  return (
    <div class="h-full bg-yellow-800">
      <PositionSeats>
        <div class="m-1">
          <PlayerMat player={0} avatar={"🦊"} line={[1, 1, 1]} />
        </div>
        <PlayerMat player={1} avatar={"🐷"} line={[2, 2, 2]} />
        <PlayerMat player={2} avatar={"🦀"} line={[3, 3, 3]} />
        <PlayerMat player={3} avatar={"🦉"} line={[4, 4, 4]} />
        <PlayerMat player={4} avatar={"🐺"} line={[5, 5, 5]} />
        <PlayerMat
          player={5}
          avatar={"🦚"}
          line={[6, 6, 6, "d", "h"]}
          isWinter={true}
        />
      </PositionSeats>
    </div>
  );
}

render(h(Test, {}, null), document.body);
