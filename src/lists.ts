namespace Opti {

export function addEventListenerEnum <IterableClass extends Iterable<T>, T extends EventTarget>(
  this: IterableClass,
  type: keyof EventMapOf<T>,
  listener: (this: T, e: EventMapOf<T>[keyof EventMapOf<T>]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  for (const el of this) {
    if (el instanceof Element) {
      el.addEventListener(type as string, listener as EventListener, options);
    }
  }
}

export function addClassList <T extends Element>(this: Iterable<T>, elClass: string): void {
  for (const el of this) {
    el.addClass(elClass);
  }
};

export function removeClassList <T extends Element>(this: Iterable<T>, elClass: string): void {
  for (const el of this) {
    el.removeClass(elClass);
  }
};

export function toggleClassList <T extends Element>(this: Iterable<T>, elClass: string): void {
  for (const el of this) {
    el.toggleClass(elClass);
  }
};

}