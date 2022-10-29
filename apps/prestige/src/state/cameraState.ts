import { Camera, panCamera } from "@lib/camera";
import {
  Subscribable,
  createSubscribable,
  createActions,
} from "@lib/subscribable";

export const createCameraState = () =>
  createSubscribable<Camera>({ x: 0, y: 0, z: 1 });

export const createCameraActions = (cameraStore: Subscribable<Camera>) =>
  createActions(cameraStore, (set, get) => ({
    pan: (dx: number, dy: number) => set(panCamera(get(), dx, dy)),
  }));
