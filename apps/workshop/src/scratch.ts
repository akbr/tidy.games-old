export type Packet = { type: string; data?: any };
export type Options = { [key: string]: any };

export type EngineTypes = {
  states: Packet;
  options: Options;
};

export interface Engine<ET extends EngineTypes> {
  getInitialState: (numSeats: number) => ET["states"];
}

type TestType = {
  states: { type: "1" } | { type: "2" };
  options: { test: true };
};

type TestEngine = Engine<TestType>;

const engine: TestEngine = {
  getInitialState: () => ({ type: "1" }),
};

const meta = <ET extends EngineTypes>(engine: Engine<ET>) => {
  return engine.getInitialState(2);
};

const test = meta(engine);
