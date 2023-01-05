import "@shared/base.css";
import "./sandbox.css";

import { render } from "preact";
import { Twemoji } from "@shared/components/Twemoji";
import { randomBetween, randomFromArray } from "@lib/random";
import { clamp } from "@lib/gfx";

const t = (x: number, y: number) => `calc(${x}px - 50%) calc(${y}px - 50%)`;
const icons = ["🪨", "💎", "🌟"];

function App() {
  const [w, h] = [600, 600];

  return (
    <div class="h-full bg-black p-8">
      <div class="w-[600px] h-[600px]" style={{ border: "2px dashed white" }}>
        <div class="absolute" style={{ translate: t(w / 2, h / 2) }}>
          <Twemoji char="🌍" size={128} />
        </div>
        {Array.from({ length: 12 }).map(() => {
          const a = randomBetween(0, 360);
          const x =
            w / 2 +
            Math.cos(a * (Math.PI / 180)) * (randomBetween(0, 180) + 100);
          const y =
            h / 2 +
            Math.sin(a * (Math.PI / 180)) * (randomBetween(0, 180) + 100);
          return (
            <div
              class="absolute"
              style={{
                translate: t(x, y),
                rotate: `${a - 270}deg`,
              }}
            >
              <Twemoji char={randomFromArray(icons)} size={24} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

render(<App />, document.body);
