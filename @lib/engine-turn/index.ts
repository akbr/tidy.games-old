// First, the user will define their engine types (states, actions, options)
export type { CreateEngineTypes } from "./types";

// Second, the user will define a "chart" and a function that yields initial states
// (These two primitives make everything else happen)
export type { Chart, GetInitialState } from "./types";

// Next, most users will use these materials to create machines
export type { Machine, MachineSpec } from "./machine";
export { createMachineFactory } from "./machine";

// Finally, there are a variety of utilities for managing machines, or manipulating state
export type { Frame, StateActionList, Bot } from "./utils";
export { createGame, getClientFrames, getStateActionList } from "./utils";

// PS: Advanced users may want to use these core functions for making new utilities.
export type { Segment } from "./core";
export { getInitialSegment, getNextSegment, isErr } from "./core";
