namespace Opti {

export function atDate(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number {
  return new Date(year, monthIndex, date, hours, minutes, seconds, ms).getTime();
}

export function fromTime (this: DateConstructor, time: Time, year: number, monthIndex: number, date?: number | undefined): Date {
  return new Date(year, monthIndex, date, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
}

export function clone<T>(object: T, deep: boolean = true): T {
  if (object === null || typeof object === "undefined") {
    return object;
  } else if (typeof object !== "object" && typeof object !== "symbol" && typeof object !== "function") {
    return object;
  }

  const shallowClone = (): T =>
    Object.assign(Object.create(Object.getPrototypeOf(object)), object);

  const deepClone = (obj: any, seen = new WeakMap()): any => {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj)) return seen.get(obj);

    // Preserve prototype
    const cloned = Array.isArray(obj)
      ? []
      : Object.create(Object.getPrototypeOf(obj));

    seen.set(obj, cloned);

    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) {
      obj.forEach((v, k) =>
        cloned.set(deepClone(k, seen), deepClone(v, seen))
      );
      return cloned;
    }
    if (obj instanceof Set) {
      obj.forEach(v => cloned.add(deepClone(v, seen)));
      return cloned;
    }
    if (ArrayBuffer.isView(obj)) return new (obj.constructor as any)(obj);
    if (obj instanceof ArrayBuffer) return obj.slice(0);

    for (const key of Reflect.ownKeys(obj)) {
      cloned[key] = deepClone(obj[key], seen);
    }

    return cloned;
  };

  return deep ? deepClone(object) : shallowClone();
};

export function repeat (this: number, iterator: (i: number) => any): void {
  for (let i = 0; i < this; i++) {
    iterator(i);
  }
};

export function unique<T>(this: T[]): T[] {
  return [...new Set(this)];
};

export function chunk<T>(this: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) throw new TypeError("`chunkSize` cannot be a number below 1");

  const newArr: T[][] = [];
  let tempArr: T[] = [];

  this.forEach(val => {
    tempArr.push(val);
    if (tempArr.length === chunkSize) {
      newArr.push(tempArr);
      tempArr = []; // Reset tempArr for the next chunk
    }
  });

  // Add the remaining elements in tempArr if any
  if (tempArr.length) {
    newArr.push(tempArr);
  }

  return newArr;
};

export function remove (this: string, finder: string | RegExp): string {
  return this.replace(finder, "");
};

export function removeAll (this: string, finder: string | RegExp): string {
  if (finder instanceof RegExp) {
    if (!finder.flags.includes("g")) {
      finder = new RegExp(finder.source, finder.flags + "g");
    }
  }
  return this.replaceAll(finder, "");
};

const origionalRandom = Math.random;
export const random = (minOrMax?: number, max?: number) => {
  if (isDefined(minOrMax) && isDefined(max)) {
    return origionalRandom() * (max - minOrMax) + minOrMax;
  } else if (isDefined(minOrMax)) {
    return origionalRandom() * minOrMax;
  } else return origionalRandom();
};

export function isDefined<T>(obj: T | undefined): obj is T {
  return typeof obj !== "undefined";
}

export function forEach<T>(object: T, iterator: (key: keyof T, value: T[keyof T]) => any): void {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      iterator(key, object[key]);
    }
  }
};

export function capitalize(this: string): string {
  const i = this.search(/\S/);
  return i === -1 ? this : this.slice(0, i) + this.charAt(i).toUpperCase() + this.slice(i + 1);
};

export async function parseFile<R = any, T = R>(
  file: string,
  receiver?: (content: T) => R
): Promise<R> {
  const fileContent = await fetch(file).then(res => res.json() as Promise<T>);

  if (!receiver) {
    return fileContent as unknown as R;
  }

  return receiver(fileContent);
};

