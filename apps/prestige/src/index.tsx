import "@shared/base.css";
import { render } from "preact";
import { App } from "./views/App";
import { server, clientActions, cameraActions } from "./state";

//@ts-ignore
window.dump = server.dump;

//@ts-ignore
window.restore = (s: string) => {
  server.restore(s);
  clientActions.fetch();
};

render(<App />, document.body);

const { setId, createGame, submit, resolve, fetch } = clientActions;

setId("test");
createGame();

submit({
  type: "transitOrder",
  from: "home",
  to: "bad",
  fleets: [{ player: 1, num: 10 }],
});

submit({
  type: "transitOrder",
  to: "home",
  from: "bad",
  fleets: [{ player: 2, num: 5 }],
});

submit({
  type: "transitOrder",
  from: "ice",
  to: "mid",
  fleets: [{ player: 1, num: 2 }],
});

resolve();
resolve();
fetch(2);

cameraActions.pan(-302, -245);
