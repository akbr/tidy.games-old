import { Camera, panCamera } from "@lib/camera";
import {
  createSubscribable,
  createUseSubscribable,
  createActions,
} from "@lib/subscribable";

export const cameraStore = createSubscribable<Camera>({ x: 0, y: 0, z: 1 });
export const actions = createActions(cameraStore, (set, get) => ({
  pan: (dx: number, dy: number) => set(panCamera(get(), dx, dy)),
}));

export const useCamera = createUseSubscribable(cameraStore);
