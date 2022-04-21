import { Spec } from "@lib/tabletop/";
import { ServerApi } from "@lib/tabletop/roomServer";

import { createClient } from "@lib/tabletop/client";
import attachHashListener from "@lib/tabletop/client/attachments/hashListener";
import attachLocalStorageMemory from "@lib/tabletop/client/attachments/localStorageMeta";

import {
  initTabletopViews,
  InitAppProps,
} from "@shared/components/Tabletop/initTabletopViews";

export function initTabletop<S extends Spec>(
  props: Omit<InitAppProps<S>, "client">,
  serverOrURL: string | ServerApi<S>
) {
  const client = createClient(serverOrURL, props.cart, props.dev);
  attachLocalStorageMemory(client);

  initTabletopViews({ ...props, client });

  client.update();

  // This must come *after* initial forced update (to allow for initial /#game access)
  attachHashListener(client);

  return client;
}
