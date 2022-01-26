import { styled, keyframes } from "goober";

export const Fieldset = styled("fieldset")`
  display: flex;
  align-items: center;
  padding: 1.5em;
  border-radius: 1em;
  background-color: rgba(0, 0, 0, 0.15);
  border: 2px solid #999;
`;

export const EmojiButton = styled("button")`
  font-size: 2em;
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
`;

const ButtonBase = styled("button")`
  padding: 0;
  border: none;
  font: inherit;
  color: inherit;
  background-color: transparent;
  cursor: pointer;
`;

export const Button = styled(ButtonBase)`
  padding: 12px;
  color: white;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
  text-transform: uppercase;
  background-size: 100% auto;
  background-image: linear-gradient(to right, mediumblue 0%, blue 50%);
  background-position: right center;
  border-radius: 12px;
  font-size: 1em;
`;

export const throb = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.15);
  }
`;
export const Throb = styled("div")`
  animation: ${throb} 1s alternate infinite;
`;

export const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;
export const Appear = styled("div")`
  animation: ${fadeIn} 750ms;
`;
