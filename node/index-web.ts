import { createExpressServer } from "./express-server";
import createRoomServer from "@lib/tabletop/roomServer";

import { mountWSServer } from "./ws-server";

import { wizardCart } from "../apps/wizard/src/game/cart";
import { condottiereCart } from "../apps/condottiere/src/game/cart";

const express = createExpressServer();

const roomServers = {
  condottiere: createRoomServer(condottiereCart),
  wizard: createRoomServer(wizardCart),
};

mountWSServer(express, roomServers);
