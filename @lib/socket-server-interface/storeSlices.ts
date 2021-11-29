import type { ComponentChildren, FunctionComponent } from "preact";
import type {
  EngineTypesShape,
  ServerTypes,
  RoomState,
} from "../socket-server/types";

export type ServerSlice<ET extends EngineTypesShape> = {
  connected: boolean;
  state: ET["states"] | null;
  room: RoomState["data"];
  err: ET["msgs"] | ServerTypes<ET>["msgs"] | null;
};

export const createServerSlice = <
  ET extends EngineTypesShape
>(): ServerSlice<ET> => ({
  connected: false,
  state: null,
  room: null,
  err: null,
});

export type DialogSlice<Props> = {
  dialog: ComponentChildren | FunctionComponent<Props>;
};

export const createDialogSlice = <Props>(): DialogSlice<Props> => ({
  dialog: null,
});
