import { GameState, set } from "./useGame";

function getId<T extends Record<string, any>>(arr: T[], id: string) {
  return arr.find((x) => x.id === id);
}

export function onSelect(id: string, state: GameState) {
  if (id === "clear") {
    set({ mode: null, selected: null });
    return;
  }

  const selected = getData(id, state);

  if (!selected) {
    console.warn("onSelect code yieleded nothing", id);
    return;
  }

  if (
    state.mode === "moveSelect" &&
    state.selected?.type === "system" &&
    selected.type === "system"
  ) {
    if (selected === state.selected) {
      return set({ mode: null, selected: null });
    }
    set({
      mode: null,
      selected: {
        type: "planMoveOrder",
        from: state.selected.data,
        to: selected.data,
      },
    });
    return;
  }

  set({ selected });
}

export function getData(
  id: string,
  { board, orders }: Pick<GameState, "board" | "orders">
): GameState["selected"] {
  const system = getId(board.systems, id);
  if (system) return { type: "system", data: system };

  const transit = getId(board.transit, id);
  if (transit) return { type: "transit", data: transit };

  const moveOrder = getId(orders, id);
  if (moveOrder) return { type: "moveOrder", data: moveOrder };

  return null;
}
