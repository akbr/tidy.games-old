/**
const Card = styled("div")`
  display: inline-block;
  background-color: #fffff4;
  padding: 4px;
  border-radius: 2px;
`;

const Icon = styled("svg")`
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
`;

//type Suit = "c" | "d" | "h" | "s" | "j" | "w";
type MiniCardProps = {
  suit: string;
  value?: string | number;
};

export const MiniCard = ({ suit, value }: MiniCardProps) => {
  //@ts-ignore
  const suitColor = colors[suit];
  //@ts-ignore
  const valueColor = typeof value === "string" ? colors[value] : colors[suit];

  return (
    <Card>
      <Icon style={{ fill: suitColor }}>
        <use href={`#card-${suit}`}></use>
      </Icon>
      {value !== undefined ? (
        <Icon
          style={{
            fill: valueColor,
          }}
        >
          <use href={`#card-${value}`}></use>
        </Icon>
      ) : null}
    </Card>
  );
};

 */
