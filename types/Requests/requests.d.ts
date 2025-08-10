type RequestType = "GET" | "POST";

interface Request<T = any> {
  <U extends T = T>(url: string, data: any, options: RequestInit): Promise<U>
  <U extends T = T>(type: RequestType, url: string, data: any, options: RequestInit): Promise<U>
}

interface RequestOptions {

}

interface Requests extends Request {
  post: Request;
  get: Request;
  json: Request<object>;
  xml: Request<Document>;
  css: Request<CSSStyleSheet>;
  js: Request;
  php: Request;
  all<T = any>(url: string, data: any, options: RequestInit): Promise<U[]>
  all<T = any>(type: RequestType, url: string, data: any, options: RequestInit): Promise<U[]>
  create(options: RequestOptions): Promise<T>
}