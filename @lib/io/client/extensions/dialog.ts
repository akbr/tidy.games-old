import type { ComponentChildren, FunctionComponent } from "preact";
import type { EngineTypes } from "../../engine/";
import type { AppPrimitives } from "../";
import type { ServerSlice } from "./server";

export type DialogProps<ET extends EngineTypes> = Pick<
  ServerSlice<ET>,
  "state" | "room"
> & {
  actions: {
    setDialog: (dialog: DialogSlice<ET>["dialog"]) => void;
  };
};

export type DialogSlice<ET extends EngineTypes> = {
  dialog: ComponentChildren | FunctionComponent<DialogProps<ET>>;
};

export const dialog = {
  createSlice: <ET extends EngineTypes>(): DialogSlice<ET> => ({
    dialog: null,
  }),
  createActions: <ET extends EngineTypes, StoreShape extends DialogSlice<ET>>({
    store,
  }: AppPrimitives<ET, StoreShape>) => ({
    setDialog: (dialog: DialogSlice<ET>["dialog"]) => {
      store.set({ dialog });
    },
  }),
};
