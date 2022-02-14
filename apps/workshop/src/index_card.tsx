import "preact/debug";

import { h, Fragment, render, FunctionComponent } from "preact";
import { useRefreshOnResize } from "@lib/hooks";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
// -------------------------------
import { createStore } from "@lib/state/store";

import { getHandHeight } from "@lib/layouts/hand";

import { TrickSection } from "@lib/components/TrickSection";
import { HandSection } from "@lib/components/HandSection";
import { Card } from "@lib/components/cards";

import { HandCard } from "./HandCard";
const store = createStore({ hand: [] as string[], trick: [] as string[] });
const { play } = store.createActions((set, get) => ({
  play: (id: string) => {
    const { hand, trick } = get();
    set({ hand: hand.filter((x) => x !== id), trick: [...trick, id] });
  },
}));

const Table: FunctionComponent<{ heightOffset: number }> = ({
  heightOffset,
  children,
}) => {
  useRefreshOnResize();
  return (
    <section
      id="table"
      class="absolute w-full bg-green-900"
      style={{ height: `calc(100% - ${heightOffset}px)` }}
    >
      {children}
    </section>
  );
};

const TrickCard = ({ cardId }: { cardId: string }) => (
  <div key={cardId} class="absolute">
    <Card card={cardId} />
  </div>
);

store.subscribe(({ hand, trick }) => {
  const heightOffset = getHandHeight(
    hand.length || 1,
    document.body.getBoundingClientRect()
  );

  render(
    <Table heightOffset={heightOffset}>
      <TrickSection numPlayers={4} leadPlayer={0} perspective={0}>
        {trick.map((cardId) => (
          <TrickCard key={cardId} cardId={cardId} />
        ))}
      </TrickSection>

      <HandSection>
        {hand.map((cardId) => (
          <HandCard key={cardId} play={play} card={cardId} />
        ))}
      </HandSection>
    </Table>,
    document.getElementById("root")!
  );
});

store.set({
  hand: [
    "2|c",
    "3|c",
    "4|c",
    "5|c",
    "6|c",
    "7|c",
    "8|c",
    "9|c",
    "2|d",
    "3|d",
    "4|d",
    "5|d",
    "6|d",
    "7|d",
    "8|d",
    "9|d",
  ],
  trick: [],
});

//render(<WIP />, document.getElementById("app")!);
