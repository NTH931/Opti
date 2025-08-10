interface JSON {
  parse<T = any>(text: string, reviver?: (this: T, key: string, value: any) => any): T
}