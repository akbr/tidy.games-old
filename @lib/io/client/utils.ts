function isObject(x: unknown): boolean {
  //@ts-ignore
  return x !== null && x !== undefined && Object.is(x.constructor, Object);
}

export function patchWithPrev<T extends any>(curr: T, prev: any): T {
  let bothAreObjOrArr =
    (Array.isArray(curr) && Array.isArray(prev)) ||
    (isObject(curr) && isObject(prev));

  if (!bothAreObjOrArr) return curr;

  let next = Array.isArray(curr) ? [] : {};
  let updated = false;
  for (let key in curr) {
    let currValue = curr[key];
    let prevValue = prev[key];
    let nextValue = patchWithPrev(currValue, prevValue);
    //@ts-ignore
    next[key] = nextValue;
    if (nextValue !== prevValue) updated = true;
  }

  return updated ||
    Object.keys(curr as object).length !== Object.keys(prev).length
    ? (next as T)
    : (prev as T);
}
