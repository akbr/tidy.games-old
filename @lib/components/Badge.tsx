import { ComponentChildren } from "preact";
import { Twemoji } from "./Twemoji";
import { Tooltip } from "./Tooltip";

type BadgeProps = {
  avatar: string;
  size?: number;
  name?: string;
  tr?: ComponentChildren;
  tl?: ComponentChildren;
  info?: ComponentChildren;
  say?: {
    dir: "left" | "right" | "top" | "bottom";
    content: ComponentChildren;
  } | null;
};

export const Badge = ({
  avatar,
  size = 36,
  name,
  tr,
  tl,
  info,
  say,
}: BadgeProps) => {
  return (
    <div
      class="relative inline-flex flex-col items-center"
      style={{
        filter: "drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.3))",
      }}
    >
      {say && <Tooltip dir={say.dir}>{say.content}</Tooltip>}
      {tl && (
        <div
          class="absolute top-0 left-0"
          style={{ transform: "translate(-4px, calc(-40%))" }}
        >
          {tl}
        </div>
      )}
      {tr && (
        <div
          class="absolute top-0 right-0"
          style={{ transform: "translate(4px, calc(-40%))" }}
        >
          {tr}
        </div>
      )}
      {info && (
        <div
          class="absolute whitespace-nowrap"
          style={{
            top: "calc(103%)",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {info}
        </div>
      )}
      <Twemoji char={avatar} size={size} />
      {name && (
        <div
          class="translate-y-[-2px] text-white bg-blue-600 text-sm"
          style={{
            "clip-path":
              "polygon(100% 0, 90% 50%, 100% 100%, 0% 100%, 10% 50%, 0% 0%)",
            padding: "2px 6px 1px 6px",
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
};
