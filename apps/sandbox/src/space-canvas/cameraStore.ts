import { Camera, panCamera, Point, zoomCamera } from "@lib/camera";
import { createEmitter, createUseEmitter } from "@lib/emitter";
import { debounce } from "@lib/async/";

export function createCameraStore() {
  let panning = false;

  const cameraEmitter = createEmitter<Camera>({
    x: 0,
    y: 0,
    z: 1,
  });

  const donePanning = debounce(
    function donePanning() {
      cameraActions.setPanning(false);
    },
    200,
    false
  );

  const { get, next } = cameraEmitter;
  const cameraActions = {
    setPanning: (status: boolean) => {
      panning = status;
      next({ ...get() });
    },
    pan: (dx: number, dy: number) => {
      panning = true;
      next({ ...panCamera(get(), dx, dy) });
      //donePanning();
    },
    zoom: (point: Point, dz: number) => {
      panning = true;
      next({ ...zoomCamera(get(), point, dz) });
      //donePanning();
    },
  };

  const useCamera = createUseEmitter(cameraEmitter);

  return {
    cameraEmitter,
    cameraActions,
    useCamera,
  };
}
