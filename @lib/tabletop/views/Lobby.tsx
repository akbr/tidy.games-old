import { Badge } from "@lib/components/Badge";
import { Spec } from "@lib/tabletop/types";
import { LobbyProps } from "../client";
import { OptionsView } from "./";
import { Disconnected } from "./Disconnected";

export const Lobby = <S extends Spec>({
  meta,
  room,
  controls,
  connected,
  Options,
}: LobbyProps<S> & { Options?: OptionsView<S> }) => {
  const url = window.location.host + "/#" + room.id;
  const isAdmin = room.player === 0;

  return (
    <div class="flex flex-col h-full justify-center items-center gap-4">
      <div class="text-center font-bold text-[64px]">{meta.name}</div>
      <h1>Lobby ({room.id})</h1>
      {connected ? (
        <>
          <div class="animate-bounce">Waiting for players...</div>

          <fieldset class="p-2">
            <legend>⚡ Direct link:</legend>
            <div class="text-center">
              <input
                class="cursor-pointer"
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
          <fieldset class="p-2">
            <legend>Players in room (up to {meta.players[1]}):</legend>
            <div class="flex justify-center">
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
            </div>
          </fieldset>
          {Options ? (
            <fieldset class="p-2 max-w-[300px]">
              <legend>Options:</legend>
              <Options />
            </fieldset>
          ) : null}
          {isAdmin ? (
            <>
              {
                <button onClick={() => controls.server.addBot(null)}>
                  Add bot
                </button>
              }

              <button
                disabled={room.seats.length < meta.players[0]}
                onClick={() => controls.server.start(null)}
              >
                Start
              </button>
            </>
          ) : (
            <div>The game creator will start the game. Hang tight!</div>
          )}

          <button onClick={() => controls.server.leave(null)}>Leave</button>
        </>
      ) : (
        <Disconnected />
      )}
    </div>
  );
};
