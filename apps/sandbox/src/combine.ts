import createEmitter, { Emitter } from "@lib/emitter";

type ExtractValues<T extends ReadonlyArray<Emitter<any>>> = {
  [K in keyof T]: T[K] extends Emitter<infer R> ? R : never;
};

type Combine = <Emitters extends ReadonlyArray<Emitter<any>>, U>(
  emitters: Emitters,
  fn: (values: ExtractValues<Emitters>) => U
) => [Emitter<U>, () => void];

const combine: Combine = (emitters, fn) => {
  const values = Array.from({ length: emitters.length });
  const un: Array<Function> = [];

  emitters.forEach((emitter, idx) => {
    values[idx] = emitter.get();
  });

  const initialValue = fn(values as any);
  const emitter = createEmitter(initialValue);

  emitters.forEach((emitter, idx) => {
    un.push(
      emitter.subscribe((v) => {
        values[idx] = v;
        emitter.next(fn(values as any));
      })
    );
  });

  return [emitter, () => un.forEach((fn) => fn())];
};

const e1 = createEmitter("Aaron");
const e2 = createEmitter(38);

const e3 = combine([e1, e2] as const, ([name, age]) => {
  return true;
});
