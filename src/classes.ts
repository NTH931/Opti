namespace Opti {

  export class HTMLElementCreator {
    private superEl: DocumentFragment;
    private currContainer: HTMLElement;
    private parentStack: HTMLElement[] = [];

    constructor(tag: HTMLElement | keyof HTMLElementTagNameMap, attrsOrPosition: HTMLAttrs = {}) {
      this.superEl = document.createDocumentFragment();

      if (tag instanceof HTMLElement) {
        this.currContainer = tag;
        this.superEl.append(tag);
      } else {
        const el = document.createElement(tag);
        this.makeElement(el as HTMLElement, attrsOrPosition);
        this.currContainer = el as HTMLElement;
        this.superEl.append(el);
      }
    }

    private makeElement(el: HTMLElement, attrs: HTMLAttrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === "text") {
          el.textContent = value as string;
        } else if (key === "html") {
          el.innerHTML = value as string;
        } else if (key === "class") {
          if (typeof value === "string") {
            el.classList.add(value);
          } else if (Array.isArray(value)) {
            el.classList.add(...value.filter(c => typeof c === 'string' && c.trim()));
          }
        } else if (key === "style") {
          let styles = "";
          Object.entries(value as object).forEach(([styleKey, styleValue]) => {
            styles += `${toKebabCase(styleKey)}: ${styleValue}; `;
          });
          el.setAttribute("style", styles.trim());
        } else if (typeof value === "boolean") {
          if (value) el.setAttribute(key, "");
          else el.removeAttribute(key);
        } else if (value !== undefined && value !== null) {
          el.setAttribute(key, value as string);
        }
      });
    }

    public el(tag: keyof HTMLElementTagNameMap, attrs: HTMLAttrs = {}): HTMLElementCreator {
      const child = document.createElement(tag);
      this.makeElement(child as HTMLElement, attrs);
      this.currContainer.appendChild(child);
      return this;
    }

    public container(tag: keyof HTMLElementTagNameMap, attrs: HTMLAttrs = {}): HTMLElementCreator {
      const wrapper = document.createElement(tag);
      this.makeElement(wrapper as HTMLElement, attrs);
      this.parentStack.push(this.currContainer);
      this.currContainer.appendChild(wrapper);
      this.currContainer = wrapper as HTMLElement;
      return this;
    }

    public up(): HTMLElementCreator {
      const prev = this.parentStack.pop();
      if (prev) {
        this.currContainer = prev;
      }
      return this;
    }

    public append(to: HTMLElement | string) {
      const target = typeof to === "string" ? document.querySelector(to) : to;
      if (target instanceof HTMLElement) {
        target.append(this.superEl);
      }
    }

    public prepend(to: HTMLElement | string) {
      const target = typeof to === "string" ? document.querySelector(to) : to;
      if (target instanceof HTMLElement) {
        target.prepend(this.superEl);
      }
    }

    public get element(): HTMLElement {
      return this.currContainer;
    }
  }

  export class Time implements Time {
    private hours: number;
    private minutes: number;
    private seconds: number;
    private milliseconds: number;

    public constructor();
    public constructor(hours: Date);
    public constructor(hours: number, minutes: number, seconds?: number, milliseconds?: number);
    public constructor(hours?: number | Date, minutes?: number, seconds?: number, milliseconds?: number) {
      if (hours instanceof Date) {
        this.hours = hours.getHours();
        this.minutes = hours.getMinutes();
        this.seconds = hours.getSeconds();
        this.milliseconds = hours.getMilliseconds();
      } else {
        const now = new Date();
        this.hours = hours ?? now.getHours();
        this.minutes = minutes ?? now.getMinutes();
        this.seconds = seconds ?? now.getSeconds();
        this.milliseconds = milliseconds ?? now.getMilliseconds();
      }

      this.validateTime();
    }

    // Validation for time properties
    private validateTime(): void {
      if (this.hours < 0 || this.hours >= 24) throw new SyntaxError("Hours must be between 0 and 23.");
      if (this.minutes < 0 || this.minutes >= 60) throw new SyntaxError("Minutes must be between 0 and 59.");
      if (this.seconds < 0 || this.seconds >= 60) throw new SyntaxError("Seconds must be between 0 and 59.");
      if (this.milliseconds < 0 || this.milliseconds >= 1000) throw new SyntaxError("Milliseconds must be between 0 and 999.");
    }

    public static of(date: Date) {
      return new this(date);
    }

    // Getters
    public getHours(): number { return this.hours; }
    public getMinutes(): number { return this.minutes; }
    public getSeconds(): number { return this.seconds; }
    public getMilliseconds(): number { return this.milliseconds; }

    // Setters
    public setHours(hours: number): void {
      this.hours = hours;
      this.validateTime();
    }
    public setMinutes(minutes: number): void {
      this.minutes = minutes;
      this.validateTime();
    }
    public setSeconds(seconds: number): void {
      this.seconds = seconds;
      this.validateTime();
    }
    public setMilliseconds(milliseconds: number): void {
      this.milliseconds = milliseconds;
      this.validateTime();
    }

    // Returns the time in milliseconds since the start of the day
    public getTime(): number {
      return (
        this.hours * 3600000 +
        this.minutes * 60000 +
        this.seconds * 1000 +
        this.milliseconds
      );
    }

    // Returns the time in milliseconds since the start of the day
    public static at(hours: number, minutes: number, seconds?: number, milliseconds?: number): number {
      return new Time(hours, minutes, seconds, milliseconds).getTime();
    }

    public sync() {
      return new Time();
    }

    // Static: Return current time as a Time object
    public static now(): number {
      return new Time().getTime();
    }

    public toString() {
      return `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;;
    }

    public toISOString(): string {
      return `T${this.toString()}.${this.milliseconds.toString().padStart(3, '0')}Z`;
    }

    public toJSON(): string {
      return this.toISOString(); // Leverage the existing toISOString() method
    }

    public toDate(years: number, months: number, days: number): Date {
      return new Date(years, months, days, this.hours, this.minutes, this.seconds, this.milliseconds);
    }

    public static fromDate(date: Date) {
      return new Time(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    }

    // Arithmetic operations
    public addMilliseconds(ms: number): Time {
      const totalMilliseconds = this.getTime() + ms;
      return Time.fromMilliseconds(totalMilliseconds);
    }

    public subtractMilliseconds(ms: number): Time {
      const totalMilliseconds = this.getTime() - ms;
      return Time.fromMilliseconds(totalMilliseconds);
    }

    public addSeconds(seconds: number): Time {
      return this.addMilliseconds(seconds * 1000);
    }

    public addMinutes(minutes: number): Time {
      return this.addMilliseconds(minutes * 60000);
    }

    public addHours(hours: number): Time {
      return this.addMilliseconds(hours * 3600000);
    }

    // Static: Create a Time object from total milliseconds
    public static fromMilliseconds(ms: number): Time {
      const hours = Math.floor(ms / 3600000) % 24;
      const minutes = Math.floor(ms / 60000) % 60;
      const seconds = Math.floor(ms / 1000) % 60;
      const milliseconds = ms % 1000;
      return new Time(hours, minutes, seconds, milliseconds);
    }

    // Parsing
    public static fromString(timeString: string): Time {
      const match = timeString.match(/^(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{3}))?$/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3] ?? "0", 10);
        const milliseconds = parseInt(match[4] ?? "0", 10);
        return new Time(hours, minutes, seconds, milliseconds);
      }
      throw new Error("Invalid time string format.");
    }

    public static fromISOString(isoString: string): Time {
      const match = isoString.match(/T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);
        const milliseconds = parseInt(match[4], 10);
        return new Time(hours, minutes, seconds, milliseconds);
      }
      throw new Error("Invalid ISO string format.");
    }

    // Comparison
    public compare(other: Time): number {
      const currentTime = this.getTime();
      const otherTime = other.getTime();

      if (currentTime < otherTime) {
        return -1;
      } else if (currentTime > otherTime) {
        return 1;
      } else {
        return 0;
      }
    }

    public isBefore(other: Time): boolean {
      return this.compare(other) === -1;
    }

    public isAfter(other: Time): boolean {
      return this.compare(other) === 1;
    }

    public equals(other: Time): boolean {
      return this.compare(other) === 0;
    }

    public static equals(first: Time, other: Time): boolean {
      return first.compare(other) === 0;
    }
  }

  export class Sequence {
    private tasks: ((...args: any[]) => any)[];
    private finalResult: any;
    private errorHandler: (error: any) => void = (error) => { throw new Error(error); };

    private constructor(tasks: ((...args: any[]) => any)[] = []) {
      this.tasks = tasks;
    }

    // Executes the sequence, passing up to 3 initial arguments to the first task
    async execute(...args: any[]): Promise<any> {
      try {
        const result = await this.tasks.reduce(
          (prev, task) => prev.then((result) => task(result)),
          Promise.resolve(args)
        );
        return this.finalResult = result;
      } catch (error) {
        return this.errorHandler(error);
      }
    }

    result(): any;
    result(callback: (result: unknown) => any): any;
    result(callback?: (result: unknown) => any): typeof this.finalResult {
      if (callback) {
        return callback(this.finalResult);
      }
      return this.finalResult;
    }

    error(callback: (error: any) => any): this {
      this.errorHandler = callback;
      return this;
    }

    // Static methods to create new sequences

    // Executes all tasks with the same arguments
    static of(...functions: (((...args: any[]) => any) | Sequence)[]): Sequence {
      const tasks: ((...args: any[]) => any)[] = [];

      for (const fn of functions) {
        if (fn instanceof Sequence) {
          // Add the sequence's tasks
          tasks.push(...fn.tasks);
        } else if (typeof fn === "function") {
          // Add standalone functions
          tasks.push(fn);
        } else {
          throw new Error("Invalid argument: Must be a function or Sequence");
        }
      }

      return new Sequence(tasks);
    }

    // Executes tasks sequentially, passing the result of one to the next
    static chain(...functions: ((input: any) => any)[]): Sequence {
      return new Sequence(functions);
    }

    static parallel(...functions: (() => any)[]): Sequence {
      return new Sequence([() => Promise.all(functions.map((fn) => fn()))]);
    }

    static race(...functions: (() => any)[]): Sequence {
      return new Sequence([() => Promise.race(functions.map((fn) => fn()))]);
    }

    static retry(retries: number, task: () => Promise<any>, delay = 0): Sequence {
      return new Sequence([
        () =>
          new Promise((resolve, reject) => {
            const attempt = (attemptNumber: number) => {
              task()
                .then(resolve)
                .catch((error) => {
                  if (attemptNumber < retries) {
                    setTimeout(() => attempt(attemptNumber + 1), delay);
                  } else {
                    reject(error);
                  }
                });
            };
            attempt(0);
          }),
      ]);
    }

    // Instance methods for chaining
    add(...functions: ((...args: any[]) => any)[]): this {
      this.tasks.push(...functions);
      return this;
    }
  }

  export class FNRegistry<R = {}> {
    private _map = {} as R;

    set<K extends string, F extends (this: any, ...args: any[]) => any>(
      key: K,
      fn: F
    ): asserts this is FNRegistry<R & { [P in K]: F }> {
      (this._map as any)[key] = fn;
    }

    get<K extends keyof R>(key: K): R[K] {
      return this._map[key];
    }
  }

  export class TypedMap<R extends Record<string | number, any> = {}> {
    private _map = {} as R;

    get size(): number {
      return Object.keys(this._map).length;
    }

    set<K extends string, F extends any>(
      key: K,
      value: F
    ): asserts this is TypedMap<R & { [P in K]: F }> {
      (this._map as any)[key] = value;
    }

    get<K extends keyof R>(key: K): R[K] {
      return this._map[key];
    }

    notNull<K extends keyof R>(key: K): boolean {
      return this._map[key] !== null || this._map[key] !== undefined;
    }

    delete<K extends keyof R>(key: K): asserts this is TypedMap<Omit<R, K>> {
      delete this._map[key];
    }

    keys(): (keyof R)[] {
      return Object.keys(this._map) as (keyof R)[];
    }

    entries(): [keyof R, R[keyof R]][] {
      return Object.entries(this._map) as [keyof R, R[keyof R]][];
    }

    clear(): void {
      for (const key in this._map) delete this._map[key];
    }

    *[Symbol.iterator](): IterableIterator<[keyof R, R[keyof R]]> {
      for (const key in this._map) {
        yield [key as keyof R, this._map[key]];
      }
    }

    get [Symbol.toStringTag](): string {
      return "[object TypedMap]";
    }

    forEach(callback: <K extends keyof R>(value: R[K], key: K) => void): void {
      for (const key in this._map) {
        const val = this._map[key];
        callback(val, key as keyof R);
      }
    }
  }

  export class Enum<T extends string> {
    [key: string]: symbol;

    constructor(...values: T[]) {

      for (const val in values) {
        this[val] = Symbol();
      }
    }

    *[Symbol.iterator](): IterableIterator<T> {
      for (const prop of Object.keys(this)) {
        yield prop as T;
      }
    }
  }

  export class Collection<T> {
    readonly length: number;
    private items: T[];

    constructor(items: T[]) {
      this.items = items;
      this.length = items.length;
    }

    public static from<T>(arrayLike: ArrayLike<T>) {
      return new Collection(Array.from(arrayLike));
    }

    [key: number]: T;

    item(index: number): T | null {
      return this.items[index] ?? null;
    }

    each(callback: (value: T, key: number) => void, thisArg?: any) {
      this.items.forEach(callback, thisArg);
    }

    *[Symbol.iterator]() {
      yield* this.items;
    }

    *entries() {
      yield* this.items.entries();
    }

    *keys() {
      yield* this.items.keys();
    }

    *values() {
      yield* this.items.values();
    }
  }
}