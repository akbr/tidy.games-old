import type { Engine, EngineTypes } from "@lib/engine/types";

import { default as express } from "express";
import * as path from "path";

import { mountWSServer } from "./ws-server";
import { createServer } from "@lib/server";

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

export function startServer<T extends EngineTypes>(engine?: Engine<T>) {
  const expressServer = express()
    .use(express.static(distPath))
    .use(requireHTTPS)
    //@ts-ignore
    .get("/", function (_, res) {
      res.sendFile("index.html", { root: distPath });
    })
    .listen(PORT, function () {
      return console.log("Listening on " + PORT);
    });

  if (engine) {
    mountWSServer(expressServer, createServer(engine));
  }
}
