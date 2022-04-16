import { render, h } from "preact";

import { avatars } from "@shared/ui";
import { Badge } from "@shared/components/Badge";
import { SpeechBubble } from "@shared/components/SpeechBubble";
import { getPosition } from "@lib/stylus";

function WizBadge() {
  return (
    <div class="relative inline-block text-center">
      <Badge player={0} avatar={avatars[0]} />
      <div
        class="absolute"
        style={getPosition({ top: "100%", left: "50%", x: "-50%", y: 12 })}
      >
        <SpeechBubble dir="top">
          <div class="whitespace-nowrap">Hi from fox!</div>
        </SpeechBubble>
      </div>
    </div>
  );
}

function Test() {
  return (
    <div class="absolute" style={getPosition({ x: 200, y: 200 })}>
      <WizBadge />
    </div>
  );
}

render(h(Test, {}, null), document.getElementById("app")!);
