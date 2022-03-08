import { useRef } from "preact/hooks";

type TrumpInputProps = {
  select: (trump: string) => void;
};

export function SelectInput({ select }: TrumpInputProps) {
  const ref = useRef<HTMLSelectElement>(null);

  return (
    <div class="flex flex-col items-center text-center gap-[16px] max-w-[175px]">
      <h3>Select trump:</h3>
      <select ref={ref} name="suits" style={{ maxWidth: "100px" }}>
        <option value="c">Clubs ♣</option>
        <option value="d">Diamonds ♦</option>
        <option value="h">Hearts ♥</option>
        <option value="s">Spades ♠</option>
      </select>
      <button
        onClick={() => {
          //@ts-ignore
          select(ref.current.value);
        }}
      >
        Submit
      </button>
    </div>
  );
}
