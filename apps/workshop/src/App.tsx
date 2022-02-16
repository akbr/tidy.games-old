import { randomBetween } from "@lib/random";

export const App = ({ num }: { num: number }) => {
  return <h1 class={"text-white"}>{randomBetween(1, 2)}!!!!</h1>;
};
