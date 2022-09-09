import { animate } from "motion";

const timeKeys = ["duration", "delay", "endDelay"];

export const style = ((el: any, keyframes: any, options: any) => {
  options = options || { duration: 0 };
  timeKeys.forEach((key) => {
    if (options[key] > 16) options[key] = options[key]! / 1000;
  });
  return animate(el, keyframes, options);
}) as typeof animate;

export default style;
