import type { ErrorsProps } from "./types";
import { ErrorReciever } from "@lib/components/ErrorReceiver";

export function Errors({ err }: ErrorsProps) {
  return (
    <div class="absolute bottom-4 left-4">
      <ErrorReciever err={err} />
    </div>
  );
}
