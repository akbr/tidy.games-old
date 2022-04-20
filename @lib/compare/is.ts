export const is = {
  string: (x: unknown): x is string => typeof x === "string",
  number: (x: unknown): x is number => typeof x === "number",
  boolean: (x: unknown): x is boolean => typeof x === "boolean",
  null: (x: unknown): x is null => x === null,
  undefined: (x: unknown): x is undefined => x === undefined,
  defined: <T>(x: T | undefined): x is T => x !== undefined,
};
