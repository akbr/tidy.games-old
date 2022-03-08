import type { SocketServer, Socket } from "./";
import { Server } from "ws";

export const mountWSServer = (
  expressServer: any,
  socketServer: SocketServer<any, any>
) => {
  const wss = new Server({ server: expressServer });
  addHeartbeat(wss);

  wss.on("connection", function (ws) {
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
