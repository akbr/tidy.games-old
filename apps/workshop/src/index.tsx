import { h, render } from "preact";
import { App } from "../App";
if (module.hot) {
  module.hot.accept();
}
render(<App num={Date.now()} />, document.getElementById("app")!);
