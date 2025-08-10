/* eslint-disable no-var */

declare module "*.thtml" {
  const document: OptiDOM;
  export default document;
}

declare var Templated: Templated;
declare var TemplateComponent: TemplateComponent;
declare var TemplateElement: TemplateElement;
declare var TemplateSection: TemplateSection;
declare var TemplateDocument: TemplateDocument;