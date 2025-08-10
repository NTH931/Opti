namespace Opti.Query {
  export class MalformedQueryException extends globalThis.Exception {
    constructor(message?: string, cause?: string) {
      super("MalformedQueryException", message, cause);
    }
  }

  type QueryCustom = Partial<{
    hidden: boolean,
    visible: boolean,
    event: string[],
    hasText: string[],
    before: boolean,
    after: boolean,
    parent: boolean,
    styleexternal: string[]
    styles: string[],
    thisfirstchild: boolean,
    thislastchild: boolean,
    thisnthchild: number
  }>;

  type FilterMap = Record<string, QueryCustom>;

  function parseQuery(str: string): [string, FilterMap] {
    const complete: FilterMap = {} as FilterMap;

    function set<K extends keyof QueryCustom>(el: string, prop: K, value: QueryCustom[K]): void {
      complete[el][prop] = value;
    }

    function replace(regex: RegExp, filter: (...inner: string[]) => string | void): void {
      str = str.replace(regex, (_, ...inner: string[]) => {
        return filter(...inner) ?? "";
      });
    }

    str = str.trim();

    // ::before
    replace(/(.+?)::before$/, (...inner) => {
      set(inner[0], "before", true);
    });

    // ::after
    replace(/(.+?)::after$/, (...inner) => {
      set(inner[0], "before", true);
    });

    replace(/(.+?):parent/g, (...inner) => {
      set(inner[0], "parent", true);
    });

    // :this-first-child
    replace(/(.+?):this-first-child/g, (...inner) => {
      set(inner[0], "thisfirstchild", true);
    });

    // :this-last-child
    replace(/(.+?):this-last-child/g, (...inner) => {
      set(inner[0], "thislastchild", true);
    });

    // :this-nth-child
    replace(/(.+?):this-nth-child(\d+)/g, (...inner) => {
      set(inner[0], "thisnthchild", Number(inner[1]));
    });

    // :inline-style(...styles)
    replace(/(.+?):inline-style\(([\w]+[=:][\w\d];?)+\)/g, (...inner) => {
      const selector = inner[0]; // selector
      const inners = inner[1].split(",").map(v => v.trim()); // ...:inline-style([...styles])

      const expanded = inners.map(style => `[style*=${style}]`).join("");

      return expanded;
    });

    // :external-style(...styles)
    replace(/(.+?):external-style\(([\w]+[=:][\w\d]\w*;?\w*)+\)/g, (...inner) => {
      set(inner[0], "styleexternal", inner[1].split(";").map(s => s.trim()));
    });

    // :style(...styles)
    replace(/(.+?):style\(([\w]+[=:][\w\d]\w*;?\w*)+\)/g, (...inner) => {
      set(inner[0], "styles", inner[1].split(";").map(s => s.trim()));
    });

    // :hasText(...text)
    replace(/(.+?):hasText\(([^)(]+)\)/g, (...inner) => {
      set(inner[0], "hasText", inner[1].split(",").map(v => v.trim()).filter(Boolean));
    });

    // :has(...selectors)
    replace(/(.+?):has\(([^)]+)\)/g, (...inner): string => {
      const selector = inner[0]; // selector
      const inners = inner[1].split(",").map(v => v.trim()); // ...:has([...selectors])

      const expanded = inners.map(child => `${selector} > ${child}`).join(", ");

      return `:is(${expanded})`;
    });

    // :hidden
    replace(/(.+?):hidden/g, (...inner) => {
      set(inner[0], "hidden", true);
      return "";
    });

    // :visible
    replace(/(.+?):visible/g, (...inner) => {
      set(inner[0], "visible", true);
    });

    // :event(...events)
    replace(/(.+?):event\(([a-z,\s]*)\)/g, (...inner) => {
      set(inner[0], "event", inner[1].split(",").map(v => v.trim()).filter(Boolean));
    });
 
    return [str, complete];
  }

  const _$ = (selector: string): HTMLElement | null => {
    const [res, checks] = parseQuery(selector);

    const collection = Collection.from(document.querySelectorAll(res)) as Collection<HTMLElement & { readonly event?: string[] }>;

    if (collection?.length <= 0) return null;

    for (const el of collection) {
      for (const [ el, check ] of Object.entries(checks)) {
        throw new NotImplementedException();
      }
      //* :event(...ev)
      if (checks.event && (el.event || !Object.keys(checks.event).every(ev => el.event?.includes(ev)))) {
        continue;
      }

      //* :hidden, :visible
      if (checks.hidden || checks.visible) {
        const display = el.css("display") || getComputedStyle(el).display;
        const visibility = el.css("visibility") || getComputedStyle(el).visibility;
        const opacity = el.css("opacity") || getComputedStyle(el).opacity;

        // If any of these are NOT hiding the element, continue (skip)
        const status = (display !== "none" || visibility !== "hidden" || opacity !== "0") ? "visible" : "hidden";

        if (checks.hidden && status !== "hidden") continue;
        if (checks.visible && status !== "visible") continue;
      }

      if (checks.hasText) {
        
      }

      return el;
    }

    return null;
  };

  _$.query = () => new QueryBuilder(false);

  _$.assert = function (selector: string) {
    return <T extends HTMLTag>(tag: T): HTMLElementOf<T> | null => {
      return document.querySelector<HTMLElementOf<T>>(selector);
    };
  };

  _$.all = function (selector: string): [HTMLElement, ...HTMLElement[]] | null {
    throw new NotImplementedException();
  };

  _$.tear = (selector: string): HTMLElement => {
    throw new NotImplementedException();
  };

  _$.explicit = (selector: string): (<T extends HTMLTag>(tag: T) => HTMLElementOf<T> | null) => {
    return <T extends HTMLTag>(tag: T) => document.querySelector<HTMLElementOf<T>>(selector);
  };

  _$.with = (selector: string): HTMLElement | null => {
    throw new NotImplementedException();
  };

  export const $: OptiQuery = _$ satisfies OptiQuery;

  const _$$ = (selector: string): Collection<HTMLElement> => {
    return Collection.from(document.querySelectorAll(selector));
  };

  _$$.all = function (selector: string): Collection<[HTMLElement, ...HTMLElement[]]> {
    return new Collection([[new HTMLElement(), new HTMLElement()]]);
  };

  _$$.assert = function (selector: string) {
    return <T extends HTMLTag>(tag: T): Collection<HTMLElementOf<T>> => {
      return Collection.from(document.querySelectorAll<HTMLElementOf<T>>(selector));
    };
  };

  _$$.query = () => new QueryBuilder(true);

  _$$.explicit = (selector: string): (<T extends HTMLTag>(tag: T) => Collection<HTMLElementOf<T>>) => {
    return <T extends HTMLTag>(tag: T) => Collection.from(document.querySelectorAll<HTMLElementOf<T>>(selector));
  };

  _$$.live = (selecor: string): LiveCollection<HTMLElement> => {
    throw new NotImplementedException();
  };

  _$$.with = (selecor: string): Collection<HTMLElement> => {
    throw new NotImplementedException();
  };

  _$$.tear = (selector: string): Collection<HTMLElement> => {
    throw new NotImplementedException();
  };

  export const $$: OptiMultiQuery = _$$ satisfies OptiMultiQuery;

  class QueryBuilder {
    private queryString: string[] = [];

    constructor(private multi: boolean) { }

    public is(selector: string): this {
      this.queryString.push(`:is(${selector})`);
      return this;
    }

    public isnt(selector: string) {
      this.queryString.push(`:not(${selector})`);
      return this;
    }
  }
}
