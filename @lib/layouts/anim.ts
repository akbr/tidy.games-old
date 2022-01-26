import { randomBetween } from "@lib/random";
export const getWaggle = (amt: number, amt2: number) => {
  const getAmt = () => randomBetween(amt, amt2);
  return [0, getAmt(), 0, -getAmt(), 0, getAmt(), -getAmt() / 4].map(
    (rotate) => ({
      rotate,
    })
  );
};
