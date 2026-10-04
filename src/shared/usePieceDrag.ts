import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
type Options<T> = {
  canDrag: (source: T) => boolean;
  onStart?: (source: T) => void;
  onDrop: (source: T, target: HTMLElement | SVGElement | null) => boolean;
  elements?: (
    source: T,
    element: HTMLElement | SVGElement,
  ) => (HTMLElement | SVGElement)[];
};
export function usePieceDrag<T>(options: Options<T>) {
  const current = useRef(options);
  current.current = options;
  const cleanup = useRef<(() => void) | null>(null),
    blocked = useRef(false),
    resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      cleanup.current?.();
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );
  const bind = (source: T) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLElement | SVGElement>) => {
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        !current.current.canDrag(source)
      )
        return;
      cleanup.current?.();
      const element = event.currentTarget,
        id = event.pointerId,
        x = event.clientX,
        y = event.clientY;
      let ghost: HTMLDivElement | null = null,
        originals: (HTMLElement | SVGElement)[] = [],
        highlight: HTMLElement | SVGElement | null = null;
      const create = () => {
        originals = current.current.elements?.(source, element) || [element];
        const rects = originals.map((e) => e.getBoundingClientRect()),
          first = rects[0];
        ghost = document.createElement("div");
        ghost.className = "piece-drag-ghost";
        ghost.setAttribute("aria-hidden", "true");
        ghost.inert = true;
        ghost.style.width = first.width + "px";
        ghost.style.height =
          Math.max(...rects.map((r) => r.bottom - first.top)) + "px";
        originals.forEach((e, i) => {
          let clone = e.cloneNode(true) as HTMLElement | SVGElement;
          if (e instanceof SVGGraphicsElement) {
            const box = e.getBBox();
            const svg = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "svg",
            );
            svg.setAttribute(
              "viewBox",
              `${box.x} ${box.y} ${box.width} ${box.height}`,
            );
            svg.appendChild(clone);
            clone = svg;
          }
          clone.removeAttribute("id");
          clone.removeAttribute("aria-label");
          clone.style.position = "absolute";
          clone.style.margin = "0";
          clone.style.left = rects[i].left - first.left + "px";
          clone.style.top = rects[i].top - first.top + "px";
          clone.style.width = rects[i].width + "px";
          clone.style.height = rects[i].height + "px";
          clone.classList.remove("selected");
          ghost!.appendChild(clone);
          e.classList.add("being-dragged");
        });
        ghost.dataset.offsetX = String(x - first.left);
        ghost.dataset.offsetY = String(y - first.top);
        document.body.appendChild(ghost);
        document.body.classList.add("dragging-piece");
        current.current.onStart?.(source);
      };
      const point = (e: PointerEvent) => {
        if (e.pointerId !== id) return;
        if (!ghost && Math.hypot(e.clientX - x, e.clientY - y) < 6) return;
        if (!ghost) create();
        e.preventDefault();
        ghost!.style.left = e.clientX - Number(ghost!.dataset.offsetX) + "px";
        ghost!.style.top = e.clientY - Number(ghost!.dataset.offsetY) + "px";
        highlight?.classList.remove("drop-hover");
        highlight =
          document
            .elementFromPoint(e.clientX, e.clientY)
            ?.closest<HTMLElement | SVGElement>("[data-drop]") || null;
        highlight?.classList.add("drop-hover");
      };
      const finish = (e: PointerEvent) => {
        if (e.pointerId !== id) return;
        if (ghost) {
          blocked.current = true;
          if (resetTimer.current) clearTimeout(resetTimer.current);
          resetTimer.current = setTimeout(() => (blocked.current = false), 300);
          const target =
            document
              .elementFromPoint(e.clientX, e.clientY)
              ?.closest<HTMLElement | SVGElement>("[data-drop]") || null;
          current.current.onDrop(source, target);
        }
        clear();
      };
      const cancel = () => clear();
      const escape = (e: KeyboardEvent) => {
        if (e.key === "Escape") cancel();
      };
      const clear = () => {
        window.removeEventListener("pointermove", point);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", cancel);
        window.removeEventListener("keydown", escape);
        highlight?.classList.remove("drop-hover");
        originals.forEach((e) => e.classList.remove("being-dragged"));
        ghost?.remove();
        document.body.classList.remove("dragging-piece");
        cleanup.current = null;
      };
      cleanup.current = clear;
      window.addEventListener("pointermove", point, { passive: false });
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", cancel);
      window.addEventListener("keydown", escape);
    },
  });
  return {
    bind,
    suppressClick: () => {
      if (!blocked.current) return false;
      blocked.current = false;
      return true;
    },
  };
}
