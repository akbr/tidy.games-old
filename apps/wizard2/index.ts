import { Chart, GetInitialState, createEngine } from "@lib/engine";
import { proto } from "@lib/io/client/proto";

type GoTypes = {
  states: { type: "going"; data: number } | { type: "stopped" };
  actions: { type: "go"; data: number };
  options: { maxNum: number };
};

const goChart: Chart<GoTypes> = {
  going: ({ type, data }, { action, options, env }) => {
    const { maxNum } = options;
    const gameOver = data >= maxNum;
    if (gameOver) return { type: "stopped" };
    if (action) {
      if (action.data > 99) return "Whoa nelly; that's too much.";
      return { type: "going", data: data + action.data };
    }
    return null;
  },
  stopped: () => null,
};

const getInitialState: GetInitialState<GoTypes> = (env, options) => ({
  type: "going",
  data: 0,
});

const engine = createEngine(getInitialState, goChart);

const sockets = proto(engine, {
  go: null,
});

//@ts-ignore
const s = (window.s = sockets[0]);

sockets[0].join({ id: "TEST" });
sockets[2].join({ id: "TEST" });
sockets[1].join({ id: "TEST" });

setTimeout(() => {
  sockets[0].start({ maxNum: 99 });
  sockets[2].go(2);
  sockets[1].go(1);
  sockets[0].go(0);
}, 1000);
