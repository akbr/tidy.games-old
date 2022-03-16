import { animation } from "twind/css";

export const fadeIn = animation("400ms", {
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});
