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