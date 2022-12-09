import {
  serverActions,
  render,
  isDev,
  gameActions,
  gameMeter,
} from "./control";
import viewInputs from "./views";

render(viewInputs);

if (isDev()) {
  const { join, addBot, start, leave } = serverActions;
  join({ id: "DEVV" });
  addBot();
  addBot();
  addBot();
  addBot();
  addBot();
  start();
}
