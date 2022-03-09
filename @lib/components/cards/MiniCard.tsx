import { splitCard } from ".";
import { values, suits, colors } from "./core";

export const MiniCard = ({ card }: { card: string }) => {
  const [value, suit] = splitCard(card);
  const color = colors[suit] || "black";

  return (
    <div class="inline-block">
      <div class="bg-[#fffff4] rounded flex justify-center items-center p-[3px]">
        <div class="w-4 h-4" style={{ fill: color }}>
          {values[value] && values[value]!()}
        </div>
        {value !== undefined ? (
          <div
            class="w-4 h-4"
            style={{
              fill: color,
            }}
          >
            {suits[suit] && suits[suit]!()}
          </div>
        ) : null}
      </div>
    </div>
  );
};
