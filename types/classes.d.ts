interface EnumConstructor {
  new<T extends string>(...values: T[]): {
    [key: string]: symbol;
    [Symbol.iterator](): IterableIterator<T>
  }
}

interface CookieConstructor {
  new(name: string, valueIfNotExist?: string | null, days?: number, path?: string): Cookie;
  set<T = string>(name: string, value: T, days?: number, path?: string): void;
  get<T = string>(name: string): T | null;
  delete(name: string, path?: string): void;
}

interface Cookie {
  update(value: string, days?: number, path?: string): void;
  delete(): void;
  getValue(): string | null;
  getName(): string;
  getExpiry(): number;
  getPath(): string;
}

interface OptiStorageConstructor {
  new<T>(name: string, valueIfNotExist?: T | null): OptiStorage<T>

  set<T = string>(key: string, value: T): void;
  get<T = string>(key: string): T | null;
  remove(key: string): void;
  clear(): void;
}

interface OptiStorage<T> {
  update(value: T): void
  delete(): void;
  getValue(): T | null;
  getName(): string;
}

interface TimeConstructor {
  new();
  new(hours: Date);
  new(hours: number, minutes: number, seconds?: number, milliseconds?: number);
  new(hours?: number | Date, minutes?: number, seconds?: number, milliseconds?: number);

  of(date: Date): Time;
  at(hours: number, minutes: number, seconds?: number, milliseconds?: number): number;
  now(): number;

  fromDate(date: Date): Time;
  fromMilliseconds(ms: number): Time;
  fromString(timeString: string): Time;
  fromISOString(isoString: string): Time;

  equals(first: Time, other: Time): boolean;
}

interface Time {
  getHours(): number;
  getMinutes(): number;
  getSeconds(): number;
  getMilliseconds(): number;
  getTime(): number;

  setHours(hours: number): void;
  setMinutes(minutes: number): void;
  setSeconds(seconds: number): void;
  setMilliseconds(milliseconds: number): void;

  sync(): Time;

  toString(): string;
  toISOString(): string;
  toJSON(): string;
  toDate(years: number, months: number, days: number): Date;

  addMilliseconds(ms: number): Time;
  subtractMilliseconds(ms: number): Time;
  addSeconds(seconds: number): Time;
  addMinutes(minutes: number): Time;
  addHours(hours: number): Time;

  // Comparison
  compare(other: Time): number;
  isBefore(other: Time): boolean;
  isAfter(other: Time): boolean;
  equals(other: Time): boolean;
}

interface SequenceConstructor {
  of(...functions: (((...args: any[]) => any) | Sequence)[]): Sequence;
  chain(...functions: ((input: any) => any)[]): Sequence;
  parallel(...functions: (() => any)[]): Sequence;
  race(...functions: (() => any)[]): Sequence;
  retry(retries: number, task: () => Promise<any>, delay?: number): Sequence;
}

interface Sequence {
  execute(...args: any[]): Promise<any>;

  result(): any;
  result(callback: (result: unknown) => any): any;
  result(callback?: (result: unknown) => any): typeof this.finalResult;
  error(callback: (error: any) => any): this;

  add(...functions: ((...args: any[]) => any)[]): this;
}

interface TypedMap<R extends Record<string | number, any> = {}> {
  readonly size: number;

  set<K extends string, F>(
    key: K,
    value: F
  ): asserts this is TypedMap<R & { [P in K]: F }>;

  get<K extends keyof R>(key: K): R[K];

  notNull<K extends keyof R>(key: K): boolean;

  delete<K extends keyof R>(key: K): asserts this is TypedMap<Omit<R, K>>;

  keys(): (keyof R)[];

  entries(): [keyof R, R[keyof R]][];

  clear(): void;

  [Symbol.iterator](): IterableIterator<[keyof R, R[keyof R]]>;

  readonly [Symbol.toStringTag]: string;

  forEach(callback: <K extends keyof R>(value: R[K], key: K) => void): void;
}

interface CollectionConstructor {
  new<T>(collection: T[]): Collection<T>
  from<T>(arrayLike: ArrayLike<T>): Collection<T>
}

interface Collection<T> {
  readonly length: number;

  [index: number]: T;
  item(inedx: number): T | null;
  each(callbackfn: (value: T, key: number) => void, thisArg?: any): void;

  [Symbol.iterator](): IterableIterator<T>

  entries(): IterableIterator<[number, T]>
  keys(): IterableIterator<number>
  values(): IterableIterator<T>
}

// Exceptions

interface Exception {
  get name(): string;
  getMessage(): string;
  getCause(): string;
  getStackTrace(): string;
  throw(): never;
  toString(): string;
}

interface ExceptionConstructor {
  prototype: Exception;
  new(name: string | null, message?: string, cause?: string): Exception
}

interface CustomExceptionConstructor {
  new(name: string, message?: string): Error & { name: typeof name }
  readonly prototype: Exception;
}

interface RuntimeExceptionConstructor {
  new(message?: string, cause?: string): RuntimeException
}

interface RuntimeException {
  get name(): "RuntimeException";
  getMessage(): string;
  getCause(): string;
  toString(): string;
}

interface SubExceptionConstructor {
  new(message?: string, cause?: string): Exception
  readonly prototype: Exception;
}