import { produce } from "immer";
import { Board } from "../game.types";
import { Events } from "./events.types";
import { eventLogics, keyedEventLogics } from "./events.rules";

export function resolveEvent(board: Board, event: Events) {
  const resolve = produce(keyedEventLogics[event.type].resolve) as any;
  return resolve(board, event);
}

export function getNextEvent(board: Board) {
  const events = eventLogics
    .map(({ getNext }) => getNext(board))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((x, y) => x.ticks - y.ticks);

  return events[0] ? events[0] : null;
}

export function updateEvent<E extends Events>(event: E, board: Board) {
  const fn = keyedEventLogics[event.type].beforeResolve;
  if (!fn) return event;
  const resolve = produce(fn) as any;
  return resolve(event, board) as E;
}

export default resolveEvent;
