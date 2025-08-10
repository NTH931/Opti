namespace Opti {

function extendedString<T>(str: string, funct: boolean, length: boolean): TypeOperators<T> {
  let obj = Object.create(String.prototype, {
    toString: {
      value: () => str
    },
    valueOf: {
      value: () => str
    },
    is: {
      value: (other: string | Object): boolean => {
        if (typeof other === "string") {
          return str === other;
        } else {
          if (typeof other === "function") {
            return str.startsWith(other.name);
          }

          if (typeof other === "object") {
            if (other === null) {
              return str === "null";
            }

            const ctorName = (other as any).constructor?.name;
            if (ctorName && str.startsWith(ctorName)) return true;

            if (typeof (other as any).toString === "function") {
              return str === (other as any).toString();
            }
          }

          return false;
        }
      },
      writable: true,
      enumerable: false,
      configurable: false
    }
  });

  if (length) {
    function isShorter(this: Sized, length: number): boolean;
    function isShorter(this: Sized, object: Sized): boolean;
    function isShorter(this: Sized, lengthOrObject: number | Sized): boolean {
      const len = typeof lengthOrObject === "number" 
        ? lengthOrObject 
        : ("size" in lengthOrObject 
          ? lengthOrObject.size 
          : lengthOrObject.length);

      if ("size" in this) {
        return this.size < len;
      } else {
        return this.length < len;
      }
    }

    function isLonger(this: Sized, length: number): boolean;
    function isLonger(this: Sized, object: Sized): boolean;
    function isLonger(this: Sized, lengthOrObject: number | Sized): boolean {
      const len = typeof lengthOrObject === "number" 
        ? lengthOrObject 
        : ("size" in lengthOrObject 
          ? lengthOrObject.size 
          : lengthOrObject.length);

      if ("size" in this) {
        return this.size > len;
      } else {
        return this.length > len;
      }
    }

    obj = Object.assign({
      isLength(this: Sized, length: number): boolean {
        if ("size" in this) {
          return this.size > length;
        } else {
          return this.length > length;
        }
      },
      isShorter,
      isLonger
    }, obj);
  }

  if (funct) {
    obj = Object.assign( {
      isName(this: (...args: any[]) => any, name: string): boolean {
        return this.name === name;
      }
    }, obj);
  }

  return obj;
}

export function type<T>(val: T): TypeOperators<T> {
  if (val === null) return extendedString<undefined>("null", false, false);
  if (val === undefined) return extendedString<null>("undefined", false, false);

  if (typeof val === "function") {
    return extendedString(`function:${val.name || "<anonymous>"}(${val.length})`, true, false);
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

  return extendedString<T>(typeName, false, typeName.match(/\(\d+\)/) !== null);
};

export function info(val: any): string {
  return String(val);
}

export function assert(condition: boolean, reason?: string): asserts condition {
  if (!condition) {
    throw new globalThis.AssertException(reason);
  }
}

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

// eslint-disable-next-line prefer-const
export let opti = {
  crafty: false,
  query: false,
  evented: false,
  requests: false,
  templated: false,
  flow: false
};

}