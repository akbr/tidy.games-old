import { memo } from "preact/compat";

export const JSONPair = ({
  oKey,
  value,
  equal,
}: {
  oKey: string;
  value: any;
  equal: boolean;
}) => {
  return (
    <div>
      <div
        class={
          (equal ? "" : "bg-yellow-700") +
          " break-all inline-block font-mono text-sm"
        }
      >
        {oKey}: {typeof value === "object" ? JSON.stringify(value) : value}
      </div>
    </div>
  );
};

export const alphabetizeKeys = <T extends Record<string, any>>(obj: T): T => {
  const keys = Object.keys(obj).sort() as (keyof T)[];
  const next = {} as T;
  keys.forEach((key) => {
    next[key] = obj[key];
  });
  return next;
};

export const JSONDiff = ({
  curr,
  prev,
}: {
  curr: Record<string, any>;
  prev?: Record<string, any> | null;
}) => {
  return (
    <>
      {Object.entries(alphabetizeKeys(curr)).map(([oKey, value]) => (
        <JSONPair
          oKey={oKey}
          value={value}
          equal={!prev || curr[oKey] === prev[oKey]}
        />
      ))}
    </>
  );
};
