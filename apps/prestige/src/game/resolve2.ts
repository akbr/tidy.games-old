import { Board, Events, Orders } from "./game.types";
import { commitOrders } from "./orders";
import { getNextEvent, resolveEvent, updateEvent } from "./events";
import { runIncrements } from "./increments";

export function resolve(inputBoard: Board, orders: Orders[], numTicks: number) {
  let elapsed = 0;
  let board = commitOrders(inputBoard, orders);

  const events: Events[] = [];

  while (elapsed < numTicks) {
    const remaining = numTicks - elapsed;
    let nextEvent = getNextEvent(board);
    if (nextEvent?.ticks === 0)
      throw new Error(
        "Didn't handle event -- ticks = 0 " + JSON.stringify(nextEvent)
      );

    if (nextEvent && nextEvent.ticks <= remaining) {
      board = runIncrements(board, nextEvent.ticks);

      nextEvent = updateEvent(nextEvent, board);
      board = resolveEvent(board, nextEvent);
      elapsed += nextEvent.ticks;
      events.push({ ...nextEvent, ticks: elapsed });
    } else {
      board = runIncrements(board, remaining);
      elapsed += remaining;
    }
  }

  return { board, events };
}

export type IntermediateBoard = { tick: number; board: Board };

export function getIntermediateBoards(
  inputBoard: Board,
  orders: Orders[],
  events: Events[],
  numTicks: number
) {
  let elapsed = 0;
  let _events = [...events];
  let board = commitOrders(inputBoard, orders);
  let boards: IntermediateBoard[] = [{ tick: 0, board }];

  while (elapsed < numTicks) {
    const remaining = numTicks - elapsed;
    const nextEvent = _events.shift();
    let prevBoard = boards.at(-1)!.board;
    let nextBoard: Board;

    if (nextEvent) {
      const modElapsed = nextEvent.ticks - elapsed;

      // Handles case where events occur at exact same tick
      nextBoard =
        modElapsed === 0
          ? boards.pop()!.board
          : runIncrements(prevBoard, nextEvent.ticks);

      nextBoard = resolveEvent(nextBoard, nextEvent);
      elapsed += modElapsed;
      boards.push({ tick: elapsed, board: nextBoard });

      continue;
    }

    board = runIncrements(prevBoard, remaining);
    elapsed += remaining;
  }

  return boards;
}

export function getBoardAtTick(boards: IntermediateBoard[], tick: number) {
  let nearestIndex = boards.findIndex((board) => board.tick > tick);
  if (nearestIndex === -1) nearestIndex = boards.length;
  const entry = boards.at(nearestIndex - 1)!;
  const catchup = tick - entry.tick;
  return runIncrements(entry.board, catchup);
}

/**

export function resolveWithEvents(
  inputBoard: Board,
  orders: Orders[],
  events: Events[],
  numTicks: number
) {
  const boards: Board[] = [];

  const firstInitBoard = commitOrders(inputBoard, orders);

  const eventsByTick = events.reduce((eventsByTick, event) => {
    if (!eventsByTick.has(event.tick)) eventsByTick.set(event.tick, []);
    eventsByTick.get(event.tick)!.push(event);
    return eventsByTick;
  }, new Map() as Map<number, Events[]>);

  for (let tick = 1; tick <= numTicks; tick++) {
    let board = boards.at(-1) || firstInitBoard;
    const tickEvents = eventsByTick.get(tick);
    if (tickEvents) {
      tickEvents.forEach((event) => {
        board = resolveEvent(board, event);
      });
    }
    const nextInitBoard = runIncrements(board);
    boards.push(nextInitBoard);
  }

  return boards;
}

export function createAndRunEvents(initBoard: Board, tick: number) {
  const events: Events[] = [];

  function iterate(board: Board): {
    board: Board;
    events: Events[];
  } {
    let event: any;

    orderedEventLogics.forEach(({ getNext }) => {
      if (event) return;
      event = getNext(board);
      if (event) {
        event.tick = tick;
        board = resolveEvent(board, event);
        events.push(event);
      }
    });
    return event ? iterate(board) : { board, events };
  }

  return iterate(initBoard);
}

 */
