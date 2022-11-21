export function getNearestDimensions($el: Element): number[] {
  const rect = $el.parentElement!.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return [rect.width, rect.height];
  if ($el.parentElement) return getNearestDimensions($el.parentElement);
  return [rect.width, rect.height];
}
