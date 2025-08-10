/** Represents a common character on an english keyboard */
type char = 
  | ' ' | '!' | '"' | '#' | '$' | '%' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | '-' | '.' | '/' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | ':' | ';' | '<' | '=' | '>' | '?' | '@' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' 
  | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '[' | '\\' | ']' | '^' | '_' | '`' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | '{' | '|' | '}' | '~';

/** Shortcut for `Record<string, T>` */
type StringRecord<T> = Record<string, T>;

type Func = (...args: any[]) => any;
namespace Func {
  /** Gets a function's argument list types */
  export type Arguments<T extends Func> = T extends (...args: infer T) => any ? T : never;

  /** Get a function's return type */
  export type Return<T extends Func> = T extends (...args: any[]) => infer T ? T : never
}

/** Used as a placeholder type */
type placeholder = any;

/** Flattens array types like `T[][]` and others */
type Flatten<T extends readonly unknown[]> =
  T extends readonly (infer U)[]
    ? Flatten<U>
    : T;

/** Unboxes Object types to primatives */
type Unboxed<T> = 
  T extends (infer U)[] ? Unboxed<U>[] :
  T extends String ? string :
  T extends Number ? number :
  T extends Boolean ? boolean :
  T extends Symbol ? symbol :
  T extends BigInt ? bigint :
  T;

type GetterKeys<T> = {
  [K in keyof T]-?: T[K] extends Function ? never : (
    { -readonly [P in K]: T[K] } extends { [P in K]: T[K] } ? K : never
  )
}[keyof T];

type SetterKeys<T> = {
  [K in keyof T]-?: T[K] extends Function ? never : (
    { -readonly [P in K]: T[P] } extends { [P in K]: T[P] } ? K : never
  )
}[keyof T];

type AccessorKeys<T> = GetterKeys<T> | SetterKeys<T>;

/** Matches classes */
type Class<T> = abstract new (...args: any[]) => T;

/** Objects that have a `size` or `length` property */
type Sized = { size: number } | { length: number }

type BaseTypeOperators = string & {
  is(other: Object): boolean,
  is(other: string): boolean,
}

type TypeOperators<T> = T extends Func ?
  BaseTypeOperators & {
    isName(this: (...args: any[]) => any, name: string): boolean;
  } :
  T extends Sized ?
  BaseTypeOperators & {
    isLength(this: Sized, length: number): boolean;
    isLonger(this: Sized, length: number): boolean;
    isLonger(this: Sized, object: Sized): boolean;
    isLonger(this: Sized, lengthOrObject: number | Sized): boolean
    isShorter(this: Sized, length: number): boolean;
    isShorter(this: Sized, object: Sized): boolean;
    isShorter(this: Sized, lengthOrObject: number | Sized): boolean
  } : never

type ID = readonly string & { readonly __brand: unique symbol };

/** Repesents a html tag in string form */
type HTMLTag = keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap;

/**
 * Gets a `HTMLElement` from a 
 */
type HTMLElementOf<T extends string> =
  T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] :
  T extends keyof HTMLElementDeprecatedTagNameMap ? HTMLElementDeprecatedTagNameMap[T] :
  HTMLElement;

type SVGElementOf<T extends keyof SVGElementTagNameMap> =
  SVGElementTagNameMap[T];

type MathMLElementOf<T extends keyof MathMLElementTagNameMap> =
  MathMLElementTagNameMap[T];

// Extract tag name from element type for HTMLElement
type HTMLElementTagNameOf<T extends HTMLElement> = {
  [K in keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap]:
  K extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[K] extends T ? K : never
  : K extends keyof HTMLElementDeprecatedTagNameMap
  ? HTMLElementDeprecatedTagNameMap[K] extends T ? K : never
  : never
}[keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap];