const origionallog = console.log;
export function log(colorize?: true, ...data: any[]) {
  const text = data.map(val => typeof val === "string" ? val : JSON.stringify(val)).join(" ");
  origionallog(Colorize`${text}`);
}

}
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
namespace Opti {

export function type (val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";

  const typeOf = typeof val;
  if (typeOf === "function") {
    return `Function:${val.name || "<anonymous>"}(${val.length})`;
  }

  let typeName = capitalize.call(Object.prototype.toString.call(val).slice(8, -1));

  const ctor = val.constructor?.name;
  if (ctor && ctor !== typeName) {
    typeName = ctor;
  }

  const len = (val as any).length;
  if (typeof len === "number" && Number.isFinite(len)) {
    typeName += `(${len})`;
  } else if (val instanceof Map || val instanceof Set) {
    typeName += `(${val.size})`;
  } else if (val instanceof Date && !isNaN(val.getTime())) {
    typeName += `:${val.toISOString().split("T")[0]}`;
  } else if (typeName === "Object") {
    typeName += `(${Object.keys(val).length})`;
  }

  return typeName;
};

// Mapping of style keywords to ANSI escape codes for terminal formatting
const styles: Record<string, string> = {
  red: "\x1b[31m",
  orange: "\x1b[38;5;208m", // extended ANSI orange
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  purple: "\x1b[35m",
  pink: "\x1b[38;5;205m", // extended ANSI pink
  underline: "\x1b[4m",
  bold: "\x1b[1m",
  strikethrough: "\x1b[9m",
  italic: "\x1b[3m",
  emphasis: "\x1b[3m", // alias for italic
  reset: "\x1b[0m",
};

export function Colorize(strings: TemplateStringsArray, ...values: any[]) {
  // Combine all parts of the template string with interpolated values
  let input = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

  // Replace shorthand syntax for bold and underline
  // Replace {_..._} and {*...*} with {underline:...}, and {**...**} with {bold:...}
  input = input
    .replace(/\{_([^{}]+)_\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\{\*\*([^{}]+)\*\*\}/g, (_, content) => `{bold:${content}}`)
    .replace(/\{\*([^{}]+)\*\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\\x1b/g, '\x1b');

  // Replace escaped braces \{ and \} with placeholders so they are not parsed as tags
  input = input.replace(/\\\{/g, "__ESCAPED_OPEN_BRACE__").replace(/\\\}/g, "__ESCAPED_CLOSE_BRACE__");

  let output = ""; // Final output string with ANSI codes
  const stack: string[] = []; // Stack to track open styles for proper nesting
  let i = 0; // Current index in input

  while (i < input.length) {
    // Match the start of a style tag like {red: or {(dynamic ANSI code):
    const openMatch = input.slice(i).match(/^\{([a-zA-Z]+|\([^)]+\)):/);

    if (openMatch) {
      let tag = openMatch[1];

      if (tag.startsWith("(") && tag.endsWith(")")) {
        // Dynamic ANSI escape code inside parentheses
        tag = tag.slice(1, -1); // remove surrounding parentheses
        stack.push("__dynamic__");
        output += tag; // Insert raw ANSI code directly
      } else {
        if (!styles[tag]) {
          throw new ColorizedSyntaxError(`Unknown style: ${tag}`);
        }
        stack.push(tag);
        output += styles[tag];
      }
      i += openMatch[0].length; // Move index past the opening tag
      continue;
    }

    // Match closing tag '}'
    if (input[i] === "}") {
      if (!stack.length) {
        // No corresponding opening tag
        throw new ColorizedSyntaxError(`Unexpected closing tag at index ${i}`);
      }
      stack.pop(); // Close the last opened tag
      output += styles.reset; // Reset styles
      // Re-apply all remaining styles still on the stack
      for (const tag of stack) {
        // Reapply dynamic codes as-is, else mapped styles
        output += tag === "__dynamic__" ? "" : styles[tag];
      }
      i++; // Move past closing brace
      continue;
    }

    // Append normal character to output, but restore escaped braces if needed
    if (input.startsWith("__ESCAPED_OPEN_BRACE__", i)) {
      output += "{";
      i += "__ESCAPED_OPEN_BRACE__".length;
      continue;
    }
    if (input.startsWith("__ESCAPED_CLOSE_BRACE__", i)) {
      output += "}";
      i += "__ESCAPED_CLOSE_BRACE__".length;
      continue;
    }

    output += input[i++];
  }

  // If stack is not empty, we have unclosed tags
  if (stack.length) {
    const lastUnclosed = stack[stack.length - 1];
    throw new ColorizedSyntaxError(`Missing closing tag for: ${lastUnclosed}`);
  }

  // Ensure final reset for safety
  return output + styles.reset;
}

export function isEmpty(val: string): val is "";
export function isEmpty(val: number): val is 0 | typeof NaN;
export function isEmpty(val: boolean): val is false;
export function isEmpty(val: null | undefined): true;
export function isEmpty(val: Array<any>): val is [];
export function isEmpty(val: Record<any, unknown>): val is Record<any, never>;
export function isEmpty(val: Map<any, any>): val is Map<any, never>;
export function isEmpty(val: Set<any>): val is Set<never>;
export function isEmpty(val: WeakMap<object, any>): val is WeakMap<object, any>;
export function isEmpty(val: WeakSet<object>): val is WeakSet<object>;
export function isEmpty(val: any): boolean {
  // Generic type checking
  // eslint-disable-next-line eqeqeq
  if (val == null || val === false || val === "") return true;

  // Number checking
  if (typeof val === "number") return val === 0 || Number.isNaN(val);

  // Array checking
  if (Array.isArray(val) && val.length === 0) return true;

  // Map, Set, and weak variant checks
  if (val instanceof Map || val instanceof Set || val instanceof WeakMap || val instanceof WeakSet) {
    return (val as any).size === 0; // size check works for these types
  }

  // Object checking
  if (typeof val === 'object') {
    const proto = Object.getPrototypeOf(val);
    const isPlain = proto === Object.prototype || proto === null;
    return isPlain && Object.keys(val).length === 0;
  }

  return false;
}

export function createEventListener<T extends ((...args: any[]) => any)[]>(
  triggers: T,
  callback: (...results: CallbackResult<T>) => void
): void {
  const originals = triggers.map(fn => fn);

  triggers.forEach((originalFn, i) => {
    function wrapper (this: any, ...args: any[]) {
      const result = originals[i].apply(this, args);
      callback(...triggers.map((_, j) =>
        j === i ? result : undefined
      ) as any);
      return result;
    };

    // Replace global function by matching the actual function object
    if (typeof window !== "undefined") {
      for (const key in window) {
        if ((window as any)[key] === originalFn) {
          (window as any)[key] = wrapper;
          return; // stop after replacement
        }
      }
    }

    console.warn("Cannot replace function:", originalFn);
  });
}

export function generateID(): ID {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&*_-";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Type assertion to add the brand
  return result as unknown as ID;
}

export const ColorizedSyntaxError: ErrorConstructor = function(message?: string) {
  const err = new Error(message);
  Object.setPrototypeOf(err, ColorizedSyntaxError.prototype);
  err.name = "ColorizedSyntaxError";
  return err;
} as ErrorConstructor;

export const UnknownError: ErrorConstructor = function(message?: string) {
  const err = new Error(message);
  err.name = "UnknownError";
  Object.setPrototypeOf(err, UnknownError.prototype);
  return err;
} as ErrorConstructor;

export const AccessError: ErrorConstructor = function(message?: string) {
  const err = new Error(message);
  err.name = "AccessError";
  Object.setPrototypeOf(err, AccessError.prototype);
  return err;
} as ErrorConstructor;

export const CustomError: CustomErrorConstructor = function(name: string, message?: string) {
  const err = new Error(message);
  err.name = name;
  Object.setPrototypeOf(err, CustomError.prototype);
  return err;
} as CustomErrorConstructor;

}
namespace Opti {
  export class Exception extends Error {
    private _name: string;
    private _message: string;
    private _cause: string;
    private _internalStack: string;

    constructor(name: string | null, message: string = "", cause: string = "") {
      super();
      this._message = message;
      this._cause = cause;
      this._name = name ?? "Exception";
      this._internalStack = new Error().stack ?? "";

      this.stack = "";
      this.message = "";
    }

    public get name(): string {
      return this._name;
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public throw(): never {
      throw this;
    }

    public getStackTrace(): string {
      return this._internalStack;
    }

    public override toString(): string {
      return `${this._name}: ${this._message}\r\n${this._internalStack}`;
    }
  }

  export class RuntimeException {
    private _message: string;
    private _cause: string;

    public constructor(message: string = "", cause: string = "") {
      this._message = message;
      this._cause = cause;
    }

    public get name(): "RuntimeException" {
      return "RuntimeException";
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public toString(): string {
      return `RuntimeException: ${this._message}`;
    }
  }

  export class NotImplementedException extends Exception {
    constructor(message?: string, cause?: string) {
      super("NotImplementedError", message, cause);
    }
  }
}
namespace Opti {

export function addBoundListener <T extends EventTarget, K extends keyof EventMapOf<T>>(
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

export function addEventListeners<T extends EventTarget>(
  this: T,
  listenersOrTypes: (keyof EventMapOf<T>)[] | {
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

}
namespace Opti {

export function hasText (this: Element, text: string | RegExp): boolean {
  if (typeof text === "string") {
    return this.txt().includes(text);
  } else {
    return text.test(this.txt());
  }
}

export function addClass (this: Element, elClass: string): void {
  this.classList.add(elClass);
}

export function removeClass (this: Element, elClass: string): void {
  this.classList.remove(elClass);
}

export function toggleClass (this: Element, elClass: string): void {
  this.classList.toggle(elClass);
}

export function hasClass (this: Element, elClass: string): boolean {
  return this.classList.contains(elClass);
}

export function css(
  this: HTMLElement,
  key?: keyof CSSStyleDeclaration | Partial<Record<keyof CSSStyleDeclaration, string | number>>,
  value?: string | number
): any {
  const css = this.style;

  if (!key) {
    // Return all styles
    const result: Partial<Record<keyof CSSStyleDeclaration, string>> = {};
    for (let i = 0; i < css.length; i++) {
      const prop = css[i];
      if (prop) {
        result[prop as keyof CSSStyleDeclaration] = css.getPropertyValue(prop).trim();
      }
    }
    return result;
  }

  if (typeof key === "string") {
    if (value === undefined) {
      // Get one value
      return css.getPropertyValue(key).trim();
    } else {
      // Set one value
      if (key in css) {
        css.setProperty(toKebabCase(key), value.toString());
      }
    }
  } else {
    // Set multiple
    for (const [prop, val] of Object.entries(key)) {
      if (val !== null && val !== undefined) {
        css.setProperty(toKebabCase(prop), val.toString());
      }
    }
  }
};

export function getParent (this: Node): Node | null {
  return this.parentElement;
};

export function getAncestor<T extends Element>(this: Element, selector: string): T | null;
export function getAncestor(this: Node, level: number): Node | null;
export function getAncestor<T extends Element>(this: Node, arg: string | number): T | Node | null {
  // Case 1: numeric level
  if (typeof arg === "number") {
    let node: Node | null = this;
    for (let i = 0; i < arg; i++) {
      if (!node?.parentNode) return null;
      node = node.parentNode;
    }
    return node;
  }

  // Case 2: selector string
  const selector = arg;
  let el: Element | null = this instanceof Element ? this : this.parentElement;
  while (el) {
    if (el.matches(selector)) {
      return el as T;
    }
    el = el.parentElement;
  }
  return null;
}
export function createChildren (this: HTMLElement, elements: HTMLElementCascade): void {
  const element = document.createElement(elements.element);

  if (elements.id) {
    element.id = elements.id;
  }

  if (elements.className) {
    if (Array.isArray(elements.className)) {
      element.classList.add(...elements.className);
    } else {
      element.classList.add(elements.className);
    }
  }

  // Assign additional attributes dynamically
  for (const key in elements) {
    if (!['element', 'id', 'className', 'children'].includes(key)) {
      const value = elements[key as keyof HTMLElementCascade];
      if (typeof value === 'string') {
        element.setAttribute(key, value);
      } else if (Array.isArray(value)) {
        element.setAttribute(key, value.join(' ')); // Convert array to space-separated string
      }
    }
  }

  // Recursively create children
  if (elements.children) {
    if (Array.isArray(elements.children)) {
      elements.children.forEach(child => {
        // Recursively create child elements
        element.createChildren(child);
      });
    } else {
      // Recursively create a single child element
      element.createChildren(elements.children);
    }
  }

  this.appendChild(element);
};

export function tag <S extends HTMLElement, T extends HTMLTag = HTMLElementTagNameOf<S>>(
  this: S,
  newTag?: T
): HTMLElementOf<T> | string {
  if (!newTag) {
    return this.tagName.toLowerCase() as HTMLTag;
  }

  const newElement = document.createElement(newTag) as HTMLElementOf<T>;

  // Copy attributes
  Array.from(this.attributes).forEach(attr => {
    newElement.setAttribute(attr.name, attr.value);
  });

  // Copy dataset
  Object.entries(this.dataset).forEach(([key, value]) => {
    newElement.dataset[key] = value;
  });

  // Copy inline styles
  newElement.style.cssText = this.style.cssText;

  // Copy classes
  newElement.className = this.className;

  // Copy child nodes
  while (this.firstChild) {
    newElement.appendChild(this.firstChild);
  }

  // Transfer listeners (if you have a system for it)
  if ((this as any)._eventListeners instanceof Map) {
    const listeners = (this as any)._eventListeners as Map<string, EventListenerOrEventListenerObject[]>;
    listeners.forEach((fns, type) => {
      fns.forEach(fn => newElement.addEventListener(type, fn));
    });
    (newElement as any)._eventListeners = new Map(listeners);
  }

  // Optional: Copy properties (if you have custom prototype extensions)
  for (const key in this) {
    // Skip built-in DOM properties and functions
    if (
      !(key in newElement) &&
      typeof (this as any)[key] !== "function"
    ) {
      try {
        (newElement as any)[key] = (this as any)[key];
      } catch {
        // Some props might be readonly — safely ignore
      }
    }
  }

  this.replaceWith(newElement);
  return newElement;
};

export function html (this: HTMLElement, input?: string): string {
  return input !== undefined ? (this.innerHTML = input) : this.innerHTML;
};

export function text(this: Element, text?: string | ((text: string) => string), ...input: (string)[]): string {
  // If text is provided, update the textContent
  if (text !== undefined) {
    if (typeof text === "string") {
      input.unshift(text); // Add the text parameter to the beginning of the input array
      const joined = input.join(" "); // Join all the strings with a space

      // Replace "textContent" if it's found in the joined string (optional logic)
      this.textContent = joined.includes("textContent")
        ? joined.replace("textContent", this.textContent ?? "")
        : joined;
    } else {
      this.textContent = text(this.textContent ?? "");
    }
  }

  // Return the current textContent if no arguments are passed
  return this.textContent ?? "";
};

export function show (this: HTMLElement) {
  this.css("visibility", "visible");
};

export function hide (this: HTMLElement) {
  this.css("visibility", "hidden");
};

export function toggle (this: HTMLElement) {
  if (this.css("visibility") === "visible" || this.css("visibility") === "") {
    this.hide();
  } else {
    this.show();
  }
};

export function find (this: Node, selector: string): Node | null {
  return this.querySelector(selector); // Returns a single Element or null
};

export function findAll (this: Node, selector: string): NodeListOf<Element> {
  return this.querySelectorAll(selector); // Returns a single Element or null
};

export function getChildren (this: Node): NodeListOf<ChildNode> {
  return this.childNodes;
};

export function getSiblings (this: Node, inclusive?: boolean): Node[] {
  const siblings = Array.from(this.parentNode!.childNodes as NodeListOf<Node>);
  if (inclusive) {
    return siblings; // Include current node as part of siblings
  } else {
    return siblings.filter(node => !node.isSameNode(this));
  }
};

export function serialize (this: HTMLFormElement): string {
  const formData = new FormData(this); // Create a FormData object from the form

  // Create an array to hold key-value pairs
  const entries: [string, string][] = [];

  // Use FormData's forEach method to collect form data
  formData.forEach((value, key) => {
    entries.push([key, value.toString()]);
  });

  // Convert the entries into a query string
  return entries
    .map(([key, value]) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .join('&'); // Join the array into a single string, separated by '&'
};

export function elementCreator (this: HTMLElement) {
  return new HTMLElementCreator(this);
};

export function cut<T extends Element>(this: T): T {
  const clone = document.createElementNS(this.namespaceURI, this.tagName) as T;

  // Copy all attributes
  for (const attr of Array.from(this.attributes)) {
    clone.setAttribute(attr.name, attr.value);
  }

  // Deep copy child nodes (preserves text, elements, etc.)
  for (const child of Array.from(this.childNodes)) {
    clone.appendChild(child.cloneNode(true));
  }

  // Optionally copy inline styles (not always needed if using setAttribute above)
   if (this instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.style.cssText = this.style.cssText;
  }

  this.remove(); // Remove original from DOM

  return clone;
}

}
namespace Opti {

export function ready (callback: (this: Document, ev: Event) => any) {
  document.addEventListener("DOMContentLoaded", callback);
}

export function leaving (callback: (this: Document, ev: Event) => any): void {
  document.addEventListener("unload", (e) => callback.call(document, e));
}

export function bindShortcut (
  shortcut: Shortcut,
  callback: (event: ShortcutEvent) => void
): void {
  document.addEventListener('keydown', (event: Event) => {
    const keyboardEvent = event as ShortcutEvent;
    keyboardEvent.keys = shortcut.split("+") as [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    const keys = shortcut
      .trim()
      .toLowerCase()
      .split("+");

    // Separate out the modifier keys and the actual key
    const modifiers = keys.slice(0, -1);
    const finalKey = keys[keys.length - 1];

    const modifierMatch = modifiers.every((key: any) => {
      if (key === 'ctrl' || key === 'control') return keyboardEvent.ctrlKey;
      if (key === 'alt') return keyboardEvent.altKey;
      if (key === 'shift') return keyboardEvent.shiftKey;
      if (key === 'meta' || key === 'windows' || key === 'command') return keyboardEvent.metaKey;
      return false;
    });

    // Check that the pressed key matches the final key
    const keyMatch = finalKey === keyboardEvent.key.toLowerCase();

    if (modifierMatch && keyMatch) {
      callback(keyboardEvent);
    }
  });
}

export function documentCss (
  element: string,
  object?: Partial<Record<keyof CSSStyleDeclaration, string | number>>
): any {
  const selector = element.trim();
  if (!selector) {
    throw new Error("Selector cannot be empty.");
  }

  let styleTag = document.querySelector("style[js-styles]") as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.setAttribute("js-styles", "");
    document.head.appendChild(styleTag);
  }

  const sheet = styleTag.sheet as CSSStyleSheet;
  let ruleIndex = -1;
  const existingStyles: StringRecord<string> = {};

  for (let i = 0; i < sheet.cssRules.length; i++) {
    const rule = sheet.cssRules[i];
    if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
      ruleIndex = i;
      const declarations = rule.style;
      for (let j = 0; j < declarations.length; j++) {
        const name = declarations[j];
        existingStyles[name] = declarations.getPropertyValue(name).trim();
      }
      break;
    }
  }

  if (!object || Object.keys(object).length === 0) {
    return existingStyles;
  }

  // Convert camelCase to kebab-case
  const newStyles: StringRecord<string> = {};
  for (const [prop, val] of Object.entries(object)) {
    if (val !== null && val !== undefined) {
      const kebab = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      newStyles[kebab] = val.toString();
    }
  }

  const mergedStyles = { ...existingStyles, ...newStyles };
  const styleString = Object.entries(mergedStyles)
    .map(([prop, val]) => `${prop}: ${val};`)
    .join(" ");

  if (ruleIndex !== -1) {
    sheet.deleteRule(ruleIndex);
  }

  try {
    sheet.insertRule(`${selector} { ${styleString} }`, sheet.cssRules.length);
  } catch (err) {
    console.error("Failed to insert CSS rule:", err, { selector, styleString });
  }
}

export function createElementTree<T extends HTMLElement>(node: ElementNode): T {
  const el = document.createElement(node.tag);

  // Add class if provided
  if (node.class) el.className = node.class;

  // Add text content if provided
  if (node.text) el.textContent = node.text;

  // Add inner HTML if provided
  if (node.html) el.innerHTML = node.html;

  // Handle styles, ensure it’s an object
  if (node.style && typeof node.style === 'object') {
    for (const [prop, val] of Object.entries(node.style)) {
      el.style.setProperty(prop, val.toString());
    }
  }

  // Handle other attributes (excluding known keys)
  for (const [key, val] of Object.entries(node)) {
    if (
      key !== 'tag' &&
      key !== 'class' &&
      key !== 'text' &&
      key !== 'html' &&
      key !== 'style' &&
      key !== 'children'
    ) {
      if (typeof val === 'string') {
        el.setAttribute(key, val);
      } else throw new Opti.CustomError("ParameterError", "Custom parameters must be of type 'string'");
    }
  }

  // Handle children (ensure it's an array or a single child)
  if (node.children) {
    if (Array.isArray(node.children)) {
      node.children.forEach(child => {
        el.appendChild(createElementTree(child));
      });
    } else {
      el.appendChild(createElementTree(node.children)); // Support for a single child node
    }
  }

  return el as T;
}

export function $ (selector: string) {
  return document.querySelector(selector);
};

export function $$ (selector: string) {
  return document.querySelectorAll(selector);
};

}
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

  export class ShortcutEvent extends KeyboardEvent {
    keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    constructor(
      keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?],
      eventInit?: ShortcutEventInit
    ) {
      const lastKey = keys[keys.length - 1] || "";
      super("keydown", { ...eventInit, key: lastKey });
      this.keys = keys;
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

  export namespace Crafty {
    export interface Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {
      getProp<K extends keyof P>(prop: K): P[K];
      setProp<K extends keyof P>(prop: K, value: P[K]): void;
      getChildren(): C;
      append(child: Crafty.Child): void;
      prepend(child: Crafty.Child): void;
      remove(child: Crafty.Child): void;
      insert?(child: Crafty.Child, index: number): void;
    }

    export type Props<T extends HTMLTag> = Partial<{
      tag: T,
      class: string | string[],
      text: string,
      id: string,
      name: string,
      [key: string]: unknown
    } & Pick<HTMLElementOf<T>, AccessorKeys<HTMLElementOf<T>>>
    >;

    export type Child = Crafty.Element<any, any, any> | Crafty.Fragment<any, any, any>;

    export class Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {  // <- implements the interface
      public tag: T;
      public props: P;
      public children: C;

      constructor(tag: T, props?: P, children?: C) {
        this.tag = tag;
        this.props = props ?? ({} as P);
        this.children = children ?? [] as unknown as C;
      }

      getProp<K extends keyof P>(prop: K): P[K] {
        return this.props[prop];
      }

      setProp<K extends keyof P>(prop: K, value: P[K]): void {
        this.props[prop] = value;
      }

      getChildren(): C {
        return this.children;
      }

      append(child: Crafty.Child): void {
        this.children = [...this.children, child] as unknown as C;
      }

      prepend(child: Crafty.Child): void {
        this.children = [child, ...this.children] as unknown as C;
      }

      remove(child: Crafty.Child): void {
        this.children = this.children.filter(c => c !== child) as unknown as C;
      }

      render(): HTMLElementOf<T> {
        // your render implementation here
        throw new Error("Not implemented");
      }
    }

    export class Fragment<
      T extends HTMLTag,
      P extends Props<T> = Props<T>,
      C extends readonly Child[] = readonly []
    > extends Element<T, P, C> {
      // can override or extend render() etc.
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
function defineProperty<T>(
  object: any,
  prop: PropertyKey,
  getter: () => T,
  setter?: (value: T) => void
): void {
  Object.defineProperty(object, prop, {
    get: getter,
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function defineGetter<T>(object: any, prop: PropertyKey, getter: () => T): void {
  defineProperty(object, prop, getter);
}

function defineSetter<T>(object: any, prop: PropertyKey, setter: (value: T) => void): void {
  Object.defineProperty(object, prop, {
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function toArray(collection: HTMLCollectionOf<Element> | NodeListOf<Element>): Element[] {
  return Array.from(collection);
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isGlobal(val: any): val is typeof globalThis {
  return val === globalThis;
}

function typedEntries<T extends object, K extends keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][];
}

(function() {
  //@ts-ignore
  globalThis.Opti ??= {};

  globalThis.f = (iife: () => void) => iife();
  globalThis.createEventListener = Opti.createEventListener;
  globalThis.Time = Opti.Time;
  globalThis.ShortcutEvent = Opti.ShortcutEvent;
  globalThis.isEmpty = Opti.isEmpty;
  globalThis.type = Opti.type;
  globalThis.generateID = Opti.generateID;
  globalThis.Colorize = Opti.Colorize;
  globalThis.Exception = Opti.Exception;
  globalThis.UnknownError = Opti.UnknownError;
  globalThis.NotImplementedException = Opti.NotImplementedException;
  globalThis.AccessError = Opti.AccessError;
  globalThis.CustomError = Opti.CustomError;
  globalThis.ColorizedSyntaxError = Opti.ColorizedSyntaxError;
  globalThis.RuntimeException = Opti.RuntimeException;
  globalThis.Enum = Opti.Enum;
  globalThis.Collection = Opti.Collection;  

  Document.prototype.ready = Opti.ready;
  Document.prototype.leaving = Opti.leaving;
  Document.prototype.bindShortcut = Opti.bindShortcut;
  Document.prototype.css = Opti.documentCss;
  Document.prototype.createElementTree = Opti.createElementTree;

  NodeList.prototype.addEventListener = Opti.addEventListenerEnum;
  NodeList.prototype.addClass = Opti.addClassList;
  NodeList.prototype.removeClass = Opti.removeClassList;
  NodeList.prototype.toggleClass = Opti.toggleClassList;
  NodeList.prototype.single = function (this: NodeList) {
    return this.length > 0 ? this[0] : null;
  };

  HTMLCollection.prototype.addEventListener = Opti.addEventListenerEnum;
  HTMLCollection.prototype.addClass = Opti.addClassList;
  HTMLCollection.prototype.removeClass = Opti.removeClassList;
  HTMLCollection.prototype.toggleClass = Opti.toggleClassList;
  HTMLCollection.prototype.single = function (this: HTMLCollection) {
    return this.length > 0 ? this[0] : null;
  };

  EventTarget.prototype.addBoundListener = Opti.addBoundListener;
  EventTarget.prototype.addEventListeners = Opti.addEventListeners;
  EventTarget.prototype.delegateEventListener = Opti.delegateEventListener;

  Element.prototype.hasText = Opti.hasText;
  Element.prototype.txt = Opti.text;
  Element.prototype.addClass = Opti.addClass;
  Element.prototype.removeClass = Opti.removeClass;
  Element.prototype.toggleClass = Opti.toggleClass;
  Element.prototype.hasClass = Opti.hasClass;

  HTMLElement.prototype.css = Opti.css;
  HTMLElement.prototype.elementCreator = Opti.elementCreator;
  HTMLElement.prototype.tag = Opti.tag;
  HTMLElement.prototype.html = Opti.html;
  HTMLElement.prototype.show = Opti.show;
  HTMLElement.prototype.hide = Opti.hide;
  HTMLElement.prototype.toggle = Opti.toggle;

  HTMLFormElement.prototype.serialize = Opti.serialize;

  Node.prototype.parent = Opti.getParent;
  Node.prototype.ancestor = Opti.getAncestor;
  Node.prototype.getChildren = Opti.getChildren;
  Node.prototype.siblings = Opti.getSiblings;
  Node.prototype.$ = Opti.find;
  Node.prototype.$$ = Opti.findAll;
  Number.prototype.repeat = Opti.repeat;
  Array.prototype.unique = Opti.unique;
  Array.prototype.chunk = Opti.chunk;
  String.prototype.remove = Opti.remove;
  String.prototype.removeAll = Opti.removeAll;
  String.prototype.capitalize = Opti.capitalize;

  Math.random = Opti.random;
  JSON.parseFile = Opti.parseFile;
  Object.clone = Opti.clone;
  Object.forEach = Opti.forEach;
  Date.at = Opti.atDate;
  Date.fromTime = Opti.fromTime;

  defineGetter(Window.prototype, "width", () => window.innerWidth || document.body.clientWidth);
  defineGetter(Window.prototype, "height", () => window.innerHeight || document.body.clientHeight);
  defineGetter(HTMLElement.prototype, "visible", function (this: HTMLElement) {
    return this.css("visibility") !== "hidden"
      ? this.css("display") !== "none"
      : Number(this.css("opacity")) > 0;
  });
})();
namespace Opti {

export function atDate(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number {
  return new Date(year, monthIndex, date, hours, minutes, seconds, ms).getTime();
}

export function fromTime (this: DateConstructor, time: Time, year: number, monthIndex: number, date?: number | undefined): Date {
  return new Date(year, monthIndex, date, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
}

export function clone<T>(object: T, deep: boolean = true): T {
  if (object === null || typeof object === "undefined") {
    return object;
  } else if (typeof object !== "object" && typeof object !== "symbol" && typeof object !== "function") {
    return object;
  }

  const shallowClone = (): T =>
    Object.assign(Object.create(Object.getPrototypeOf(object)), object);

  const deepClone = (obj: any, seen = new WeakMap()): any => {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj)) return seen.get(obj);

    // Preserve prototype
    const cloned = Array.isArray(obj)
      ? []
      : Object.create(Object.getPrototypeOf(obj));

    seen.set(obj, cloned);

    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) {
      obj.forEach((v, k) =>
        cloned.set(deepClone(k, seen), deepClone(v, seen))
      );
      return cloned;
    }
    if (obj instanceof Set) {
      obj.forEach(v => cloned.add(deepClone(v, seen)));
      return cloned;
    }
    if (ArrayBuffer.isView(obj)) return new (obj.constructor as any)(obj);
    if (obj instanceof ArrayBuffer) return obj.slice(0);

    for (const key of Reflect.ownKeys(obj)) {
      cloned[key] = deepClone(obj[key], seen);
    }

    return cloned;
  };

  return deep ? deepClone(object) : shallowClone();
};

export function repeat (this: number, iterator: (i: number) => any): void {
  for (let i = 0; i < this; i++) {
    iterator(i);
  }
};

export function unique<T>(this: T[]): T[] {
  return [...new Set(this)];
};

export function chunk<T>(this: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) throw new TypeError("`chunkSize` cannot be a number below 1");

  const newArr: T[][] = [];
  let tempArr: T[] = [];

  this.forEach(val => {
    tempArr.push(val);
    if (tempArr.length === chunkSize) {
      newArr.push(tempArr);
      tempArr = []; // Reset tempArr for the next chunk
    }
  });

  // Add the remaining elements in tempArr if any
  if (tempArr.length) {
    newArr.push(tempArr);
  }

  return newArr;
};

export function remove (this: string, finder: string | RegExp): string {
  return this.replace(finder, "");
};

export function removeAll (this: string, finder: string | RegExp): string {
  if (finder instanceof RegExp) {
    if (!finder.flags.includes("g")) {
      finder = new RegExp(finder.source, finder.flags + "g");
    }
  }
  return this.replaceAll(finder, "");
};

const origionalRandom = Math.random;
export const random = (minOrMax?: number, max?: number) => {
  if (isDefined(minOrMax) && isDefined(max)) {
    return origionalRandom() * (max - minOrMax) + minOrMax;
  } else if (isDefined(minOrMax)) {
    return origionalRandom() * minOrMax;
  } else return origionalRandom();
};

export function isDefined<T>(obj: T | undefined): obj is T {
  return typeof obj !== "undefined";
}

export function forEach<T>(object: T, iterator: (key: keyof T, value: T[keyof T]) => any): void {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      iterator(key, object[key]);
    }
  }
};

export function capitalize(this: string): string {
  const i = this.search(/\S/);
  return i === -1 ? this : this.slice(0, i) + this.charAt(i).toUpperCase() + this.slice(i + 1);
};

export async function parseFile<R = any, T = R>(
  file: string,
  receiver?: (content: T) => R
): Promise<R> {
  const fileContent = await fetch(file).then(res => res.json() as Promise<T>);

  if (!receiver) {
    return fileContent as unknown as R;
  }

  return receiver(fileContent);
};

const origionallog = console.log;
export function log(colorize?: true, ...data: any[]) {
  const text = data.map(val => typeof val === "string" ? val : JSON.stringify(val)).join(" ");
  origionallog(Colorize`${text}`);
}

}
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
namespace Opti {

export function type (val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";

  const typeOf = typeof val;
  if (typeOf === "function") {
    return `Function:${val.name || "<anonymous>"}(${val.length})`;
  }

  let typeName = capitalize.call(Object.prototype.toString.call(val).slice(8, -1));

  const ctor = val.constructor?.name;
  if (ctor && ctor !== typeName) {
    typeName = ctor;
  }

  const len = (val as any).length;
  if (typeof len === "number" && Number.isFinite(len)) {
    typeName += `(${len})`;
  } else if (val instanceof Map || val instanceof Set) {
    typeName += `(${val.size})`;
  } else if (val instanceof Date && !isNaN(val.getTime())) {
    typeName += `:${val.toISOString().split("T")[0]}`;
  } else if (typeName === "Object") {
    typeName += `(${Object.keys(val).length})`;
  }

  return typeName;
};

// Mapping of style keywords to ANSI escape codes for terminal formatting
const styles: Record<string, string> = {
  red: "\x1b[31m",
  orange: "\x1b[38;5;208m", // extended ANSI orange
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  purple: "\x1b[35m",
  pink: "\x1b[38;5;205m", // extended ANSI pink
  underline: "\x1b[4m",
  bold: "\x1b[1m",
  strikethrough: "\x1b[9m",
  italic: "\x1b[3m",
  emphasis: "\x1b[3m", // alias for italic
  reset: "\x1b[0m",
};

export function Colorize(strings: TemplateStringsArray, ...values: any[]) {
  // Combine all parts of the template string with interpolated values
  let input = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

  // Replace shorthand syntax for bold and underline
  // Replace {_..._} and {*...*} with {underline:...}, and {**...**} with {bold:...}
  input = input
    .replace(/\{_([^{}]+)_\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\{\*\*([^{}]+)\*\*\}/g, (_, content) => `{bold:${content}}`)
    .replace(/\{\*([^{}]+)\*\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\\x1b/g, '\x1b');

  // Replace escaped braces \{ and \} with placeholders so they are not parsed as tags
  input = input.replace(/\\\{/g, "__ESCAPED_OPEN_BRACE__").replace(/\\\}/g, "__ESCAPED_CLOSE_BRACE__");

  let output = ""; // Final output string with ANSI codes
  const stack: string[] = []; // Stack to track open styles for proper nesting
  let i = 0; // Current index in input

  while (i < input.length) {
    // Match the start of a style tag like {red: or {(dynamic ANSI code):
    const openMatch = input.slice(i).match(/^\{([a-zA-Z]+|\([^)]+\)):/);

    if (openMatch) {
      let tag = openMatch[1];

      if (tag.startsWith("(") && tag.endsWith(")")) {
        // Dynamic ANSI escape code inside parentheses
        tag = tag.slice(1, -1); // remove surrounding parentheses
        stack.push("__dynamic__");
        output += tag; // Insert raw ANSI code directly
      } else {
        if (!styles[tag]) {
          throw new ColorizedSyntaxException(`Unknown style: ${tag}`);
        }
        stack.push(tag);
        output += styles[tag];
      }
      i += openMatch[0].length; // Move index past the opening tag
      continue;
    }

    // Match closing tag '}'
    if (input[i] === "}") {
      if (!stack.length) {
        // No corresponding opening tag
        throw new ColorizedSyntaxException(`Unexpected closing tag at index ${i}`);
      }
      stack.pop(); // Close the last opened tag
      output += styles.reset; // Reset styles
      // Re-apply all remaining styles still on the stack
      for (const tag of stack) {
        // Reapply dynamic codes as-is, else mapped styles
        output += tag === "__dynamic__" ? "" : styles[tag];
      }
      i++; // Move past closing brace
      continue;
    }

    // Append normal character to output, but restore escaped braces if needed
    if (input.startsWith("__ESCAPED_OPEN_BRACE__", i)) {
      output += "{";
      i += "__ESCAPED_OPEN_BRACE__".length;
      continue;
    }
    if (input.startsWith("__ESCAPED_CLOSE_BRACE__", i)) {
      output += "}";
      i += "__ESCAPED_CLOSE_BRACE__".length;
      continue;
    }

    output += input[i++];
  }

  // If stack is not empty, we have unclosed tags
  if (stack.length) {
    const lastUnclosed = stack[stack.length - 1];
    throw new ColorizedSyntaxException(`Missing closing tag for: ${lastUnclosed}`);
  }

  // Ensure final reset for safety
  return output + styles.reset;
}

export function isEmpty(val: string): val is "";
export function isEmpty(val: number): val is 0 | typeof NaN;
export function isEmpty(val: boolean): val is false;
export function isEmpty(val: null | undefined): true;
export function isEmpty(val: Array<any>): val is [];
export function isEmpty(val: Record<any, unknown>): val is Record<any, never>;
export function isEmpty(val: Map<any, any>): val is Map<any, never>;
export function isEmpty(val: Set<any>): val is Set<never>;
export function isEmpty(val: WeakMap<object, any>): val is WeakMap<object, any>;
export function isEmpty(val: WeakSet<object>): val is WeakSet<object>;
export function isEmpty(val: any): boolean {
  // Generic type checking
  // eslint-disable-next-line eqeqeq
  if (val == null || val === false || val === "") return true;

  // Number checking
  if (typeof val === "number") return val === 0 || Number.isNaN(val);

  // Array checking
  if (Array.isArray(val) && val.length === 0) return true;

  // Map, Set, and weak variant checks
  if (val instanceof Map || val instanceof Set || val instanceof WeakMap || val instanceof WeakSet) {
    return (val as any).size === 0; // size check works for these types
  }

  // Object checking
  if (typeof val === 'object') {
    const proto = Object.getPrototypeOf(val);
    const isPlain = proto === Object.prototype || proto === null;
    return isPlain && Object.keys(val).length === 0;
  }

  return false;
}

export function createEventListener<T extends ((...args: any[]) => any)[]>(
  triggers: T,
  callback: (...results: CallbackResult<T>) => void
): void {
  const originals = triggers.map(fn => fn);

  triggers.forEach((originalFn, i) => {
    function wrapper (this: any, ...args: any[]) {
      const result = originals[i].apply(this, args);
      callback(...triggers.map((_, j) =>
        j === i ? result : undefined
      ) as any);
      return result;
    };

    // Replace global function by matching the actual function object
    if (typeof window !== "undefined") {
      for (const key in window) {
        if ((window as any)[key] === originalFn) {
          (window as any)[key] = wrapper;
          return; // stop after replacement
        }
      }
    }

    console.warn("Cannot replace function:", originalFn);
  });
}

export function generateID(): ID {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&*_-";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Type assertion to add the brand
  return Object.freeze(result) as ID;
}

}
namespace Opti {
  export class Exception extends Error {
    private _name: string;
    private _message: string;
    private _cause: string;
    private _internalStack: string;

    constructor(name: string | null, message: string = "", cause: string = "") {
      super();
      this._message = message;
      this._cause = cause;
      this._name = name ?? "Exception";
      this._internalStack = new Error().stack ?? "";

      this.stack = "";
      this.message = "";
    }

    public get name(): string {
      return this._name;
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public throw(): never {
      throw this;
    }

    public getStackTrace(): string {
      return this._internalStack;
    }

    public override toString(): string {
      return `${this._name}: ${this._message}\r\n${this._internalStack}`;
    }
  }

  export class RuntimeException {
    private _message: string;
    private _cause: string;

    public constructor(message: string = "", cause: string = "") {
      this._message = message;
      this._cause = cause;
    }

    public get name(): "RuntimeException" {
      return "RuntimeException";
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public toString(): string {
      return `RuntimeException: ${this._message}`;
    }
  }

  export class NotImplementedException extends Exception {
    constructor(message?: string, cause?: string) {
      super("NotImplementedError", message, cause);
    }
  }

  export class ColorizedSyntaxException extends Exception {
    constructor(message?: string, cause?: string) {
      super("ColorizedSyntaxError", message, cause);
      Object.setPrototypeOf(this, ColorizedSyntaxException.prototype);
    }
  }

  export class UnknownException extends Exception {
    constructor(message?: string, cause?: string) {
      super("UnknownError", message, cause);
      Object.setPrototypeOf(this, UnknownException.prototype);
    }
  }

  export class AccessException extends Exception {
    constructor(message?: string, cause?: string) {
      super("AccessError", message, cause);
      Object.setPrototypeOf(this, AccessException.prototype);
    }
  }

  export class CustomException extends Exception {
    constructor(name: string, message?: string, cause?: string) {
      super(name, message, cause);
      Object.setPrototypeOf(this, CustomException.prototype);
    }
  }
}
namespace Opti {

export function addBoundListener <T extends EventTarget, K extends keyof EventMapOf<T>>(
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

export function addEventListeners<T extends EventTarget>(
  this: T,
  listenersOrTypes: (keyof EventMapOf<T>)[] | {
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

}
namespace Opti {

export function hasText (this: Element, text: string | RegExp): boolean {
  if (typeof text === "string") {
    return this.txt().includes(text);
  } else {
    return text.test(this.txt());
  }
}

export function addClass (this: Element, elClass: string): void {
  this.classList.add(elClass);
}

export function removeClass (this: Element, elClass: string): void {
  this.classList.remove(elClass);
}

export function toggleClass (this: Element, elClass: string): void {
  this.classList.toggle(elClass);
}

export function hasClass (this: Element, elClass: string): boolean {
  return this.classList.contains(elClass);
}

export function css(
  this: HTMLElement,
  key?: keyof CSSStyleDeclaration | Partial<Record<keyof CSSStyleDeclaration, string | number>>,
  value?: string | number
): any {
  const css = this.style;

  if (!key) {
    // Return all styles
    const result: Partial<Record<keyof CSSStyleDeclaration, string>> = {};
    for (let i = 0; i < css.length; i++) {
      const prop = css[i];
      if (prop) {
        result[prop as keyof CSSStyleDeclaration] = css.getPropertyValue(prop).trim();
      }
    }
    return result;
  }

  if (typeof key === "string") {
    if (value === undefined) {
      // Get one value
      return css.getPropertyValue(key).trim();
    } else {
      // Set one value
      if (key in css) {
        css.setProperty(toKebabCase(key), value.toString());
      }
    }
  } else {
    // Set multiple
    for (const [prop, val] of Object.entries(key)) {
      if (val !== null && val !== undefined) {
        css.setProperty(toKebabCase(prop), val.toString());
      }
    }
  }
};

export function getParent (this: Node): Node | null {
  return this.parentElement;
};

export function getAncestor<T extends Element>(this: Element, selector: string): T | null;
export function getAncestor(this: Node, level: number): Node | null;
export function getAncestor<T extends Element>(this: Node, arg: string | number): T | Node | null {
  // Case 1: numeric level
  if (typeof arg === "number") {
    let node: Node | null = this;
    for (let i = 0; i < arg; i++) {
      if (!node?.parentNode) return null;
      node = node.parentNode;
    }
    return node;
  }

  // Case 2: selector string
  const selector = arg;
  let el: Element | null = this instanceof Element ? this : this.parentElement;
  while (el) {
    if (el.matches(selector)) {
      return el as T;
    }
    el = el.parentElement;
  }
  return null;
}
export function createChildren (this: HTMLElement, elements: HTMLElementCascade): void {
  const element = document.createElement(elements.element);

  if (elements.id) {
    element.id = elements.id;
  }

  if (elements.className) {
    if (Array.isArray(elements.className)) {
      element.classList.add(...elements.className);
    } else {
      element.classList.add(elements.className);
    }
  }

  // Assign additional attributes dynamically
  for (const key in elements) {
    if (!['element', 'id', 'className', 'children'].includes(key)) {
      const value = elements[key as keyof HTMLElementCascade];
      if (typeof value === 'string') {
        element.setAttribute(key, value);
      } else if (Array.isArray(value)) {
        element.setAttribute(key, value.join(' ')); // Convert array to space-separated string
      }
    }
  }

  // Recursively create children
  if (elements.children) {
    if (Array.isArray(elements.children)) {
      elements.children.forEach(child => {
        // Recursively create child elements
        element.createChildren(child);
      });
    } else {
      // Recursively create a single child element
      element.createChildren(elements.children);
    }
  }

  this.appendChild(element);
};

export function tag <S extends HTMLElement, T extends HTMLTag = HTMLElementTagNameOf<S>>(
  this: S,
  newTag?: T
): HTMLElementOf<T> | string {
  if (!newTag) {
    return this.tagName.toLowerCase() as HTMLTag;
  }

  const newElement = document.createElement(newTag) as HTMLElementOf<T>;

  // Copy attributes
  Array.from(this.attributes).forEach(attr => {
    newElement.setAttribute(attr.name, attr.value);
  });

  // Copy dataset
  Object.entries(this.dataset).forEach(([key, value]) => {
    newElement.dataset[key] = value;
  });

  // Copy inline styles
  newElement.style.cssText = this.style.cssText;

  // Copy classes
  newElement.className = this.className;

  // Copy child nodes
  while (this.firstChild) {
    newElement.appendChild(this.firstChild);
  }

  // Transfer listeners (if you have a system for it)
  if ((this as any)._eventListeners instanceof Map) {
    const listeners = (this as any)._eventListeners as Map<string, EventListenerOrEventListenerObject[]>;
    listeners.forEach((fns, type) => {
      fns.forEach(fn => newElement.addEventListener(type, fn));
    });
    (newElement as any)._eventListeners = new Map(listeners);
  }

  // Optional: Copy properties (if you have custom prototype extensions)
  for (const key in this) {
    // Skip built-in DOM properties and functions
    if (
      !(key in newElement) &&
      typeof (this as any)[key] !== "function"
    ) {
      try {
        (newElement as any)[key] = (this as any)[key];
      } catch {
        // Some props might be readonly — safely ignore
      }
    }
  }

  this.replaceWith(newElement);
  return newElement;
};

export function html (this: HTMLElement, input?: string): string {
  return input !== undefined ? (this.innerHTML = input) : this.innerHTML;
};

export function text(this: Element, text?: string | ((text: string) => string), ...input: (string)[]): string {
  // If text is provided, update the textContent
  if (text !== undefined) {
    if (typeof text === "string") {
      input.unshift(text); // Add the text parameter to the beginning of the input array
      const joined = input.join(" "); // Join all the strings with a space

      // Replace "textContent" if it's found in the joined string (optional logic)
      this.textContent = joined.includes("textContent")
        ? joined.replace("textContent", this.textContent ?? "")
        : joined;
    } else {
      this.textContent = text(this.textContent ?? "");
    }
  }

  // Return the current textContent if no arguments are passed
  return this.textContent ?? "";
};

export function show (this: HTMLElement) {
  this.css("visibility", "visible");
};

export function hide (this: HTMLElement) {
  this.css("visibility", "hidden");
};

export function toggle (this: HTMLElement) {
  if (this.css("visibility") === "visible" || this.css("visibility") === "") {
    this.hide();
  } else {
    this.show();
  }
};

export function find (this: Node, selector: string): Node | null {
  return this.querySelector(selector); // Returns a single Element or null
};

export function findAll (this: Node, selector: string): NodeListOf<Element> {
  return this.querySelectorAll(selector); // Returns a single Element or null
};

export function getChildren (this: Node): NodeListOf<ChildNode> {
  return this.childNodes;
};

export function getSiblings (this: Node, inclusive?: boolean): Node[] {
  const siblings = Array.from(this.parentNode!.childNodes as NodeListOf<Node>);
  if (inclusive) {
    return siblings; // Include current node as part of siblings
  } else {
    return siblings.filter(node => !node.isSameNode(this));
  }
};

export function serialize (this: HTMLFormElement): string {
  const formData = new FormData(this); // Create a FormData object from the form

  // Create an array to hold key-value pairs
  const entries: [string, string][] = [];

  // Use FormData's forEach method to collect form data
  formData.forEach((value, key) => {
    entries.push([key, value.toString()]);
  });

  // Convert the entries into a query string
  return entries
    .map(([key, value]) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .join('&'); // Join the array into a single string, separated by '&'
};

export function elementCreator (this: HTMLElement) {
  return new HTMLElementCreator(this);
};

export function cut<T extends Element>(this: T): T {
  const clone = document.createElementNS(this.namespaceURI, this.tagName) as T;

  // Copy all attributes
  for (const attr of Array.from(this.attributes)) {
    clone.setAttribute(attr.name, attr.value);
  }

  // Deep copy child nodes (preserves text, elements, etc.)
  for (const child of Array.from(this.childNodes)) {
    clone.appendChild(child.cloneNode(true));
  }

  // Optionally copy inline styles (not always needed if using setAttribute above)
   if (this instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.style.cssText = this.style.cssText;
  }

  this.remove(); // Remove original from DOM

  return clone;
}

}
namespace Opti {

export function ready (callback: (this: Document, ev: Event) => any) {
  document.addEventListener("DOMContentLoaded", callback);
}

export function leaving (callback: (this: Document, ev: Event) => any): void {
  document.addEventListener("unload", (e) => callback.call(document, e));
}

export function bindShortcut (
  shortcut: Shortcut,
  callback: (event: ShortcutEvent) => void
): void {
  document.addEventListener('keydown', (event: Event) => {
    const keyboardEvent = event as ShortcutEvent;
    keyboardEvent.keys = shortcut.split("+") as [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    const keys = shortcut
      .trim()
      .toLowerCase()
      .split("+");

    // Separate out the modifier keys and the actual key
    const modifiers = keys.slice(0, -1);
    const finalKey = keys[keys.length - 1];

    const modifierMatch = modifiers.every((key: any) => {
      if (key === 'ctrl' || key === 'control') return keyboardEvent.ctrlKey;
      if (key === 'alt') return keyboardEvent.altKey;
      if (key === 'shift') return keyboardEvent.shiftKey;
      if (key === 'meta' || key === 'windows' || key === 'command') return keyboardEvent.metaKey;
      return false;
    });

    // Check that the pressed key matches the final key
    const keyMatch = finalKey === keyboardEvent.key.toLowerCase();

    if (modifierMatch && keyMatch) {
      callback(keyboardEvent);
    }
  });
}

export function documentCss (
  element: string,
  object?: Partial<Record<keyof CSSStyleDeclaration, string | number>>
): any {
  const selector = element.trim();
  if (!selector) {
    throw new Error("Selector cannot be empty.");
  }

  let styleTag = document.querySelector("style[js-styles]") as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.setAttribute("js-styles", "");
    document.head.appendChild(styleTag);
  }

  const sheet = styleTag.sheet as CSSStyleSheet;
  let ruleIndex = -1;
  const existingStyles: StringRecord<string> = {};

  for (let i = 0; i < sheet.cssRules.length; i++) {
    const rule = sheet.cssRules[i];
    if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
      ruleIndex = i;
      const declarations = rule.style;
      for (let j = 0; j < declarations.length; j++) {
        const name = declarations[j];
        existingStyles[name] = declarations.getPropertyValue(name).trim();
      }
      break;
    }
  }

  if (!object || Object.keys(object).length === 0) {
    return existingStyles;
  }

  // Convert camelCase to kebab-case
  const newStyles: StringRecord<string> = {};
  for (const [prop, val] of Object.entries(object)) {
    if (val !== null && val !== undefined) {
      const kebab = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      newStyles[kebab] = val.toString();
    }
  }

  const mergedStyles = { ...existingStyles, ...newStyles };
  const styleString = Object.entries(mergedStyles)
    .map(([prop, val]) => `${prop}: ${val};`)
    .join(" ");

  if (ruleIndex !== -1) {
    sheet.deleteRule(ruleIndex);
  }

  try {
    sheet.insertRule(`${selector} { ${styleString} }`, sheet.cssRules.length);
  } catch (err) {
    console.error("Failed to insert CSS rule:", err, { selector, styleString });
  }
}

export function createElementTree<T extends HTMLElement>(node: ElementNode): T {
  const el = document.createElement(node.tag);

  // Add class if provided
  if (node.class) el.className = node.class;

  // Add text content if provided
  if (node.text) el.textContent = node.text;

  // Add inner HTML if provided
  if (node.html) el.innerHTML = node.html;

  // Handle styles, ensure it’s an object
  if (node.style && typeof node.style === 'object') {
    for (const [prop, val] of Object.entries(node.style)) {
      el.style.setProperty(prop, val.toString());
    }
  }

  // Handle other attributes (excluding known keys)
  for (const [key, val] of Object.entries(node)) {
    if (
      key !== 'tag' &&
      key !== 'class' &&
      key !== 'text' &&
      key !== 'html' &&
      key !== 'style' &&
      key !== 'children'
    ) {
      if (typeof val === 'string') {
        el.setAttribute(key, val);
      } else throw new Opti.CustomException("ParameterError", "Custom parameters must be of type 'string'");
    }
  }

  // Handle children (ensure it's an array or a single child)
  if (node.children) {
    if (Array.isArray(node.children)) {
      node.children.forEach(child => {
        el.appendChild(createElementTree(child));
      });
    } else {
      el.appendChild(createElementTree(node.children)); // Support for a single child node
    }
  }

  return el as T;
}

export function $ (selector: string) {
  return document.querySelector(selector);
};

export function $$ (selector: string) {
  return document.querySelectorAll(selector);
};

}
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

  export class ShortcutEvent extends KeyboardEvent {
    keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    constructor(
      keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?],
      eventInit?: ShortcutEventInit
    ) {
      const lastKey = keys[keys.length - 1] || "";
      super("keydown", { ...eventInit, key: lastKey });
      this.keys = keys;
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

  export namespace Crafty {
    export interface Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {
      getProp<K extends keyof P>(prop: K): P[K];
      setProp<K extends keyof P>(prop: K, value: P[K]): void;
      getChildren(): C;
      append(child: Crafty.Child): void;
      prepend(child: Crafty.Child): void;
      remove(child: Crafty.Child): void;
      insert?(child: Crafty.Child, index: number): void;
    }

    export type Props<T extends HTMLTag> = Partial<{
      tag: T,
      class: string | string[],
      text: string,
      id: string,
      name: string,
      [key: string]: unknown
    } & Pick<HTMLElementOf<T>, AccessorKeys<HTMLElementOf<T>>>
    >;

    export type Child = Crafty.Element<any, any, any> | Crafty.Fragment<any, any, any>;

    export class Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {  // <- implements the interface
      public tag: T;
      public props: P;
      public children: C;

      constructor(tag: T, props?: P, children?: C) {
        this.tag = tag;
        this.props = props ?? ({} as P);
        this.children = children ?? [] as unknown as C;
      }

      getProp<K extends keyof P>(prop: K): P[K] {
        return this.props[prop];
      }

      setProp<K extends keyof P>(prop: K, value: P[K]): void {
        this.props[prop] = value;
      }

      getChildren(): C {
        return this.children;
      }

      append(child: Crafty.Child): void {
        this.children = [...this.children, child] as unknown as C;
      }

      prepend(child: Crafty.Child): void {
        this.children = [child, ...this.children] as unknown as C;
      }

      remove(child: Crafty.Child): void {
        this.children = this.children.filter(c => c !== child) as unknown as C;
      }

      render(): HTMLElementOf<T> {
        // your render implementation here
        throw new Error("Not implemented");
      }
    }

    export class Fragment<
      T extends HTMLTag,
      P extends Props<T> = Props<T>,
      C extends readonly Child[] = readonly []
    > extends Element<T, P, C> {
      // can override or extend render() etc.
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
function defineProperty<T>(
  object: any,
  prop: PropertyKey,
  getter: () => T,
  setter?: (value: T) => void
): void {
  Object.defineProperty(object, prop, {
    get: getter,
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function defineGetter<T>(object: any, prop: PropertyKey, getter: () => T): void {
  defineProperty(object, prop, getter);
}

function defineSetter<T>(object: any, prop: PropertyKey, setter: (value: T) => void): void {
  Object.defineProperty(object, prop, {
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function toArray(collection: HTMLCollectionOf<Element> | NodeListOf<Element>): Element[] {
  return Array.from(collection);
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isGlobal(val: any): val is typeof globalThis {
  return val === globalThis;
}

function typedEntries<T extends object, K extends keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][];
}

(function() {
  //@ts-ignore
  globalThis.Opti ??= {};

  globalThis.f = (iife: () => void) => iife();
  globalThis.createEventListener = Opti.createEventListener;
  globalThis.Time = Opti.Time;
  globalThis.ShortcutEvent = Opti.ShortcutEvent;
  globalThis.isEmpty = Opti.isEmpty;
  globalThis.type = Opti.type;
  globalThis.generateID = Opti.generateID;
  globalThis.Colorize = Opti.Colorize;
  globalThis.Exception = Opti.Exception;
  globalThis.UnknownException = Opti.UnknownException;
  globalThis.NotImplementedException = Opti.NotImplementedException;
  globalThis.AccessException = Opti.AccessException;
  globalThis.CustomException = Opti.CustomException;
  globalThis.ColorizedSyntaxException = Opti.ColorizedSyntaxException;
  globalThis.RuntimeException = Opti.RuntimeException;
  globalThis.Enum = Opti.Enum;
  globalThis.Collection = Opti.Collection;  

  Document.prototype.ready = Opti.ready;
  Document.prototype.leaving = Opti.leaving;
  Document.prototype.bindShortcut = Opti.bindShortcut;
  Document.prototype.css = Opti.documentCss;
  Document.prototype.createElementTree = Opti.createElementTree;

  NodeList.prototype.addEventListener = Opti.addEventListenerEnum;
  NodeList.prototype.addClass = Opti.addClassList;
  NodeList.prototype.removeClass = Opti.removeClassList;
  NodeList.prototype.toggleClass = Opti.toggleClassList;
  NodeList.prototype.single = function (this: NodeList) {
    return this.length > 0 ? this[0] : null;
  };

  HTMLCollection.prototype.addEventListener = Opti.addEventListenerEnum;
  HTMLCollection.prototype.addClass = Opti.addClassList;
  HTMLCollection.prototype.removeClass = Opti.removeClassList;
  HTMLCollection.prototype.toggleClass = Opti.toggleClassList;
  HTMLCollection.prototype.single = function (this: HTMLCollection) {
    return this.length > 0 ? this[0] : null;
  };

  EventTarget.prototype.addBoundListener = Opti.addBoundListener;
  EventTarget.prototype.addEventListeners = Opti.addEventListeners;
  EventTarget.prototype.delegateEventListener = Opti.delegateEventListener;

  Element.prototype.hasText = Opti.hasText;
  Element.prototype.txt = Opti.text;
  Element.prototype.addClass = Opti.addClass;
  Element.prototype.removeClass = Opti.removeClass;
  Element.prototype.toggleClass = Opti.toggleClass;
  Element.prototype.hasClass = Opti.hasClass;

  HTMLElement.prototype.css = Opti.css;
  HTMLElement.prototype.elementCreator = Opti.elementCreator;
  HTMLElement.prototype.tag = Opti.tag;
  HTMLElement.prototype.html = Opti.html;
  HTMLElement.prototype.show = Opti.show;
  HTMLElement.prototype.hide = Opti.hide;
  HTMLElement.prototype.toggle = Opti.toggle;

  HTMLFormElement.prototype.serialize = Opti.serialize;

  Node.prototype.parent = Opti.getParent;
  Node.prototype.ancestor = Opti.getAncestor;
  Node.prototype.getChildren = Opti.getChildren;
  Node.prototype.siblings = Opti.getSiblings;
  Node.prototype.$ = Opti.find;
  Node.prototype.$$ = Opti.findAll;
  Number.prototype.repeat = Opti.repeat;
  Array.prototype.unique = Opti.unique;
  Array.prototype.chunk = Opti.chunk;
  String.prototype.remove = Opti.remove;
  String.prototype.removeAll = Opti.removeAll;
  String.prototype.capitalize = Opti.capitalize;

  Math.random = Opti.random;
  JSON.parseFile = Opti.parseFile;
  Object.clone = Opti.clone;
  Object.forEach = Opti.forEach;
  Date.at = Opti.atDate;
  Date.fromTime = Opti.fromTime;

  defineGetter(Window.prototype, "width", () => window.innerWidth || document.body.clientWidth);
  defineGetter(Window.prototype, "height", () => window.innerHeight || document.body.clientHeight);
  defineGetter(HTMLElement.prototype, "visible", function (this: HTMLElement) {
    return this.css("visibility") !== "hidden"
      ? this.css("display") !== "none"
      : Number(this.css("opacity")) > 0;
  });
})();
namespace Opti {

export function atDate(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number {
  return new Date(year, monthIndex, date, hours, minutes, seconds, ms).getTime();
}

export function fromTime (this: DateConstructor, time: Time, year: number, monthIndex: number, date?: number | undefined): Date {
  return new Date(year, monthIndex, date, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
}

export function clone<T>(object: T, deep: boolean = true): T {
  if (object === null || typeof object === "undefined") {
    return object;
  } else if (typeof object !== "object" && typeof object !== "symbol" && typeof object !== "function") {
    return object;
  }

  const shallowClone = (): T =>
    Object.assign(Object.create(Object.getPrototypeOf(object)), object);

  const deepClone = (obj: any, seen = new WeakMap()): any => {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj)) return seen.get(obj);

    // Preserve prototype
    const cloned = Array.isArray(obj)
      ? []
      : Object.create(Object.getPrototypeOf(obj));

    seen.set(obj, cloned);

    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) {
      obj.forEach((v, k) =>
        cloned.set(deepClone(k, seen), deepClone(v, seen))
      );
      return cloned;
    }
    if (obj instanceof Set) {
      obj.forEach(v => cloned.add(deepClone(v, seen)));
      return cloned;
    }
    if (ArrayBuffer.isView(obj)) return new (obj.constructor as any)(obj);
    if (obj instanceof ArrayBuffer) return obj.slice(0);

    for (const key of Reflect.ownKeys(obj)) {
      cloned[key] = deepClone(obj[key], seen);
    }

    return cloned;
  };

  return deep ? deepClone(object) : shallowClone();
};

export function repeat (this: number, iterator: (i: number) => any): void {
  for (let i = 0; i < this; i++) {
    iterator(i);
  }
};

export function unique<T>(this: T[]): T[] {
  return [...new Set(this)];
};

export function chunk<T>(this: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) throw new TypeError("`chunkSize` cannot be a number below 1");

  const newArr: T[][] = [];
  let tempArr: T[] = [];

  this.forEach(val => {
    tempArr.push(val);
    if (tempArr.length === chunkSize) {
      newArr.push(tempArr);
      tempArr = []; // Reset tempArr for the next chunk
    }
  });

  // Add the remaining elements in tempArr if any
  if (tempArr.length) {
    newArr.push(tempArr);
  }

  return newArr;
};

export function remove (this: string, finder: string | RegExp): string {
  return this.replace(finder, "");
};

export function removeAll (this: string, finder: string | RegExp): string {
  if (finder instanceof RegExp) {
    if (!finder.flags.includes("g")) {
      finder = new RegExp(finder.source, finder.flags + "g");
    }
  }
  return this.replaceAll(finder, "");
};

const origionalRandom = Math.random;
export const random = (minOrMax?: number, max?: number) => {
  if (isDefined(minOrMax) && isDefined(max)) {
    return origionalRandom() * (max - minOrMax) + minOrMax;
  } else if (isDefined(minOrMax)) {
    return origionalRandom() * minOrMax;
  } else return origionalRandom();
};

export function isDefined<T>(obj: T | undefined): obj is T {
  return typeof obj !== "undefined";
}

export function forEach<T>(object: T, iterator: (key: keyof T, value: T[keyof T]) => any): void {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      iterator(key, object[key]);
    }
  }
};

export function capitalize(this: string): string {
  const i = this.search(/\S/);
  return i === -1 ? this : this.slice(0, i) + this.charAt(i).toUpperCase() + this.slice(i + 1);
};

export async function parseFile<R = any, T = R>(
  file: string,
  receiver?: (content: T) => R
): Promise<R> {
  const fileContent = await fetch(file).then(res => res.json() as Promise<T>);

  if (!receiver) {
    return fileContent as unknown as R;
  }

  return receiver(fileContent);
};

const origionallog = console.log;
export function log(colorize?: true, ...data: any[]) {
  const text = data.map(val => typeof val === "string" ? val : JSON.stringify(val)).join(" ");
  origionallog(Colorize`${text}`);
}

}
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
namespace Opti {

export function type (val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";

  const typeOf = typeof val;
  if (typeOf === "function") {
    return `Function:${val.name || "<anonymous>"}(${val.length})`;
  }

  let typeName = capitalize.call(Object.prototype.toString.call(val).slice(8, -1));

  const ctor = val.constructor?.name;
  if (ctor && ctor !== typeName) {
    typeName = ctor;
  }

  const len = (val as any).length;
  if (typeof len === "number" && Number.isFinite(len)) {
    typeName += `(${len})`;
  } else if (val instanceof Map || val instanceof Set) {
    typeName += `(${val.size})`;
  } else if (val instanceof Date && !isNaN(val.getTime())) {
    typeName += `:${val.toISOString().split("T")[0]}`;
  } else if (typeName === "Object") {
    typeName += `(${Object.keys(val).length})`;
  }

  return typeName;
};

// Mapping of style keywords to ANSI escape codes for terminal formatting
const styles: Record<string, string> = {
  red: "\x1b[31m",
  orange: "\x1b[38;5;208m", // extended ANSI orange
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  purple: "\x1b[35m",
  pink: "\x1b[38;5;205m", // extended ANSI pink
  underline: "\x1b[4m",
  bold: "\x1b[1m",
  strikethrough: "\x1b[9m",
  italic: "\x1b[3m",
  emphasis: "\x1b[3m", // alias for italic
  reset: "\x1b[0m",
};

export function Colorize(strings: TemplateStringsArray, ...values: any[]) {
  // Combine all parts of the template string with interpolated values
  let input = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

  // Replace shorthand syntax for bold and underline
  // Replace {_..._} and {*...*} with {underline:...}, and {**...**} with {bold:...}
  input = input
    .replace(/\{_([^{}]+)_\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\{\*\*([^{}]+)\*\*\}/g, (_, content) => `{bold:${content}}`)
    .replace(/\{\*([^{}]+)\*\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\\x1b/g, '\x1b');

  // Replace escaped braces \{ and \} with placeholders so they are not parsed as tags
  input = input.replace(/\\\{/g, "__ESCAPED_OPEN_BRACE__").replace(/\\\}/g, "__ESCAPED_CLOSE_BRACE__");

  let output = ""; // Final output string with ANSI codes
  const stack: string[] = []; // Stack to track open styles for proper nesting
  let i = 0; // Current index in input

  while (i < input.length) {
    // Match the start of a style tag like {red: or {(dynamic ANSI code):
    const openMatch = input.slice(i).match(/^\{([a-zA-Z]+|\([^)]+\)):/);

    if (openMatch) {
      let tag = openMatch[1];

      if (tag.startsWith("(") && tag.endsWith(")")) {
        // Dynamic ANSI escape code inside parentheses
        tag = tag.slice(1, -1); // remove surrounding parentheses
        stack.push("__dynamic__");
        output += tag; // Insert raw ANSI code directly
      } else {
        if (!styles[tag]) {
          throw new ColorizedSyntaxException(`Unknown style: ${tag}`);
        }
        stack.push(tag);
        output += styles[tag];
      }
      i += openMatch[0].length; // Move index past the opening tag
      continue;
    }

    // Match closing tag '}'
    if (input[i] === "}") {
      if (!stack.length) {
        // No corresponding opening tag
        throw new ColorizedSyntaxException(`Unexpected closing tag at index ${i}`);
      }
      stack.pop(); // Close the last opened tag
      output += styles.reset; // Reset styles
      // Re-apply all remaining styles still on the stack
      for (const tag of stack) {
        // Reapply dynamic codes as-is, else mapped styles
        output += tag === "__dynamic__" ? "" : styles[tag];
      }
      i++; // Move past closing brace
      continue;
    }

    // Append normal character to output, but restore escaped braces if needed
    if (input.startsWith("__ESCAPED_OPEN_BRACE__", i)) {
      output += "{";
      i += "__ESCAPED_OPEN_BRACE__".length;
      continue;
    }
    if (input.startsWith("__ESCAPED_CLOSE_BRACE__", i)) {
      output += "}";
      i += "__ESCAPED_CLOSE_BRACE__".length;
      continue;
    }

    output += input[i++];
  }

  // If stack is not empty, we have unclosed tags
  if (stack.length) {
    const lastUnclosed = stack[stack.length - 1];
    throw new ColorizedSyntaxException(`Missing closing tag for: ${lastUnclosed}`);
  }

  // Ensure final reset for safety
  return output + styles.reset;
}

export function isEmpty(val: string): val is "";
export function isEmpty(val: number): val is 0 | typeof NaN;
export function isEmpty(val: boolean): val is false;
export function isEmpty(val: null | undefined): true;
export function isEmpty(val: Array<any>): val is [];
export function isEmpty(val: Record<any, unknown>): val is Record<any, never>;
export function isEmpty(val: Map<any, any>): val is Map<any, never>;
export function isEmpty(val: Set<any>): val is Set<never>;
export function isEmpty(val: WeakMap<object, any>): val is WeakMap<object, any>;
export function isEmpty(val: WeakSet<object>): val is WeakSet<object>;
export function isEmpty(val: any): boolean {
  // Generic type checking
  // eslint-disable-next-line eqeqeq
  if (val == null || val === false || val === "") return true;

  // Number checking
  if (typeof val === "number") return val === 0 || Number.isNaN(val);

  // Array checking
  if (Array.isArray(val) && val.length === 0) return true;

  // Map, Set, and weak variant checks
  if (val instanceof Map || val instanceof Set || val instanceof WeakMap || val instanceof WeakSet) {
    return (val as any).size === 0; // size check works for these types
  }

  // Object checking
  if (typeof val === 'object') {
    const proto = Object.getPrototypeOf(val);
    const isPlain = proto === Object.prototype || proto === null;
    return isPlain && Object.keys(val).length === 0;
  }

  return false;
}

export function createEventListener<T extends ((...args: any[]) => any)[]>(
  triggers: T,
  callback: (...results: CallbackResult<T>) => void
): void {
  const originals = triggers.map(fn => fn);

  triggers.forEach((originalFn, i) => {
    function wrapper (this: any, ...args: any[]) {
      const result = originals[i].apply(this, args);
      callback(...triggers.map((_, j) =>
        j === i ? result : undefined
      ) as any);
      return result;
    };

    // Replace global function by matching the actual function object
    if (typeof window !== "undefined") {
      for (const key in window) {
        if ((window as any)[key] === originalFn) {
          (window as any)[key] = wrapper;
          return; // stop after replacement
        }
      }
    }

    console.warn("Cannot replace function:", originalFn);
  });
}

export function generateID(): ID {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&*_-";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Type assertion to add the brand
  return Object.freeze(result) as ID;
}

}
namespace Opti {
  export class Exception extends Error {
    private _name: string;
    private _message: string;
    private _cause: string;
    private _internalStack: string;

    constructor(name: string | null, message: string = "", cause: string = "") {
      super();
      this._message = message;
      this._cause = cause;
      this._name = name ?? "Exception";
      this._internalStack = new Error().stack ?? "";

      this.stack = "";
      this.message = "";
    }

    public get name(): string {
      return this._name;
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public throw(): never {
      throw this;
    }

    public getStackTrace(): string {
      return this._internalStack;
    }

    public override toString(): string {
      return `${this._name}: ${this._message}\r\n${this._internalStack}`;
    }
  }

  export class RuntimeException {
    private _message: string;
    private _cause: string;

    public constructor(message: string = "", cause: string = "") {
      this._message = message;
      this._cause = cause;
    }

    public get name(): "RuntimeException" {
      return "RuntimeException";
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public toString(): string {
      return `RuntimeException: ${this._message}`;
    }
  }

  export class NotImplementedException extends Exception {
    constructor(message?: string, cause?: string) {
      super("NotImplementedException", message, cause);
    }
  }

  export class ColorizedSyntaxException extends Exception {
    constructor(message?: string, cause?: string) {
      super("ColorizedSyntaxException", message, cause);
      Object.setPrototypeOf(this, ColorizedSyntaxException.prototype);
    }
  }

  export class UnknownException extends Exception {
    constructor(message?: string, cause?: string) {
      super("UnknownException", message, cause);
      Object.setPrototypeOf(this, UnknownException.prototype);
    }
  }

  export class AccessException extends Exception {
    constructor(message?: string, cause?: string) {
      super("AccessException", message, cause);
      Object.setPrototypeOf(this, AccessException.prototype);
    }
  }

  export class CustomException extends Exception {
    constructor(name: string, message?: string, cause?: string) {
      super(name, message, cause);
      Object.setPrototypeOf(this, CustomException.prototype);
    }
  }
}
namespace Opti {

export function addBoundListener <T extends EventTarget, K extends keyof EventMapOf<T>>(
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

export function addEventListeners<T extends EventTarget>(
  this: T,
  listenersOrTypes: (keyof EventMapOf<T>)[] | {
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

}
namespace Opti {

export function hasText (this: Element, text: string | RegExp): boolean {
  if (typeof text === "string") {
    return this.txt().includes(text);
  } else {
    return text.test(this.txt());
  }
}

export function addClass (this: Element, elClass: string): void {
  this.classList.add(elClass);
}

export function removeClass (this: Element, elClass: string): void {
  this.classList.remove(elClass);
}

export function toggleClass (this: Element, elClass: string): void {
  this.classList.toggle(elClass);
}

export function hasClass (this: Element, elClass: string): boolean {
  return this.classList.contains(elClass);
}

export function css(
  this: HTMLElement,
  key?: keyof CSSStyleDeclaration | Partial<Record<keyof CSSStyleDeclaration, string | number>>,
  value?: string | number
): any {
  const css = this.style;

  if (!key) {
    // Return all styles
    const result: Partial<Record<keyof CSSStyleDeclaration, string>> = {};
    for (let i = 0; i < css.length; i++) {
      const prop = css[i];
      if (prop) {
        result[prop as keyof CSSStyleDeclaration] = css.getPropertyValue(prop).trim();
      }
    }
    return result;
  }

  if (typeof key === "string") {
    if (value === undefined) {
      // Get one value
      return css.getPropertyValue(key).trim();
    } else {
      // Set one value
      if (key in css) {
        css.setProperty(toKebabCase(key), value.toString());
      }
    }
  } else {
    // Set multiple
    for (const [prop, val] of Object.entries(key)) {
      if (val !== null && val !== undefined) {
        css.setProperty(toKebabCase(prop), val.toString());
      }
    }
  }
};

export function getParent (this: Node): Node | null {
  return this.parentElement;
};

export function getAncestor<T extends Element>(this: Element, selector: string): T | null;
export function getAncestor(this: Node, level: number): Node | null;
export function getAncestor<T extends Element>(this: Node, arg: string | number): T | Node | null {
  // Case 1: numeric level
  if (typeof arg === "number") {
    let node: Node | null = this;
    for (let i = 0; i < arg; i++) {
      if (!node?.parentNode) return null;
      node = node.parentNode;
    }
    return node;
  }

  // Case 2: selector string
  const selector = arg;
  let el: Element | null = this instanceof Element ? this : this.parentElement;
  while (el) {
    if (el.matches(selector)) {
      return el as T;
    }
    el = el.parentElement;
  }
  return null;
}
export function createChildren (this: HTMLElement, elements: HTMLElementCascade): void {
  const element = document.createElement(elements.element);

  if (elements.id) {
    element.id = elements.id;
  }

  if (elements.className) {
    if (Array.isArray(elements.className)) {
      element.classList.add(...elements.className);
    } else {
      element.classList.add(elements.className);
    }
  }

  // Assign additional attributes dynamically
  for (const key in elements) {
    if (!['element', 'id', 'className', 'children'].includes(key)) {
      const value = elements[key as keyof HTMLElementCascade];
      if (typeof value === 'string') {
        element.setAttribute(key, value);
      } else if (Array.isArray(value)) {
        element.setAttribute(key, value.join(' ')); // Convert array to space-separated string
      }
    }
  }

  // Recursively create children
  if (elements.children) {
    if (Array.isArray(elements.children)) {
      elements.children.forEach(child => {
        // Recursively create child elements
        element.createChildren(child);
      });
    } else {
      // Recursively create a single child element
      element.createChildren(elements.children);
    }
  }

  this.appendChild(element);
};

export function tag <S extends HTMLElement, T extends HTMLTag = HTMLElementTagNameOf<S>>(
  this: S,
  newTag?: T
): HTMLElementOf<T> | string {
  if (!newTag) {
    return this.tagName.toLowerCase() as HTMLTag;
  }

  const newElement = document.createElement(newTag) as HTMLElementOf<T>;

  // Copy attributes
  Array.from(this.attributes).forEach(attr => {
    newElement.setAttribute(attr.name, attr.value);
  });

  // Copy dataset
  Object.entries(this.dataset).forEach(([key, value]) => {
    newElement.dataset[key] = value;
  });

  // Copy inline styles
  newElement.style.cssText = this.style.cssText;

  // Copy classes
  newElement.className = this.className;

  // Copy child nodes
  while (this.firstChild) {
    newElement.appendChild(this.firstChild);
  }

  // Transfer listeners (if you have a system for it)
  if ((this as any)._eventListeners instanceof Map) {
    const listeners = (this as any)._eventListeners as Map<string, EventListenerOrEventListenerObject[]>;
    listeners.forEach((fns, type) => {
      fns.forEach(fn => newElement.addEventListener(type, fn));
    });
    (newElement as any)._eventListeners = new Map(listeners);
  }

  // Optional: Copy properties (if you have custom prototype extensions)
  for (const key in this) {
    // Skip built-in DOM properties and functions
    if (
      !(key in newElement) &&
      typeof (this as any)[key] !== "function"
    ) {
      try {
        (newElement as any)[key] = (this as any)[key];
      } catch {
        // Some props might be readonly — safely ignore
      }
    }
  }

  this.replaceWith(newElement);
  return newElement;
};

export function html (this: HTMLElement, input?: string): string {
  return input !== undefined ? (this.innerHTML = input) : this.innerHTML;
};

export function text(this: Element, text?: string | ((text: string) => string), ...input: (string)[]): string {
  // If text is provided, update the textContent
  if (text !== undefined) {
    if (typeof text === "string") {
      input.unshift(text); // Add the text parameter to the beginning of the input array
      const joined = input.join(" "); // Join all the strings with a space

      // Replace "textContent" if it's found in the joined string (optional logic)
      this.textContent = joined.includes("textContent")
        ? joined.replace("textContent", this.textContent ?? "")
        : joined;
    } else {
      this.textContent = text(this.textContent ?? "");
    }
  }

  // Return the current textContent if no arguments are passed
  return this.textContent ?? "";
};

export function show (this: HTMLElement) {
  this.css("visibility", "visible");
};

export function hide (this: HTMLElement) {
  this.css("visibility", "hidden");
};

export function toggle (this: HTMLElement) {
  if (this.css("visibility") === "visible" || this.css("visibility") === "") {
    this.hide();
  } else {
    this.show();
  }
};

export function find (this: Node, selector: string): Node | null {
  return this.querySelector(selector); // Returns a single Element or null
};

export function findAll (this: Node, selector: string): NodeListOf<Element> {
  return this.querySelectorAll(selector); // Returns a single Element or null
};

export function getChildren (this: Node): NodeListOf<ChildNode> {
  return this.childNodes;
};

export function getSiblings (this: Node, inclusive?: boolean): Node[] {
  const siblings = Array.from(this.parentNode!.childNodes as NodeListOf<Node>);
  if (inclusive) {
    return siblings; // Include current node as part of siblings
  } else {
    return siblings.filter(node => !node.isSameNode(this));
  }
};

export function serialize (this: HTMLFormElement): string {
  const formData = new FormData(this); // Create a FormData object from the form

  // Create an array to hold key-value pairs
  const entries: [string, string][] = [];

  // Use FormData's forEach method to collect form data
  formData.forEach((value, key) => {
    entries.push([key, value.toString()]);
  });

  // Convert the entries into a query string
  return entries
    .map(([key, value]) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .join('&'); // Join the array into a single string, separated by '&'
};

export function elementCreator (this: HTMLElement) {
  return new HTMLElementCreator(this);
};

export function cut<T extends Element>(this: T): T {
  const clone = document.createElementNS(this.namespaceURI, this.tagName) as T;

  // Copy all attributes
  for (const attr of Array.from(this.attributes)) {
    clone.setAttribute(attr.name, attr.value);
  }

  // Deep copy child nodes (preserves text, elements, etc.)
  for (const child of Array.from(this.childNodes)) {
    clone.appendChild(child.cloneNode(true));
  }

  // Optionally copy inline styles (not always needed if using setAttribute above)
   if (this instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.style.cssText = this.style.cssText;
  }

  this.remove(); // Remove original from DOM

  return clone;
}

}
namespace Opti {

export function ready (callback: (this: Document, ev: Event) => any) {
  document.addEventListener("DOMContentLoaded", callback);
}

export function leaving (callback: (this: Document, ev: Event) => any): void {
  document.addEventListener("unload", (e) => callback.call(document, e));
}

export function bindShortcut (
  shortcut: Shortcut,
  callback: (event: ShortcutEvent) => void
): void {
  document.addEventListener('keydown', (event: Event) => {
    const keyboardEvent = event as ShortcutEvent;
    keyboardEvent.keys = shortcut.split("+") as [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    const keys = shortcut
      .trim()
      .toLowerCase()
      .split("+");

    // Separate out the modifier keys and the actual key
    const modifiers = keys.slice(0, -1);
    const finalKey = keys[keys.length - 1];

    const modifierMatch = modifiers.every((key: any) => {
      if (key === 'ctrl' || key === 'control') return keyboardEvent.ctrlKey;
      if (key === 'alt') return keyboardEvent.altKey;
      if (key === 'shift') return keyboardEvent.shiftKey;
      if (key === 'meta' || key === 'windows' || key === 'command') return keyboardEvent.metaKey;
      return false;
    });

    // Check that the pressed key matches the final key
    const keyMatch = finalKey === keyboardEvent.key.toLowerCase();

    if (modifierMatch && keyMatch) {
      callback(keyboardEvent);
    }
  });
}

export function documentCss (
  element: string,
  object?: Partial<Record<keyof CSSStyleDeclaration, string | number>>
): any {
  const selector = element.trim();
  if (!selector) {
    throw new Error("Selector cannot be empty.");
  }

  let styleTag = document.querySelector("style[js-styles]") as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.setAttribute("js-styles", "");
    document.head.appendChild(styleTag);
  }

  const sheet = styleTag.sheet as CSSStyleSheet;
  let ruleIndex = -1;
  const existingStyles: StringRecord<string> = {};

  for (let i = 0; i < sheet.cssRules.length; i++) {
    const rule = sheet.cssRules[i];
    if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
      ruleIndex = i;
      const declarations = rule.style;
      for (let j = 0; j < declarations.length; j++) {
        const name = declarations[j];
        existingStyles[name] = declarations.getPropertyValue(name).trim();
      }
      break;
    }
  }

  if (!object || Object.keys(object).length === 0) {
    return existingStyles;
  }

  // Convert camelCase to kebab-case
  const newStyles: StringRecord<string> = {};
  for (const [prop, val] of Object.entries(object)) {
    if (val !== null && val !== undefined) {
      const kebab = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      newStyles[kebab] = val.toString();
    }
  }

  const mergedStyles = { ...existingStyles, ...newStyles };
  const styleString = Object.entries(mergedStyles)
    .map(([prop, val]) => `${prop}: ${val};`)
    .join(" ");

  if (ruleIndex !== -1) {
    sheet.deleteRule(ruleIndex);
  }

  try {
    sheet.insertRule(`${selector} { ${styleString} }`, sheet.cssRules.length);
  } catch (err) {
    console.error("Failed to insert CSS rule:", err, { selector, styleString });
  }
}

export function createElementTree<T extends HTMLElement>(node: ElementNode): T {
  const el = document.createElement(node.tag);

  // Add class if provided
  if (node.class) el.className = node.class;

  // Add text content if provided
  if (node.text) el.textContent = node.text;

  // Add inner HTML if provided
  if (node.html) el.innerHTML = node.html;

  // Handle styles, ensure it’s an object
  if (node.style && typeof node.style === 'object') {
    for (const [prop, val] of Object.entries(node.style)) {
      el.style.setProperty(prop, val.toString());
    }
  }

  // Handle other attributes (excluding known keys)
  for (const [key, val] of Object.entries(node)) {
    if (
      key !== 'tag' &&
      key !== 'class' &&
      key !== 'text' &&
      key !== 'html' &&
      key !== 'style' &&
      key !== 'children'
    ) {
      if (typeof val === 'string') {
        el.setAttribute(key, val);
      } else throw new Opti.CustomException("ParameterError", "Custom parameters must be of type 'string'");
    }
  }

  // Handle children (ensure it's an array or a single child)
  if (node.children) {
    if (Array.isArray(node.children)) {
      node.children.forEach(child => {
        el.appendChild(createElementTree(child));
      });
    } else {
      el.appendChild(createElementTree(node.children)); // Support for a single child node
    }
  }

  return el as T;
}

export function $ (selector: string) {
  return document.querySelector(selector);
};

export function $$ (selector: string) {
  return document.querySelectorAll(selector);
};

}
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

  export class ShortcutEvent extends KeyboardEvent {
    keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    constructor(
      keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?],
      eventInit?: ShortcutEventInit
    ) {
      const lastKey = keys[keys.length - 1] || "";
      super("keydown", { ...eventInit, key: lastKey });
      this.keys = keys;
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

  export namespace Crafty {
    export interface Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {
      getProp<K extends keyof P>(prop: K): P[K];
      setProp<K extends keyof P>(prop: K, value: P[K]): void;
      getChildren(): C;
      append(child: Crafty.Child): void;
      prepend(child: Crafty.Child): void;
      remove(child: Crafty.Child): void;
      insert?(child: Crafty.Child, index: number): void;
    }

    export type Props<T extends HTMLTag> = Partial<{
      tag: T,
      class: string | string[],
      text: string,
      id: string,
      name: string,
      [key: string]: unknown
    } & Pick<HTMLElementOf<T>, AccessorKeys<HTMLElementOf<T>>>
    >;

    export type Child = Crafty.Element<any, any, any> | Crafty.Fragment<any, any, any>;

    export class Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {  // <- implements the interface
      public tag: T;
      public props: P;
      public children: C;

      constructor(tag: T, props?: P, children?: C) {
        this.tag = tag;
        this.props = props ?? ({} as P);
        this.children = children ?? [] as unknown as C;
      }

      getProp<K extends keyof P>(prop: K): P[K] {
        return this.props[prop];
      }

      setProp<K extends keyof P>(prop: K, value: P[K]): void {
        this.props[prop] = value;
      }

      getChildren(): C {
        return this.children;
      }

      append(child: Crafty.Child): void {
        this.children = [...this.children, child] as unknown as C;
      }

      prepend(child: Crafty.Child): void {
        this.children = [child, ...this.children] as unknown as C;
      }

      remove(child: Crafty.Child): void {
        this.children = this.children.filter(c => c !== child) as unknown as C;
      }

      render(): HTMLElementOf<T> {
        // your render implementation here
        throw new Error("Not implemented");
      }
    }

    export class Fragment<
      T extends HTMLTag,
      P extends Props<T> = Props<T>,
      C extends readonly Child[] = readonly []
    > extends Element<T, P, C> {
      // can override or extend render() etc.
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
function defineProperty<T>(
  object: any,
  prop: PropertyKey,
  getter: () => T,
  setter?: (value: T) => void
): void {
  Object.defineProperty(object, prop, {
    get: getter,
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function defineGetter<T>(object: any, prop: PropertyKey, getter: () => T): void {
  defineProperty(object, prop, getter);
}

function defineSetter<T>(object: any, prop: PropertyKey, setter: (value: T) => void): void {
  Object.defineProperty(object, prop, {
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function toArray(collection: HTMLCollectionOf<Element> | NodeListOf<Element>): Element[] {
  return Array.from(collection);
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isGlobal(val: any): val is typeof globalThis {
  return val === globalThis;
}

function typedEntries<T extends object, K extends keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][];
}

(function() {
  //@ts-ignore
  globalThis.Opti ??= {};

  globalThis.f = (iife: () => void) => iife();
  globalThis.createEventListener = Opti.createEventListener;
  globalThis.Time = Opti.Time;
  globalThis.ShortcutEvent = Opti.ShortcutEvent;
  globalThis.isEmpty = Opti.isEmpty;
  globalThis.type = Opti.type;
  globalThis.generateID = Opti.generateID;
  globalThis.Colorize = Opti.Colorize;
  globalThis.Exception = Opti.Exception;
  globalThis.UnknownException = Opti.UnknownException;
  globalThis.NotImplementedException = Opti.NotImplementedException;
  globalThis.AccessException = Opti.AccessException;
  globalThis.CustomException = Opti.CustomException;
  globalThis.ColorizedSyntaxException = Opti.ColorizedSyntaxException;
  globalThis.RuntimeException = Opti.RuntimeException;
  globalThis.Enum = Opti.Enum;
  globalThis.Collection = Opti.Collection;  

  Document.prototype.ready = Opti.ready;
  Document.prototype.leaving = Opti.leaving;
  Document.prototype.bindShortcut = Opti.bindShortcut;
  Document.prototype.css = Opti.documentCss;
  Document.prototype.createElementTree = Opti.createElementTree;

  NodeList.prototype.addEventListener = Opti.addEventListenerEnum;
  NodeList.prototype.addClass = Opti.addClassList;
  NodeList.prototype.removeClass = Opti.removeClassList;
  NodeList.prototype.toggleClass = Opti.toggleClassList;
  NodeList.prototype.single = function (this: NodeList) {
    return this.length > 0 ? this[0] : null;
  };

  HTMLCollection.prototype.addEventListener = Opti.addEventListenerEnum;
  HTMLCollection.prototype.addClass = Opti.addClassList;
  HTMLCollection.prototype.removeClass = Opti.removeClassList;
  HTMLCollection.prototype.toggleClass = Opti.toggleClassList;
  HTMLCollection.prototype.single = function (this: HTMLCollection) {
    return this.length > 0 ? this[0] : null;
  };

  EventTarget.prototype.addBoundListener = Opti.addBoundListener;
  EventTarget.prototype.addEventListeners = Opti.addEventListeners;
  EventTarget.prototype.delegateEventListener = Opti.delegateEventListener;

  Element.prototype.hasText = Opti.hasText;
  Element.prototype.txt = Opti.text;
  Element.prototype.addClass = Opti.addClass;
  Element.prototype.removeClass = Opti.removeClass;
  Element.prototype.toggleClass = Opti.toggleClass;
  Element.prototype.hasClass = Opti.hasClass;

  HTMLElement.prototype.css = Opti.css;
  HTMLElement.prototype.elementCreator = Opti.elementCreator;
  HTMLElement.prototype.tag = Opti.tag;
  HTMLElement.prototype.html = Opti.html;
  HTMLElement.prototype.show = Opti.show;
  HTMLElement.prototype.hide = Opti.hide;
  HTMLElement.prototype.toggle = Opti.toggle;

  HTMLFormElement.prototype.serialize = Opti.serialize;

  Node.prototype.parent = Opti.getParent;
  Node.prototype.ancestor = Opti.getAncestor;
  Node.prototype.getChildren = Opti.getChildren;
  Node.prototype.siblings = Opti.getSiblings;
  Node.prototype.$ = Opti.find;
  Node.prototype.$$ = Opti.findAll;
  Number.prototype.repeat = Opti.repeat;
  Array.prototype.unique = Opti.unique;
  Array.prototype.chunk = Opti.chunk;
  String.prototype.remove = Opti.remove;
  String.prototype.removeAll = Opti.removeAll;
  String.prototype.capitalize = Opti.capitalize;

  Math.random = Opti.random;
  JSON.parseFile = Opti.parseFile;
  Object.clone = Opti.clone;
  Object.forEach = Opti.forEach;
  Date.at = Opti.atDate;
  Date.fromTime = Opti.fromTime;

  defineGetter(Window.prototype, "width", () => window.innerWidth || document.body.clientWidth);
  defineGetter(Window.prototype, "height", () => window.innerHeight || document.body.clientHeight);
  defineGetter(HTMLElement.prototype, "visible", function (this: HTMLElement) {
    return this.css("visibility") !== "hidden"
      ? this.css("display") !== "none"
      : Number(this.css("opacity")) > 0;
  });
})();
namespace Opti {

export function atDate(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number {
  return new Date(year, monthIndex, date, hours, minutes, seconds, ms).getTime();
}

export function fromTime (this: DateConstructor, time: Time, year: number, monthIndex: number, date?: number | undefined): Date {
  return new Date(year, monthIndex, date, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
}

export function clone<T>(object: T, deep: boolean = true): T {
  if (object === null || typeof object === "undefined") {
    return object;
  } else if (typeof object !== "object" && typeof object !== "symbol" && typeof object !== "function") {
    return object;
  }

  const shallowClone = (): T =>
    Object.assign(Object.create(Object.getPrototypeOf(object)), object);

  const deepClone = (obj: any, seen = new WeakMap()): any => {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj)) return seen.get(obj);

    // Preserve prototype
    const cloned = Array.isArray(obj)
      ? []
      : Object.create(Object.getPrototypeOf(obj));

    seen.set(obj, cloned);

    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) {
      obj.forEach((v, k) =>
        cloned.set(deepClone(k, seen), deepClone(v, seen))
      );
      return cloned;
    }
    if (obj instanceof Set) {
      obj.forEach(v => cloned.add(deepClone(v, seen)));
      return cloned;
    }
    if (ArrayBuffer.isView(obj)) return new (obj.constructor as any)(obj);
    if (obj instanceof ArrayBuffer) return obj.slice(0);

    for (const key of Reflect.ownKeys(obj)) {
      cloned[key] = deepClone(obj[key], seen);
    }

    return cloned;
  };

  return deep ? deepClone(object) : shallowClone();
};

export function repeat (this: number, iterator: (i: number) => any): void {
  for (let i = 0; i < this; i++) {
    iterator(i);
  }
};

export function unique<T>(this: T[]): T[] {
  return [...new Set(this)];
};

export function chunk<T>(this: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) throw new TypeError("`chunkSize` cannot be a number below 1");

  const newArr: T[][] = [];
  let tempArr: T[] = [];

  this.forEach(val => {
    tempArr.push(val);
    if (tempArr.length === chunkSize) {
      newArr.push(tempArr);
      tempArr = []; // Reset tempArr for the next chunk
    }
  });

  // Add the remaining elements in tempArr if any
  if (tempArr.length) {
    newArr.push(tempArr);
  }

  return newArr;
};

export function remove (this: string, finder: string | RegExp): string {
  return this.replace(finder, "");
};

export function removeAll (this: string, finder: string | RegExp): string {
  if (finder instanceof RegExp) {
    if (!finder.flags.includes("g")) {
      finder = new RegExp(finder.source, finder.flags + "g");
    }
  }
  return this.replaceAll(finder, "");
};

const origionalRandom = Math.random;
export const random = (minOrMax?: number, max?: number) => {
  if (isDefined(minOrMax) && isDefined(max)) {
    return origionalRandom() * (max - minOrMax) + minOrMax;
  } else if (isDefined(minOrMax)) {
    return origionalRandom() * minOrMax;
  } else return origionalRandom();
};

export function isDefined<T>(obj: T | undefined): obj is T {
  return typeof obj !== "undefined";
}

export function forEach<T>(object: T, iterator: (key: keyof T, value: T[keyof T]) => any): void {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      iterator(key, object[key]);
    }
  }
};

export function capitalize(this: string): string {
  const i = this.search(/\S/);
  return i === -1 ? this : this.slice(0, i) + this.charAt(i).toUpperCase() + this.slice(i + 1);
};

export async function parseFile<R = any, T = R>(
  file: string,
  receiver?: (content: T) => R
): Promise<R> {
  const fileContent = await fetch(file).then(res => res.json() as Promise<T>);

  if (!receiver) {
    return fileContent as unknown as R;
  }

  return receiver(fileContent);
};

const origionallog = console.log;
export function log(colorize?: true, ...data: any[]) {
  const text = data.map(val => typeof val === "string" ? val : JSON.stringify(val)).join(" ");
  origionallog(Colorize`${text}`);
}

}
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
namespace Opti {

export function type (val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";

  const typeOf = typeof val;
  if (typeOf === "function") {
    return `Function:${val.name || "<anonymous>"}(${val.length})`;
  }

  let typeName = capitalize.call(Object.prototype.toString.call(val).slice(8, -1));

  const ctor = val.constructor?.name;
  if (ctor && ctor !== typeName) {
    typeName = ctor;
  }

  const len = (val as any).length;
  if (typeof len === "number" && Number.isFinite(len)) {
    typeName += `(${len})`;
  } else if (val instanceof Map || val instanceof Set) {
    typeName += `(${val.size})`;
  } else if (val instanceof Date && !isNaN(val.getTime())) {
    typeName += `:${val.toISOString().split("T")[0]}`;
  } else if (typeName === "Object") {
    typeName += `(${Object.keys(val).length})`;
  }

  return typeName;
};

// Mapping of style keywords to ANSI escape codes for terminal formatting
const styles: Record<string, string> = {
  red: "\x1b[31m",
  orange: "\x1b[38;5;208m", // extended ANSI orange
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  purple: "\x1b[35m",
  pink: "\x1b[38;5;205m", // extended ANSI pink
  underline: "\x1b[4m",
  bold: "\x1b[1m",
  strikethrough: "\x1b[9m",
  italic: "\x1b[3m",
  emphasis: "\x1b[3m", // alias for italic
  reset: "\x1b[0m",
};

export function Colorize(strings: TemplateStringsArray, ...values: any[]) {
  // Combine all parts of the template string with interpolated values
  let input = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

  // Replace shorthand syntax for bold and underline
  // Replace {_..._} and {*...*} with {underline:...}, and {**...**} with {bold:...}
  input = input
    .replace(/\{_([^{}]+)_\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\{\*\*([^{}]+)\*\*\}/g, (_, content) => `{bold:${content}}`)
    .replace(/\{\*([^{}]+)\*\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\\x1b/g, '\x1b');

  // Replace escaped braces \{ and \} with placeholders so they are not parsed as tags
  input = input.replace(/\\\{/g, "__ESCAPED_OPEN_BRACE__").replace(/\\\}/g, "__ESCAPED_CLOSE_BRACE__");

  let output = ""; // Final output string with ANSI codes
  const stack: string[] = []; // Stack to track open styles for proper nesting
  let i = 0; // Current index in input

  while (i < input.length) {
    // Match the start of a style tag like {red: or {(dynamic ANSI code):
    const openMatch = input.slice(i).match(/^\{([a-zA-Z]+|\([^)]+\)):/);

    if (openMatch) {
      let tag = openMatch[1];

      if (tag.startsWith("(") && tag.endsWith(")")) {
        // Dynamic ANSI escape code inside parentheses
        tag = tag.slice(1, -1); // remove surrounding parentheses
        stack.push("__dynamic__");
        output += tag; // Insert raw ANSI code directly
      } else {
        if (!styles[tag]) {
          throw new ColorizedSyntaxException(`Unknown style: ${tag}`);
        }
        stack.push(tag);
        output += styles[tag];
      }
      i += openMatch[0].length; // Move index past the opening tag
      continue;
    }

    // Match closing tag '}'
    if (input[i] === "}") {
      if (!stack.length) {
        // No corresponding opening tag
        throw new ColorizedSyntaxException(`Unexpected closing tag at index ${i}`);
      }
      stack.pop(); // Close the last opened tag
      output += styles.reset; // Reset styles
      // Re-apply all remaining styles still on the stack
      for (const tag of stack) {
        // Reapply dynamic codes as-is, else mapped styles
        output += tag === "__dynamic__" ? "" : styles[tag];
      }
      i++; // Move past closing brace
      continue;
    }

    // Append normal character to output, but restore escaped braces if needed
    if (input.startsWith("__ESCAPED_OPEN_BRACE__", i)) {
      output += "{";
      i += "__ESCAPED_OPEN_BRACE__".length;
      continue;
    }
    if (input.startsWith("__ESCAPED_CLOSE_BRACE__", i)) {
      output += "}";
      i += "__ESCAPED_CLOSE_BRACE__".length;
      continue;
    }

    output += input[i++];
  }

  // If stack is not empty, we have unclosed tags
  if (stack.length) {
    const lastUnclosed = stack[stack.length - 1];
    throw new ColorizedSyntaxException(`Missing closing tag for: ${lastUnclosed}`);
  }

  // Ensure final reset for safety
  return output + styles.reset;
}

export function isEmpty(val: string): val is "";
export function isEmpty(val: number): val is 0 | typeof NaN;
export function isEmpty(val: boolean): val is false;
export function isEmpty(val: null | undefined): true;
export function isEmpty(val: Array<any>): val is [];
export function isEmpty(val: Record<any, unknown>): val is Record<any, never>;
export function isEmpty(val: Map<any, any>): val is Map<any, never>;
export function isEmpty(val: Set<any>): val is Set<never>;
export function isEmpty(val: WeakMap<object, any>): val is WeakMap<object, any>;
export function isEmpty(val: WeakSet<object>): val is WeakSet<object>;
export function isEmpty(val: any): boolean {
  // Generic type checking
  // eslint-disable-next-line eqeqeq
  if (val == null || val === false || val === "") return true;

  // Number checking
  if (typeof val === "number") return val === 0 || Number.isNaN(val);

  // Array checking
  if (Array.isArray(val) && val.length === 0) return true;

  // Map, Set, and weak variant checks
  if (val instanceof Map || val instanceof Set || val instanceof WeakMap || val instanceof WeakSet) {
    return (val as any).size === 0; // size check works for these types
  }

  // Object checking
  if (typeof val === 'object') {
    const proto = Object.getPrototypeOf(val);
    const isPlain = proto === Object.prototype || proto === null;
    return isPlain && Object.keys(val).length === 0;
  }

  return false;
}

export function createEventListener<T extends ((...args: any[]) => any)[]>(
  triggers: T,
  callback: (...results: CallbackResult<T>) => void
): void {
  const originals = triggers.map(fn => fn);

  triggers.forEach((originalFn, i) => {
    function wrapper (this: any, ...args: any[]) {
      const result = originals[i].apply(this, args);
      callback(...triggers.map((_, j) =>
        j === i ? result : undefined
      ) as any);
      return result;
    };

    // Replace global function by matching the actual function object
    if (typeof window !== "undefined") {
      for (const key in window) {
        if ((window as any)[key] === originalFn) {
          (window as any)[key] = wrapper;
          return; // stop after replacement
        }
      }
    }

    console.warn("Cannot replace function:", originalFn);
  });
}

export function generateID(): ID {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&*_-";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Type assertion to add the brand
  return Object.freeze(result) as ID;
}

}
namespace Opti {
  export class Exception extends Error {
    private _name: string;
    private _message: string;
    private _cause: string;
    private _internalStack: string;

    constructor(name: string | null, message: string = "", cause: string = "") {
      super();
      this._message = message;
      this._cause = cause;
      this._name = name ?? "Exception";
      this._internalStack = new Error().stack ?? "";
    }

    public get name(): string {
      return this._name;
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public throw(): never {
      throw this;
    }

    public getStackTrace(): string {
      return this._internalStack;
    }

    public override toString(): string {
      return `${this._name}: ${this._message}\r\n${this._internalStack}`;
    }
  }

  export class RuntimeException {
    private _message: string;
    private _cause: string;

    public constructor(message: string = "", cause: string = "") {
      this._message = message;
      this._cause = cause;
    }

    public get name(): "RuntimeException" {
      return "RuntimeException";
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public toString(): string {
      return `RuntimeException: ${this._message}`;
    }
  }

  export class NotImplementedException extends Exception {
    constructor(message?: string, cause?: string) {
      super("NotImplementedException", message, cause);
    }
  }

  export class ColorizedSyntaxException extends Exception {
    constructor(message?: string, cause?: string) {
      super("ColorizedSyntaxException", message, cause);
      Object.setPrototypeOf(this, ColorizedSyntaxException.prototype);
    }
  }

  export class UnknownException extends Exception {
    constructor(message?: string, cause?: string) {
      super("UnknownException", message, cause);
      Object.setPrototypeOf(this, UnknownException.prototype);
    }
  }

  export class AccessException extends Exception {
    constructor(message?: string, cause?: string) {
      super("AccessException", message, cause);
      Object.setPrototypeOf(this, AccessException.prototype);
    }
  }

  export class CustomException extends Exception {
    constructor(name: string, message?: string, cause?: string) {
      super(name, message, cause);
      Object.setPrototypeOf(this, CustomException.prototype);
    }
  }
}
namespace Opti {

export function addBoundListener <T extends EventTarget, K extends keyof EventMapOf<T>>(
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

export function addEventListeners<T extends EventTarget>(
  this: T,
  listenersOrTypes: (keyof EventMapOf<T>)[] | {
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

}
namespace Opti {

export function hasText (this: Element, text: string | RegExp): boolean {
  if (typeof text === "string") {
    return this.txt().includes(text);
  } else {
    return text.test(this.txt());
  }
}

export function addClass (this: Element, elClass: string): void {
  this.classList.add(elClass);
}

export function removeClass (this: Element, elClass: string): void {
  this.classList.remove(elClass);
}

export function toggleClass (this: Element, elClass: string): void {
  this.classList.toggle(elClass);
}

export function hasClass (this: Element, elClass: string): boolean {
  return this.classList.contains(elClass);
}

export function css(
  this: HTMLElement,
  key?: keyof CSSStyleDeclaration | Partial<Record<keyof CSSStyleDeclaration, string | number>>,
  value?: string | number
): any {
  const css = this.style;

  if (!key) {
    // Return all styles
    const result: Partial<Record<keyof CSSStyleDeclaration, string>> = {};
    for (let i = 0; i < css.length; i++) {
      const prop = css[i];
      if (prop) {
        result[prop as keyof CSSStyleDeclaration] = css.getPropertyValue(prop).trim();
      }
    }
    return result;
  }

  if (typeof key === "string") {
    if (value === undefined) {
      // Get one value
      return css.getPropertyValue(key).trim();
    } else {
      // Set one value
      if (key in css) {
        css.setProperty(toKebabCase(key), value.toString());
      }
    }
  } else {
    // Set multiple
    for (const [prop, val] of Object.entries(key)) {
      if (val !== null && val !== undefined) {
        css.setProperty(toKebabCase(prop), val.toString());
      }
    }
  }
};

export function getParent (this: Node): Node | null {
  return this.parentElement;
};

export function getAncestor<T extends Element>(this: Element, selector: string): T | null;
export function getAncestor(this: Node, level: number): Node | null;
export function getAncestor<T extends Element>(this: Node, arg: string | number): T | Node | null {
  // Case 1: numeric level
  if (typeof arg === "number") {
    let node: Node | null = this;
    for (let i = 0; i < arg; i++) {
      if (!node?.parentNode) return null;
      node = node.parentNode;
    }
    return node;
  }

  // Case 2: selector string
  const selector = arg;
  let el: Element | null = this instanceof Element ? this : this.parentElement;
  while (el) {
    if (el.matches(selector)) {
      return el as T;
    }
    el = el.parentElement;
  }
  return null;
}
export function createChildren (this: HTMLElement, elements: HTMLElementCascade): void {
  const element = document.createElement(elements.element);

  if (elements.id) {
    element.id = elements.id;
  }

  if (elements.className) {
    if (Array.isArray(elements.className)) {
      element.classList.add(...elements.className);
    } else {
      element.classList.add(elements.className);
    }
  }

  // Assign additional attributes dynamically
  for (const key in elements) {
    if (!['element', 'id', 'className', 'children'].includes(key)) {
      const value = elements[key as keyof HTMLElementCascade];
      if (typeof value === 'string') {
        element.setAttribute(key, value);
      } else if (Array.isArray(value)) {
        element.setAttribute(key, value.join(' ')); // Convert array to space-separated string
      }
    }
  }

  // Recursively create children
  if (elements.children) {
    if (Array.isArray(elements.children)) {
      elements.children.forEach(child => {
        // Recursively create child elements
        element.createChildren(child);
      });
    } else {
      // Recursively create a single child element
      element.createChildren(elements.children);
    }
  }

  this.appendChild(element);
};

export function tag <S extends HTMLElement, T extends HTMLTag = HTMLElementTagNameOf<S>>(
  this: S,
  newTag?: T
): HTMLElementOf<T> | string {
  if (!newTag) {
    return this.tagName.toLowerCase() as HTMLTag;
  }

  const newElement = document.createElement(newTag) as HTMLElementOf<T>;

  // Copy attributes
  Array.from(this.attributes).forEach(attr => {
    newElement.setAttribute(attr.name, attr.value);
  });

  // Copy dataset
  Object.entries(this.dataset).forEach(([key, value]) => {
    newElement.dataset[key] = value;
  });

  // Copy inline styles
  newElement.style.cssText = this.style.cssText;

  // Copy classes
  newElement.className = this.className;

  // Copy child nodes
  while (this.firstChild) {
    newElement.appendChild(this.firstChild);
  }

  // Transfer listeners (if you have a system for it)
  if ((this as any)._eventListeners instanceof Map) {
    const listeners = (this as any)._eventListeners as Map<string, EventListenerOrEventListenerObject[]>;
    listeners.forEach((fns, type) => {
      fns.forEach(fn => newElement.addEventListener(type, fn));
    });
    (newElement as any)._eventListeners = new Map(listeners);
  }

  // Optional: Copy properties (if you have custom prototype extensions)
  for (const key in this) {
    // Skip built-in DOM properties and functions
    if (
      !(key in newElement) &&
      typeof (this as any)[key] !== "function"
    ) {
      try {
        (newElement as any)[key] = (this as any)[key];
      } catch {
        // Some props might be readonly — safely ignore
      }
    }
  }

  this.replaceWith(newElement);
  return newElement;
};

export function html (this: HTMLElement, input?: string): string {
  return input !== undefined ? (this.innerHTML = input) : this.innerHTML;
};

export function text(this: Element, text?: string | ((text: string) => string), ...input: (string)[]): string {
  // If text is provided, update the textContent
  if (text !== undefined) {
    if (typeof text === "string") {
      input.unshift(text); // Add the text parameter to the beginning of the input array
      const joined = input.join(" "); // Join all the strings with a space

      // Replace "textContent" if it's found in the joined string (optional logic)
      this.textContent = joined.includes("textContent")
        ? joined.replace("textContent", this.textContent ?? "")
        : joined;
    } else {
      this.textContent = text(this.textContent ?? "");
    }
  }

  // Return the current textContent if no arguments are passed
  return this.textContent ?? "";
};

export function show (this: HTMLElement) {
  this.css("visibility", "visible");
};

export function hide (this: HTMLElement) {
  this.css("visibility", "hidden");
};

export function toggle (this: HTMLElement) {
  if (this.css("visibility") === "visible" || this.css("visibility") === "") {
    this.hide();
  } else {
    this.show();
  }
};

export function find (this: Node, selector: string): Node | null {
  return this.querySelector(selector); // Returns a single Element or null
};

export function findAll (this: Node, selector: string): NodeListOf<Element> {
  return this.querySelectorAll(selector); // Returns a single Element or null
};

export function getChildren (this: Node): NodeListOf<ChildNode> {
  return this.childNodes;
};

export function getSiblings (this: Node, inclusive?: boolean): Node[] {
  const siblings = Array.from(this.parentNode!.childNodes as NodeListOf<Node>);
  if (inclusive) {
    return siblings; // Include current node as part of siblings
  } else {
    return siblings.filter(node => !node.isSameNode(this));
  }
};

export function serialize (this: HTMLFormElement): string {
  const formData = new FormData(this); // Create a FormData object from the form

  // Create an array to hold key-value pairs
  const entries: [string, string][] = [];

  // Use FormData's forEach method to collect form data
  formData.forEach((value, key) => {
    entries.push([key, value.toString()]);
  });

  // Convert the entries into a query string
  return entries
    .map(([key, value]) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .join('&'); // Join the array into a single string, separated by '&'
};

export function elementCreator (this: HTMLElement) {
  return new HTMLElementCreator(this);
};

export function cut<T extends Element>(this: T): T {
  const clone = document.createElementNS(this.namespaceURI, this.tagName) as T;

  // Copy all attributes
  for (const attr of Array.from(this.attributes)) {
    clone.setAttribute(attr.name, attr.value);
  }

  // Deep copy child nodes (preserves text, elements, etc.)
  for (const child of Array.from(this.childNodes)) {
    clone.appendChild(child.cloneNode(true));
  }

  // Optionally copy inline styles (not always needed if using setAttribute above)
   if (this instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.style.cssText = this.style.cssText;
  }

  this.remove(); // Remove original from DOM

  return clone;
}

}
namespace Opti {

export function ready (callback: (this: Document, ev: Event) => any) {
  document.addEventListener("DOMContentLoaded", callback);
}

export function leaving (callback: (this: Document, ev: Event) => any): void {
  document.addEventListener("unload", (e) => callback.call(document, e));
}

export function bindShortcut (
  shortcut: Shortcut,
  callback: (event: ShortcutEvent) => void
): void {
  document.addEventListener('keydown', (event: Event) => {
    const keyboardEvent = event as ShortcutEvent;
    keyboardEvent.keys = shortcut.split("+") as [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    const keys = shortcut
      .trim()
      .toLowerCase()
      .split("+");

    // Separate out the modifier keys and the actual key
    const modifiers = keys.slice(0, -1);
    const finalKey = keys[keys.length - 1];

    const modifierMatch = modifiers.every((key: any) => {
      if (key === 'ctrl' || key === 'control') return keyboardEvent.ctrlKey;
      if (key === 'alt') return keyboardEvent.altKey;
      if (key === 'shift') return keyboardEvent.shiftKey;
      if (key === 'meta' || key === 'windows' || key === 'command') return keyboardEvent.metaKey;
      return false;
    });

    // Check that the pressed key matches the final key
    const keyMatch = finalKey === keyboardEvent.key.toLowerCase();

    if (modifierMatch && keyMatch) {
      callback(keyboardEvent);
    }
  });
}

export function documentCss (
  element: string,
  object?: Partial<Record<keyof CSSStyleDeclaration, string | number>>
): any {
  const selector = element.trim();
  if (!selector) {
    throw new Error("Selector cannot be empty.");
  }

  let styleTag = document.querySelector("style[js-styles]") as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.setAttribute("js-styles", "");
    document.head.appendChild(styleTag);
  }

  const sheet = styleTag.sheet as CSSStyleSheet;
  let ruleIndex = -1;
  const existingStyles: StringRecord<string> = {};

  for (let i = 0; i < sheet.cssRules.length; i++) {
    const rule = sheet.cssRules[i];
    if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
      ruleIndex = i;
      const declarations = rule.style;
      for (let j = 0; j < declarations.length; j++) {
        const name = declarations[j];
        existingStyles[name] = declarations.getPropertyValue(name).trim();
      }
      break;
    }
  }

  if (!object || Object.keys(object).length === 0) {
    return existingStyles;
  }

  // Convert camelCase to kebab-case
  const newStyles: StringRecord<string> = {};
  for (const [prop, val] of Object.entries(object)) {
    if (val !== null && val !== undefined) {
      const kebab = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      newStyles[kebab] = val.toString();
    }
  }

  const mergedStyles = { ...existingStyles, ...newStyles };
  const styleString = Object.entries(mergedStyles)
    .map(([prop, val]) => `${prop}: ${val};`)
    .join(" ");

  if (ruleIndex !== -1) {
    sheet.deleteRule(ruleIndex);
  }

  try {
    sheet.insertRule(`${selector} { ${styleString} }`, sheet.cssRules.length);
  } catch (err) {
    console.error("Failed to insert CSS rule:", err, { selector, styleString });
  }
}

export function createElementTree<T extends HTMLElement>(node: ElementNode): T {
  const el = document.createElement(node.tag);

  // Add class if provided
  if (node.class) el.className = node.class;

  // Add text content if provided
  if (node.text) el.textContent = node.text;

  // Add inner HTML if provided
  if (node.html) el.innerHTML = node.html;

  // Handle styles, ensure it’s an object
  if (node.style && typeof node.style === 'object') {
    for (const [prop, val] of Object.entries(node.style)) {
      el.style.setProperty(prop, val.toString());
    }
  }

  // Handle other attributes (excluding known keys)
  for (const [key, val] of Object.entries(node)) {
    if (
      key !== 'tag' &&
      key !== 'class' &&
      key !== 'text' &&
      key !== 'html' &&
      key !== 'style' &&
      key !== 'children'
    ) {
      if (typeof val === 'string') {
        el.setAttribute(key, val);
      } else throw new Opti.CustomException("ParameterError", "Custom parameters must be of type 'string'");
    }
  }

  // Handle children (ensure it's an array or a single child)
  if (node.children) {
    if (Array.isArray(node.children)) {
      node.children.forEach(child => {
        el.appendChild(createElementTree(child));
      });
    } else {
      el.appendChild(createElementTree(node.children)); // Support for a single child node
    }
  }

  return el as T;
}

export function $ (selector: string) {
  return document.querySelector(selector);
};

export function $$ (selector: string) {
  return document.querySelectorAll(selector);
};

}
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

  export class ShortcutEvent extends KeyboardEvent {
    keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    constructor(
      keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?],
      eventInit?: ShortcutEventInit
    ) {
      const lastKey = keys[keys.length - 1] || "";
      super("keydown", { ...eventInit, key: lastKey });
      this.keys = keys;
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

  export namespace Crafty {
    export interface Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {
      getProp<K extends keyof P>(prop: K): P[K];
      setProp<K extends keyof P>(prop: K, value: P[K]): void;
      getChildren(): C;
      append(child: Crafty.Child): void;
      prepend(child: Crafty.Child): void;
      remove(child: Crafty.Child): void;
      insert?(child: Crafty.Child, index: number): void;
    }

    export type Props<T extends HTMLTag> = Partial<{
      tag: T,
      class: string | string[],
      text: string,
      id: string,
      name: string,
      [key: string]: unknown
    } & Pick<HTMLElementOf<T>, AccessorKeys<HTMLElementOf<T>>>
    >;

    export type Child = Crafty.Element<any, any, any> | Crafty.Fragment<any, any, any>;

    export class Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {  // <- implements the interface
      public tag: T;
      public props: P;
      public children: C;

      constructor(tag: T, props?: P, children?: C) {
        this.tag = tag;
        this.props = props ?? ({} as P);
        this.children = children ?? [] as unknown as C;
      }

      getProp<K extends keyof P>(prop: K): P[K] {
        return this.props[prop];
      }

      setProp<K extends keyof P>(prop: K, value: P[K]): void {
        this.props[prop] = value;
      }

      getChildren(): C {
        return this.children;
      }

      append(child: Crafty.Child): void {
        this.children = [...this.children, child] as unknown as C;
      }

      prepend(child: Crafty.Child): void {
        this.children = [child, ...this.children] as unknown as C;
      }

      remove(child: Crafty.Child): void {
        this.children = this.children.filter(c => c !== child) as unknown as C;
      }

      render(): HTMLElementOf<T> {
        // your render implementation here
        throw new Error("Not implemented");
      }
    }

    export class Fragment<
      T extends HTMLTag,
      P extends Props<T> = Props<T>,
      C extends readonly Child[] = readonly []
    > extends Element<T, P, C> {
      // can override or extend render() etc.
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
function defineProperty<T>(
  object: any,
  prop: PropertyKey,
  getter: () => T,
  setter?: (value: T) => void
): void {
  Object.defineProperty(object, prop, {
    get: getter,
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function defineGetter<T>(object: any, prop: PropertyKey, getter: () => T): void {
  defineProperty(object, prop, getter);
}

function defineSetter<T>(object: any, prop: PropertyKey, setter: (value: T) => void): void {
  Object.defineProperty(object, prop, {
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function toArray(collection: HTMLCollectionOf<Element> | NodeListOf<Element>): Element[] {
  return Array.from(collection);
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isGlobal(val: any): val is typeof globalThis {
  return val === globalThis;
}

function typedEntries<T extends object, K extends keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][];
}

(function() {
  //@ts-ignore
  globalThis.Opti ??= {};

  globalThis.f = (iife: () => void) => iife();
  globalThis.createEventListener = Opti.createEventListener;
  globalThis.Time = Opti.Time;
  globalThis.ShortcutEvent = Opti.ShortcutEvent;
  globalThis.isEmpty = Opti.isEmpty;
  globalThis.type = Opti.type;
  globalThis.generateID = Opti.generateID;
  globalThis.Colorize = Opti.Colorize;
  globalThis.Exception = Opti.Exception;
  globalThis.UnknownException = Opti.UnknownException;
  globalThis.NotImplementedException = Opti.NotImplementedException;
  globalThis.AccessException = Opti.AccessException;
  globalThis.CustomException = Opti.CustomException;
  globalThis.ColorizedSyntaxException = Opti.ColorizedSyntaxException;
  globalThis.RuntimeException = Opti.RuntimeException;
  globalThis.Enum = Opti.Enum;
  globalThis.Collection = Opti.Collection;  

  Document.prototype.ready = Opti.ready;
  Document.prototype.leaving = Opti.leaving;
  Document.prototype.bindShortcut = Opti.bindShortcut;
  Document.prototype.css = Opti.documentCss;
  Document.prototype.createElementTree = Opti.createElementTree;

  NodeList.prototype.addEventListener = Opti.addEventListenerEnum;
  NodeList.prototype.addClass = Opti.addClassList;
  NodeList.prototype.removeClass = Opti.removeClassList;
  NodeList.prototype.toggleClass = Opti.toggleClassList;
  NodeList.prototype.single = function (this: NodeList) {
    return this.length > 0 ? this[0] : null;
  };

  HTMLCollection.prototype.addEventListener = Opti.addEventListenerEnum;
  HTMLCollection.prototype.addClass = Opti.addClassList;
  HTMLCollection.prototype.removeClass = Opti.removeClassList;
  HTMLCollection.prototype.toggleClass = Opti.toggleClassList;
  HTMLCollection.prototype.single = function (this: HTMLCollection) {
    return this.length > 0 ? this[0] : null;
  };

  EventTarget.prototype.addBoundListener = Opti.addBoundListener;
  EventTarget.prototype.addEventListeners = Opti.addEventListeners;
  EventTarget.prototype.delegateEventListener = Opti.delegateEventListener;

  Element.prototype.hasText = Opti.hasText;
  Element.prototype.txt = Opti.text;
  Element.prototype.addClass = Opti.addClass;
  Element.prototype.removeClass = Opti.removeClass;
  Element.prototype.toggleClass = Opti.toggleClass;
  Element.prototype.hasClass = Opti.hasClass;

  HTMLElement.prototype.css = Opti.css;
  HTMLElement.prototype.elementCreator = Opti.elementCreator;
  HTMLElement.prototype.tag = Opti.tag;
  HTMLElement.prototype.html = Opti.html;
  HTMLElement.prototype.show = Opti.show;
  HTMLElement.prototype.hide = Opti.hide;
  HTMLElement.prototype.toggle = Opti.toggle;

  HTMLFormElement.prototype.serialize = Opti.serialize;

  Node.prototype.parent = Opti.getParent;
  Node.prototype.ancestor = Opti.getAncestor;
  Node.prototype.getChildren = Opti.getChildren;
  Node.prototype.siblings = Opti.getSiblings;
  Node.prototype.$ = Opti.find;
  Node.prototype.$$ = Opti.findAll;
  Number.prototype.repeat = Opti.repeat;
  Array.prototype.unique = Opti.unique;
  Array.prototype.chunk = Opti.chunk;
  String.prototype.remove = Opti.remove;
  String.prototype.removeAll = Opti.removeAll;
  String.prototype.capitalize = Opti.capitalize;

  Math.random = Opti.random;
  JSON.parseFile = Opti.parseFile;
  Object.clone = Opti.clone;
  Object.forEach = Opti.forEach;
  Date.at = Opti.atDate;
  Date.fromTime = Opti.fromTime;

  defineGetter(Window.prototype, "width", () => window.innerWidth || document.body.clientWidth);
  defineGetter(Window.prototype, "height", () => window.innerHeight || document.body.clientHeight);
  defineGetter(HTMLElement.prototype, "visible", function (this: HTMLElement) {
    return this.css("visibility") !== "hidden"
      ? this.css("display") !== "none"
      : Number(this.css("opacity")) > 0;
  });
})();
namespace Opti {

export function atDate(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number {
  return new Date(year, monthIndex, date, hours, minutes, seconds, ms).getTime();
}

export function fromTime (this: DateConstructor, time: Time, year: number, monthIndex: number, date?: number | undefined): Date {
  return new Date(year, monthIndex, date, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
}

export function clone<T>(object: T, deep: boolean = true): T {
  if (object === null || typeof object === "undefined") {
    return object;
  } else if (typeof object !== "object" && typeof object !== "symbol" && typeof object !== "function") {
    return object;
  }

  const shallowClone = (): T =>
    Object.assign(Object.create(Object.getPrototypeOf(object)), object);

  const deepClone = (obj: any, seen = new WeakMap()): any => {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj)) return seen.get(obj);

    // Preserve prototype
    const cloned = Array.isArray(obj)
      ? []
      : Object.create(Object.getPrototypeOf(obj));

    seen.set(obj, cloned);

    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) {
      obj.forEach((v, k) =>
        cloned.set(deepClone(k, seen), deepClone(v, seen))
      );
      return cloned;
    }
    if (obj instanceof Set) {
      obj.forEach(v => cloned.add(deepClone(v, seen)));
      return cloned;
    }
    if (ArrayBuffer.isView(obj)) return new (obj.constructor as any)(obj);
    if (obj instanceof ArrayBuffer) return obj.slice(0);

    for (const key of Reflect.ownKeys(obj)) {
      cloned[key] = deepClone(obj[key], seen);
    }

    return cloned;
  };

  return deep ? deepClone(object) : shallowClone();
};

export function repeat (this: number, iterator: (i: number) => any): void {
  for (let i = 0; i < this; i++) {
    iterator(i);
  }
};

export function unique<T>(this: T[]): T[] {
  return [...new Set(this)];
};

export function chunk<T>(this: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) throw new TypeError("`chunkSize` cannot be a number below 1");

  const newArr: T[][] = [];
  let tempArr: T[] = [];

  this.forEach(val => {
    tempArr.push(val);
    if (tempArr.length === chunkSize) {
      newArr.push(tempArr);
      tempArr = []; // Reset tempArr for the next chunk
    }
  });

  // Add the remaining elements in tempArr if any
  if (tempArr.length) {
    newArr.push(tempArr);
  }

  return newArr;
};

export function remove (this: string, finder: string | RegExp): string {
  return this.replace(finder, "");
};

export function removeAll (this: string, finder: string | RegExp): string {
  if (finder instanceof RegExp) {
    if (!finder.flags.includes("g")) {
      finder = new RegExp(finder.source, finder.flags + "g");
    }
  }
  return this.replaceAll(finder, "");
};

const origionalRandom = Math.random;
export const random = (minOrMax?: number, max?: number) => {
  if (isDefined(minOrMax) && isDefined(max)) {
    return origionalRandom() * (max - minOrMax) + minOrMax;
  } else if (isDefined(minOrMax)) {
    return origionalRandom() * minOrMax;
  } else return origionalRandom();
};

export function isDefined<T>(obj: T | undefined): obj is T {
  return typeof obj !== "undefined";
}

export function forEach<T>(object: T, iterator: (key: keyof T, value: T[keyof T]) => any): void {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      iterator(key, object[key]);
    }
  }
};

export function capitalize(this: string): string {
  const i = this.search(/\S/);
  return i === -1 ? this : this.slice(0, i) + this.charAt(i).toUpperCase() + this.slice(i + 1);
};

export async function parseFile<R = any, T = R>(
  file: string,
  receiver?: (content: T) => R
): Promise<R> {
  const fileContent = await fetch(file).then(res => res.json() as Promise<T>);

  if (!receiver) {
    return fileContent as unknown as R;
  }

  return receiver(fileContent);
};

const origionallog = console.log;
export function log(colorize?: true, ...data: any[]) {
  const text = data.map(val => typeof val === "string" ? val : JSON.stringify(val)).join(" ");
  origionallog(Colorize`${text}`);
}

}
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
namespace Opti {

export function type (val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";

  const typeOf = typeof val;
  if (typeOf === "function") {
    return `Function:${val.name || "<anonymous>"}(${val.length})`;
  }

  let typeName = capitalize.call(Object.prototype.toString.call(val).slice(8, -1));

  const ctor = val.constructor?.name;
  if (ctor && ctor !== typeName) {
    typeName = ctor;
  }

  const len = (val as any).length;
  if (typeof len === "number" && Number.isFinite(len)) {
    typeName += `(${len})`;
  } else if (val instanceof Map || val instanceof Set) {
    typeName += `(${val.size})`;
  } else if (val instanceof Date && !isNaN(val.getTime())) {
    typeName += `:${val.toISOString().split("T")[0]}`;
  } else if (typeName === "Object") {
    typeName += `(${Object.keys(val).length})`;
  }

  return typeName;
};

// Mapping of style keywords to ANSI escape codes for terminal formatting
const styles: Record<string, string> = {
  red: "\x1b[31m",
  orange: "\x1b[38;5;208m", // extended ANSI orange
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  purple: "\x1b[35m",
  pink: "\x1b[38;5;205m", // extended ANSI pink
  underline: "\x1b[4m",
  bold: "\x1b[1m",
  strikethrough: "\x1b[9m",
  italic: "\x1b[3m",
  emphasis: "\x1b[3m", // alias for italic
  reset: "\x1b[0m",
};

export function Colorize(strings: TemplateStringsArray, ...values: any[]) {
  // Combine all parts of the template string with interpolated values
  let input = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

  // Replace shorthand syntax for bold and underline
  // Replace {_..._} and {*...*} with {underline:...}, and {**...**} with {bold:...}
  input = input
    .replace(/\{_([^{}]+)_\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\{\*\*([^{}]+)\*\*\}/g, (_, content) => `{bold:${content}}`)
    .replace(/\{\*([^{}]+)\*\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\\x1b/g, '\x1b');

  // Replace escaped braces \{ and \} with placeholders so they are not parsed as tags
  input = input.replace(/\\\{/g, "__ESCAPED_OPEN_BRACE__").replace(/\\\}/g, "__ESCAPED_CLOSE_BRACE__");

  let output = ""; // Final output string with ANSI codes
  const stack: string[] = []; // Stack to track open styles for proper nesting
  let i = 0; // Current index in input

  while (i < input.length) {
    // Match the start of a style tag like {red: or {(dynamic ANSI code):
    const openMatch = input.slice(i).match(/^\{([a-zA-Z]+|\([^)]+\)):/);

    if (openMatch) {
      let tag = openMatch[1];

      if (tag.startsWith("(") && tag.endsWith(")")) {
        // Dynamic ANSI escape code inside parentheses
        tag = tag.slice(1, -1); // remove surrounding parentheses
        stack.push("__dynamic__");
        output += tag; // Insert raw ANSI code directly
      } else {
        if (!styles[tag]) {
          throw new ColorizedSyntaxException(`Unknown style: ${tag}`);
        }
        stack.push(tag);
        output += styles[tag];
      }
      i += openMatch[0].length; // Move index past the opening tag
      continue;
    }

    // Match closing tag '}'
    if (input[i] === "}") {
      if (!stack.length) {
        // No corresponding opening tag
        throw new ColorizedSyntaxException(`Unexpected closing tag at index ${i}`);
      }
      stack.pop(); // Close the last opened tag
      output += styles.reset; // Reset styles
      // Re-apply all remaining styles still on the stack
      for (const tag of stack) {
        // Reapply dynamic codes as-is, else mapped styles
        output += tag === "__dynamic__" ? "" : styles[tag];
      }
      i++; // Move past closing brace
      continue;
    }

    // Append normal character to output, but restore escaped braces if needed
    if (input.startsWith("__ESCAPED_OPEN_BRACE__", i)) {
      output += "{";
      i += "__ESCAPED_OPEN_BRACE__".length;
      continue;
    }
    if (input.startsWith("__ESCAPED_CLOSE_BRACE__", i)) {
      output += "}";
      i += "__ESCAPED_CLOSE_BRACE__".length;
      continue;
    }

    output += input[i++];
  }

  // If stack is not empty, we have unclosed tags
  if (stack.length) {
    const lastUnclosed = stack[stack.length - 1];
    throw new ColorizedSyntaxException(`Missing closing tag for: ${lastUnclosed}`);
  }

  // Ensure final reset for safety
  return output + styles.reset;
}

export function isEmpty(val: string): val is "";
export function isEmpty(val: number): val is 0 | typeof NaN;
export function isEmpty(val: boolean): val is false;
export function isEmpty(val: null | undefined): true;
export function isEmpty(val: Array<any>): val is [];
export function isEmpty(val: Record<any, unknown>): val is Record<any, never>;
export function isEmpty(val: Map<any, any>): val is Map<any, never>;
export function isEmpty(val: Set<any>): val is Set<never>;
export function isEmpty(val: WeakMap<object, any>): val is WeakMap<object, any>;
export function isEmpty(val: WeakSet<object>): val is WeakSet<object>;
export function isEmpty(val: any): boolean {
  // Generic type checking
  // eslint-disable-next-line eqeqeq
  if (val == null || val === false || val === "") return true;

  // Number checking
  if (typeof val === "number") return val === 0 || Number.isNaN(val);

  // Array checking
  if (Array.isArray(val) && val.length === 0) return true;

  // Map, Set, and weak variant checks
  if (val instanceof Map || val instanceof Set || val instanceof WeakMap || val instanceof WeakSet) {
    return (val as any).size === 0; // size check works for these types
  }

  // Object checking
  if (typeof val === 'object') {
    const proto = Object.getPrototypeOf(val);
    const isPlain = proto === Object.prototype || proto === null;
    return isPlain && Object.keys(val).length === 0;
  }

  return false;
}

export function createEventListener<T extends ((...args: any[]) => any)[]>(
  triggers: T,
  callback: (...results: CallbackResult<T>) => void
): void {
  const originals = triggers.map(fn => fn);

  triggers.forEach((originalFn, i) => {
    function wrapper (this: any, ...args: any[]) {
      const result = originals[i].apply(this, args);
      callback(...triggers.map((_, j) =>
        j === i ? result : undefined
      ) as any);
      return result;
    };

    // Replace global function by matching the actual function object
    if (typeof window !== "undefined") {
      for (const key in window) {
        if ((window as any)[key] === originalFn) {
          (window as any)[key] = wrapper;
          return; // stop after replacement
        }
      }
    }

    console.warn("Cannot replace function:", originalFn);
  });
}

export function generateID(): ID {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&*_-";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Type assertion to add the brand
  return Object.freeze(result) as ID;
}

}
namespace Opti {
  export class Exception extends Error {
    private _name: string;
    private _message: string;
    private _cause: string;
    private _internalStack: string;

    constructor(name: string | null, message: string = "", cause: string = "") {
      super();
      this._message = message;
      this._cause = cause;
      this._name = name ?? "Exception";
      this._internalStack = new Error().stack ?? "";
    }

    public get name(): string {
      return this._name;
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public throw(): never {
      throw this;
    }

    public getStackTrace(): string {
      return this._internalStack;
    }

    public override toString(): string {
      return `${this._name}: ${this._message}\r\n${this._internalStack}`;
    }
  }

  export class RuntimeException {
    private _message: string;
    private _cause: string;

    public constructor(message: string = "", cause: string = "") {
      this._message = message;
      this._cause = cause;
    }

    public get name(): "RuntimeException" {
      return "RuntimeException";
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public toString(): string {
      return `RuntimeException: ${this._message}`;
    }
  }

  export class NotImplementedException extends Exception {
    constructor(message?: string, cause?: string) {
      super("NotImplementedException", message, cause);
    }
  }

  export class ColorizedSyntaxException extends Exception {
    constructor(message?: string, cause?: string) {
      super("ColorizedSyntaxException", message, cause);
      Object.setPrototypeOf(this, ColorizedSyntaxException.prototype);
    }
  }

  export class UnknownException extends Exception {
    constructor(message?: string, cause?: string) {
      super("UnknownException", message, cause);
      Object.setPrototypeOf(this, UnknownException.prototype);
    }
  }

  export class AccessException extends Exception {
    constructor(message?: string, cause?: string) {
      super("AccessException", message, cause);
      Object.setPrototypeOf(this, AccessException.prototype);
    }
  }

  export class CustomException extends Exception {
    constructor(name: string, message?: string, cause?: string) {
      super(name, message, cause);
      Object.setPrototypeOf(this, CustomException.prototype);
    }
  }
}
namespace Opti {

export function addBoundListener <T extends EventTarget, K extends keyof EventMapOf<T>>(
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

export function addEventListeners<T extends EventTarget>(
  this: T,
  listenersOrTypes: (keyof EventMapOf<T>)[] | {
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

}
namespace Opti {

export function hasText (this: Element, text: string | RegExp): boolean {
  if (typeof text === "string") {
    return this.txt().includes(text);
  } else {
    return text.test(this.txt());
  }
}

export function addClass (this: Element, elClass: string): void {
  this.classList.add(elClass);
}

export function removeClass (this: Element, elClass: string): void {
  this.classList.remove(elClass);
}

export function toggleClass (this: Element, elClass: string): void {
  this.classList.toggle(elClass);
}

export function hasClass (this: Element, elClass: string): boolean {
  return this.classList.contains(elClass);
}

export function css(
  this: HTMLElement,
  key?: keyof CSSStyleDeclaration | Partial<Record<keyof CSSStyleDeclaration, string | number>>,
  value?: string | number
): any {
  const css = this.style;

  if (!key) {
    // Return all styles
    const result: Partial<Record<keyof CSSStyleDeclaration, string>> = {};
    for (let i = 0; i < css.length; i++) {
      const prop = css[i];
      if (prop) {
        result[prop as keyof CSSStyleDeclaration] = css.getPropertyValue(prop).trim();
      }
    }
    return result;
  }

  if (typeof key === "string") {
    if (value === undefined) {
      // Get one value
      return css.getPropertyValue(key).trim();
    } else {
      // Set one value
      if (key in css) {
        css.setProperty(toKebabCase(key), value.toString());
      }
    }
  } else {
    // Set multiple
    for (const [prop, val] of Object.entries(key)) {
      if (val !== null && val !== undefined) {
        css.setProperty(toKebabCase(prop), val.toString());
      }
    }
  }
};

export function getParent (this: Node): Node | null {
  return this.parentElement;
};

export function getAncestor<T extends Element>(this: Element, selector: string): T | null;
export function getAncestor(this: Node, level: number): Node | null;
export function getAncestor<T extends Element>(this: Node, arg: string | number): T | Node | null {
  // Case 1: numeric level
  if (typeof arg === "number") {
    let node: Node | null = this;
    for (let i = 0; i < arg; i++) {
      if (!node?.parentNode) return null;
      node = node.parentNode;
    }
    return node;
  }

  // Case 2: selector string
  const selector = arg;
  let el: Element | null = this instanceof Element ? this : this.parentElement;
  while (el) {
    if (el.matches(selector)) {
      return el as T;
    }
    el = el.parentElement;
  }
  return null;
}
export function createChildren (this: HTMLElement, elements: HTMLElementCascade): void {
  const element = document.createElement(elements.element);

  if (elements.id) {
    element.id = elements.id;
  }

  if (elements.className) {
    if (Array.isArray(elements.className)) {
      element.classList.add(...elements.className);
    } else {
      element.classList.add(elements.className);
    }
  }

  // Assign additional attributes dynamically
  for (const key in elements) {
    if (!['element', 'id', 'className', 'children'].includes(key)) {
      const value = elements[key as keyof HTMLElementCascade];
      if (typeof value === 'string') {
        element.setAttribute(key, value);
      } else if (Array.isArray(value)) {
        element.setAttribute(key, value.join(' ')); // Convert array to space-separated string
      }
    }
  }

  // Recursively create children
  if (elements.children) {
    if (Array.isArray(elements.children)) {
      elements.children.forEach(child => {
        // Recursively create child elements
        element.createChildren(child);
      });
    } else {
      // Recursively create a single child element
      element.createChildren(elements.children);
    }
  }

  this.appendChild(element);
};

export function tag <S extends HTMLElement, T extends HTMLTag = HTMLElementTagNameOf<S>>(
  this: S,
  newTag?: T
): HTMLElementOf<T> | string {
  if (!newTag) {
    return this.tagName.toLowerCase() as HTMLTag;
  }

  const newElement = document.createElement(newTag) as HTMLElementOf<T>;

  // Copy attributes
  Array.from(this.attributes).forEach(attr => {
    newElement.setAttribute(attr.name, attr.value);
  });

  // Copy dataset
  Object.entries(this.dataset).forEach(([key, value]) => {
    newElement.dataset[key] = value;
  });

  // Copy inline styles
  newElement.style.cssText = this.style.cssText;

  // Copy classes
  newElement.className = this.className;

  // Copy child nodes
  while (this.firstChild) {
    newElement.appendChild(this.firstChild);
  }

  // Transfer listeners (if you have a system for it)
  if ((this as any)._eventListeners instanceof Map) {
    const listeners = (this as any)._eventListeners as Map<string, EventListenerOrEventListenerObject[]>;
    listeners.forEach((fns, type) => {
      fns.forEach(fn => newElement.addEventListener(type, fn));
    });
    (newElement as any)._eventListeners = new Map(listeners);
  }

  // Optional: Copy properties (if you have custom prototype extensions)
  for (const key in this) {
    // Skip built-in DOM properties and functions
    if (
      !(key in newElement) &&
      typeof (this as any)[key] !== "function"
    ) {
      try {
        (newElement as any)[key] = (this as any)[key];
      } catch {
        // Some props might be readonly — safely ignore
      }
    }
  }

  this.replaceWith(newElement);
  return newElement;
};

export function html (this: HTMLElement, input?: string): string {
  return input !== undefined ? (this.innerHTML = input) : this.innerHTML;
};

export function text(this: Element, text?: string | ((text: string) => string), ...input: (string)[]): string {
  // If text is provided, update the textContent
  if (text !== undefined) {
    if (typeof text === "string") {
      input.unshift(text); // Add the text parameter to the beginning of the input array
      const joined = input.join(" "); // Join all the strings with a space

      // Replace "textContent" if it's found in the joined string (optional logic)
      this.textContent = joined.includes("textContent")
        ? joined.replace("textContent", this.textContent ?? "")
        : joined;
    } else {
      this.textContent = text(this.textContent ?? "");
    }
  }

  // Return the current textContent if no arguments are passed
  return this.textContent ?? "";
};

export function show (this: HTMLElement) {
  this.css("visibility", "visible");
};

export function hide (this: HTMLElement) {
  this.css("visibility", "hidden");
};

export function toggle (this: HTMLElement) {
  if (this.css("visibility") === "visible" || this.css("visibility") === "") {
    this.hide();
  } else {
    this.show();
  }
};

export function find (this: Node, selector: string): Node | null {
  return this.querySelector(selector); // Returns a single Element or null
};

export function findAll (this: Node, selector: string): NodeListOf<Element> {
  return this.querySelectorAll(selector); // Returns a single Element or null
};

export function getChildren (this: Node): NodeListOf<ChildNode> {
  return this.childNodes;
};

export function getSiblings (this: Node, inclusive?: boolean): Node[] {
  const siblings = Array.from(this.parentNode!.childNodes as NodeListOf<Node>);
  if (inclusive) {
    return siblings; // Include current node as part of siblings
  } else {
    return siblings.filter(node => !node.isSameNode(this));
  }
};

export function serialize (this: HTMLFormElement): string {
  const formData = new FormData(this); // Create a FormData object from the form

  // Create an array to hold key-value pairs
  const entries: [string, string][] = [];

  // Use FormData's forEach method to collect form data
  formData.forEach((value, key) => {
    entries.push([key, value.toString()]);
  });

  // Convert the entries into a query string
  return entries
    .map(([key, value]) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .join('&'); // Join the array into a single string, separated by '&'
};

export function elementCreator (this: HTMLElement) {
  return new HTMLElementCreator(this);
};

export function cut<T extends Element>(this: T): T {
  const clone = document.createElementNS(this.namespaceURI, this.tagName) as T;

  // Copy all attributes
  for (const attr of Array.from(this.attributes)) {
    clone.setAttribute(attr.name, attr.value);
  }

  // Deep copy child nodes (preserves text, elements, etc.)
  for (const child of Array.from(this.childNodes)) {
    clone.appendChild(child.cloneNode(true));
  }

  // Optionally copy inline styles (not always needed if using setAttribute above)
   if (this instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.style.cssText = this.style.cssText;
  }

  this.remove(); // Remove original from DOM

  return clone;
}

}
namespace Opti {

export function ready (callback: (this: Document, ev: Event) => any) {
  document.addEventListener("DOMContentLoaded", callback);
}

export function leaving (callback: (this: Document, ev: Event) => any): void {
  document.addEventListener("unload", (e) => callback.call(document, e));
}

export function bindShortcut (
  shortcut: Shortcut,
  callback: (event: ShortcutEvent) => void
): void {
  document.addEventListener('keydown', (event: Event) => {
    const keyboardEvent = event as ShortcutEvent;
    keyboardEvent.keys = shortcut.split("+") as [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    const keys = shortcut
      .trim()
      .toLowerCase()
      .split("+");

    // Separate out the modifier keys and the actual key
    const modifiers = keys.slice(0, -1);
    const finalKey = keys[keys.length - 1];

    const modifierMatch = modifiers.every((key: any) => {
      if (key === 'ctrl' || key === 'control') return keyboardEvent.ctrlKey;
      if (key === 'alt') return keyboardEvent.altKey;
      if (key === 'shift') return keyboardEvent.shiftKey;
      if (key === 'meta' || key === 'windows' || key === 'command') return keyboardEvent.metaKey;
      return false;
    });

    // Check that the pressed key matches the final key
    const keyMatch = finalKey === keyboardEvent.key.toLowerCase();

    if (modifierMatch && keyMatch) {
      callback(keyboardEvent);
    }
  });
}

export function documentCss (
  element: string,
  object?: Partial<Record<keyof CSSStyleDeclaration, string | number>>
): any {
  const selector = element.trim();
  if (!selector) {
    throw new Error("Selector cannot be empty.");
  }

  let styleTag = document.querySelector("style[js-styles]") as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.setAttribute("js-styles", "");
    document.head.appendChild(styleTag);
  }

  const sheet = styleTag.sheet as CSSStyleSheet;
  let ruleIndex = -1;
  const existingStyles: StringRecord<string> = {};

  for (let i = 0; i < sheet.cssRules.length; i++) {
    const rule = sheet.cssRules[i];
    if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
      ruleIndex = i;
      const declarations = rule.style;
      for (let j = 0; j < declarations.length; j++) {
        const name = declarations[j];
        existingStyles[name] = declarations.getPropertyValue(name).trim();
      }
      break;
    }
  }

  if (!object || Object.keys(object).length === 0) {
    return existingStyles;
  }

  // Convert camelCase to kebab-case
  const newStyles: StringRecord<string> = {};
  for (const [prop, val] of Object.entries(object)) {
    if (val !== null && val !== undefined) {
      const kebab = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      newStyles[kebab] = val.toString();
    }
  }

  const mergedStyles = { ...existingStyles, ...newStyles };
  const styleString = Object.entries(mergedStyles)
    .map(([prop, val]) => `${prop}: ${val};`)
    .join(" ");

  if (ruleIndex !== -1) {
    sheet.deleteRule(ruleIndex);
  }

  try {
    sheet.insertRule(`${selector} { ${styleString} }`, sheet.cssRules.length);
  } catch (err) {
    console.error("Failed to insert CSS rule:", err, { selector, styleString });
  }
}

export function createElementTree<T extends HTMLElement>(node: ElementNode): T {
  const el = document.createElement(node.tag);

  // Add class if provided
  if (node.class) el.className = node.class;

  // Add text content if provided
  if (node.text) el.textContent = node.text;

  // Add inner HTML if provided
  if (node.html) el.innerHTML = node.html;

  // Handle styles, ensure it’s an object
  if (node.style && typeof node.style === 'object') {
    for (const [prop, val] of Object.entries(node.style)) {
      el.style.setProperty(prop, val.toString());
    }
  }

  // Handle other attributes (excluding known keys)
  for (const [key, val] of Object.entries(node)) {
    if (
      key !== 'tag' &&
      key !== 'class' &&
      key !== 'text' &&
      key !== 'html' &&
      key !== 'style' &&
      key !== 'children'
    ) {
      if (typeof val === 'string') {
        el.setAttribute(key, val);
      } else throw new Opti.CustomException("ParameterError", "Custom parameters must be of type 'string'");
    }
  }

  // Handle children (ensure it's an array or a single child)
  if (node.children) {
    if (Array.isArray(node.children)) {
      node.children.forEach(child => {
        el.appendChild(createElementTree(child));
      });
    } else {
      el.appendChild(createElementTree(node.children)); // Support for a single child node
    }
  }

  return el as T;
}

export function $ (selector: string) {
  return document.querySelector(selector);
};

export function $$ (selector: string) {
  return document.querySelectorAll(selector);
};

}
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

  export class ShortcutEvent extends KeyboardEvent {
    keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    constructor(
      keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?],
      eventInit?: ShortcutEventInit
    ) {
      const lastKey = keys[keys.length - 1] || "";
      super("keydown", { ...eventInit, key: lastKey });
      this.keys = keys;
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

  export namespace Crafty {
    export interface Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {
      getProp<K extends keyof P>(prop: K): P[K];
      setProp<K extends keyof P>(prop: K, value: P[K]): void;
      getChildren(): C;
      append(child: Crafty.Child): void;
      prepend(child: Crafty.Child): void;
      remove(child: Crafty.Child): void;
      insert?(child: Crafty.Child, index: number): void;
    }

    export type Props<T extends HTMLTag> = Partial<{
      tag: T,
      class: string | string[],
      text: string,
      id: string,
      name: string,
      [key: string]: unknown
    } & Pick<HTMLElementOf<T>, AccessorKeys<HTMLElementOf<T>>>
    >;

    export type Child = Crafty.Element<any, any, any> | Crafty.Fragment<any, any, any>;

    export class Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {  // <- implements the interface
      public tag: T;
      public props: P;
      public children: C;

      constructor(tag: T, props?: P, children?: C) {
        this.tag = tag;
        this.props = props ?? ({} as P);
        this.children = children ?? [] as unknown as C;
      }

      getProp<K extends keyof P>(prop: K): P[K] {
        return this.props[prop];
      }

      setProp<K extends keyof P>(prop: K, value: P[K]): void {
        this.props[prop] = value;
      }

      getChildren(): C {
        return this.children;
      }

      append(child: Crafty.Child): void {
        this.children = [...this.children, child] as unknown as C;
      }

      prepend(child: Crafty.Child): void {
        this.children = [child, ...this.children] as unknown as C;
      }

      remove(child: Crafty.Child): void {
        this.children = this.children.filter(c => c !== child) as unknown as C;
      }

      render(): HTMLElementOf<T> {
        // your render implementation here
        throw new Error("Not implemented");
      }
    }

    export class Fragment<
      T extends HTMLTag,
      P extends Props<T> = Props<T>,
      C extends readonly Child[] = readonly []
    > extends Element<T, P, C> {
      // can override or extend render() etc.
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
function defineProperty<T>(
  object: any,
  prop: PropertyKey,
  getter: () => T,
  setter?: (value: T) => void
): void {
  Object.defineProperty(object, prop, {
    get: getter,
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function defineGetter<T>(object: any, prop: PropertyKey, getter: () => T): void {
  defineProperty(object, prop, getter);
}

function defineSetter<T>(object: any, prop: PropertyKey, setter: (value: T) => void): void {
  Object.defineProperty(object, prop, {
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function toArray(collection: HTMLCollectionOf<Element> | NodeListOf<Element>): Element[] {
  return Array.from(collection);
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isGlobal(val: any): val is typeof globalThis {
  return val === globalThis;
}

function typedEntries<T extends object, K extends keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][];
}

(function() {
  //@ts-ignore
  globalThis.Opti ??= {};

  globalThis.f = (iife: () => void) => iife();
  globalThis.createEventListener = Opti.createEventListener;
  globalThis.Time = Opti.Time;
  globalThis.ShortcutEvent = Opti.ShortcutEvent;
  globalThis.isEmpty = Opti.isEmpty;
  globalThis.type = Opti.type;
  globalThis.generateID = Opti.generateID;
  globalThis.Colorize = Opti.Colorize;
  globalThis.Exception = Opti.Exception;
  globalThis.UnknownException = Opti.UnknownException;
  globalThis.NotImplementedException = Opti.NotImplementedException;
  globalThis.AccessException = Opti.AccessException;
  globalThis.CustomException = Opti.CustomException;
  globalThis.ColorizedSyntaxException = Opti.ColorizedSyntaxException;
  globalThis.RuntimeException = Opti.RuntimeException;
  globalThis.Enum = Opti.Enum;
  globalThis.Collection = Opti.Collection;  

  Document.prototype.ready = Opti.ready;
  Document.prototype.leaving = Opti.leaving;
  Document.prototype.bindShortcut = Opti.bindShortcut;
  Document.prototype.css = Opti.documentCss;
  Document.prototype.createElementTree = Opti.createElementTree;

  NodeList.prototype.addEventListener = Opti.addEventListenerEnum;
  NodeList.prototype.addClass = Opti.addClassList;
  NodeList.prototype.removeClass = Opti.removeClassList;
  NodeList.prototype.toggleClass = Opti.toggleClassList;
  NodeList.prototype.single = function (this: NodeList) {
    return this.length > 0 ? this[0] : null;
  };

  HTMLCollection.prototype.addEventListener = Opti.addEventListenerEnum;
  HTMLCollection.prototype.addClass = Opti.addClassList;
  HTMLCollection.prototype.removeClass = Opti.removeClassList;
  HTMLCollection.prototype.toggleClass = Opti.toggleClassList;
  HTMLCollection.prototype.single = function (this: HTMLCollection) {
    return this.length > 0 ? this[0] : null;
  };

  EventTarget.prototype.addBoundListener = Opti.addBoundListener;
  EventTarget.prototype.addEventListeners = Opti.addEventListeners;
  EventTarget.prototype.delegateEventListener = Opti.delegateEventListener;

  Element.prototype.hasText = Opti.hasText;
  Element.prototype.txt = Opti.text;
  Element.prototype.addClass = Opti.addClass;
  Element.prototype.removeClass = Opti.removeClass;
  Element.prototype.toggleClass = Opti.toggleClass;
  Element.prototype.hasClass = Opti.hasClass;

  HTMLElement.prototype.css = Opti.css;
  HTMLElement.prototype.elementCreator = Opti.elementCreator;
  HTMLElement.prototype.tag = Opti.tag;
  HTMLElement.prototype.html = Opti.html;
  HTMLElement.prototype.show = Opti.show;
  HTMLElement.prototype.hide = Opti.hide;
  HTMLElement.prototype.toggle = Opti.toggle;

  HTMLFormElement.prototype.serialize = Opti.serialize;

  Node.prototype.parent = Opti.getParent;
  Node.prototype.ancestor = Opti.getAncestor;
  Node.prototype.getChildren = Opti.getChildren;
  Node.prototype.siblings = Opti.getSiblings;
  Node.prototype.$ = Opti.find;
  Node.prototype.$$ = Opti.findAll;
  Number.prototype.repeat = Opti.repeat;
  Array.prototype.unique = Opti.unique;
  Array.prototype.chunk = Opti.chunk;
  String.prototype.remove = Opti.remove;
  String.prototype.removeAll = Opti.removeAll;
  String.prototype.capitalize = Opti.capitalize;

  Math.random = Opti.random;
  JSON.parseFile = Opti.parseFile;
  Object.clone = Opti.clone;
  Object.forEach = Opti.forEach;
  Date.at = Opti.atDate;
  Date.fromTime = Opti.fromTime;

  defineGetter(Window.prototype, "width", () => window.innerWidth || document.body.clientWidth);
  defineGetter(Window.prototype, "height", () => window.innerHeight || document.body.clientHeight);
  defineGetter(HTMLElement.prototype, "visible", function (this: HTMLElement) {
    return this.css("visibility") !== "hidden"
      ? this.css("display") !== "none"
      : Number(this.css("opacity")) > 0;
  });
})();
namespace Opti {

export function atDate(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number {
  return new Date(year, monthIndex, date, hours, minutes, seconds, ms).getTime();
}

export function fromTime (this: DateConstructor, time: Time, year: number, monthIndex: number, date?: number | undefined): Date {
  return new Date(year, monthIndex, date, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
}

export function clone<T>(object: T, deep: boolean = true): T {
  if (object === null || typeof object === "undefined") {
    return object;
  } else if (typeof object !== "object" && typeof object !== "symbol" && typeof object !== "function") {
    return object;
  }

  const shallowClone = (): T =>
    Object.assign(Object.create(Object.getPrototypeOf(object)), object);

  const deepClone = (obj: any, seen = new WeakMap()): any => {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj)) return seen.get(obj);

    // Preserve prototype
    const cloned = Array.isArray(obj)
      ? []
      : Object.create(Object.getPrototypeOf(obj));

    seen.set(obj, cloned);

    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) {
      obj.forEach((v, k) =>
        cloned.set(deepClone(k, seen), deepClone(v, seen))
      );
      return cloned;
    }
    if (obj instanceof Set) {
      obj.forEach(v => cloned.add(deepClone(v, seen)));
      return cloned;
    }
    if (ArrayBuffer.isView(obj)) return new (obj.constructor as any)(obj);
    if (obj instanceof ArrayBuffer) return obj.slice(0);

    for (const key of Reflect.ownKeys(obj)) {
      cloned[key] = deepClone(obj[key], seen);
    }

    return cloned;
  };

  return deep ? deepClone(object) : shallowClone();
};

export function repeat (this: number, iterator: (i: number) => any): void {
  for (let i = 0; i < this; i++) {
    iterator(i);
  }
};

export function unique<T>(this: T[]): T[] {
  return [...new Set(this)];
};

export function chunk<T>(this: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) throw new TypeError("`chunkSize` cannot be a number below 1");

  const newArr: T[][] = [];
  let tempArr: T[] = [];

  this.forEach(val => {
    tempArr.push(val);
    if (tempArr.length === chunkSize) {
      newArr.push(tempArr);
      tempArr = []; // Reset tempArr for the next chunk
    }
  });

  // Add the remaining elements in tempArr if any
  if (tempArr.length) {
    newArr.push(tempArr);
  }

  return newArr;
};

export function remove (this: string, finder: string | RegExp): string {
  return this.replace(finder, "");
};

export function removeAll (this: string, finder: string | RegExp): string {
  if (finder instanceof RegExp) {
    if (!finder.flags.includes("g")) {
      finder = new RegExp(finder.source, finder.flags + "g");
    }
  }
  return this.replaceAll(finder, "");
};

const origionalRandom = Math.random;
export const random = (minOrMax?: number, max?: number) => {
  if (isDefined(minOrMax) && isDefined(max)) {
    return origionalRandom() * (max - minOrMax) + minOrMax;
  } else if (isDefined(minOrMax)) {
    return origionalRandom() * minOrMax;
  } else return origionalRandom();
};

export function isDefined<T>(obj: T | undefined): obj is T {
  return typeof obj !== "undefined";
}

export function forEach<T>(object: T, iterator: (key: keyof T, value: T[keyof T]) => any): void {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      iterator(key, object[key]);
    }
  }
};

export function capitalize(this: string): string {
  const i = this.search(/\S/);
  return i === -1 ? this : this.slice(0, i) + this.charAt(i).toUpperCase() + this.slice(i + 1);
};

export async function parseFile<R = any, T = R>(
  file: string,
  receiver?: (content: T) => R
): Promise<R> {
  const fileContent = await fetch(file).then(res => res.json() as Promise<T>);

  if (!receiver) {
    return fileContent as unknown as R;
  }

  return receiver(fileContent);
};

const origionallog = console.log;
export function log(colorize?: true, ...data: any[]) {
  const text = data.map(val => typeof val === "string" ? val : JSON.stringify(val)).join(" ");
  origionallog(Colorize`${text}`);
}

}
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
namespace Opti {

export function type (val: any): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";

  const typeOf = typeof val;
  if (typeOf === "function") {
    return `Function:${val.name || "<anonymous>"}(${val.length})`;
  }

  let typeName = capitalize.call(Object.prototype.toString.call(val).slice(8, -1));

  const ctor = val.constructor?.name;
  if (ctor && ctor !== typeName) {
    typeName = ctor;
  }

  const len = (val as any).length;
  if (typeof len === "number" && Number.isFinite(len)) {
    typeName += `(${len})`;
  } else if (val instanceof Map || val instanceof Set) {
    typeName += `(${val.size})`;
  } else if (val instanceof Date && !isNaN(val.getTime())) {
    typeName += `:${val.toISOString().split("T")[0]}`;
  } else if (typeName === "Object") {
    typeName += `(${Object.keys(val).length})`;
  }

  return typeName;
};

// Mapping of style keywords to ANSI escape codes for terminal formatting
const styles: Record<string, string> = {
  red: "\x1b[31m",
  orange: "\x1b[38;5;208m", // extended ANSI orange
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  purple: "\x1b[35m",
  pink: "\x1b[38;5;205m", // extended ANSI pink
  underline: "\x1b[4m",
  bold: "\x1b[1m",
  strikethrough: "\x1b[9m",
  italic: "\x1b[3m",
  emphasis: "\x1b[3m", // alias for italic
  reset: "\x1b[0m",
};

export function Colorize(strings: TemplateStringsArray, ...values: any[]) {
  // Combine all parts of the template string with interpolated values
  let input = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

  // Replace shorthand syntax for bold and underline
  // Replace {_..._} and {*...*} with {underline:...}, and {**...**} with {bold:...}
  input = input
    .replace(/\{_([^{}]+)_\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\{\*\*([^{}]+)\*\*\}/g, (_, content) => `{bold:${content}}`)
    .replace(/\{\*([^{}]+)\*\}/g, (_, content) => `{underline:${content}}`)
    .replace(/\\x1b/g, '\x1b');

  // Replace escaped braces \{ and \} with placeholders so they are not parsed as tags
  input = input.replace(/\\\{/g, "__ESCAPED_OPEN_BRACE__").replace(/\\\}/g, "__ESCAPED_CLOSE_BRACE__");

  let output = ""; // Final output string with ANSI codes
  const stack: string[] = []; // Stack to track open styles for proper nesting
  let i = 0; // Current index in input

  while (i < input.length) {
    // Match the start of a style tag like {red: or {(dynamic ANSI code):
    const openMatch = input.slice(i).match(/^\{([a-zA-Z]+|\([^)]+\)):/);

    if (openMatch) {
      let tag = openMatch[1];

      if (tag.startsWith("(") && tag.endsWith(")")) {
        // Dynamic ANSI escape code inside parentheses
        tag = tag.slice(1, -1); // remove surrounding parentheses
        stack.push("__dynamic__");
        output += tag; // Insert raw ANSI code directly
      } else {
        if (!styles[tag]) {
          throw new ColorizedSyntaxException(`Unknown style: ${tag}`);
        }
        stack.push(tag);
        output += styles[tag];
      }
      i += openMatch[0].length; // Move index past the opening tag
      continue;
    }

    // Match closing tag '}'
    if (input[i] === "}") {
      if (!stack.length) {
        // No corresponding opening tag
        throw new ColorizedSyntaxException(`Unexpected closing tag at index ${i}`);
      }
      stack.pop(); // Close the last opened tag
      output += styles.reset; // Reset styles
      // Re-apply all remaining styles still on the stack
      for (const tag of stack) {
        // Reapply dynamic codes as-is, else mapped styles
        output += tag === "__dynamic__" ? "" : styles[tag];
      }
      i++; // Move past closing brace
      continue;
    }

    // Append normal character to output, but restore escaped braces if needed
    if (input.startsWith("__ESCAPED_OPEN_BRACE__", i)) {
      output += "{";
      i += "__ESCAPED_OPEN_BRACE__".length;
      continue;
    }
    if (input.startsWith("__ESCAPED_CLOSE_BRACE__", i)) {
      output += "}";
      i += "__ESCAPED_CLOSE_BRACE__".length;
      continue;
    }

    output += input[i++];
  }

  // If stack is not empty, we have unclosed tags
  if (stack.length) {
    const lastUnclosed = stack[stack.length - 1];
    throw new ColorizedSyntaxException(`Missing closing tag for: ${lastUnclosed}`);
  }

  // Ensure final reset for safety
  return output + styles.reset;
}

export function isEmpty(val: string): val is "";
export function isEmpty(val: number): val is 0 | typeof NaN;
export function isEmpty(val: boolean): val is false;
export function isEmpty(val: null | undefined): true;
export function isEmpty(val: Array<any>): val is [];
export function isEmpty(val: Record<any, unknown>): val is Record<any, never>;
export function isEmpty(val: Map<any, any>): val is Map<any, never>;
export function isEmpty(val: Set<any>): val is Set<never>;
export function isEmpty(val: WeakMap<object, any>): val is WeakMap<object, any>;
export function isEmpty(val: WeakSet<object>): val is WeakSet<object>;
export function isEmpty(val: any): boolean {
  // Generic type checking
  // eslint-disable-next-line eqeqeq
  if (val == null || val === false || val === "") return true;

  // Number checking
  if (typeof val === "number") return val === 0 || Number.isNaN(val);

  // Array checking
  if (Array.isArray(val) && val.length === 0) return true;

  // Map, Set, and weak variant checks
  if (val instanceof Map || val instanceof Set || val instanceof WeakMap || val instanceof WeakSet) {
    return (val as any).size === 0; // size check works for these types
  }

  // Object checking
  if (typeof val === 'object') {
    const proto = Object.getPrototypeOf(val);
    const isPlain = proto === Object.prototype || proto === null;
    return isPlain && Object.keys(val).length === 0;
  }

  return false;
}

export function createEventListener<T extends ((...args: any[]) => any)[]>(
  triggers: T,
  callback: (...results: CallbackResult<T>) => void
): void {
  const originals = triggers.map(fn => fn);

  triggers.forEach((originalFn, i) => {
    function wrapper (this: any, ...args: any[]) {
      const result = originals[i].apply(this, args);
      callback(...triggers.map((_, j) =>
        j === i ? result : undefined
      ) as any);
      return result;
    };

    // Replace global function by matching the actual function object
    if (typeof window !== "undefined") {
      for (const key in window) {
        if ((window as any)[key] === originalFn) {
          (window as any)[key] = wrapper;
          return; // stop after replacement
        }
      }
    }

    console.warn("Cannot replace function:", originalFn);
  });
}

export function generateID(): ID {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&*_-";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Type assertion to add the brand
  return Object.freeze(result) as ID;
}

}
namespace Opti {
  export class Exception extends Error {
    private _name: string;
    private _message: string;
    private _cause: string;
    private _internalStack: string;

    constructor(name: string | null, message: string = "", cause: string = "") {
      super();
      this._message = message;
      this._cause = cause;
      this._name = name ?? "Exception";
      this._internalStack = new Error().stack ?? "";
    }

    public get name(): string {
      return this._name;
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public throw(): never {
      throw this;
    }

    public getStackTrace(): string {
      return this._internalStack;
    }

    public override toString(): string {
      return `${this._name}: ${this._message}\r\n${this._internalStack}`;
    }
  }

  export class RuntimeException {
    private _message: string;
    private _cause: string;

    public constructor(message: string = "", cause: string = "") {
      this._message = message;
      this._cause = cause;
    }

    public get name(): "RuntimeException" {
      return "RuntimeException";
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public toString(): string {
      return `RuntimeException: ${this._message}`;
    }
  }

  export class NotImplementedException extends Exception {
    constructor(message: string = "Function not implimented yet", cause?: string) {
      super("NotImplementedException", message, cause);
    }
  }

  export class ColorizedSyntaxException extends Exception {
    constructor(message?: string, cause?: string) {
      super("ColorizedSyntaxException", message, cause);
      Object.setPrototypeOf(this, ColorizedSyntaxException.prototype);
    }
  }

  export class UnknownException extends Exception {
    constructor(message?: string, cause?: string) {
      super("UnknownException", message, cause);
      Object.setPrototypeOf(this, UnknownException.prototype);
    }
  }

  export class AccessException extends Exception {
    constructor(message?: string, cause?: string) {
      super("AccessException", message, cause);
      Object.setPrototypeOf(this, AccessException.prototype);
    }
  }

  export class CustomException extends Exception {
    constructor(name: string, message?: string, cause?: string) {
      super(name, message, cause);
      Object.setPrototypeOf(this, CustomException.prototype);
    }
  }
}
namespace Opti {

export function addBoundListener <T extends EventTarget, K extends keyof EventMapOf<T>>(
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

export function addEventListeners<T extends EventTarget>(
  this: T,
  listenersOrTypes: (keyof EventMapOf<T>)[] | {
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

}
namespace Opti {

export function hasText (this: Element, text: string | RegExp): boolean {
  if (typeof text === "string") {
    return this.txt().includes(text);
  } else {
    return text.test(this.txt());
  }
}

export function addClass (this: Element, elClass: string): void {
  this.classList.add(elClass);
}

export function removeClass (this: Element, elClass: string): void {
  this.classList.remove(elClass);
}

export function toggleClass (this: Element, elClass: string): void {
  this.classList.toggle(elClass);
}

export function hasClass (this: Element, elClass: string): boolean {
  return this.classList.contains(elClass);
}

export function css(
  this: HTMLElement,
  key?: keyof CSSStyleDeclaration | Partial<Record<keyof CSSStyleDeclaration, string | number>>,
  value?: string | number
): any {
  const css = this.style;

  if (!key) {
    // Return all styles
    const result: Partial<Record<keyof CSSStyleDeclaration, string>> = {};
    for (let i = 0; i < css.length; i++) {
      const prop = css[i];
      if (prop) {
        result[prop as keyof CSSStyleDeclaration] = css.getPropertyValue(prop).trim();
      }
    }
    return result;
  }

  if (typeof key === "string") {
    if (value === undefined) {
      // Get one value
      return css.getPropertyValue(key).trim();
    } else {
      // Set one value
      if (key in css) {
        css.setProperty(toKebabCase(key), value.toString());
      }
    }
  } else {
    // Set multiple
    for (const [prop, val] of Object.entries(key)) {
      if (val !== null && val !== undefined) {
        css.setProperty(toKebabCase(prop), val.toString());
      }
    }
  }
};

export function getParent (this: Node): Node | null {
  return this.parentElement;
};

export function getAncestor<T extends Element>(this: Element, selector: string): T | null;
export function getAncestor(this: Node, level: number): Node | null;
export function getAncestor<T extends Element>(this: Node, arg: string | number): T | Node | null {
  // Case 1: numeric level
  if (typeof arg === "number") {
    let node: Node | null = this;
    for (let i = 0; i < arg; i++) {
      if (!node?.parentNode) return null;
      node = node.parentNode;
    }
    return node;
  }

  // Case 2: selector string
  const selector = arg;
  let el: Element | null = this instanceof Element ? this : this.parentElement;
  while (el) {
    if (el.matches(selector)) {
      return el as T;
    }
    el = el.parentElement;
  }
  return null;
}
export function createChildren (this: HTMLElement, elements: HTMLElementCascade): void {
  const element = document.createElement(elements.element);

  if (elements.id) {
    element.id = elements.id;
  }

  if (elements.className) {
    if (Array.isArray(elements.className)) {
      element.classList.add(...elements.className);
    } else {
      element.classList.add(elements.className);
    }
  }

  // Assign additional attributes dynamically
  for (const key in elements) {
    if (!['element', 'id', 'className', 'children'].includes(key)) {
      const value = elements[key as keyof HTMLElementCascade];
      if (typeof value === 'string') {
        element.setAttribute(key, value);
      } else if (Array.isArray(value)) {
        element.setAttribute(key, value.join(' ')); // Convert array to space-separated string
      }
    }
  }

  // Recursively create children
  if (elements.children) {
    if (Array.isArray(elements.children)) {
      elements.children.forEach(child => {
        // Recursively create child elements
        element.createChildren(child);
      });
    } else {
      // Recursively create a single child element
      element.createChildren(elements.children);
    }
  }

  this.appendChild(element);
};

export function tag <S extends HTMLElement, T extends HTMLTag = HTMLElementTagNameOf<S>>(
  this: S,
  newTag?: T
): HTMLElementOf<T> | string {
  if (!newTag) {
    return this.tagName.toLowerCase() as HTMLTag;
  }

  const newElement = document.createElement(newTag) as HTMLElementOf<T>;

  // Copy attributes
  Array.from(this.attributes).forEach(attr => {
    newElement.setAttribute(attr.name, attr.value);
  });

  // Copy dataset
  Object.entries(this.dataset).forEach(([key, value]) => {
    newElement.dataset[key] = value;
  });

  // Copy inline styles
  newElement.style.cssText = this.style.cssText;

  // Copy classes
  newElement.className = this.className;

  // Copy child nodes
  while (this.firstChild) {
    newElement.appendChild(this.firstChild);
  }

  // Transfer listeners (if you have a system for it)
  if ((this as any)._eventListeners instanceof Map) {
    const listeners = (this as any)._eventListeners as Map<string, EventListenerOrEventListenerObject[]>;
    listeners.forEach((fns, type) => {
      fns.forEach(fn => newElement.addEventListener(type, fn));
    });
    (newElement as any)._eventListeners = new Map(listeners);
  }

  // Optional: Copy properties (if you have custom prototype extensions)
  for (const key in this) {
    // Skip built-in DOM properties and functions
    if (
      !(key in newElement) &&
      typeof (this as any)[key] !== "function"
    ) {
      try {
        (newElement as any)[key] = (this as any)[key];
      } catch {
        // Some props might be readonly — safely ignore
      }
    }
  }

  this.replaceWith(newElement);
  return newElement;
};

export function html (this: HTMLElement, input?: string): string {
  return input !== undefined ? (this.innerHTML = input) : this.innerHTML;
};

export function text(this: Element, text?: string | ((text: string) => string), ...input: (string)[]): string {
  // If text is provided, update the textContent
  if (text !== undefined) {
    if (typeof text === "string") {
      input.unshift(text); // Add the text parameter to the beginning of the input array
      const joined = input.join(" "); // Join all the strings with a space

      // Replace "textContent" if it's found in the joined string (optional logic)
      this.textContent = joined.includes("textContent")
        ? joined.replace("textContent", this.textContent ?? "")
        : joined;
    } else {
      this.textContent = text(this.textContent ?? "");
    }
  }

  // Return the current textContent if no arguments are passed
  return this.textContent ?? "";
};

export function show (this: HTMLElement) {
  this.css("visibility", "visible");
};

export function hide (this: HTMLElement) {
  this.css("visibility", "hidden");
};

export function toggle (this: HTMLElement) {
  if (this.css("visibility") === "visible" || this.css("visibility") === "") {
    this.hide();
  } else {
    this.show();
  }
};

export function find (this: Node, selector: string): Node | null {
  return this.querySelector(selector); // Returns a single Element or null
};

export function findAll (this: Node, selector: string): NodeListOf<Element> {
  return this.querySelectorAll(selector); // Returns a single Element or null
};

export function getChildren (this: Node): NodeListOf<ChildNode> {
  return this.childNodes;
};

export function getSiblings (this: Node, inclusive?: boolean): Node[] {
  const siblings = Array.from(this.parentNode!.childNodes as NodeListOf<Node>);
  if (inclusive) {
    return siblings; // Include current node as part of siblings
  } else {
    return siblings.filter(node => !node.isSameNode(this));
  }
};

export function serialize (this: HTMLFormElement): string {
  const formData = new FormData(this); // Create a FormData object from the form

  // Create an array to hold key-value pairs
  const entries: [string, string][] = [];

  // Use FormData's forEach method to collect form data
  formData.forEach((value, key) => {
    entries.push([key, value.toString()]);
  });

  // Convert the entries into a query string
  return entries
    .map(([key, value]) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    })
    .join('&'); // Join the array into a single string, separated by '&'
};

export function elementCreator (this: HTMLElement) {
  return new HTMLElementCreator(this);
};

export function cut<T extends Element>(this: T): T {
  const clone = document.createElementNS(this.namespaceURI, this.tagName) as T;

  // Copy all attributes
  for (const attr of Array.from(this.attributes)) {
    clone.setAttribute(attr.name, attr.value);
  }

  // Deep copy child nodes (preserves text, elements, etc.)
  for (const child of Array.from(this.childNodes)) {
    clone.appendChild(child.cloneNode(true));
  }

  // Optionally copy inline styles (not always needed if using setAttribute above)
   if (this instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.style.cssText = this.style.cssText;
  }

  this.remove(); // Remove original from DOM

  return clone;
}

}
namespace Opti {

export function ready (callback: (this: Document, ev: Event) => any) {
  document.addEventListener("DOMContentLoaded", callback);
}

export function leaving (callback: (this: Document, ev: Event) => any): void {
  document.addEventListener("unload", (e) => callback.call(document, e));
}

export function bindShortcut (
  shortcut: Shortcut,
  callback: (event: ShortcutEvent) => void
): void {
  document.addEventListener('keydown', (event: Event) => {
    const keyboardEvent = event as ShortcutEvent;
    keyboardEvent.keys = shortcut.split("+") as [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    const keys = shortcut
      .trim()
      .toLowerCase()
      .split("+");

    // Separate out the modifier keys and the actual key
    const modifiers = keys.slice(0, -1);
    const finalKey = keys[keys.length - 1];

    const modifierMatch = modifiers.every((key: any) => {
      if (key === 'ctrl' || key === 'control') return keyboardEvent.ctrlKey;
      if (key === 'alt') return keyboardEvent.altKey;
      if (key === 'shift') return keyboardEvent.shiftKey;
      if (key === 'meta' || key === 'windows' || key === 'command') return keyboardEvent.metaKey;
      return false;
    });

    // Check that the pressed key matches the final key
    const keyMatch = finalKey === keyboardEvent.key.toLowerCase();

    if (modifierMatch && keyMatch) {
      callback(keyboardEvent);
    }
  });
}

export function documentCss (
  element: string,
  object?: Partial<Record<keyof CSSStyleDeclaration, string | number>>
): any {
  const selector = element.trim();
  if (!selector) {
    throw new Error("Selector cannot be empty.");
  }

  let styleTag = document.querySelector("style[js-styles]") as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.setAttribute("js-styles", "");
    document.head.appendChild(styleTag);
  }

  const sheet = styleTag.sheet as CSSStyleSheet;
  let ruleIndex = -1;
  const existingStyles: StringRecord<string> = {};

  for (let i = 0; i < sheet.cssRules.length; i++) {
    const rule = sheet.cssRules[i];
    if (rule instanceof CSSStyleRule && rule.selectorText === selector) {
      ruleIndex = i;
      const declarations = rule.style;
      for (let j = 0; j < declarations.length; j++) {
        const name = declarations[j];
        existingStyles[name] = declarations.getPropertyValue(name).trim();
      }
      break;
    }
  }

  if (!object || Object.keys(object).length === 0) {
    return existingStyles;
  }

  // Convert camelCase to kebab-case
  const newStyles: StringRecord<string> = {};
  for (const [prop, val] of Object.entries(object)) {
    if (val !== null && val !== undefined) {
      const kebab = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      newStyles[kebab] = val.toString();
    }
  }

  const mergedStyles = { ...existingStyles, ...newStyles };
  const styleString = Object.entries(mergedStyles)
    .map(([prop, val]) => `${prop}: ${val};`)
    .join(" ");

  if (ruleIndex !== -1) {
    sheet.deleteRule(ruleIndex);
  }

  try {
    sheet.insertRule(`${selector} { ${styleString} }`, sheet.cssRules.length);
  } catch (err) {
    console.error("Failed to insert CSS rule:", err, { selector, styleString });
  }
}

export function createElementTree<T extends HTMLElement>(node: ElementNode): T {
  const el = document.createElement(node.tag);

  // Add class if provided
  if (node.class) el.className = node.class;

  // Add text content if provided
  if (node.text) el.textContent = node.text;

  // Add inner HTML if provided
  if (node.html) el.innerHTML = node.html;

  // Handle styles, ensure it’s an object
  if (node.style && typeof node.style === 'object') {
    for (const [prop, val] of Object.entries(node.style)) {
      el.style.setProperty(prop, val.toString());
    }
  }

  // Handle other attributes (excluding known keys)
  for (const [key, val] of Object.entries(node)) {
    if (
      key !== 'tag' &&
      key !== 'class' &&
      key !== 'text' &&
      key !== 'html' &&
      key !== 'style' &&
      key !== 'children'
    ) {
      if (typeof val === 'string') {
        el.setAttribute(key, val);
      } else throw new Opti.CustomException("ParameterError", "Custom parameters must be of type 'string'");
    }
  }

  // Handle children (ensure it's an array or a single child)
  if (node.children) {
    if (Array.isArray(node.children)) {
      node.children.forEach(child => {
        el.appendChild(createElementTree(child));
      });
    } else {
      el.appendChild(createElementTree(node.children)); // Support for a single child node
    }
  }

  return el as T;
}

export function $ (selector: string) {
  return document.querySelector(selector);
};

export function $$ (selector: string) {
  return document.querySelectorAll(selector);
};

}
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

  export class ShortcutEvent extends KeyboardEvent {
    keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

    constructor(
      keys: [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?],
      eventInit?: ShortcutEventInit
    ) {
      const lastKey = keys[keys.length - 1] || "";
      super("keydown", { ...eventInit, key: lastKey });
      this.keys = keys;
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

  export namespace Crafty {
    export interface Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {
      getProp<K extends keyof P>(prop: K): P[K];
      setProp<K extends keyof P>(prop: K, value: P[K]): void;
      getChildren(): C;
      append(child: Crafty.Child): void;
      prepend(child: Crafty.Child): void;
      remove(child: Crafty.Child): void;
      insert?(child: Crafty.Child, index: number): void;
    }

    export type Props<T extends HTMLTag> = Partial<{
      tag: T,
      class: string | string[],
      text: string,
      id: string,
      name: string,
      [key: string]: unknown
    } & Pick<HTMLElementOf<T>, AccessorKeys<HTMLElementOf<T>>>
    >;

    export type Child = Crafty.Element<any, any, any> | Crafty.Fragment<any, any, any>;

    export class Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Props<T>,
      C extends readonly Crafty.Child[] = readonly []
    > {  // <- implements the interface
      public tag: T;
      public props: P;
      public children: C;

      constructor(tag: T, props?: P, children?: C) {
        this.tag = tag;
        this.props = props ?? ({} as P);
        this.children = children ?? [] as unknown as C;
      }

      getProp<K extends keyof P>(prop: K): P[K] {
        return this.props[prop];
      }

      setProp<K extends keyof P>(prop: K, value: P[K]): void {
        this.props[prop] = value;
      }

      getChildren(): C {
        return this.children;
      }

      append(child: Crafty.Child): void {
        this.children = [...this.children, child] as unknown as C;
      }

      prepend(child: Crafty.Child): void {
        this.children = [child, ...this.children] as unknown as C;
      }

      remove(child: Crafty.Child): void {
        this.children = this.children.filter(c => c !== child) as unknown as C;
      }

      render(): HTMLElementOf<T> {
        // your render implementation here
        throw new Error("Not implemented");
      }
    }

    export class Fragment<
      T extends HTMLTag,
      P extends Props<T> = Props<T>,
      C extends readonly Child[] = readonly []
    > extends Element<T, P, C> {
      // can override or extend render() etc.
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
function defineProperty<T>(
  object: any,
  prop: PropertyKey,
  getter: () => T,
  setter?: (value: T) => void
): void {
  Object.defineProperty(object, prop, {
    get: getter,
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function defineGetter<T>(object: any, prop: PropertyKey, getter: () => T): void {
  defineProperty(object, prop, getter);
}

function defineSetter<T>(object: any, prop: PropertyKey, setter: (value: T) => void): void {
  Object.defineProperty(object, prop, {
    set: setter,
    enumerable: false,
    configurable: true
  });
}

function toArray(collection: HTMLCollectionOf<Element> | NodeListOf<Element>): Element[] {
  return Array.from(collection);
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isGlobal(val: any): val is typeof globalThis {
  return val === globalThis;
}

function typedEntries<T extends object, K extends keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][];
}

(function() {
  //@ts-ignore
  globalThis.Opti ??= {};

  globalThis.f = (iife: () => void) => iife();
  globalThis.createEventListener = Opti.createEventListener;
  globalThis.Time = Opti.Time;
  globalThis.ShortcutEvent = Opti.ShortcutEvent;
  globalThis.isEmpty = Opti.isEmpty;
  globalThis.type = Opti.type;
  globalThis.generateID = Opti.generateID;
  globalThis.Colorize = Opti.Colorize;
  globalThis.Exception = Opti.Exception;
  globalThis.UnknownException = Opti.UnknownException;
  globalThis.NotImplementedException = Opti.NotImplementedException;
  globalThis.AccessException = Opti.AccessException;
  globalThis.CustomException = Opti.CustomException;
  globalThis.ColorizedSyntaxException = Opti.ColorizedSyntaxException;
  globalThis.RuntimeException = Opti.RuntimeException;
  globalThis.Enum = Opti.Enum;
  globalThis.Collection = Opti.Collection;  

  Document.prototype.ready = Opti.ready;
  Document.prototype.leaving = Opti.leaving;
  Document.prototype.bindShortcut = Opti.bindShortcut;
  Document.prototype.css = Opti.documentCss;
  Document.prototype.createElementTree = Opti.createElementTree;

  NodeList.prototype.addEventListener = Opti.addEventListenerEnum;
  NodeList.prototype.addClass = Opti.addClassList;
  NodeList.prototype.removeClass = Opti.removeClassList;
  NodeList.prototype.toggleClass = Opti.toggleClassList;
  NodeList.prototype.single = function (this: NodeList) {
    return this.length > 0 ? this[0] : null;
  };

  HTMLCollection.prototype.addEventListener = Opti.addEventListenerEnum;
  HTMLCollection.prototype.addClass = Opti.addClassList;
  HTMLCollection.prototype.removeClass = Opti.removeClassList;
  HTMLCollection.prototype.toggleClass = Opti.toggleClassList;
  HTMLCollection.prototype.single = function (this: HTMLCollection) {
    return this.length > 0 ? this[0] : null;
  };

  EventTarget.prototype.addBoundListener = Opti.addBoundListener;
  EventTarget.prototype.addEventListeners = Opti.addEventListeners;
  EventTarget.prototype.delegateEventListener = Opti.delegateEventListener;

  Element.prototype.hasText = Opti.hasText;
  Element.prototype.txt = Opti.text;
  Element.prototype.addClass = Opti.addClass;
  Element.prototype.removeClass = Opti.removeClass;
  Element.prototype.toggleClass = Opti.toggleClass;
  Element.prototype.hasClass = Opti.hasClass;

  HTMLElement.prototype.css = Opti.css;
  HTMLElement.prototype.elementCreator = Opti.elementCreator;
  HTMLElement.prototype.tag = Opti.tag;
  HTMLElement.prototype.html = Opti.html;
  HTMLElement.prototype.show = Opti.show;
  HTMLElement.prototype.hide = Opti.hide;
  HTMLElement.prototype.toggle = Opti.toggle;

  HTMLFormElement.prototype.serialize = Opti.serialize;

  Node.prototype.parent = Opti.getParent;
  Node.prototype.ancestor = Opti.getAncestor;
  Node.prototype.getChildren = Opti.getChildren;
  Node.prototype.siblings = Opti.getSiblings;
  Node.prototype.$ = Opti.find;
  Node.prototype.$$ = Opti.findAll;
  Number.prototype.repeat = Opti.repeat;
  Array.prototype.unique = Opti.unique;
  Array.prototype.chunk = Opti.chunk;
  String.prototype.remove = Opti.remove;
  String.prototype.removeAll = Opti.removeAll;
  String.prototype.capitalize = Opti.capitalize;

  Math.random = Opti.random;
  JSON.parseFile = Opti.parseFile;
  Object.clone = Opti.clone;
  Object.forEach = Opti.forEach;
  Date.at = Opti.atDate;
  Date.fromTime = Opti.fromTime;

  defineGetter(Window.prototype, "width", () => window.innerWidth || document.body.clientWidth);
  defineGetter(Window.prototype, "height", () => window.innerHeight || document.body.clientHeight);
  defineGetter(HTMLElement.prototype, "visible", function (this: HTMLElement) {
    return this.css("visibility") !== "hidden"
      ? this.css("display") !== "none"
      : Number(this.css("opacity")) > 0;
  });
})();
