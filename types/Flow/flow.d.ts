
type FlowbackTest = (fn: (...args: any[]) => any, flowtests: FlowTests) => boolean

interface FlowTests {
  test(): boolean;
  
}

interface Flow {
  flows(fn: (...args: any[]) => any): boolean;
  flows<T extends (...args: any[]) => any>(fn: T, flowback: T): boolean;
  flowback(file: string): boolean;
  flowback(test: FlowbackTest): void;
}