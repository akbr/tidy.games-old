export function getNearestDimensions($el: Element): DOMRect {
  const rect = $el.parentElement!.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return rect;
  if ($el.parentElement) return getNearestDimensions($el.parentElement);
  return rect;
}
