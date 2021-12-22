import { consoleProto } from "@lib/io/client/consoleProto";
import { seq } from "@lib/timing";
import { engine } from "./engine";

const s = consoleProto(engine, {
  choose: null,
  play: null,
  retreat: null,
  discard: null,
});

seq(
  [
    () => s[0].join({ id: "test" }),
    () => s[1].join({ id: "test" }),
    () => s[0].start({ seed: "sssss" }),
    () => s[0].choose("ven"),
    () => {
      console.log(s[0].getState()?.data.hands[0]);
    },
  ].map((step) => () => {
    step();
    return 10;
  })
);
