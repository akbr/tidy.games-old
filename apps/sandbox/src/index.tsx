import { createServer } from "@lib/tabletop/server/server";
import { warCart } from "@lib/tabletop/core/sample/war.cart";
import { createClient } from "@lib/tabletop/client/client";
import { withSelector } from "@lib/store";
import { delay } from "@lib/async/task";

const server = createServer(warCart);
const client = createClient(server, warCart);
const client2 = createClient(server, warCart);

withSelector(
  client,
  (x) => x.room,
  (room) => {
    if (room) console.log("Room update:", room);
  }
);

withSelector(
  client,
  (x) => x.state,
  (state) => {
    if (state) {
      console.log("State update:", state);
    }
  }
);

withSelector(
  client,
  (x) => x.err,
  (err) => {
    if (err) console.log("Err:", err);
  }
);

console.log(client);

client.actions.server.join({ id: "test" });
client2.actions.server.join({ id: "test" });
client.actions.server.start();