// Extract tag name from element type for SVGElement
type SVGElementTagNameOf<T extends SVGElement> = {
  [K in keyof SVGElementTagNameMap]: SVGElementTagNameMap[K] extends T ? K : never;
}[keyof SVGElementTagNameMap];

// Extract tag name from element type for MathMLElement
type MathMLElementTagNameOf<T extends MathMLElement> = {
  [K in keyof MathMLElementTagNameMap]: MathMLElementTagNameMap[K] extends T ? K : never;
}[keyof MathMLElementTagNameMap];

/** Returns the resulting type(s) of the function(s) given */
type CallbackResult<T extends ((...args: any[]) => any) | readonly ((...args: any[]) => any)[]> =
  T extends ((...args: any[]) => any) ? ReturnType<T> :
  T extends readonly [...infer R] ? R extends ((...args: any[]) => any)[] ? { [K in keyof R]: ReturnType<R[K]> } : never : never;

type EventMapOf<T> =
  T extends HTMLVideoElement ? HTMLVideoElementEventMap :
  T extends HTMLMediaElement ? HTMLMediaElementEventMap :
  T extends HTMLBodyElement ? HTMLBodyElementEventMap :
  T extends HTMLFrameSetElement ? HTMLFrameSetElementEventMap :
  T extends HTMLElement ? HTMLElementEventMap :

  T extends SVGSVGElement ? SVGSVGElementEventMap :
  T extends SVGElement ? SVGElementEventMap :

  T extends ShadowRoot ? ShadowRootEventMap :
  T extends Document ? DocumentEventMap :
  T extends Window & typeof globalThis ? WindowEventMap :

  T extends Worker ? WorkerEventMap :
  T extends ServiceWorker ? ServiceWorkerEventMap :
  T extends ServiceWorkerRegistration ? ServiceWorkerRegistrationEventMap :
  T extends ServiceWorkerContainer ? ServiceWorkerContainerEventMap :

  T extends RTCPeerConnection ? RTCPeerConnectionEventMap :
  T extends RTCDataChannel ? RTCDataChannelEventMap :
  T extends RTCDTMFSender ? RTCDTMFSenderEventMap :
  T extends RTCDtlsTransport ? RTCDtlsTransportEventMap :
  T extends RTCIceTransport ? RTCIceTransportEventMap :
  T extends RTCSctpTransport ? RTCSctpTransportEventMap :

  T extends AudioScheduledSourceNode ? AudioScheduledSourceNodeEventMap :
  T extends AudioWorkletNode ? AudioWorkletNodeEventMap :
  T extends ScriptProcessorNode ? ScriptProcessorNodeEventMap :
  T extends BaseAudioContext ? BaseAudioContextEventMap :
  T extends OfflineAudioContext ? OfflineAudioContextEventMap :

  T extends AudioDecoder ? AudioDecoderEventMap :
  T extends AudioEncoder ? AudioEncoderEventMap :
  T extends VideoDecoder ? VideoDecoderEventMap :
  T extends VideoEncoder ? VideoEncoderEventMap :

  T extends FontFaceSet ? FontFaceSetEventMap :
  T extends PaymentRequest ? PaymentRequestEventMap :
  T extends PaymentResponse ? PaymentResponseEventMap :

  T extends MediaDevices ? MediaDevicesEventMap :
  T extends MediaStream ? MediaStreamEventMap :
  T extends MediaStreamTrack ? MediaStreamTrackEventMap :
  T extends MediaRecorder ? MediaRecorderEventMap :
  T extends MediaSource ? MediaSourceEventMap :

  T extends MessagePort ? MessagePortEventMap :
  T extends MessageEventTarget<any> ? MessageEventTargetEventMap :
  T extends BroadcastChannel ? BroadcastChannelEventMap :
  T extends WebSocket ? WebSocketEventMap :

  T extends NavigationHistoryEntry ? NavigationHistoryEntryEventMap :
  T extends Notification ? NotificationEventMap :

  T extends Performance ? PerformanceEventMap :
  T extends VisualViewport ? VisualViewportEventMap :
  T extends ScreenOrientation ? ScreenOrientationEventMap :
  T extends RemotePlayback ? RemotePlaybackEventMap :
  T extends WakeLockSentinel ? WakeLockSentinelEventMap :

  T extends TextTrackCue ? TextTrackCueEventMap :
  T extends TextTrack ? TextTrackEventMap :
  T extends TextTrackList ? TextTrackListEventMap :

  T extends SpeechSynthesisUtterance ? SpeechSynthesisUtteranceEventMap :
  T extends SpeechSynthesis ? SpeechSynthesisEventMap :

  T extends MathMLElement ? MathMLElementEventMap :

  T extends IDBOpenDBRequest ? IDBOpenDBRequestEventMap :
  T extends IDBDatabase ? IDBDatabaseEventMap :
  T extends IDBTransaction ? IDBTransactionEventMap :
  T extends IDBRequest ? IDBRequestEventMap :

  T extends XMLHttpRequest ? XMLHttpRequestEventMap :
  T extends XMLHttpRequestEventTarget ? XMLHttpRequestEventTargetEventMap :

  T extends FileReader ? FileReaderEventMap :
  T extends MediaQueryList ? MediaQueryListEventMap :
  T extends EventSource ? EventSourceEventMap :
  T extends PermissionStatus ? PermissionStatusEventMap :

  T extends Animation ? AnimationEventMap :

  T extends MIDIAccess ? MIDIAccessEventMap :
  T extends MIDIInput ? MIDIInputEventMap :
  T extends MIDIPort ? MIDIPortEventMap :

  T extends SourceBufferList ? SourceBufferListEventMap :
  T extends SourceBuffer ? SourceBufferEventMap :

  T extends AbortSignal ? AbortSignalEventMap :

  T extends OffscreenCanvas ? OffscreenCanvasEventMap :

  T extends Element ? ElementEventMap :
  T extends GlobalEventHandlers ? GlobalEventHandlersEventMap :
  T extends WindowEventHandlers ? WindowEventHandlersEventMap :
  T extends AbstractWorker ? AbstractWorkerEventMap :

  GlobalEventHandlersEventMap; // fallback


