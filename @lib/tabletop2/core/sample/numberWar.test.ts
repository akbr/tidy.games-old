import { expect, test } from "vitest";

import { createMachine } from "../machine";
import { numberWarCart } from "./numberWar";

test("runs a test", () => {
  const machine = createMachine(numberWarCart, {
    numPlayers: 2,
    options: { maxPlay: 10, maxScore: 5 },
  });

  expect(typeof machine).to.equal("object");
});
