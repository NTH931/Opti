/* eslint-disable no-var */
interface Node {
  /**
   * Returns the parent element.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement)
   * 
   * @deprecated
   * @migrate {@link Node.parent}
   */
  readonly parentElement: HTMLElement | null;

  /**
   * Returns the parent element.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement)
   * @deprecated
   * @migrate {@link Node.parent}
   */
  readonly parentNode: ParentNode | null;

  /**
   * Returns the first element that is a descendant of node that matches selectors.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/querySelector)
   * @deprecated
   * @migrate {@link Node.$}
   */
  querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
  querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
  querySelector<K extends keyof MathMLElementTagNameMap>(selectors: K): MathMLElementTagNameMap[K] | null;
  querySelector<K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K): HTMLElementDeprecatedTagNameMap[K] | null;
  querySelector<E extends Element = Element>(selectors: string): E | null;

  /**
   * Returns all element descendants of node that match selectors.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/querySelectorAll)
   * @deprecated
   * @migrate {@link Node.$$}
   */
  querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
  querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
  querySelectorAll<K extends keyof MathMLElementTagNameMap>(selectors: K): NodeListOf<MathMLElementTagNameMap[K]>;
  /** @deprecated */
  querySelectorAll<K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K): NodeListOf<HTMLElementDeprecatedTagNameMap[K]>;
  querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;

  /** 
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/textContent) 
   * @deprecated
   * @migrate {@link Element.txt}
   */
  textContent: string | null;
}

interface Document {
  /**
   * Returns the HTTP cookies that apply to the Document. If there are no cookies or cookies can't be applied to this resource, the empty string will be returned.
   *
   * Can be set, to add a new cookie to the element's set of HTTP cookies.
   *
   * If the contents are sandboxed into a unique origin (e.g. in an iframe with the sandbox attribute), a "SecurityError" DOMException will be thrown on getting and setting.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/cookie)
   * @deprecated
   * @migrate {@link Cookie}
   */
  cookie: string;

  /**
   * @deprecated
   * @migrate {@link document.ready}
   */
  addEventListener(type: "DOMContentLoaded", listener: (this: Document, ev: Event) => any, options?: boolean | AddEventListenerOptions): void

  /**
   * @deprecated
   * @migrate {@link document.ready}
   */
  addEventListener(type: "load", listener: (this: Document, ev: Event) => any, options?: boolean | AddEventListenerOptions): void

  /**
   * @deprecated
   * @migrate {@link document.leaving}
   */
  addEventListener(type: "unload", listener: (this: Window, ev: Event) => any, options?: boolean | AddEventListenerOptions): void
}

interface Window {
  /** 
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/innerHeight) 
   * @deprecated
   * @migrate {@link window.height}
   */
  readonly innerHeight: number;

  /** 
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/innerWidth) 
   * @deprecated
   * @migrate {@link window.width}
   */
  readonly innerWidth: number;

  /**
   * @deprecated
   * @migrate {@link document.ready}
   */
  addEventListener(type: "DOMContentLoaded", listener: (this: Document, ev: Event) => any, options?: boolean | AddEventListenerOptions): void

  /**
   * @deprecated
   * @migrate {@link document.leaving}
   */
  addEventListener(type: "beforeunload", listener: (this: Window, ev: BeforeUnloadEvent) => any, options?: boolean | AddEventListenerOptions): void

  /**
   * @deprecated
   * @migrate {@link document.leaving}
   */
  addEventListener(type: "unload", listener: (this: Window, ev: Event) => any, options?: boolean | AddEventListenerOptions): void
}

interface Element {
  /** 
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/innerHTML) 
   * @deprecated
   * @migrate {@link HTMLElement.html}
   */
  innerHTML: string;
}

interface HTMLElement {
  /** 
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/innerText) 
   * @deprecated
   * @migrate {@link Node.text}
   */
  innerText: string;
}

/** 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/localStorage) 
 * @deprecated
 * @migrate {@link LocalStorage}
 */
declare var localStorage: Storage;

/** 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/sessionStorage) 
 * @deprecated
 * @migrate {@link SessionStorage}
 */
declare var sessionStorage: Storage;