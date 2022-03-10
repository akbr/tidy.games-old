import { values, suits, colors } from "./core";

export const MiniCard = ({
  suit,
  value,
  color = colors[suit] || "black",
}: {
  suit: string;
  value: number | null;
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
