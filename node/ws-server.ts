import { Server } from "ws";
import type { Socket } from "@lib/socket";
import type { ServerApi } from "@lib/tabletop/roomServer";

export const mountWSServer = (
  expressServer: any,
  roomServers: Record<string, ServerApi<any>>
) => {
  const wss = new Server({ server: expressServer });
  addHeartbeat(wss);

  wss.on("connection", function (ws, req) {
    const gameId = (req.url || "").replace(/\//g, "");
    const socketServer = roomServers[gameId];

    if (!socketServer) {
      ws.close(1006, `Can't find server for game code ${gameId}`);
    }

    const socket: Socket<any, any> = {
      send: (msg) => ws.send(JSON.stringify(msg)),
      close: () => {
        socketServer.onclose(socket);
      },
    };

    ws.on("message", function (msg: any) {
      msg = typeof msg === "string" ? msg : msg.toString();
      let action = JSON.parse(msg);
      socketServer.onmessage(socket, action);
    });

    ws.on("close", function () {
      socketServer.onclose(socket);
    });

    socketServer.onopen(socket);
  });
};

function addHeartbeat(wss: Server, ms = 25000) {
  function noop() {}
  function heartbeat() {
    //@ts-ignore
    this.isAlive = true;
  }

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      //@ts-ignore
      if (ws.isAlive === false) return ws.terminate();
      //@ts-ignore
      ws.isAlive = false;
      ws.ping(noop);
    });
  }, ms);

  wss.on("connection", function (ws) {
    //@ts-ignore
    ws.isAlive = true;
    //@ts-ignore
    ws.on("pong", heartbeat);
  });

  wss.on("close", function close() {
    clearInterval(interval);
  });
}
