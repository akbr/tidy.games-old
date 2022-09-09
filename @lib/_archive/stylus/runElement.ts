import type { SingleFrame, MultiFrame, Options } from "./types";
import { getCommitStyles, setStyles, createAnimationTask } from "./utils";
import { convertFrameValues, convertOptionValues } from "./convertValues";
import { mungeTransforms } from "./mungeTransforms";

export function runElement(
  $el: Element,
  keyframes: SingleFrame | MultiFrame[],
  index: number,
  length: number,
  options?: Options
) {
  const transformString = ($el as HTMLElement).style.transform;

  const parseKeyframe = (keyframe: SingleFrame | MultiFrame) => {
    const withValues = convertFrameValues(keyframe, index, length);
    return mungeTransforms(withValues, transformString);
  };

  const parsedKeyframes = !Array.isArray(keyframes)
    ? parseKeyframe(keyframes)
    : keyframes.map(parseKeyframe);

  const lastKeyframe = Array.isArray(parsedKeyframes)
    ? parsedKeyframes[parsedKeyframes.length - 1]
    : parsedKeyframes;
  const commitStyle = getCommitStyles(lastKeyframe);

  if (!options) {
    setStyles($el, commitStyle);
    return;
  }

  const convertedOptions = convertOptionValues(options, index, length);

  return createAnimationTask(
    $el,
    parsedKeyframes,
    commitStyle,
    convertedOptions
  );
}
