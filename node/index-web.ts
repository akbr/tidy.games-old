import { createServer } from "@lib/tabletop";
import { createExpressServer } from "./express-server";
import { mountWSServer } from "./ws-server";

import { wizardCart } from "../apps/wizard/src/game/cart";
import { condottiereCart } from "../apps/condottiere/src/game/cart";

const express = createExpressServer();

const roomServers = {
  wizard: createServer(wizardCart),
  condottiere: createServer(condottiereCart),
};

mountWSServer(express, roomServers);
