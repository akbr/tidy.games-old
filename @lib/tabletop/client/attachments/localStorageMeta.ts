import { Spec } from "../../spec";
import { Client } from "..";

export default function attachLocalStorageMeta<S extends Spec>(
  client: Client<S>
) {
  client.subscribe(([type, payload]) => {
    if (type === "lobby") {
      const { room } = payload;
      const meta = room.seats[room.player]!;
      const receivedMeta = JSON.stringify(meta);
      const storedMeta = localStorage.getItem("meta");

      if (!storedMeta) {
        localStorage.setItem("meta", receivedMeta);
        return;
      }

      if (receivedMeta === storedMeta) return;

      if (receivedMeta === `{}`) {
        client.controls.server.setMeta(JSON.parse(storedMeta));
      } else {
        localStorage.setItem("meta", JSON.stringify(meta));
      }
    }
  });
}
