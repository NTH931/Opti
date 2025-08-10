namespace Opti {
  export class Exception extends Error {
    private _name: string;
    private _message: string;
    private _cause: string;
    private _internalStack: string;

    constructor(name: string | null, message: string = "", cause: string = "") {
      super();
      this._message = message;
      this._cause = cause;
      this._name = name ?? "Exception";
      this._internalStack = new Error().stack ?? "";
    }

    public get name(): string {
      return this._name;
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public throw(): never {
      throw this;
    }

    public getStackTrace(): string {
      return this._internalStack;
    }

    public override toString(): string {
      return `${this._name}: ${this._message}\r\n${this._internalStack}`;
    }
  }

  export class RuntimeException {
    private _message: string;
    private _cause: string;

    public constructor(message: string = "", cause: string = "") {
      this._message = message;
      this._cause = cause;
    }

    public get name(): "RuntimeException" {
      return "RuntimeException";
    }

    public getMessage(): string {
      return this._message;
    }

    public getCause(): string {
      return this._cause;
    }

    public toString(): string {
      return `RuntimeException: ${this._message}`;
    }
  }

  export class NotImplementedException extends Exception {
    constructor(message: string = "Function not implimented yet", cause?: string) {
      super("NotImplementedException", message, cause);
    }
  }

  export class ColorizedSyntaxException extends Exception {
    constructor(message?: string, cause?: string) {
      super("ColorizedSyntaxException", message, cause);
      Object.setPrototypeOf(this, ColorizedSyntaxException.prototype);
    }
  }

  export class UnknownException extends Exception {
    constructor(message?: string, cause?: string) {
      super("UnknownException", message, cause);
      Object.setPrototypeOf(this, UnknownException.prototype);
    }
  }

  export class AccessException extends Exception {
    constructor(message?: string, cause?: string) {
      super("AccessException", message, cause);
      Object.setPrototypeOf(this, AccessException.prototype);
    }
  }

  export class AssertException extends Exception {
    constructor(message?: string, cause?: string) {
      super("AssertException", message, cause);
      Object.setPrototypeOf(this, AssertException.prototype);
    }
  }

  export class CustomException extends Exception {
    constructor(name: string, message?: string, cause?: string) {
      super(name, message, cause);
      Object.setPrototypeOf(this, CustomException.prototype);
    }
  }
}