//! Interfaces


/**
 * @opti
 * @deprecated
 */
interface HTMLElementCascade {
  element: keyof HTMLElementTagNameMap;
  id?: string;
  className?: string | string[];
  children?: HTMLElementCascade[] | HTMLElementCascade;
  [key: string]: any
}

/* New Classes */
/**
 * @opti
 */
type HTMLAttrs = {
  text?: string,
  html?: string,
  id?: string;
  class?: string | string[];
  style?: { [key: string]: string };
  [key: string]: any
};

/**
 * @opti
 */
interface OptiFeature {
  enable(): void;
  disable(): void;
  [key: `_${string}`]: any;
}

/**
 * @opti
 */
type ElementProps<T extends HTMLTag> = Partial<
  Pick<
    HTMLElementOf<T>,
    keyof HTMLElementOf<T> extends string ? keyof HTMLElementOf<T> : never
  >
>;

/**
 * @opti
 */
type ElementNode = {
  tag: HTMLTag;
  class?: string;
  text?: string;
  html?: string;
  style?: Record<string, string | number>;
  children?: ElementNode | ElementNode[];
  [key: string]:
  | string
  | number
  | Record<string, string | number>
  | ElementNode
  | ElementNode[]
  | undefined;
};

/**
 * @opti
 */
interface HTMLElementCreator {
  el(tag: keyof HTMLElementTagNameMap, attrs?: HTMLAttrs): HTMLElementCreator;
  container(tag: keyof HTMLElementTagNameMap, attrs?: HTMLAttrs): HTMLElementCreator;
  up(): HTMLElementCreator;
  append(element: HTMLElement): void;
  get element(): HTMLElement;
}

declare enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT"
}