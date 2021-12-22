import { consoleProto } from "@lib/io/client/consoleProto";
import { seq } from "@lib/timing";
import { engine, actionStubs } from "./engine";

export function init() {
  const s = consoleProto(engine, actionStubs);

  // ---
  seq([
    () => {
      s[0].join({ id: "TEST" });
      return 10;
    },
    () => {
      s[2].join({ id: "TEST" });
      return 10;
    },
    () => {
      s[0].start();
      return 10;
    },
    () => {},
  ]);
}
