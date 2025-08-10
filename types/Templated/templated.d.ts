type DOMVars = Record<string, unknown>

interface Templated {
  parse(file: string, vars?: DOMVars): OptiDOM;
  parse<T extends OptiDOM>(dom: T, vars?: T["vars"]): DocumentFragment;
}

interface TemplateComponent {
  bind(args: DOMVars): void;

  preRender(callback: () => void): void
  onRender(callback: () => void): void
  postRender(callback: () => void): void

  preUpdate(callback: () => boolean | void): void
  onUpdate(callback: () => void): void
  postUpdate(callback: () => void): void

  preDelete(callback: () => boolean | void): void
  onDelete(callback: () => void): void
}

interface TemplateDocument extends TemplateComponent {

}

interface TemplateElement extends TemplateComponent {

}

interface TemplateSection extends TemplateComponent {

}

interface OptiDOM {
  readonly vars: DOMVars
  bind(vars: DOMVars): this;
}