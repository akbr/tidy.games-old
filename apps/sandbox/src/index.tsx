import "@shared/base.css";

import { createServer, createClient, createViews } from "@lib/tabletop";
import { wizardCart } from "../../wizard/src/game/cart";
import Game from "../../wizard/src/views/Game";

const server = createServer(wizardCart);
const client = createClient(server, wizardCart);

createViews(client, document.body, { Game }, { dev: true });

client.actions.server.join();
client.actions.server.addBot();
client.actions.server.addBot();
client.actions.server.start();
