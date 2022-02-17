import { render } from "preact";
import { setup } from "@twind/preact";
import { Game } from "./views/Game";

setup({
  props: { className: true },
  preflight: false,
});

render(<Game />, document.getElementById("app")!);
