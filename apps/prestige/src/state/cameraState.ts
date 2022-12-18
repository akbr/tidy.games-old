import { Camera, panCamera, Point, zoomCamera } from "@lib/camera";
import { createEmitter, Emitter } from "@lib/emitter";
import { createSetFn } from "@lib/emitter/utils";

export const createCameraState = () =>
  createEmitter<Camera>({ x: 0, y: 0, z: 1 });

export const createCameraActions = (cameraStore: Emitter<Camera>) => {
  const set = createSetFn(cameraStore);
  const { get } = cameraStore;
  return {
    pan: (dx: number, dy: number) => set(panCamera(get(), dx, dy)),
    zoom: (point: Point, dz: number) => set(zoomCamera(get(), point, dz)),
  };
};
