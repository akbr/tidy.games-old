import { values, suits, colors } from "./glyphs";
import { memo } from "preact/compat";

export const splitCard = (cardId: string): [number, string] => {
  const split = cardId.split("|");
  return [parseInt(split[0], 10), split[1]];
};

const shadow = { filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5))" };
export const Card = memo(({ card }: { card: string }) => {
  const [value, suit] = splitCard(card) as [
    keyof typeof values,
    keyof typeof suits
  ];

  const color = colors[suit] || "black";
  const showValue = !["w", "j"].includes(suit);

  return (
    <div
      class="relative w-[80px] h-[112px] rounded-[8px] bg-[#fffff4]"
      style={shadow}
    >
      <div
        class="flex flex-col pt-[6px] pl-[2px] gap-[4px] w-[26px]"
        style={{ fill: color }}
      >
        {showValue && values[value] && values[value]!()}
        {suits[suit] && suits[suit]!()}
      </div>
      <div
        id="suit"
        class="absolute bottom-[6px] right-[2px] w-[54px]"
        style={{ fill: color }}
      >
        {suits[suit] && suits[suit]!()}
      </div>
    </div>
  );
});
export default Card;

export const MiniCard = ({
  suit,
  value,
  color = colors[suit] || "black",
}: {
  suit: keyof typeof suits;
  value: keyof typeof values | null;
  color?: string;
}) => {
  return (
    <div class="inline-block">
      <div class="bg-[#fffff4] rounded flex justify-center items-center p-[3px]">
        {value !== null && (
          <div class="w-4 h-4" style={{ fill: color }}>
            {values[value] && values[value]!()}
          </div>
        )}
        <div
          class="w-4 h-4"
          style={{
            fill: color,
          }}
        >
          {suits[suit] && suits[suit]!()}
        </div>
      </div>
    </div>
  );
};
