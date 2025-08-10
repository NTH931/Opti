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
  globalThis.isEmpty = Opti.isEmpty;
  globalThis.generateID = Opti.generateID;
  globalThis.Colorize = Opti.Colorize;

  globalThis.type = Opti.type;
  globalThis.info = Opti.info;
  globalThis.assert = Opti.assert;

  globalThis.Exception = Opti.Exception;
  globalThis.UnknownException = Opti.UnknownException;
  globalThis.NotImplementedException = Opti.NotImplementedException;
  globalThis.AccessException = Opti.AccessException;
  globalThis.CustomException = Opti.CustomException;
  globalThis.ColorizedSyntaxException = Opti.ColorizedSyntaxException;
  globalThis.AssertException = Opti.AssertException;
  globalThis.RuntimeException = Opti.RuntimeException;

  globalThis.Enum = Opti.Enum;
  globalThis.Collection = Opti.Collection;  

  Document.prototype.ready = Opti.ready;
  Document.prototype.leaving = Opti.leaving;
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
  Array.prototype.pluck;
  Array.prototype.replace;
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