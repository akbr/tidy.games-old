import { createNodeServer } from "@lib/tabletop/nodeServer";
import createRoomServer from "@lib/tabletop/roomServer";
import wizardCart from "./src/game/cart";

createNodeServer(createRoomServer(wizardCart));
