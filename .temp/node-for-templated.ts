namespace Opti.Templated {
  export class TemplatedParseException extends globalThis.Exception {
    constructor(message?: string, cause?: string) {
      super("TemplatedParseException", message, cause);
    }
  }

  export class Templated {
    static parse(domOrFile: OptiDOM | string, reqvar?: DOMVars): OptiDOM | DocumentFragment {
      if (typeof domOrFile === "string") {
        let dom: OptiDOM | null = null;

        fetch(domOrFile).then((file) => {
          if (!file.url.endsWith(".template.html")) {
            throw new TemplatedParseException("File extension must be of type *.template.html");
          }
          return file.text();
        }).then((html) => {
          dom = Opti.Templated.OptiDOM.from(html, reqvar);
        }).catch((e) => {
          if (e instanceof TemplatedParseException) {
            throw e;
          } else {
            console.error(e);
          }
        });

        if (!dom) {
          throw new globalThis.Exception("Exception", "Error parsing document");
        }

        return dom;
      } else {
        return domOrFile.template(reqvar ?? {});
      }
    }
  }

  export class OptiDOM {
    private constructor(
      private html: string,
      private vars: DOMVars = {}
    ) {}

    static from(html: string, vars?: DOMVars) {
      return new OptiDOM(html, vars);
    }

    template(reqvar: DOMVars): DocumentFragment {
      const frag = document.createDocumentFragment();
      frag.append(this.html);
      return frag;
    }
  }
}

namespace Opti.Templated {
  export class TemplatedParseException extends globalThis.Exception {
    constructor(message?: string, cause?: string) {
      super("TemplatedParseException", message, cause);
    }
  }

  export class Templated {
    static parse(domOrFile: OptiDOM | string, reqvar?: DOMVars): OptiDOM | DocumentFragment {
      if (typeof domOrFile === "string") {
        let dom: OptiDOM | null = null;

        fetch(domOrFile).then((file) => {
          if (!file.url.endsWith(".template.html")) {
            throw new TemplatedParseException("File extension must be of type *.template.html");
          }
          return file.text();
        }).then((html) => {
          dom = Opti.Templated.OptiDOM.from(html, reqvar);
        }).catch((e) => {
          if (e instanceof TemplatedParseException) {
            throw e;
          } else {
            console.error(e);
          }
        });

        if (!dom) {
          throw new globalThis.Exception("Exception", "Error parsing document");
        }

        return dom;
      } else {
        return domOrFile.template(reqvar ?? {});
      }
    }
  }

  export class OptiDOM {
    private constructor(
      private html: string,
      private vars: DOMVars = {}
    ) {}

    static from(html: string, vars?: DOMVars) {
      return new OptiDOM(html, vars);
    }

    template(reqvar: DOMVars): DocumentFragment {
      const frag = document.createDocumentFragment();
      frag.append(this.html);
      return frag;
    }
  }
}

namespace Opti.Templated {
  export class TemplatedParseException extends globalThis.Exception {
    constructor(message?: string, cause?: string) {
      super("TemplatedParseException", message, cause);
    }
  }

  export class Templated {
    static parse(domOrFile: OptiDOM | string, reqvar?: DOMVars): OptiDOM | DocumentFragment {
      if (typeof domOrFile === "string") {
        let dom: OptiDOM | null = null;

        fetch(domOrFile).then((file) => {
          if (!file.url.endsWith(".template.html")) {
            throw new TemplatedParseException("File extension must be of type *.template.html");
          }
          return file.text();
        }).then((html) => {
          dom = Opti.Templated.OptiDOM.from(html, reqvar);
        }).catch((e) => {
          if (e instanceof TemplatedParseException) {
            throw e;
          } else {
            console.error(e);
          }
        });

        if (!dom) {
          throw new globalThis.Exception("Exception", "Error parsing document");
        }

        return dom;
      } else {
        return domOrFile.template(reqvar ?? {});
      }
    }
  }

  export class OptiDOM {
    private constructor(
      private html: string,
      private vars: DOMVars = {}
    ) {}

    static from(html: string, vars?: DOMVars) {
      return new OptiDOM(html, vars);
    }

    template(reqvar: DOMVars): DocumentFragment {
      const frag = document.createDocumentFragment();
      frag.append(this.html);
      return frag;
    }
  }
}

