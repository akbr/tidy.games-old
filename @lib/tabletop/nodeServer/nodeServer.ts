const express = require("express");
import * as path from "path";

import { mountWSServer } from "@lib/socket/ws-server";

import type { Spec } from "../spec";
import type { ServerApi } from "../roomServer";

const PORT = process.env.PORT || 5000;
const distPath = path.resolve("dist/") + "/client";

//@ts-ignore
function requireHeorkuHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (
    !req.secure &&
    req.get("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV !== "development" &&
    req.hostname !== "localhost"
  ) {
    return res.redirect("https://" + req.get("host") + req.url);
  }
  next();
}

export function createNodeServer<S extends Spec>(
  roomServer: ServerApi<S>,
  servePath = distPath
) {
  const expressServer = express()
    .use(requireHeorkuHTTPS)
    .use(express.static(servePath))
    //@ts-ignore
    .get("/", function (_, res) {
      res.sendFile("index.html", { root: distPath });
    })
    .listen(PORT, function () {
      return console.log("Listening on " + PORT);
    });

  mountWSServer(expressServer, roomServer);
}
export default createNodeServer;
