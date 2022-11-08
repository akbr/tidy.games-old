import { expect, test } from "vitest";

import { createCartStore } from "../store";
import { warCart } from "./war.cart";

test("fails on invalid number of players", () => {
  const errPlayers = createCartStore(warCart, {
    numPlayers: 1,
  });
  expect(errPlayers).to.toBeTypeOf("string");
});

test("creates with default options", () => {
  const host = createCartStore(warCart, {
    numPlayers: 2,
    seed: "test_",
  });

  expect(host).to.toBeTypeOf("object");
  if (typeof host !== "object") return;

  const update = host.get();
  expect(update.games.length).toBe(2);
  expect(update.final).toBe(false);
  expect(host.submit({ type: "play", data: 2 }, 1)).toBe("Not your turn!");
  expect(host.submit({ type: "play", data: 222 }, 0)).toBe(
    "You don't have that number!"
  );
  expect(host.submit({ type: "play", data: 1 }, 0)).toBe(undefined);

  expect(host.submit({ type: "play", data: 2 }, 0)).toBe("Not your turn!");
  expect(host.submit({ type: "play", data: 222 }, 1)).toBe(
    "You don't have that number!"
  );
  expect(host.submit({ type: "play", data: 2 }, 1)).toBe(undefined);

  expect(host.get().final).toBe(true);
});