namespace Opti.Templated {
  export class TemplatedParseException extends globalThis.Exception {
    constructor(message?: string, cause?: string) {
      super("TemplatedParseException", message, cause);
    }
  }

  export class Templated {
    static parse(domOrFile: OptiDOM | string, reqvar?: DOMVars): OptiDOM | DocumentFragment {
      if (typeof domOrFile === "string") {
        let dom: OptiDOM | null = null;

        fetch(domOrFile).then((file) => {
          if (!file.url.endsWith(".template.html")) {
            throw new TemplatedParseException("File extension must be of type *.template.html");
          }
          return file.text();
        }).then((html) => {
          dom = Opti.Templated.OptiDOM.from(html, reqvar);
        }).catch((e) => {
          if (e instanceof TemplatedParseException) {
            throw e;
          } else {
            console.error(e);
          }
        });

        if (!dom) {
          throw new globalThis.Exception("Exception", "Error parsing document");
        }

        return dom;
      } else {
        return domOrFile.template(reqvar ?? {});
      }
    }
  }

  export class OptiDOM {
    private constructor(
      private html: string,
      private vars: DOMVars = {}
    ) {}

    static from(html: string, vars?: DOMVars) {
      return new OptiDOM(html, vars);
    }

    template(reqvar: DOMVars): DocumentFragment {
      const frag = document.createDocumentFragment();
      frag.append(this.html);
      return frag;
    }
  }
}

namespace Opti.Templated {
  export class TemplatedParseException extends globalThis.Exception {
    constructor(message?: string, cause?: string) {
      super("TemplatedParseException", message, cause);
    }
  }

  export class Templated {
    static parse(domOrFile: OptiDOM | string, reqvar?: DOMVars): OptiDOM | DocumentFragment {
      if (typeof domOrFile === "string") {
        let dom: OptiDOM | null = null;

        fetch(domOrFile).then((file) => {
          if (!file.url.endsWith(".template.html")) {
            throw new TemplatedParseException("File extension must be of type *.template.html");
          }
          return file.text();
        }).then((html) => {
          dom = Opti.Templated.OptiDOM.from(html, reqvar);
        }).catch((e) => {
          if (e instanceof TemplatedParseException) {
            throw e;
          } else {
            console.error(e);
          }
        });

        if (!dom) {
          throw new globalThis.Exception("Exception", "Error parsing document");
        }

        return dom;
      } else {
        return domOrFile.template(reqvar ?? {});
      }
    }
  }

  export class OptiDOM {
    private constructor(
      private html: string,
      private vars: DOMVars = {}
    ) {}

    static from(html: string, vars?: DOMVars) {
      return new OptiDOM(html, vars);
    }

    template(reqvar: DOMVars): DocumentFragment {
      const frag = document.createDocumentFragment();
      frag.append(this.html);
      return frag;
    }
  }
}

namespace Opti.Templated {
  export class TemplatedParseException extends globalThis.Exception {
    constructor(message?: string, cause?: string) {
      super("TemplatedParseException", message, cause);
    }
  }

  export class Templated {
    static parse(domOrFile: OptiDOM | string, reqvar?: DOMVars): OptiDOM | DocumentFragment {
      if (typeof domOrFile === "string") {
        let dom: OptiDOM | null = null;

        fetch(domOrFile).then((file) => {
          if (!file.url.endsWith(".template.html")) {
            throw new TemplatedParseException("File extension must be of type *.template.html");
          }
          return file.text();
        }).then((html) => {
          dom = Opti.Templated.OptiDOM.from(html, reqvar);
        }).catch((e) => {
          if (e instanceof TemplatedParseException) {
            throw e;
          } else {
            console.error(e);
          }
        });

        if (!dom) {
          throw new globalThis.Exception("Exception", "Error parsing document");
        }

        return dom;
      } else {
        return domOrFile.template(reqvar ?? {});
      }
    }
  }

  export class OptiDOM {
    private constructor(
      private html: string,
      private vars: DOMVars = {}
    ) {}

    static from(html: string, vars?: DOMVars) {
      return new OptiDOM(html, vars);
    }

    template(reqvar: DOMVars): DocumentFragment {
      const frag = document.createDocumentFragment();
      frag.append(this.html);
      return frag;
    }
  }
}

