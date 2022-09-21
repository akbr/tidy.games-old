import "@shared/base.css";
import { render } from "preact";
import { App } from "./views/App";
import { client } from "./state/useClient";

render(<App />, document.body);
client.create();
client.get();
