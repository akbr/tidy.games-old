import { expect, test } from "vitest";

import { createMachine } from "../machine";
import { numberWarCart } from "./numberWar";

test("runs a test", () => {
  const machine = createMachine(numberWarCart, {
    numPlayers: 2,
  });

  expect(typeof machine).to.equal("object");
});
