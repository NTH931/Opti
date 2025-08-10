/* eslint-disable no-var */

namespace Crafty {
  export type Child = Crafty.Node | Crafty.Element | Crafty.Fragment;
  export type ChildList = readonly Child[];
  export type Props<T extends HTMLTag> = {
      classList?: string | string[],
      text?: string,
      id?: string,
      name?: string,
    } & Partial<Pick<HTMLElementOf<T>, AccessorKeys<HTMLElementOf<T>>>>

  export type ChildIds<T extends Crafty.ChildList> =
    T extends readonly (infer U)[]
      ? U extends { id?: infer ID } & Crafty.Node<infer C>
        ? ID | ChildIds<U["children"]>
        : never
      : never;

  type Example = ChildIds<[Element<"a", { id: "new" }, [Element<"a", { id: "example" }, []>]>]>

  export type Classes<T extends Crafty.ChildList> =
    Flatten<T> extends readonly (infer U)[]
      ? U extends { classList: infer V }
        ? V extends string
          ? V
          : V extends readonly string[]
            ? V[number]
            : never
        : never
      : never;

  type ChildByID<T extends Crafty.ChildList, I> =
    Flatten<T> extends readonly (infer U)[]
      ? U extends { id: infer V }
        ? V extends I
          ? U
          : number
        : string
      : never;
    
  type addsda = Flatten<[Crafty.Element<"div", { id: "newOne" }, []>]>
  type Res = Crafty.ChildByID<[Crafty.Element<"div", { id: "newOne" }, []>], "newOne">

  type ChildByClass<T extends readonly { classList?: unknown }[], C extends string> =
    Flatten<T> extends readonly (infer U)[]
      ? U extends { classList: infer CL }
        ? CL extends string
          ? C extends CL
            ? U
              : never
                : CL extends readonly string[]
                ? C extends CL[number]
              ? U
            : never
          : never
        : never
      : never;


  export class Node<
    T extends Crafty.ChildList = []
  > {
    constructor(children: T);

    public children: T;

    getChildren(): T;
    append(child: Crafty.Child): void;
    prepend(child: Crafty.Child): void;
    remove(child: Crafty.Child): void;
    insert?(child: Crafty.Child, index: number): void;
  }
  export interface Element<
    T extends HTMLTag,
    P extends Crafty.Props<T> = Props<T>,
    C extends Crafty.ChildList = []
  > extends Crafty.Node<C> {
    id: P["id"] | null;
    classList: P["classList"] | [];

    get<K extends keyof P>(prop: K): P[K];
    set<K extends keyof P>(prop: K, value: P[K]): void;

    getById<U extends Crafty.ChildIds<C>>(id: U): Crafty.ChildByID<C, U> | undefined;
    getByClass<U extends Crafty.Classes<C>>(className: U): Crafty.ChildByClass<C, U>[];
  }
  export interface Fragment<
    C extends ChildList = []
  > extends Crafty.Node<C> { }

  export class Unknown extends Crafty.Node<never[]> { 
    constructor();
  }
  export class UnknownElement extends Crafty.Unknown { }
  export class UnknownFragment extends Crafty.Unknown { }

  export function craft<T extends HTMLTag, U extends Crafty.Props<T>, V extends Crafty.ChildList>(tag: T, props?: U, children?: V): Crafty.Element<T, U, V>;
  export function craft<T extends Crafty.ChildList>(...children: T): Crafty.Fragment<T>;
}

declare var Crafty: Crafty;