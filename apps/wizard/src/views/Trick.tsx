import { TrickSection, TrickProps } from "@lib/components/TrickSection";
import { Card } from "@lib/components/cards/";

const TrickCard = ({ cardId }: { cardId: string }) => (
  <div key={cardId} class="absolute">
    <Card card={cardId} />
  </div>
);

export const Trick = ({
  trick,
  ...trickProps
}: TrickProps & { trick: string[] }) => (
  <TrickSection {...trickProps}>
    {trick.map((cardId) => (
      <TrickCard key={cardId} cardId={cardId} />
    ))}
  </TrickSection>
);
