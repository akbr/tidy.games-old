import { css } from "goober";

export function html(htmlString: string) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstElementChild as HTMLElement;
}

const card = css`
  position: absolute;
  font-size: 8px;
  width: 10em;
  height: 14em;
  border-radius: 0.75em;
  background-color: #fffff4;
  box-shadow: 0 0.3em 0.8em rgba(0, 0, 0, 0.5);
  will-change: transform;
`;

const back = css`
  background-color: midnightBlue;
  width: 100%;
  height: 100%;
  border: 0.6em solid white;
  border-radius: 0.75em;
`;

const face = css`
  position: relative;
  height: 100%;
  overflow: hidden;
`;

const corner = css`
  margin-top: 0.175em;
  margin-left: 0.05em;
  font-size: 3.25em;
`;

const icon = css`
  display: block;
  width: 1em;
  height: 1em;
`;

const valueIcon = css`
  margin-bottom: 0.175em;
`;

const main = css`
  position: absolute;
  bottom: 0.14em;
  right: 0.03em;
  font-size: 6.75em;
`;

const BLACK = "black";
const RED = "#DC143C";
const BLUE = "blue";
export const colors = {
  c: BLACK,
  s: BLACK,
  d: RED,
  h: RED,
  w: BLUE,
  j: BLUE,
};

type CardProps = {
  suit: "c" | "s" | "d" | "h" | "w" | "j";
  value: number;
};

const backTemplate = () => `<div class="${back}"></div>`;

const faceTemplate = ({ suit, value }: CardProps) => {
  let color = colors[suit];
  let showValue = suit !== "w" && suit !== "j";

  return `<div class="${face}" style="fill: ${color};" >
      <div class="${corner}">
        ${
          showValue
            ? `<svg class="${icon} ${valueIcon}">
            <use href="#card-${value}"></use>
          </svg>`
            : ""
        }
        <svg class="${icon}">
          <use href="#card-${suit}"></use>
        </svg>
      </div>
      <div class="${main}">
        <svg class="${icon}">
          <use href="#card-${suit}"></use>
        </svg>
      </div>
    </div>`;
};

const cardTemplate = (props: CardProps | void) => {
  let innerTemplate = props ? faceTemplate(props) : backTemplate();
  let id = props ? `${props.value}|${props.suit}` : "";
  return `<div class="${card}" data-card-id="${id}">${innerTemplate}</div>`;
};

export const createCard = (props: CardProps | void) =>
  html(cardTemplate(props));

export const memoizedCreate = (() => {
  let memo: { [key: string]: HTMLElement } = {};
  return (cardId?: string) => {
    if (!cardId) return createCard();
    if (memo[cardId]) return memo[cardId];
    let [value, suit] = cardId.split("|");
    //@ts-ignore
    memo[cardId] = createCard({ suit, value });
    return memo[cardId];
  };
})();
