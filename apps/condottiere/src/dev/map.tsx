import { render, h } from "preact";
import { PlayerMat } from "../views/PlayerMat";

import { Map } from "../views/Map";

function Test() {
  return (
    <div class="h-full bg-yellow-800">
      <Map />
    </div>
  );
}

render(h(Test, {}, null), document.body);
