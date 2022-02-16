import { render, h } from "preact";
import { tw } from "twind";

export const App = ({ num }: { num: number }) => {
  const s = tw`text-white m-2`;
  return <div class={s}>{num}!!!!</div>;
};
