import { useCamera, useTable } from "../state";

export function Dev() {
  return (
    <>
      <EventList />
      <CameraStatus />
    </>
  );
}

function EventList() {
  const ticks = useTable((x) => x.ticks);
  const events = useTable((x) => x.events);
  const visibleEvents = useTable((x) => x.visibleEvents);

  if (!ticks) return null;

  return (
    <div class="absolute top-0 text-sm">
      <div>
        Tick {ticks.tick}/{ticks.numTicks}
      </div>
      <div class="font-bold">Events</div>
      {events.map((e) => {
        return (
          <div
            class={
              visibleEvents.indexOf(e) === -1 ? "opacity-50" : "opacity-100"
            }
            onClick={() => {
              console.log(e);
            }}
          >
            {e.type} @ {e.ticks}{" "}
          </div>
        );
      })}
    </div>
  );
}

function CameraStatus() {
  const camera = useCamera((x) => x);
  return (
    <div class="absolute bottom-0 text-sm">
      <div class="max-w-[100px]">{JSON.stringify(camera)}</div>
    </div>
  );
}
