type Callbacks<L extends unknown[]> = ((...args: L) => void)[];

interface EventController {
  on?(): void;
  off?(): void;
  del?(): void;
  exists(): this is { on(): void; off(): void; del(): void };
}

interface EventEmitter<T extends Record<string, unknown[]> = {}> {
  on<K extends string & keyof any, L extends unknown[]>(
    ev: K,
    callback: (...args: L) => void
  ): asserts this is EventEmitter<T & { [P in K]: K extends keyof T ? [...T[K], L] : [L] }>;
  off<K extends keyof T>(ev: K): asserts this is EventEmitter<Omit<T, K>>;
  emit<K extends keyof T>(ev: K, ...args: T[K][number]): void;
}

interface EventedConstructor {
  new(): EventEmitter<{}>
}

interface ThreadConstructor {
  new(): Thread
}

interface StaticThreadConstructor {
  new(): StaticThread
}

interface Thread {
  sleep(ms: number): void;
  stack(fn: () => any): void;
  pause(): void;
  resume(): void;
  stop(code?: number): never;
  get running(): boolean;
}

interface StaticThread extends Thread {
  start(...args: any[]): void;
  results<T = unknown>(): T;
}

interface EventCollection<T extends EventTarget> {
  [key: keyof EventMapOf<T>]: EventMapOf<T>[K] | undefined
  get<K extends keyof EventMapOf<T>>(key: K): EventMapOf<T>[K] | undefined
}