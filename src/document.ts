namespace Opti {

export function ready (callback: (this: Document, ev: Event) => any) {
  document.addEventListener("DOMContentLoaded", callback);
}

export function leaving (callback: (this: Document, ev: Event) => any): void {
  document.addEventListener("unload", (e) => callback.call(document, e));
}

// export function bindShortcut (
//   shortcut: Shortcut,
//   callback: (event: ShortcutEvent) => void
// ): void {
//   document.addEventListener('keydown', (event: Event) => {
//     const keyboardEvent = event as ShortcutEvent;
//     keyboardEvent.keys = shortcut.split("+") as [KeyboardEventKey, KeyboardEventKey, KeyboardEventKey?, KeyboardEventKey?, KeyboardEventKey?];

//     const keys = shortcut
//       .trim()
//       .toLowerCase()
//       .split("+");

//     // Separate out the modifier keys and the actual key
//     const modifiers = keys.slice(0, -1);
//     const finalKey = keys[keys.length - 1];

//     const modifierMatch = modifiers.every((key: any) => {
//       if (key === 'ctrl' || key === 'control') return keyboardEvent.ctrlKey;
//       if (key === 'alt') return keyboardEvent.altKey;
//       if (key === 'shift') return keyboardEvent.shiftKey;
//       if (key === 'meta' || key === 'windows' || key === 'command') return keyboardEvent.metaKey;
//       return false;
//     });

//     // Check that the pressed key matches the final key
//     const keyMatch = finalKey === keyboardEvent.key.toLowerCase();

//     if (modifierMatch && keyMatch) {
//       callback(keyboardEvent);
//     }
//   });
// }

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