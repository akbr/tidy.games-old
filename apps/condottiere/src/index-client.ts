import { proto } from "@lib/io/client/proto";
import { seq } from "@lib/timing";
import { engine } from "./engine";

const s = proto(document.getElementById("app")!, engine, {
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
    () => s[0].play(1),
    () => s[1].play(3),
    () => s[0].play(1),
    () => s[1].play(3),
    () => s[0].play(2),
    () => s[1].play(3),
    () => s[0].play("s"),
    () => s[0].retreat(2),
  ].map((step) => () => {
    step();
    return 10;
  })
);
