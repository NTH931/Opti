/* eslint-disable no-var */

declare var Evented: EventedConstructor;
declare var Thread: ThreadConstructor;
declare var StaticThread: StaticThreadConstructor;

interface EventTarget {
  /** 
   * Creates an event listener that triggers a set amount of times
   * @opti
   * @param type The type of listener to use
   * @param listener The callback of the listener
   * @param options Optional options to give the listener 
   * @example
   * const el = document.$("#target");
   * 
   * el.addBoundListener("click", () => {
   *   el.removeAttr("id");
   * }, 1);
   * 
   * let mouseover = false;
   * 
   * el.addBoundListener("mouseover", () => {
   *   el.removeAttr("id");
   *   mouseover = true;
   * }, () => mouseover);
   */
  addBoundListener<T extends EventTarget, K extends keyof EventMapOf<T>>(
    this: T,
    type: K,
    listener: (this: T, e: EventMapOf<T>[K]) => void,
    times: number,
    options?: boolean | AddEventListenerOptions
  ): void;
  addBoundListener<T extends EventTarget, K extends keyof EventMapOf<T>>(
    this: T,
    type: K,
    listener: (this: T, e: EventMapOf<T>[K]) => void,
    condition: (this: T) => boolean,
    options?: boolean | AddEventListenerOptions
  ): void;

  /** 
   * Adds multiple event listeners to the target
   * @opti
   * @param listeners The listeners to apply
   * @example
   * document.addEventListeners({
   *   load: () => console.log("loaded!"),
   *   unload: () => console.log("unloaded!")
   * });
   */
  addEventListeners<T extends EventTarget>(
    this: T,
    listeners: {
      [K in keyof EventMapOf<T>]?: (this: T, e: EventMapOf<T>[K]) => any
    }
  ): void

  /** 
   * Adds multiple event listeners that resolve under a unified callback
   * @opti
   * @param types The events to listen to
   * @param listener The listener to apply
   * @param options options for the event listeners
   * @example
   * document.addEventListeners(["load", "unload"], () => {
   *   console.log("document experienced a loading event");
   * });
   */
  addEventListeners<T extends EventTarget>(
    this: T,
    types: (keyof EventMapOf<T>)[],
    listener: (this: T, e: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;

  /** 
   * Delegates an event listener to a child of the node
   * @opti
   * @param types The events to listen to
   * @param delegator The child element that the event should fire on
   * @param listener The listener to apply
   * @param options options for the event listeners
   * @example
   * document.delegateEventListener("click", "button", () => {
   *   console.log("Button has had a click event happen"); // Even works after DOM mutation
   * });
   */
  delegateEventListener<T extends EventTarget, U extends Element, K extends keyof EventMapOf<T>>(
    this: T,
    type: K,
    delegator: HTMLTag | string,
    listener: (this: U, e: EventMapOf<T>[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void
}