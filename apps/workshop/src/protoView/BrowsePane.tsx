const Controls = ({
  idx,
  length,
  set,
}: {
  idx: number;
  length: number;
  set: (n: number) => void;
}) => {
  const atMin = idx === 0;
  const atMax = idx === length - 1;

  return (
    <div>
      <button disabled={atMin} onClick={() => set(0)}>
        {"<<"}
      </button>
      <button disabled={atMin} onClick={() => set(idx - 1)}>
        {"<"}
      </button>
      <div class="inline-block">
        {idx}/{length - 1}
      </div>
      <button disabled={atMax} onClick={() => set(idx + 1)}>
        {">"}
      </button>
      <button disabled={atMax} onClick={() => set(length - 1)}>
        {">>"}
      </button>
    </div>
  );
};
