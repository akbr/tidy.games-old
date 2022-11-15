import { useRefreshOnResize } from "@lib/hooks";
import { Spec } from "@lib/tabletop/core/spec";
import { AppViews } from "./Root";
import type { GameProps } from "./types";

export function SideWrapper<S extends Spec>({
  props,
  SideView,
}: {
  props: GameProps<S>;
  SideView: NonNullable<AppViews<S>["Side"]>;
}) {
  useRefreshOnResize();
  const { width } = document.body.getBoundingClientRect();
  return width > 1200 ? (
    <div class="flex justify-center items-center p-6">
      <SideView {...props} />
    </div>
  ) : null;
}

export default SideWrapper;
