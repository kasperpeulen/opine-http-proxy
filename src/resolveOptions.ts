import {
  Request as OpineRequest,
  Response as OpineResponse,
  NextFunction,
} from "../deps.ts";
import { isUnset } from "./isUnset.ts";

/**
 * Interface for the proxy options which allow the user
 * to filter, customize and decorate proxied requests and
 * responses.
 * 
 * @public
 */
export interface ProxyOptions
  extends Omit<RequestInit, "body" | "window" | "method"> {
  /**
   * The filter request option can be used to limit what requests are
   * proxied.
   * 
   * Return false to continue to execute the proxy; return true to skip the 
   * proxy for this request.
   * 
   * @public
   */
  filterReq?: (
    req: OpineRequest,
    res: OpineResponse,
  ) => boolean | Promise<boolean>;

  /**
   * Provide a custom error handling for failed proxied requests.
   * 
   * @public
   */
  proxyErrorHandler?: (
    err: any,
    res: OpineResponse,
    next: NextFunction,
  ) => any;

  /**
   * Decorate the outbound proxied request url.
   * 
   * @public
   */
  proxyReqUrlDecorator?: (url: URL, req?: OpineRequest) => URL | Promise<URL>;

  /**
   * Decorate the outbound proxied request initialization options.
   * This configuration will be used within the `fetch` method internally
   * to make the request to the provided url.
   * 
   * @public
   */
  proxyReqInitDecorator?: (
    proxyReqOpts: RequestInit,
    srcReq: OpineRequest,
  ) => RequestInit | Promise<RequestInit>;

  /**
   * Decorate the inbound response headers from the proxied request.
   * 
   * @public
   */
  srcResHeaderDecorator?: (
    headers: Headers,
    srcReq: OpineRequest,
    srcRes: OpineResponse,
    proxyReq: Request,
    proxyRes: Response,
  ) => Headers;

  /**
   * Decorate the inbound response object from the proxied request.
   * 
   * @public
   */
  srcResDecorator?: (
    srcReq: OpineRequest,
    srcRes: OpineResponse,
    proxyRes: Response,
    proxyResData: any,
  ) => any;

  /**
   * The filter response option can be used to limit what responses are
   * used from the proxy.
   * 
   * Return false to continue to execute the proxy; return true to skip the 
   * proxy for this request.
   * 
   * @public
   */
  filterRes?: (proxyRes: Response, proxyResData: any) => boolean;

  /**
   * Configure whether the "Host" header should be preserved on proxied
   * requests.
   * 
   * @public
   */
  preserveHostHeader?: boolean;

  /**
   * Configure whether the request body should be parsed and used on
   * proxied requests.
   * 
   * True by default.
   * 
   * @public
   */
  parseReqBody?: boolean;

  /**
   * The request body encoding to use. Only "utf-8" currently supported.
   * 
   * @public
   */
  reqBodyEncoding?: "utf-8" | null;

  /**
   * Configure whether the request body should be sent as a UInt8Array
   * buffer.
   * 
   * @public
   */
  reqAsBuffer?: boolean;

  /**
   * Configure whether the proxy URL should be memoized for subsequent
   * requests.
   * 
   * If you are using the function form of the URL and require it to
   * be executed on every request then this should be set to false.
   * 
   * True by default.
   * 
   * @public
   */
  memoizeUrl?: boolean;

  /**
   * The memoized url set on first request and used internally if
   * `memoizeUrl` is set to true.
   * 
   * @private
   */
  memoizedUrl?: URL;

  /**
   * Configure whether the outbound proxied request should be over
   * HTTPS. This will always override the protocol produced by the provided
   * proxy URL if set to `true`.
   * 
   * @public
   */
  secure?: boolean;

  /**
   * Configure a timeout in ms for the outbound proxied request. If not
   * provided the request will never time out.
   * 
   * @public
   */
  timeout?: number;

  /**
   * Configure the HTTP method (verb) used for the outbound proxied
   * request. If not provided the current request method is used.
   * 
   * @public
   */
  method?: "string";
}

/**
 * @private
 */
function resolveBodyEncoding(reqBodyEncoding: "utf-8" | null | undefined) {
  return reqBodyEncoding !== undefined ? reqBodyEncoding : "utf-8";
}

/**
 * @private
 */
export function resolveOptions(options: ProxyOptions = {}): ProxyOptions {
  return {
    filterReq: options.filterReq,
    proxyErrorHandler: options.proxyErrorHandler,
    proxyReqUrlDecorator: options.proxyReqUrlDecorator,
    proxyReqInitDecorator: options.proxyReqInitDecorator,
    srcResHeaderDecorator: options.srcResHeaderDecorator,
    srcResDecorator: options.srcResDecorator,
    filterRes: options.filterRes,
    preserveHostHeader: options.preserveHostHeader,
    parseReqBody: isUnset(options.parseReqBody) ? true : options.parseReqBody,
    reqBodyEncoding: resolveBodyEncoding(options.reqBodyEncoding),
    memoizeUrl: isUnset(options.memoizeUrl) ? true : options.memoizeUrl,
    secure: options.secure,
    headers: options.headers,
    timeout: options.timeout,
  };
}
