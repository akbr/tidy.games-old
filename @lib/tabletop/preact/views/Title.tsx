import type { Spec } from "@lib/tabletop/core/spec";
import { Twemoji } from "@shared/components/Twemoji";

import { useClientTitle } from "../createHooks";
import { MetaViewProps } from "../types";
import { Container } from "./Container";

export function Title<S extends Spec>({
  viewInputs,
  appProps,
}: MetaViewProps<S>) {
  const { client } = appProps;
  const { buttonClass, TitleDisplay, FooterDisplay } = viewInputs;

  const connected = useClientTitle(client)((x) => x.connected);

  const {
    meta: { name },
  } = client.game;
  const { join } = client.serverActions;

  function Buttons() {
    return (
      <section
        id="tabletop-titleContent"
        class="flex flex-col justify-center gap-2"
      >
        <button
          onClick={() => join()}
          disabled={!connected}
          class={buttonClass}
        >
          <Twemoji char={"✨"} size={24} />
          &nbsp;
          <span>Create game</span>
        </button>
        <h3 class="font-italic font-light"></h3>
        <button
          onClick={() => {
            const id = prompt("Enter a room code:");
            if (!id) return;
            client.serverActions.join({ id: id.toUpperCase() });
          }}
          class={buttonClass}
          disabled={!connected}
        >
          <Twemoji char={"🚪"} size={24} />
          &nbsp;
          <span>Join game</span>
        </button>
      </section>
    );
  }

  return (
    <Container>
      <TitleDisplay title={name} />
      <Buttons />
      <FooterDisplay title={name} />
    </Container>
  );
}
