import { Twemoji } from "../Twemoji";

export const Disconnected = () => {
  return (
    <div class="flex flex-col items-center gap-2 m-2">
      <div class="animate-spin">
        <Twemoji char={"🔌"} size={36} />
      </div>
      <div>Waiting for websocket connection...</div>
    </div>
  );
};
