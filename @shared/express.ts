const express = require("express");

import * as path from "path";

import type { Spec, GameDefinition } from "@lib/tabletop/types";
import { createServer } from "@lib/tabletop/server";
import { mountWSServer } from "@lib/socket/ws-server";

const PORT = process.env.PORT || 5000;
const distPath = path.resolve("dist/");

//@ts-ignore
function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (
    !req.secure &&
    req.get("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV !== "development"
  ) {
    return res.redirect("https://" + req.get("host") + req.url);
  }
  next();
}

export function startServer<S extends Spec>(def: GameDefinition<S>) {
  console.log(distPath);
  const expressServer = express()
    .use(express.static(distPath))
    //.use(requireHTTPS)
    //@ts-ignore
    .get("/", function (_, res) {
      res.sendFile("index.html", { root: distPath });
    })
    .listen(PORT, function () {
      return console.log("Listening on " + PORT);
    });

  mountWSServer(expressServer, createServer(def));
}
