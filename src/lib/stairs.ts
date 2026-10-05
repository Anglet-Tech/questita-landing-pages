/**
 * Stepped "pixel wipe" clip-path that grows from the bottom-left corner.
 * p = 0 hides everything, p = 1 shows the full box. The front is a diagonal
 * staircase quantised to `steps` columns and rows.
 */
export function stairClip(p: number, steps = 10): string {
  if (p >= 1) return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const pts: string[] = ["0% 100%"];
  for (let i = 0; i < steps; i++) {
    const raw = 2 * p - (i + 1) / steps;
    const v = Math.max(0, Math.min(1, Math.ceil(raw * steps) / steps));
    const top = `${((1 - v) * 100).toFixed(2)}%`;
    pts.push(`${((i / steps) * 100).toFixed(2)}% ${top}`);
    pts.push(`${(((i + 1) / steps) * 100).toFixed(2)}% ${top}`);
  }
  pts.push("100% 100%");
  return `polygon(${pts.join(", ")})`;
}
