export const is = {
  string: (x: unknown): x is string => typeof x === "string",
  number: (x: unknown): x is number => typeof x === "number",
  null: (x: unknown): x is null => x === null,
  undefined: (x: unknown): x is undefined => x === undefined,
};
