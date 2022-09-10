function KeyValueCompare({
  entryKey,
  prev,
  curr,
}: {
  entryKey: string;
  prev: any;
  curr: any;
}) {
  const backgroundColor = prev !== curr ? "yellow" : "";
  return (
    <span style={{ backgroundColor }}>
      {entryKey}: {JSON.stringify(curr)}
    </span>
  );
}

function JSONDiff({
  prev,
  curr,
}: {
  prev: Record<string, any>;
  curr: Record<string, any>;
}) {
  const entries = Object.entries(curr);
  return (
    <div>
      <span>{"{"}</span>
      {entries.map(([key, currValue], idx, arr) => (
        <>
          <KeyValueCompare entryKey={key} curr={currValue} prev={prev[key]} />
          {idx !== arr.length - 1 && <span>, </span>}
        </>
      ))}
      <span>{"}"}</span>
    </div>
  );
}

const prev = { name: "Aaron", age: 36, hair: "brown", food: "lasgna" };
const curr = { name: "Aaron", age: 37, hair: "brown", food: "sushi" };

export function App() {
  return <JSONDiff prev={prev} curr={curr} />;
}
