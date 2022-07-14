import { expect, test } from "vitest";

import { createHost } from "../host";
import { numberWarCart } from "./numberWar";

test("fails on invalid number of players", () => {
  const errPlayers = createHost(numberWarCart, {
    numPlayers: 1,
  });
  expect(errPlayers).to.toBeTypeOf("string");
});

test("fails on invalid options", () => {
  const errOptions = createHost(numberWarCart, {
    numPlayers: 2,
    options: {
      targetScore: 9999,
    },
  });
  expect(errOptions).to.toBeTypeOf("string");
});

test("creates with default options", () => {
  const host = createHost(numberWarCart, {
    numPlayers: 2,
  });

  expect(host).to.toBeTypeOf("object");
  if (typeof host !== "object") return;

  const update = host.get();

  expect(update.ctx.options.targetScore).toEqual(3);

  console.log(update);
});
