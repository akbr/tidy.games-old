import { createServer } from "@lib/tabletop";
import { createExpressServer } from "./express-server";
import { mountWSServer } from "./ws-server";

import { wizardGame } from "../apps/wizard/src/game/game";
//import { condottiereCart } from "../apps/condottiere/src/game/cart";

const express = createExpressServer();

const roomServers = {
  wizard: createServer(wizardGame),
  //condottiere: createServer(condottiereCart),
};

mountWSServer(express, roomServers);
