import { Task } from "@lib/async/task";

const tasks: WeakMap<Element, Task<Animation>[]> = new WeakMap();

export const addTask = ($el: Element, task: Task<Animation>) => {
  let arr = tasks.get($el) || [];
  arr.push(task);
  tasks.set($el, arr);

  task.finished.then(() => {
    let arr = tasks.get($el) || [];
    arr = arr.filter((x) => x !== task);
    tasks.set($el, arr);
  });
};

export const getTasks = ($el: Element) => tasks.get($el) || [];
export const skipTasks = ($el: Element) => {
  getTasks($el).forEach((x) => x.skip());
};
