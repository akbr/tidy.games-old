import { useEffect, useState } from "preact/hooks";

import { Badge } from "@shared/components/Badge";
import { Field } from "@shared/components/Field";
import { Twemoji } from "@shared/components/Twemoji";

import { AppProps } from "../types";
import type { Spec } from "../../core";
import type { SocketMeta } from "../../server";
import { avatars } from "../../server/";
import { useEmitter } from "@lib/emitter";

export const getRoomURL = (roomId = "") => {
  const host = window.location.hostname.replace("www.", "");
  const port = location.port === "" ? "" : `:${location.port}`;
  const path = window.location.pathname;
  const hash = `#${roomId}`;

  return [location.protocol, "//", host, port, path, hash].join("");
};

export default function DefaultLobby<S extends Spec>({ client }: AppProps<S>) {
  const { id, playerIndex } = useEmitter(client.appEmitter, (x) => x.loc);
  const sockets = useEmitter(client.appEmitter, (x) => x.sockets);

  const { cart, serverActions } = client;
  const { addBot, start, leave } = serverActions;

  const numPlayers = sockets.length;

  const [options, setOptions] = useState(cart.getOptions(numPlayers));

  useEffect(() => {
    setOptions(cart.getOptions(numPlayers, options));
  }, [numPlayers]);

  const isAdmin = playerIndex === 0;
  const gameReady = sockets.length >= cart.meta.players[0];

  /**
   *   const updateOptions = (nextOptions: S["options"]) =>
    setOptions(cart.getOptions(numPlayers, nextOptions));
          {OptionsView && (
            <Field legend="Options">
              <OptionsView
                options={options}
                updateOptions={updateOptions}
                numPlayers={numPlayers}
              />
            </Field>
          )}
 */

  return (
    <div class="flex flex-col h-full justify-center items-center gap-4">
      <div class="text-center font-bold text-[64px] mb-2">{cart.meta.name}</div>
      <ShareLink roomId={id} />
      <Field legend={`🪑 Players (${sockets.length}/${cart.meta.players[1]})`}>
        <div class="flex justify-center gap-1">
          {sockets.map((player, idx) => {
            player = player || {};
            let isPlayer = idx === playerIndex;
            let style = {
              backgroundColor: isPlayer ? "rgba(252,255,164, 0.4)" : "",
              borderRadius: "4px",
              cursor: isPlayer ? "pointer" : "",
            };
            return (
              <div
                class={`flex flex-col gap-1 p-[6px] animate-fadeIn text-center`}
                style={style}
                onClick={() => {
                  //if (isPlayer) setDialog(SetMetaDialog);
                }}
              >
                <Badge {...{ ...player, player: idx }}></Badge>
                {isPlayer && (
                  <div class="text-center text-base mt-1 -mb-1">YOU</div>
                )}
              </div>
            );
          })}
        </div>
      </Field>
      {isAdmin ? (
        <>
          <button onClick={() => start({ options })} disabled={!gameReady}>
            {gameReady ? "Start game" : "Waiting for players..."}
          </button>
          {addBot && <button onClick={() => addBot()}>Add bot</button>}
        </>
      ) : (
        <div>The game creator will start the game. Hang tight!</div>
      )}
      <button onClick={() => leave()}>Leave</button>
    </div>
  );
}

function ShareLink({ roomId }: { roomId: string }) {
  const [status, setStatus] = useState("📋");
  useEffect(() => {
    if (status === "✅") {
      setTimeout(() => {
        setStatus("📋");
      }, 2000);
    }
  });

  return (
    <Field legend="🖇️ Share link">
      <div
        class="cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(getRoomURL(roomId)).then(() => {
            setStatus("✅");
          });
        }}
      >
        {getRoomURL(roomId)}{" "}
        <div class="inline-block animate-bounce">
          <Twemoji char={status} size={18} align={"text-top"} />
        </div>
      </div>
    </Field>
  );
}

function SetMetaDialog<S extends Spec>({ client, setDialog }: AppProps<S>) {
  const { playerIndex, id } = useEmitter(client.appEmitter, (x) => x.loc);
  const sockets = useEmitter(client.appEmitter, (x) => x.sockets);

  if (id === "") {
    setDialog(null);
    return null;
  }

  return (
    <SetMeta
      meta={sockets[playerIndex]}
      set={client.serverActions.setMeta}
      close={() => setDialog(null)}
    />
  );
}

type MetaDialogProps = {
  meta: SocketMeta | null;
  set: (meta: SocketMeta) => void;
  close: () => void;
};

function SetMeta({ meta, set, close }: MetaDialogProps) {
  if (!meta) meta = {};
  const [name, setName] = useState(meta.name);
  const [avatar, setAvatar] = useState(meta.avatar || avatars[0]);

  return (
    <div class="flex flex-col gap-2 text-center">
      <div>
        <label for="name">Initials: </label>
        <input
          type="text"
          id="name"
          name="name"
          size={3}
          onInput={(e: any) => {
            let modName = e.target.value.substr(0, 3).toUpperCase();
            setName(modName);
            e.target.value = modName;
          }}
          value={name}
        />
      </div>
      <div>
        <label for="avatar">Avatar: </label>
        <select
          class="text-2xl"
          value={avatar}
          onChange={(e: any) => {
            setAvatar(e.target.value);
          }}
        >
          {avatars.map((a) => (
            <option value={a}>{a}</option>
          ))}
        </select>
      </div>
      <button
        onClick={() => {
          set({ name, avatar });
          close();
        }}
      >
        Apply
      </button>
    </div>
  );
}
