const express = require("express");
import * as path from "path";

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

export function createExpressServer(servePath = distPath) {
  return (
    express()
      .use(requireHeorkuHTTPS)
      .use(express.static(servePath))
      //@ts-ignore
      .get("/", function (_, res) {
        res.redirect("/index/");
      })
      //@ts-ignore
      .get("*", function (_, res) {
        res.sendFile(`${_.url}/index.html`, { root: distPath });
      })
      .listen(PORT, function () {
        return console.log("Listening on " + PORT);
      })
  );
}
export default createExpressServer;
