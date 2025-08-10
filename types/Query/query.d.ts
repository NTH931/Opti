interface OptiQuery {
  <T extends HTMLTag>(selector: T): HTMLElementOf<T> | null 
  (selector: string): HTMLElement | null

  all(selector: string): [HTMLElement, ...HTMLElement[]] | null;

  assert(selector: string): <T extends HTMLTag>(tag: T) => HTMLElementOf<T> | null

  query(): QueryBuilder;

  tear<T extends HTMLTag>(selector: T): HTMLElementOf<T> | null;
  tear(selector: string): HTMLElement;

  explicit(selector: string): <T extends HTMLTag>(tag: T) => HTMLElementOf<T> | null;

  with<T extends HTMLTag>(selector: `${T}${string}`): HTMLElementOf<T> | null;
  with(selecor: string): HTMLElement | null;
}

interface OptiMultiQuery {
  <T extends HTMLTag>(selector: T): Collection<HTMLElementOf<T>>
  (selector: string): Collection<HTMLElement>

  all(selector: string): Collection<[HTMLElement, ...HTMLElement[]]>;

  assert(selector: string): <T extends HTMLTag>(tag: T) => Collection<HTMLElementOf<T>>

  query(): QueryBuilder;

  tear<T extends HTMLTag>(selector: T): Collection<HTMLElementOf<T>>;
  tear(selector: string): Collection<HTMLElement>;

  explicit(selector: string): <T extends HTMLTag>(tag: T) => Collection<HTMLElementOf<T>>;

  live<T extends HTMLTag>(selecor: T): LiveCollection<HTMLElementOf<T>>;
  live(selecor: string): LiveCollection<HTMLElement>;

  with<T extends HTMLTag>(selector: `${T}${string}`): Collection<HTMLElementOf<T>>;
  with(selecor: string): Collection<HTMLElement>;
}

interface LiveCollectionConstructor {
  new<T>(collection: T[]): LiveCollection<T>
  from<T>(arrayLike: ArrayLike<T>): LiveCollection<T>
}
interface LiveCollection<T> extends Collection<T> {}

interface QueryBuilder {
  is(selector: string): this
  isnt(selector: string): this
}