import { Twemoji } from "@shared/components/Twemoji";
import { playerColors } from "@shared/ui";

export type BadgeProps = {
  player: number;
  avatar?: string;
  name?: string | null;
  size?: number;
};

export const getGlowStyle = (player: number) => {
  const [glowColor] = playerColors[player];
  return `drop-shadow(0px 0px 4px ${glowColor})`;
};

export const Badge = (props: BadgeProps) => {
  const { player, avatar = "👤", name = `PL${player}`, size = 36 } = props;

  return (
    <section data-type="badge" class="inline-flex flex-col">
      <div style={{ filter: getGlowStyle(player) }}>
        <Twemoji char={avatar} size={size} />
      </div>
      {name ? (
        <div class="">
          <Name name={name} player={player} />
        </div>
      ) : null}
    </section>
  );
};

export function Name({ name, player }: { name: string; player: number }) {
  const [backgroundColor, color] = playerColors[player];

  return (
    <div
      class="text-sm inline text-center rounded-md p-1"
      style={{
        backgroundColor,
        color,
        filter: "drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.6))",
      }}
    >
      {name}
    </div>
  );
}
