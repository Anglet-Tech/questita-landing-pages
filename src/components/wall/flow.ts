/*
 * Scroll triggers on the wall never measure elements inside a poster: posters
 * are sticky and transformed while they are pasted, so their on-screen boxes
 * lie. Instead every trigger hangs off the poster's flow anchor (a zero-height
 * span right before it) plus the element's layout offset inside the poster,
 * which transforms and sticking do not change.
 */

export function posterOf(el: Element): HTMLElement {
  return el.closest<HTMLElement>("[data-poster]")!;
}

export function anchorOf(el: Element): HTMLElement {
  return posterOf(el).previousElementSibling as HTMLElement;
}

/** Layout distance from the top of `ancestor` to the top of `el`. */
export function offsetIn(el: HTMLElement, ancestor: HTMLElement): number {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== ancestor) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return y;
}

/** ScrollTrigger vars: fires when the top of `el` reaches `at` of the viewport. */
export function flowTrigger(el: HTMLElement, at = "85%") {
  return {
    trigger: anchorOf(el),
    start: () => `top+=${offsetIn(el, posterOf(el))} ${at}`,
    invalidateOnRefresh: true,
  };
}
