import { values, suits, colors } from "./core";
import { memo } from "preact/compat";

export const splitCard = (cardId: string): [number, string] => {
  const split = cardId.split("|");
  return [parseInt(split[0], 10), split[1]];
};

const shadow = { boxShadow: "0 4px 8px rgba(0,0,0,0.5)" };

export const Card = memo(({ card }: { card: string }) => {
  const [value, suit] = splitCard(card);

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
        class="absolute bottom-[6px] right-[2px] w-[54px]"
        style={{ fill: color }}
      >
        {suits[suit] && suits[suit]!()}
      </div>
    </div>
  );
});
