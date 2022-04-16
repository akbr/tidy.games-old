import { Twemoji } from "@shared/components/Twemoji";
import { playerColors } from "@shared/ui";

export type BadgeProps = {
  player: number;
  avatar?: string;
  name?: string;
  size?: number;
};

export const Badge = (props: BadgeProps) => {
  const { player, avatar = "👤", name = `PL${player}`, size = 36 } = props;

  const [backgroundColor, color] = playerColors[player];
  const vAvatar = (
    <div style={{ filter: `drop-shadow(0px 0px 4px ${backgroundColor})` }}>
      <Twemoji char={avatar} size={size} />
    </div>
  );

  const vName = (
    <div
      class="-mt-[6px] text-sm inline text-center rounded-md"
      style={{
        backgroundColor,
        color,
        filter: "drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.6))",
      }}
    >
      {name}
    </div>
  );

  return (
    <section data-type="badge" class="inline-flex flex-col">
      {vAvatar}
      {vName}
    </section>
  );
};
