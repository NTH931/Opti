namespace Opti {
  export class Crafty {
    static Node = class Node<T extends Crafty.ChildList = []> {
      public children: T;

      constructor(children: T) {
        this.children = children;
      }

      getChildren(): T {
        return this.children;
      }
      append<U extends Crafty.Child>(child: Crafty.Child): asserts this is Node<T & U> {
        
      }
      prepend<U extends Crafty.Child>(child: Crafty.Child): asserts this is Node<T & U> {

      }
      remove<U extends Crafty.Child>(child: Crafty.Child): asserts this is Node<T & U> {

      }
      insert?<U extends Crafty.Child>(child: Crafty.Child): asserts this is Node<T & U> {

      }
    };

    static Element = class Element<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Crafty.Props<T>,
      C extends Crafty.ChildList = []
    > extends Crafty.Node<C> {
      public id: P["id"] | null;
      public classList: P["classList"] | null;
      private readonly tag: T;
      private readonly props: P;

      constructor(tag: T, props: P = {} as P, children?: C) {
        super(children || [] as unknown as C);
        this.tag = tag;
        this.props = props;
        this.id = (props.id ?? null) as P["id"] | null;
        this.classList = (props.classList ?? null) as P["classList"] | null;
      }

      get<K extends keyof P>(prop: K): P[K] {
        return this.props[prop];
      }
      set<K extends keyof P>(prop: K, value: P[K]): void {
        this.props[prop] = value;
      }

      getById<U extends Crafty.ChildIds<C>>(id: U): Crafty.ChildByID<C, U> {
        return this.children.find(child => child.id === id);
      }

      getByClass<U extends Crafty.Classes<C>>(className: U): Crafty.ChildByClass<C, U>[] {
        function search(list: Crafty.ChildList): Crafty.Child[] {
          let results: Crafty.Child[] = [];
          for (const item of list) {
            if (Array.isArray(item)) {
              results = results.concat(search(item));
            } else {
              const cls = item.classList;
              if (typeof cls === "string" && cls === className) {
                results.push(item);
              } else if (Array.isArray(cls) && cls.includes(className)) {
                results.push(item);
              }
            }
          }
          return results;
        }
        return search(this.children);
      }
    };

    static Fragment = class Fragment<
      T extends HTMLTag,
      P extends Crafty.Props<T> = Crafty.Props<T>,
      C extends Crafty.ChildList = []
    > extends Crafty.Node<C> {
      // can override or extend render() etc.
    };

    static Unknown = class Unknown extends Crafty.Node<never[]> {
      constructor() {
        super([]);
      }

    };

    static UnknownElement = class UnknownElement extends Crafty.Unknown {

    };

    static UnknownFragment = class UnknownFragment extends Crafty.Unknown {

    };

    static craft<C extends Crafty.ChildList>(children: C): Crafty.Fragment<C>;
    static craft<T extends HTMLTag, U extends Crafty.Props<T>, V extends Crafty.ChildList>(
      tag: T, 
      props?: U, 
      children?: V
    ): Crafty.Element<T, U, V>;
    static craft<T extends HTMLTag, U extends Crafty.Props<T>, V extends Crafty.ChildList>(
      tagOrChildList: T | V,
      propsOrChild?: U,
      children?: V
    ): Crafty.Element<T, U, V> | Crafty.Fragment<V> {
      if (typeof tagOrChildList === "string") {
        return new Crafty.Element((tagOrChildList as T), propsOrChild as U, children);
      } else {
        return new Crafty.Fragment(tagOrChildList);
      }
    }
  }

  const node = Crafty.craft("div", {}, [Crafty.craft("div", { id: "oldOne" }, []), Crafty.craft("div", { id: "newOne" }, [])]);

  type Res = Crafty.ChildByID<[Crafty.Element<"div", { id: "newOne" }, []>], "newOne">
}