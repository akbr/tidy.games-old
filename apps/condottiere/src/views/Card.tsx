import { Twemoji } from "@shared/components/Twemoji";

const shadow = { filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5))" };
export const Card = ({ glyph }: { glyph: string }) => {
  return (
    <div
      class="relative w-[80px] h-[112px] rounded-[8px] bg-[#FCF5E5] text-black"
      style={shadow}
    >
      <div class="absolute top-[6px] left-[6px]">
        <Twemoji char={glyph} size={22} />
      </div>
      <div id="suit" class="absolute bottom-1 right-2">
        <Twemoji char={glyph} size={56} />
      </div>
    </div>
  );
};

export default Card;
