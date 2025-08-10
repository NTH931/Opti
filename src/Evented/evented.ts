namespace Opti {
  export class Evented<T extends Record<string, unknown[][]> = {}> {
    private _evmap: { [K in keyof T]?: Callbacks<T[K][number]> } = {};

    on<K extends string & keyof any, L extends unknown[]>(
      ev: K,
      callback: (...args: L) => void
    ): asserts this is EventEmitter<T & { [P in K]: K extends keyof T ? [...T[K], L] : [L] }> {
      const map = this._evmap ?? [];
      map[ev] = [...(map[ev] || []), callback] as Callbacks<any>;
    }

    off<K extends keyof T>(ev: K): asserts this is EventEmitter<Omit<T, K>> {
      delete this._evmap[ev];
    }

    emit<K extends keyof T>(ev: K, ...args: T[K][number]): void {
      const callbacks = this._evmap[ev];
      if (callbacks) {
        for (const cb of callbacks) {
          cb(...args);
        }
      }
    }
  }
}

namespace Opti.Evented {
  export function addEventRuled<T extends EventTarget, K extends keyof EventMapOf<T>>(
    this: T,
    type: K,
    listener: (this: T, e: EventMapOf<T>[K]) => void,
    timesOrCondition: number | ((this: T) => boolean),
    options?: boolean | AddEventListenerOptions
  ): void {
    if (typeof timesOrCondition === "number") {
      if (timesOrCondition <= 0) return;

      let repeatCount = timesOrCondition; // Default to 1 if no repeat option provided

      const onceListener = (event: EventMapOf<T>[K]) => {
        listener.call(this, event);
        repeatCount--;

        if (repeatCount <= 0) {
          this.removeEventListener(type as string, onceListener as EventListener, options);
        }
      };

      this.addEventListener(type as string, onceListener as EventListener, options);
    } else {
      if (timesOrCondition.call(this)) return;

      const onceListener = (event: EventMapOf<T>[K]) => {
        if (timesOrCondition.call(this)) {
          this.removeEventListener(type as string, onceListener as EventListener, options);
          return;
        }
        listener.call(this, event);
      };

      this.addEventListener(type as string, onceListener as EventListener, options);
    }
  };

  export function addEventListeners<T extends EventTarget, U extends (keyof EventMapOf<T>)[]>(
    this: T,
    listenersOrTypes: U | {
      [K in keyof EventMapOf<T>]?: (this: T, e: EventMapOf<T>[K]) => any
    },
    callback?: (e: Event) => any,
    options?: AddEventListenerOptions | boolean
  ): void {
    if (Array.isArray(listenersOrTypes)) {
      for (const type of listenersOrTypes) {
        this.addEventListener(String(type), callback as EventListener, options);
      }
    } else {
      for (const [event, listener] of Object.entries(listenersOrTypes) as [keyof EventMapOf<T>, ((e: EventMapOf<T>[keyof EventMapOf<T>]) => any)][]) {
        if (listener) {
          this.addEventListener(String(event), listener as EventListener, options);
        }
      }
    }
  };

  export function delegateEventListener<
    T extends EventTarget,
    U extends Element,
    K extends keyof EventMapOf<T>
  >(
    this: T,
    type: K,
    delegator: HTMLTag | string,
    listener: (this: U, e: EventMapOf<T>[K]) => void,
    options?: boolean | AddEventListenerOptions
  ) {
    this.addEventListener(
      type as string,
      function (this: T, e: Event) {
        const target = e.target as HTMLElement | null;

        if (!target) return;

        let selector: string;
        if (typeof delegator === "string") {
          selector = delegator;
        } else {
          selector = ""; // fallback
        }

        const matchedEl = target.closest(selector) as U | null;

        if (
          matchedEl &&
          (!(this instanceof Element) || this.contains(matchedEl))
        ) {
          listener.call(matchedEl, e as EventMapOf<T>[K]);
        }
      },
      options
    );
  }

  export function addEventController<T extends EventTarget, K extends keyof EventMapOf<T>>(
    this: T,
    type: K,
    listener: (e: EventMapOf<T>[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): EventController {
    this.addEventListener(type as string, listener as EventListener, options);
    const self = this;

    const controller = new class implements EventController {
      private _exists: boolean = true;

      public exists(): this is { on(): void; off(): void; del(): void } {
        return this._exists;
      }

      on?() {
        self.addEventListener(type as string, listener as EventListener, options);
      }
      off?() {
        self.removeEventListener(type as string, listener as EventListener, options);
      }
      del?() {
        delete this.off;
        delete this.on;
        delete this.del;
        this._exists = false;
      }
    };

    return controller;
  }
}