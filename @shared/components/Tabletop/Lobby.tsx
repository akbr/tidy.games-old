import type { Spec } from "@lib/tabletop";
import type { SocketMeta } from "@lib/tabletop/roomServer";
import type { LobbyProps } from "@lib/tabletop/client";

import avatars from "@lib/tabletop/roomServer/avatars";

import { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { OptionsView, OptionsWrapper } from "./OptionsView";
import { Badge } from "@shared/components/Badge";
import { DialogOf } from "@shared/components/DialogOf";
import { Field } from "@shared/components/Field";
import { Twemoji } from "../Twemoji";
import { getRoomURL } from "@shared/browser";
import { is } from "@lib/compare/is";

export type LobbyViewProps<S extends Spec> = LobbyProps<S> & {
  Options?: OptionsView<S>;
};

export const Lobby = <S extends Spec>(props: LobbyViewProps<S>) => {
  const { cart, room, controls, Options } = props;
  const numPlayers = room.seats.length;

  const [options, setOptionsState] = useState(
    cart.setOptions(numPlayers, undefined)
  );
  const set = (options: S["options"]) =>
    setOptionsState(cart.setOptions(numPlayers, options));

  const isAdmin = room.player === 0;
  const gameReady = room.seats.length >= cart.meta.players[0];

  return (
    <div class="flex flex-col h-full justify-center items-center gap-4">
      <div class="text-center font-bold text-[64px] mb-2">{cart.meta.name}</div>
      <ShareLink roomId={room.id} />
      <PlayerDisplay {...props} />
      {Options && isAdmin ? (
        <div class="max-w-[300px]">
          <Field legend="⚙️ Options">
            <OptionsWrapper
              OptionsView={Options}
              numPlayers={room.seats.length}
              setOptions={set}
              options={options}
            />
          </Field>
        </div>
      ) : null}
      {isAdmin ? (
        <>
          <button
            onClick={() => controls.server.start(options)}
            disabled={!gameReady}
          >
            {gameReady ? "Start game" : "Waiting for players..."}
          </button>
          {!!props.cart.botFn && (
            <button onClick={() => controls.server.addBot()}>Add bot</button>
          )}
        </>
      ) : (
        <div>The game creator will start the game. Hang tight!</div>
      )}
      <button onClick={() => controls.server.leave()}>Leave</button>
    </div>
  );
};

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

function PlayerDisplay<S extends Spec>({
  room,
  cart,
  controls,
}: LobbyViewProps<S>) {
  const [Dialog, setDialog] =
    useState<FunctionalComponent<MetaDialogProps> | null>(null);

  return (
    <>
      <Field
        legend={`🪑 Players (${room.seats.length}/${cart.meta.players[1]})`}
      >
        <div class="flex justify-center gap-1">
          {room.seats.map((player, idx) => {
            if (!player) return;
            let isPlayer = idx === room.player;
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
                  if (isPlayer) setDialog(() => SetMeta);
                }}
              >
                <Badge {...{ ...player, player: idx }}></Badge>
                {isPlayer && (
                  <>
                    <div class="text-center text-base mt-1 -mb-1">YOU</div>
                    {is.undefined(player.avatar) && (
                      <div class={`animate-ping`}>
                        <Twemoji char={"⚙️"} size={18} />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Field>
      {Dialog && (
        <DialogOf close={() => setDialog(null)}>
          <Dialog
            close={() => setDialog(null)}
            meta={room.seats[room.player]!}
            set={controls.server.setMeta}
          />
        </DialogOf>
      )}
    </>
  );
}

type MetaDialogProps = {
  meta?: SocketMeta;
  set: (meta: SocketMeta) => void;
  close: () => void;
};

function SetMeta({ meta = {}, set, close }: MetaDialogProps) {
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
