import { useRef } from "preact/hooks";
import { styled } from "goober";
import { Button, Throb } from "@lib/components/common";

const Outer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  max-width: 175px;
`;

type TrumpInputProps = {
  active: boolean;
  selectTrump: (trump: string) => void;
};

export function TrumpInput({ active, selectTrump }: TrumpInputProps) {
  const ref = useRef<HTMLSelectElement>(null);

  if (!active) {
    return <Throb>Waiting for dealer to choose trump...</Throb>;
  }

  return (
    <Outer>
      <h3>Select trump:</h3>
      <select ref={ref} name="suits" style={{ maxWidth: "100px" }}>
        <option value="c">Clubs ♣</option>
        <option value="d">Diamonds ♦</option>
        <option value="h">Hearts ♥</option>
        <option value="s">Spades ♠</option>
      </select>
      <Button
        onClick={() => {
          //@ts-ignore
          selectTrump(ref.current.value);
        }}
      >
        Submit
      </Button>
    </Outer>
  );
}
