import "@shared/base.css";

import { createServer, createClient, createView } from "@lib/tabletop";
import { wizardCart } from "../../wizard/src/game/cart";
import Game from "../../wizard/src/views/Game";

const server = createServer(wizardCart);
const client = createClient(server, wizardCart);

createView(client, document.body, { Game }, { dev: true });
