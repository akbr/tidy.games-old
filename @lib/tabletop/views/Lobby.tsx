import { Badge } from "@lib/components/Badge";
import { Spec } from "@lib/tabletop/types";
import { LobbyProps } from "../client";

export const Lobby = <S extends Spec>({ room, controls }: LobbyProps<S>) => {
  const url = window.location.host + "/#" + room.id;
  const isAdmin = room.player === 0;

  return (
    <div class="flex flex-col items-center gap-4 mt-6">
      <h1>Lobby</h1>

      <div class="animate-bounce">Waiting for players...</div>

      <fieldset>
        <legend>⚡ Direct link:</legend>
        <div class="text-center">
          <input
            readonly
            size={url.length - 2}
            type={"text"}
            value={url}
            onClick={(e: any) => {
              navigator.clipboard.writeText(e.target.value);
            }}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend>Players in room:</legend>
        {room.seats.map((player, idx) => {
          let isPlayer = idx === room.player;
          let style = {
            backgroundColor: isPlayer ? "rgba(252,255,164, 0.4)" : "",
            padding: "8px",
            borderRadius: "4px",
          };
          return (
            <div style={style}>
              <Badge {...player}></Badge>
              {isPlayer && <div class="text-center text-base">YOU</div>}
            </div>
          );
        })}
      </fieldset>
      {isAdmin ? (
        <>
          {
            <button onClick={() => controls.server.addBot(null)}>
              Add bot
            </button>
          }
          {room.seats.length > 1 && (
            <button onClick={() => controls.server.start(null)}>Start</button>
          )}
        </>
      ) : (
        <div>The game creator will start the game. Hang tight!</div>
      )}
    </div>
  );
};
