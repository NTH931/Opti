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

export function repeat(this: number, iterator: (i: number) => any): void {
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
  if (typeof minOrMax !== "undefined" && typeof max !== "undefined") {
    return origionalRandom() * (max - minOrMax) + minOrMax;
  } else if (typeof minOrMax !== "undefined") {
    return origionalRandom() * minOrMax;
  } else return origionalRandom();
};

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