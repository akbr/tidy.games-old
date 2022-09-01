import { delay, Task } from "@lib/async/task";

type Receiver = (task: Task<any>) => void;
let receiver: Receiver = () => {};

export const setReceiver = (fn: Receiver) => {
  receiver = fn;
};

export const receive = (task: Task<any>) => receiver(task);

export const setDelay = (ms: number) => {
  receive(delay(ms));
};
