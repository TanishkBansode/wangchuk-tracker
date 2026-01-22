var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-el1bqC/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object2, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object2),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/utils/compress.js
var COMPRESSIBLE_CONTENT_TYPE_REGEX = /^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;

// node_modules/hono/dist/utils/mime.js
var getMimeType = /* @__PURE__ */ __name((filename, mimes = baseMimes) => {
  const regexp = /\.([a-zA-Z0-9]+?)$/;
  const match2 = filename.match(regexp);
  if (!match2) {
    return;
  }
  let mimeType = mimes[match2[1]];
  if (mimeType && mimeType.startsWith("text")) {
    mimeType += "; charset=utf-8";
  }
  return mimeType;
}, "getMimeType");
var _baseMimes = {
  aac: "audio/aac",
  avi: "video/x-msvideo",
  avif: "image/avif",
  av1: "video/av1",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  css: "text/css",
  csv: "text/csv",
  eot: "application/vnd.ms-fontobject",
  epub: "application/epub+zip",
  gif: "image/gif",
  gz: "application/gzip",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  ics: "text/calendar",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  jsonld: "application/ld+json",
  map: "application/json",
  mid: "audio/x-midi",
  midi: "audio/x-midi",
  mjs: "text/javascript",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  oga: "audio/ogg",
  ogv: "video/ogg",
  ogx: "application/ogg",
  opus: "audio/opus",
  otf: "font/otf",
  pdf: "application/pdf",
  png: "image/png",
  rtf: "application/rtf",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  ts: "video/mp2t",
  ttf: "font/ttf",
  txt: "text/plain",
  wasm: "application/wasm",
  webm: "video/webm",
  weba: "audio/webm",
  webmanifest: "application/manifest+json",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xhtml: "application/xhtml+xml",
  xml: "application/xml",
  zip: "application/zip",
  "3gp": "video/3gpp",
  "3g2": "video/3gpp2",
  gltf: "model/gltf+json",
  glb: "model/gltf-binary"
};
var baseMimes = _baseMimes;

// node_modules/hono/dist/middleware/serve-static/path.js
var defaultJoin = /* @__PURE__ */ __name((...paths) => {
  let result = paths.filter((p) => p !== "").join("/");
  result = result.replace(/(?<=\/)\/+/g, "");
  const segments = result.split("/");
  const resolved = [];
  for (const segment of segments) {
    if (segment === ".." && resolved.length > 0 && resolved.at(-1) !== "..") {
      resolved.pop();
    } else if (segment !== ".") {
      resolved.push(segment);
    }
  }
  return resolved.join("/") || ".";
}, "defaultJoin");

// node_modules/hono/dist/middleware/serve-static/index.js
var ENCODINGS = {
  br: ".br",
  zstd: ".zst",
  gzip: ".gz"
};
var ENCODINGS_ORDERED_KEYS = Object.keys(ENCODINGS);
var DEFAULT_DOCUMENT = "index.html";
var serveStatic = /* @__PURE__ */ __name((options) => {
  const root = options.root ?? "./";
  const optionPath = options.path;
  const join = options.join ?? defaultJoin;
  return async (c, next) => {
    if (c.finalized) {
      return next();
    }
    let filename;
    if (options.path) {
      filename = options.path;
    } else {
      try {
        filename = decodeURIComponent(c.req.path);
        if (/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(filename)) {
          throw new Error();
        }
      } catch {
        await options.onNotFound?.(c.req.path, c);
        return next();
      }
    }
    let path = join(
      root,
      !optionPath && options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename
    );
    if (options.isDir && await options.isDir(path)) {
      path = join(path, DEFAULT_DOCUMENT);
    }
    const getContent = options.getContent;
    let content = await getContent(path, c);
    if (content instanceof Response) {
      return c.newResponse(content.body, content);
    }
    if (content) {
      const mimeType = options.mimes && getMimeType(path, options.mimes) || getMimeType(path);
      c.header("Content-Type", mimeType || "application/octet-stream");
      if (options.precompressed && (!mimeType || COMPRESSIBLE_CONTENT_TYPE_REGEX.test(mimeType))) {
        const acceptEncodingSet = new Set(
          c.req.header("Accept-Encoding")?.split(",").map((encoding) => encoding.trim())
        );
        for (const encoding of ENCODINGS_ORDERED_KEYS) {
          if (!acceptEncodingSet.has(encoding)) {
            continue;
          }
          const compressedContent = await getContent(path + ENCODINGS[encoding], c);
          if (compressedContent) {
            content = compressedContent;
            c.header("Content-Encoding", encoding);
            c.header("Vary", "Accept-Encoding", { append: true });
            break;
          }
        }
      }
      await options.onFound?.(path, c);
      return c.body(content);
    }
    await options.onNotFound?.(path, c);
    await next();
    return;
  };
}, "serveStatic");

// node_modules/hono/dist/adapter/cloudflare-workers/utils.js
var getContentFromKVAsset = /* @__PURE__ */ __name(async (path, options) => {
  let ASSET_MANIFEST;
  if (options && options.manifest) {
    if (typeof options.manifest === "string") {
      ASSET_MANIFEST = JSON.parse(options.manifest);
    } else {
      ASSET_MANIFEST = options.manifest;
    }
  } else {
    if (typeof __STATIC_CONTENT_MANIFEST === "string") {
      ASSET_MANIFEST = JSON.parse(__STATIC_CONTENT_MANIFEST);
    } else {
      ASSET_MANIFEST = __STATIC_CONTENT_MANIFEST;
    }
  }
  let ASSET_NAMESPACE;
  if (options && options.namespace) {
    ASSET_NAMESPACE = options.namespace;
  } else {
    ASSET_NAMESPACE = __STATIC_CONTENT;
  }
  const key = ASSET_MANIFEST[path] || path;
  if (!key) {
    return null;
  }
  const content = await ASSET_NAMESPACE.get(key, { type: "stream" });
  if (!content) {
    return null;
  }
  return content;
}, "getContentFromKVAsset");

// node_modules/hono/dist/adapter/cloudflare-workers/serve-static.js
var serveStatic2 = /* @__PURE__ */ __name((options) => {
  return /* @__PURE__ */ __name(async function serveStatic22(c, next) {
    const getContent = /* @__PURE__ */ __name(async (path) => {
      return getContentFromKVAsset(path, {
        manifest: options.manifest,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        namespace: options.namespace ? options.namespace : c.env ? c.env.__STATIC_CONTENT : void 0
      });
    }, "getContent");
    return serveStatic({
      ...options,
      getContent
    })(c, next);
  }, "serveStatic2");
}, "serveStatic");

// node_modules/hono/dist/adapter/cloudflare-workers/serve-static-module.js
var module = /* @__PURE__ */ __name((options) => {
  return serveStatic2(options);
}, "module");

// node_modules/hono/dist/helper/websocket/index.js
var WSContext = class {
  static {
    __name(this, "WSContext");
  }
  #init;
  constructor(init) {
    this.#init = init;
    this.raw = init.raw;
    this.url = init.url ? new URL(init.url) : null;
    this.protocol = init.protocol ?? null;
  }
  send(source, options) {
    this.#init.send(source, options ?? {});
  }
  raw;
  binaryType = "arraybuffer";
  get readyState() {
    return this.#init.readyState;
  }
  url;
  protocol;
  close(code, reason) {
    this.#init.close(code, reason);
  }
};
var defineWebSocketHelper = /* @__PURE__ */ __name((handler) => {
  return ((...args) => {
    if (typeof args[0] === "function") {
      const [createEvents, options] = args;
      return /* @__PURE__ */ __name(async function upgradeWebSocket2(c, next) {
        const events = await createEvents(c);
        const result = await handler(c, events, options);
        if (result) {
          return result;
        }
        await next();
      }, "upgradeWebSocket");
    } else {
      const [c, events, options] = args;
      return (async () => {
        const upgraded = await handler(c, events, options);
        if (!upgraded) {
          throw new Error("Failed to upgrade WebSocket");
        }
        return upgraded;
      })();
    }
  });
}, "defineWebSocketHelper");

// node_modules/hono/dist/adapter/cloudflare-workers/websocket.js
var upgradeWebSocket = defineWebSocketHelper(async (c, events) => {
  const upgradeHeader = c.req.header("Upgrade");
  if (upgradeHeader !== "websocket") {
    return;
  }
  const webSocketPair = new WebSocketPair();
  const client = webSocketPair[0];
  const server = webSocketPair[1];
  const wsContext = new WSContext({
    close: /* @__PURE__ */ __name((code, reason) => server.close(code, reason), "close"),
    get protocol() {
      return server.protocol;
    },
    raw: server,
    get readyState() {
      return server.readyState;
    },
    url: server.url ? new URL(server.url) : null,
    send: /* @__PURE__ */ __name((source) => server.send(source), "send")
  });
  if (events.onClose) {
    server.addEventListener("close", (evt) => events.onClose?.(evt, wsContext));
  }
  if (events.onMessage) {
    server.addEventListener("message", (evt) => events.onMessage?.(evt, wsContext));
  }
  if (events.onError) {
    server.addEventListener("error", (evt) => events.onError?.(evt, wsContext));
  }
  server.accept?.();
  return new Response(null, {
    status: 101,
    // @ts-expect-error - webSocket is not typed
    webSocket: client
  });
});

// node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// node_modules/@libsql/core/lib-esm/api.js
var LibsqlError = class extends Error {
  static {
    __name(this, "LibsqlError");
  }
  /** Machine-readable error code. */
  code;
  /** Raw numeric error code */
  rawCode;
  constructor(message, code, rawCode, cause) {
    if (code !== void 0) {
      message = `${code}: ${message}`;
    }
    super(message, { cause });
    this.code = code;
    this.rawCode = rawCode;
    this.name = "LibsqlError";
  }
};

// node_modules/@libsql/core/lib-esm/uri.js
function parseUri(text) {
  const match2 = URI_RE.exec(text);
  if (match2 === null) {
    throw new LibsqlError("The URL is not in a valid format", "URL_INVALID");
  }
  const groups = match2.groups;
  const scheme = groups["scheme"];
  const authority = groups["authority"] !== void 0 ? parseAuthority(groups["authority"]) : void 0;
  const path = percentDecode(groups["path"]);
  const query = groups["query"] !== void 0 ? parseQuery(groups["query"]) : void 0;
  const fragment = groups["fragment"] !== void 0 ? percentDecode(groups["fragment"]) : void 0;
  return { scheme, authority, path, query, fragment };
}
__name(parseUri, "parseUri");
var URI_RE = (() => {
  const SCHEME = "(?<scheme>[A-Za-z][A-Za-z.+-]*)";
  const AUTHORITY = "(?<authority>[^/?#]*)";
  const PATH = "(?<path>[^?#]*)";
  const QUERY = "(?<query>[^#]*)";
  const FRAGMENT = "(?<fragment>.*)";
  return new RegExp(`^${SCHEME}:(//${AUTHORITY})?${PATH}(\\?${QUERY})?(#${FRAGMENT})?$`, "su");
})();
function parseAuthority(text) {
  const match2 = AUTHORITY_RE.exec(text);
  if (match2 === null) {
    throw new LibsqlError("The authority part of the URL is not in a valid format", "URL_INVALID");
  }
  const groups = match2.groups;
  const host = percentDecode(groups["host_br"] ?? groups["host"]);
  const port = groups["port"] ? parseInt(groups["port"], 10) : void 0;
  const userinfo = groups["username"] !== void 0 ? {
    username: percentDecode(groups["username"]),
    password: groups["password"] !== void 0 ? percentDecode(groups["password"]) : void 0
  } : void 0;
  return { host, port, userinfo };
}
__name(parseAuthority, "parseAuthority");
var AUTHORITY_RE = (() => {
  return new RegExp(`^((?<username>[^:]*)(:(?<password>.*))?@)?((?<host>[^:\\[\\]]*)|(\\[(?<host_br>[^\\[\\]]*)\\]))(:(?<port>[0-9]*))?$`, "su");
})();
function parseQuery(text) {
  const sequences = text.split("&");
  const pairs = [];
  for (const sequence of sequences) {
    if (sequence === "") {
      continue;
    }
    let key;
    let value;
    const splitIdx = sequence.indexOf("=");
    if (splitIdx < 0) {
      key = sequence;
      value = "";
    } else {
      key = sequence.substring(0, splitIdx);
      value = sequence.substring(splitIdx + 1);
    }
    pairs.push({
      key: percentDecode(key.replaceAll("+", " ")),
      value: percentDecode(value.replaceAll("+", " "))
    });
  }
  return { pairs };
}
__name(parseQuery, "parseQuery");
function percentDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    if (e instanceof URIError) {
      throw new LibsqlError(`URL component has invalid percent encoding: ${e}`, "URL_INVALID", void 0, e);
    }
    throw e;
  }
}
__name(percentDecode, "percentDecode");
function encodeBaseUrl(scheme, authority, path) {
  if (authority === void 0) {
    throw new LibsqlError(`URL with scheme ${JSON.stringify(scheme + ":")} requires authority (the "//" part)`, "URL_INVALID");
  }
  const schemeText = `${scheme}:`;
  const hostText = encodeHost(authority.host);
  const portText = encodePort(authority.port);
  const userinfoText = encodeUserinfo(authority.userinfo);
  const authorityText = `//${userinfoText}${hostText}${portText}`;
  let pathText = path.split("/").map(encodeURIComponent).join("/");
  if (pathText !== "" && !pathText.startsWith("/")) {
    pathText = "/" + pathText;
  }
  return new URL(`${schemeText}${authorityText}${pathText}`);
}
__name(encodeBaseUrl, "encodeBaseUrl");
function encodeHost(host) {
  return host.includes(":") ? `[${encodeURI(host)}]` : encodeURI(host);
}
__name(encodeHost, "encodeHost");
function encodePort(port) {
  return port !== void 0 ? `:${port}` : "";
}
__name(encodePort, "encodePort");
function encodeUserinfo(userinfo) {
  if (userinfo === void 0) {
    return "";
  }
  const usernameText = encodeURIComponent(userinfo.username);
  const passwordText = userinfo.password !== void 0 ? `:${encodeURIComponent(userinfo.password)}` : "";
  return `${usernameText}${passwordText}@`;
}
__name(encodeUserinfo, "encodeUserinfo");

// node_modules/js-base64/base64.mjs
var version = "3.7.8";
var VERSION = version;
var _hasBuffer = typeof Buffer === "function";
var _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var b64chs = Array.prototype.slice.call(b64ch);
var b64tab = ((a) => {
  let tab = {};
  a.forEach((c, i) => tab[c] = i);
  return tab;
})(b64chs);
var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
var _fromCC = String.fromCharCode.bind(String);
var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
var _mkUriSafe = /* @__PURE__ */ __name((src) => src.replace(/=/g, "").replace(/[+\/]/g, (m0) => m0 == "+" ? "-" : "_"), "_mkUriSafe");
var _tidyB64 = /* @__PURE__ */ __name((s) => s.replace(/[^A-Za-z0-9\+\/]/g, ""), "_tidyB64");
var btoaPolyfill = /* @__PURE__ */ __name((bin) => {
  let u32, c0, c1, c2, asc = "";
  const pad = bin.length % 3;
  for (let i = 0; i < bin.length; ) {
    if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255)
      throw new TypeError("invalid character found");
    u32 = c0 << 16 | c1 << 8 | c2;
    asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
  }
  return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
}, "btoaPolyfill");
var _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : _hasBuffer ? (bin) => Buffer.from(bin, "binary").toString("base64") : btoaPolyfill;
var _fromUint8Array = _hasBuffer ? (u8a) => Buffer.from(u8a).toString("base64") : (u8a) => {
  const maxargs = 4096;
  let strs = [];
  for (let i = 0, l = u8a.length; i < l; i += maxargs) {
    strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
  }
  return _btoa(strs.join(""));
};
var fromUint8Array = /* @__PURE__ */ __name((u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a), "fromUint8Array");
var cb_utob = /* @__PURE__ */ __name((c) => {
  if (c.length < 2) {
    var cc = c.charCodeAt(0);
    return cc < 128 ? c : cc < 2048 ? _fromCC(192 | cc >>> 6) + _fromCC(128 | cc & 63) : _fromCC(224 | cc >>> 12 & 15) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
  } else {
    var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
    return _fromCC(240 | cc >>> 18 & 7) + _fromCC(128 | cc >>> 12 & 63) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
  }
}, "cb_utob");
var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
var utob = /* @__PURE__ */ __name((u) => u.replace(re_utob, cb_utob), "utob");
var _encode = _hasBuffer ? (s) => Buffer.from(s, "utf8").toString("base64") : _TE ? (s) => _fromUint8Array(_TE.encode(s)) : (s) => _btoa(utob(s));
var encode = /* @__PURE__ */ __name((src, urlsafe = false) => urlsafe ? _mkUriSafe(_encode(src)) : _encode(src), "encode");
var encodeURI2 = /* @__PURE__ */ __name((src) => encode(src, true), "encodeURI");
var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
var cb_btou = /* @__PURE__ */ __name((cccc) => {
  switch (cccc.length) {
    case 4:
      var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
      return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
    case 3:
      return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
    default:
      return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
  }
}, "cb_btou");
var btou = /* @__PURE__ */ __name((b) => b.replace(re_btou, cb_btou), "btou");
var atobPolyfill = /* @__PURE__ */ __name((asc) => {
  asc = asc.replace(/\s+/g, "");
  if (!b64re.test(asc))
    throw new TypeError("malformed base64.");
  asc += "==".slice(2 - (asc.length & 3));
  let u24, r1, r2;
  let binArray = [];
  for (let i = 0; i < asc.length; ) {
    u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
    if (r1 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255));
    } else if (r2 === 64) {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
    } else {
      binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
    }
  }
  return binArray.join("");
}, "atobPolyfill");
var _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : _hasBuffer ? (asc) => Buffer.from(asc, "base64").toString("binary") : atobPolyfill;
var _toUint8Array = _hasBuffer ? (a) => _U8Afrom(Buffer.from(a, "base64")) : (a) => _U8Afrom(_atob(a).split("").map((c) => c.charCodeAt(0)));
var toUint8Array = /* @__PURE__ */ __name((a) => _toUint8Array(_unURI(a)), "toUint8Array");
var _decode = _hasBuffer ? (a) => Buffer.from(a, "base64").toString("utf8") : _TD ? (a) => _TD.decode(_toUint8Array(a)) : (a) => btou(_atob(a));
var _unURI = /* @__PURE__ */ __name((a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/")), "_unURI");
var decode = /* @__PURE__ */ __name((src) => _decode(_unURI(src)), "decode");
var isValid = /* @__PURE__ */ __name((src) => {
  if (typeof src !== "string")
    return false;
  const s = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
  return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
}, "isValid");
var _noEnum = /* @__PURE__ */ __name((v) => {
  return {
    value: v,
    enumerable: false,
    writable: true,
    configurable: true
  };
}, "_noEnum");
var extendString = /* @__PURE__ */ __name(function() {
  const _add = /* @__PURE__ */ __name((name, body) => Object.defineProperty(String.prototype, name, _noEnum(body)), "_add");
  _add("fromBase64", function() {
    return decode(this);
  });
  _add("toBase64", function(urlsafe) {
    return encode(this, urlsafe);
  });
  _add("toBase64URI", function() {
    return encode(this, true);
  });
  _add("toBase64URL", function() {
    return encode(this, true);
  });
  _add("toUint8Array", function() {
    return toUint8Array(this);
  });
}, "extendString");
var extendUint8Array = /* @__PURE__ */ __name(function() {
  const _add = /* @__PURE__ */ __name((name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body)), "_add");
  _add("toBase64", function(urlsafe) {
    return fromUint8Array(this, urlsafe);
  });
  _add("toBase64URI", function() {
    return fromUint8Array(this, true);
  });
  _add("toBase64URL", function() {
    return fromUint8Array(this, true);
  });
}, "extendUint8Array");
var extendBuiltins = /* @__PURE__ */ __name(() => {
  extendString();
  extendUint8Array();
}, "extendBuiltins");
var gBase64 = {
  version,
  VERSION,
  atob: _atob,
  atobPolyfill,
  btoa: _btoa,
  btoaPolyfill,
  fromBase64: decode,
  toBase64: encode,
  encode,
  encodeURI: encodeURI2,
  encodeURL: encodeURI2,
  utob,
  btou,
  decode,
  isValid,
  fromUint8Array,
  toUint8Array,
  extendString,
  extendUint8Array,
  extendBuiltins
};

// node_modules/@libsql/core/lib-esm/util.js
var supportedUrlLink = "https://github.com/libsql/libsql-client-ts#supported-urls";
function transactionModeToBegin(mode) {
  if (mode === "write") {
    return "BEGIN IMMEDIATE";
  } else if (mode === "read") {
    return "BEGIN TRANSACTION READONLY";
  } else if (mode === "deferred") {
    return "BEGIN DEFERRED";
  } else {
    throw RangeError('Unknown transaction mode, supported values are "write", "read" and "deferred"');
  }
}
__name(transactionModeToBegin, "transactionModeToBegin");
var ResultSetImpl = class {
  static {
    __name(this, "ResultSetImpl");
  }
  columns;
  columnTypes;
  rows;
  rowsAffected;
  lastInsertRowid;
  constructor(columns, columnTypes, rows, rowsAffected, lastInsertRowid) {
    this.columns = columns;
    this.columnTypes = columnTypes;
    this.rows = rows;
    this.rowsAffected = rowsAffected;
    this.lastInsertRowid = lastInsertRowid;
  }
  toJSON() {
    return {
      "columns": this.columns,
      "columnTypes": this.columnTypes,
      "rows": this.rows.map(rowToJson),
      "rowsAffected": this.rowsAffected,
      "lastInsertRowid": this.lastInsertRowid !== void 0 ? "" + this.lastInsertRowid : null
    };
  }
};
function rowToJson(row) {
  return Array.prototype.map.call(row, valueToJson);
}
__name(rowToJson, "rowToJson");
function valueToJson(value) {
  if (typeof value === "bigint") {
    return "" + value;
  } else if (value instanceof ArrayBuffer) {
    return gBase64.fromUint8Array(new Uint8Array(value));
  } else {
    return value;
  }
}
__name(valueToJson, "valueToJson");

// node_modules/@libsql/core/lib-esm/config.js
function expandConfig(config, preferHttp) {
  if (typeof config !== "object") {
    throw new TypeError(`Expected client configuration as object, got ${typeof config}`);
  }
  let tls = config.tls;
  let authToken = config.authToken;
  let encryptionKey = config.encryptionKey;
  let syncUrl = config.syncUrl;
  let syncInterval = config.syncInterval;
  const intMode = "" + (config.intMode ?? "number");
  if (intMode !== "number" && intMode !== "bigint" && intMode !== "string") {
    throw new TypeError(`Invalid value for intMode, expected "number", "bigint" or "string",             got ${JSON.stringify(intMode)}`);
  }
  if (config.url === ":memory:") {
    return {
      path: ":memory:",
      scheme: "file",
      syncUrl,
      syncInterval,
      intMode,
      fetch: config.fetch,
      tls: false,
      authToken: void 0,
      encryptionKey: void 0,
      authority: void 0
    };
  }
  const uri = parseUri(config.url);
  for (const { key, value } of uri.query?.pairs ?? []) {
    if (key === "authToken") {
      authToken = value ? value : void 0;
    } else if (key === "tls") {
      if (value === "0") {
        tls = false;
      } else if (value === "1") {
        tls = true;
      } else {
        throw new LibsqlError(`Unknown value for the "tls" query argument: ${JSON.stringify(value)}. Supported values are "0" and "1"`, "URL_INVALID");
      }
    } else {
      throw new LibsqlError(`Unknown URL query parameter ${JSON.stringify(key)}`, "URL_PARAM_NOT_SUPPORTED");
    }
  }
  const uriScheme = uri.scheme.toLowerCase();
  let scheme;
  if (uriScheme === "libsql") {
    if (tls === false) {
      if (uri.authority?.port === void 0) {
        throw new LibsqlError('A "libsql:" URL with ?tls=0 must specify an explicit port', "URL_INVALID");
      }
      scheme = preferHttp ? "http" : "ws";
    } else {
      scheme = preferHttp ? "https" : "wss";
    }
  } else if (uriScheme === "http" || uriScheme === "ws") {
    scheme = uriScheme;
    tls ??= false;
  } else if (uriScheme === "https" || uriScheme === "wss" || uriScheme === "file") {
    scheme = uriScheme;
  } else {
    throw new LibsqlError(`The client supports only "libsql:", "wss:", "ws:", "https:", "http:" and "file:" URLs, got ${JSON.stringify(uri.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (uri.fragment !== void 0) {
    throw new LibsqlError(`URL fragments are not supported: ${JSON.stringify("#" + uri.fragment)}`, "URL_INVALID");
  }
  return {
    scheme,
    tls: tls ?? true,
    authority: uri.authority,
    path: uri.path,
    authToken,
    encryptionKey,
    syncUrl,
    syncInterval,
    intMode,
    fetch: config.fetch
  };
}
__name(expandConfig, "expandConfig");

// node_modules/@libsql/isomorphic-ws/web.mjs
var _WebSocket;
if (typeof WebSocket !== "undefined") {
  _WebSocket = WebSocket;
} else if (typeof global !== "undefined") {
  _WebSocket = global.WebSocket;
} else if (typeof window !== "undefined") {
  _WebSocket = window.WebSocket;
} else if (typeof self !== "undefined") {
  _WebSocket = self.WebSocket;
}

// node_modules/@libsql/hrana-client/lib-esm/client.js
var Client = class {
  static {
    __name(this, "Client");
  }
  /** @private */
  constructor() {
    this.intMode = "number";
  }
  /** Representation of integers returned from the database. See {@link IntMode}.
   *
   * This value is inherited by {@link Stream} objects created with {@link openStream}, but you can
   * override the integer mode for every stream by setting {@link Stream.intMode} on the stream.
   */
  intMode;
};

// node_modules/@libsql/hrana-client/lib-esm/errors.js
var ClientError = class extends Error {
  static {
    __name(this, "ClientError");
  }
  /** @private */
  constructor(message) {
    super(message);
    this.name = "ClientError";
  }
};
var ProtoError = class extends ClientError {
  static {
    __name(this, "ProtoError");
  }
  /** @private */
  constructor(message) {
    super(message);
    this.name = "ProtoError";
  }
};
var ResponseError = class extends ClientError {
  static {
    __name(this, "ResponseError");
  }
  code;
  /** @internal */
  proto;
  /** @private */
  constructor(message, protoError) {
    super(message);
    this.name = "ResponseError";
    this.code = protoError.code;
    this.proto = protoError;
    this.stack = void 0;
  }
};
var ClosedError = class extends ClientError {
  static {
    __name(this, "ClosedError");
  }
  /** @private */
  constructor(message, cause) {
    if (cause !== void 0) {
      super(`${message}: ${cause}`);
      this.cause = cause;
    } else {
      super(message);
    }
    this.name = "ClosedError";
  }
};
var WebSocketUnsupportedError = class extends ClientError {
  static {
    __name(this, "WebSocketUnsupportedError");
  }
  /** @private */
  constructor(message) {
    super(message);
    this.name = "WebSocketUnsupportedError";
  }
};
var WebSocketError = class extends ClientError {
  static {
    __name(this, "WebSocketError");
  }
  /** @private */
  constructor(message) {
    super(message);
    this.name = "WebSocketError";
  }
};
var HttpServerError = class extends ClientError {
  static {
    __name(this, "HttpServerError");
  }
  status;
  /** @private */
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "HttpServerError";
  }
};
var ProtocolVersionError = class extends ClientError {
  static {
    __name(this, "ProtocolVersionError");
  }
  /** @private */
  constructor(message) {
    super(message);
    this.name = "ProtocolVersionError";
  }
};
var InternalError = class extends ClientError {
  static {
    __name(this, "InternalError");
  }
  /** @private */
  constructor(message) {
    super(message);
    this.name = "InternalError";
  }
};
var MisuseError = class extends ClientError {
  static {
    __name(this, "MisuseError");
  }
  /** @private */
  constructor(message) {
    super(message);
    this.name = "MisuseError";
  }
};

// node_modules/@libsql/hrana-client/lib-esm/encoding/json/decode.js
function string(value) {
  if (typeof value === "string") {
    return value;
  }
  throw typeError(value, "string");
}
__name(string, "string");
function stringOpt(value) {
  if (value === null || value === void 0) {
    return void 0;
  } else if (typeof value === "string") {
    return value;
  }
  throw typeError(value, "string or null");
}
__name(stringOpt, "stringOpt");
function number(value) {
  if (typeof value === "number") {
    return value;
  }
  throw typeError(value, "number");
}
__name(number, "number");
function boolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  throw typeError(value, "boolean");
}
__name(boolean, "boolean");
function array(value) {
  if (Array.isArray(value)) {
    return value;
  }
  throw typeError(value, "array");
}
__name(array, "array");
function object(value) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  throw typeError(value, "object");
}
__name(object, "object");
function arrayObjectsMap(value, fun) {
  return array(value).map((elemValue) => fun(object(elemValue)));
}
__name(arrayObjectsMap, "arrayObjectsMap");
function typeError(value, expected) {
  if (value === void 0) {
    return new ProtoError(`Expected ${expected}, but the property was missing`);
  }
  let received = typeof value;
  if (value === null) {
    received = "null";
  } else if (Array.isArray(value)) {
    received = "array";
  }
  return new ProtoError(`Expected ${expected}, received ${received}`);
}
__name(typeError, "typeError");
function readJsonObject(value, fun) {
  return fun(object(value));
}
__name(readJsonObject, "readJsonObject");

// node_modules/@libsql/hrana-client/lib-esm/encoding/json/encode.js
var ObjectWriter = class {
  static {
    __name(this, "ObjectWriter");
  }
  #output;
  #isFirst;
  constructor(output) {
    this.#output = output;
    this.#isFirst = false;
  }
  begin() {
    this.#output.push("{");
    this.#isFirst = true;
  }
  end() {
    this.#output.push("}");
    this.#isFirst = false;
  }
  #key(name) {
    if (this.#isFirst) {
      this.#output.push('"');
      this.#isFirst = false;
    } else {
      this.#output.push(',"');
    }
    this.#output.push(name);
    this.#output.push('":');
  }
  string(name, value) {
    this.#key(name);
    this.#output.push(JSON.stringify(value));
  }
  stringRaw(name, value) {
    this.#key(name);
    this.#output.push('"');
    this.#output.push(value);
    this.#output.push('"');
  }
  number(name, value) {
    this.#key(name);
    this.#output.push("" + value);
  }
  boolean(name, value) {
    this.#key(name);
    this.#output.push(value ? "true" : "false");
  }
  object(name, value, valueFun) {
    this.#key(name);
    this.begin();
    valueFun(this, value);
    this.end();
  }
  arrayObjects(name, values, valueFun) {
    this.#key(name);
    this.#output.push("[");
    for (let i = 0; i < values.length; ++i) {
      if (i !== 0) {
        this.#output.push(",");
      }
      this.begin();
      valueFun(this, values[i]);
      this.end();
    }
    this.#output.push("]");
  }
};
function writeJsonObject(value, fun) {
  const output = [];
  const writer = new ObjectWriter(output);
  writer.begin();
  fun(writer, value);
  writer.end();
  return output.join("");
}
__name(writeJsonObject, "writeJsonObject");

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/util.js
var VARINT = 0;
var FIXED_64 = 1;
var LENGTH_DELIMITED = 2;
var FIXED_32 = 5;

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/decode.js
var MessageReader = class {
  static {
    __name(this, "MessageReader");
  }
  #array;
  #view;
  #pos;
  constructor(array2) {
    this.#array = array2;
    this.#view = new DataView(array2.buffer, array2.byteOffset, array2.byteLength);
    this.#pos = 0;
  }
  varint() {
    let value = 0;
    for (let shift = 0; ; shift += 7) {
      const byte = this.#array[this.#pos++];
      value |= (byte & 127) << shift;
      if (!(byte & 128)) {
        break;
      }
    }
    return value;
  }
  varintBig() {
    let value = 0n;
    for (let shift = 0n; ; shift += 7n) {
      const byte = this.#array[this.#pos++];
      value |= BigInt(byte & 127) << shift;
      if (!(byte & 128)) {
        break;
      }
    }
    return value;
  }
  bytes(length) {
    const array2 = new Uint8Array(this.#array.buffer, this.#array.byteOffset + this.#pos, length);
    this.#pos += length;
    return array2;
  }
  double() {
    const value = this.#view.getFloat64(this.#pos, true);
    this.#pos += 8;
    return value;
  }
  skipVarint() {
    for (; ; ) {
      const byte = this.#array[this.#pos++];
      if (!(byte & 128)) {
        break;
      }
    }
  }
  skip(count) {
    this.#pos += count;
  }
  eof() {
    return this.#pos >= this.#array.byteLength;
  }
};
var FieldReader = class {
  static {
    __name(this, "FieldReader");
  }
  #reader;
  #wireType;
  constructor(reader) {
    this.#reader = reader;
    this.#wireType = -1;
  }
  setup(wireType) {
    this.#wireType = wireType;
  }
  #expect(expectedWireType) {
    if (this.#wireType !== expectedWireType) {
      throw new ProtoError(`Expected wire type ${expectedWireType}, got ${this.#wireType}`);
    }
    this.#wireType = -1;
  }
  bytes() {
    this.#expect(LENGTH_DELIMITED);
    const length = this.#reader.varint();
    return this.#reader.bytes(length);
  }
  string() {
    return new TextDecoder().decode(this.bytes());
  }
  message(def) {
    return readProtobufMessage(this.bytes(), def);
  }
  int32() {
    this.#expect(VARINT);
    return this.#reader.varint();
  }
  uint32() {
    return this.int32();
  }
  bool() {
    return this.int32() !== 0;
  }
  uint64() {
    this.#expect(VARINT);
    return this.#reader.varintBig();
  }
  sint64() {
    const value = this.uint64();
    return value >> 1n ^ -(value & 1n);
  }
  double() {
    this.#expect(FIXED_64);
    return this.#reader.double();
  }
  maybeSkip() {
    if (this.#wireType < 0) {
      return;
    } else if (this.#wireType === VARINT) {
      this.#reader.skipVarint();
    } else if (this.#wireType === FIXED_64) {
      this.#reader.skip(8);
    } else if (this.#wireType === LENGTH_DELIMITED) {
      const length = this.#reader.varint();
      this.#reader.skip(length);
    } else if (this.#wireType === FIXED_32) {
      this.#reader.skip(4);
    } else {
      throw new ProtoError(`Unexpected wire type ${this.#wireType}`);
    }
    this.#wireType = -1;
  }
};
function readProtobufMessage(data, def) {
  const msgReader = new MessageReader(data);
  const fieldReader = new FieldReader(msgReader);
  let value = def.default();
  while (!msgReader.eof()) {
    const key = msgReader.varint();
    const tag = key >> 3;
    const wireType = key & 7;
    fieldReader.setup(wireType);
    const tagFun = def[tag];
    if (tagFun !== void 0) {
      const returnedValue = tagFun(fieldReader, value);
      if (returnedValue !== void 0) {
        value = returnedValue;
      }
    }
    fieldReader.maybeSkip();
  }
  return value;
}
__name(readProtobufMessage, "readProtobufMessage");

// node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/encode.js
var MessageWriter = class _MessageWriter {
  static {
    __name(this, "MessageWriter");
  }
  #buf;
  #array;
  #view;
  #pos;
  constructor() {
    this.#buf = new ArrayBuffer(256);
    this.#array = new Uint8Array(this.#buf);
    this.#view = new DataView(this.#buf);
    this.#pos = 0;
  }
  #ensure(extra) {
    if (this.#pos + extra <= this.#buf.byteLength) {
      return;
    }
    let newCap = this.#buf.byteLength;
    while (newCap < this.#pos + extra) {
      newCap *= 2;
    }
    const newBuf = new ArrayBuffer(newCap);
    const newArray = new Uint8Array(newBuf);
    const newView = new DataView(newBuf);
    newArray.set(new Uint8Array(this.#buf, 0, this.#pos));
    this.#buf = newBuf;
    this.#array = newArray;
    this.#view = newView;
  }
  #varint(value) {
    this.#ensure(5);
    value = 0 | value;
    do {
      let byte = value & 127;
      value >>>= 7;
      byte |= value ? 128 : 0;
      this.#array[this.#pos++] = byte;
    } while (value);
  }
  #varintBig(value) {
    this.#ensure(10);
    value = value & 0xffffffffffffffffn;
    do {
      let byte = Number(value & 0x7fn);
      value >>= 7n;
      byte |= value ? 128 : 0;
      this.#array[this.#pos++] = byte;
    } while (value);
  }
  #tag(tag, wireType) {
    this.#varint(tag << 3 | wireType);
  }
  bytes(tag, value) {
    this.#tag(tag, LENGTH_DELIMITED);
    this.#varint(value.byteLength);
    this.#ensure(value.byteLength);
    this.#array.set(value, this.#pos);
    this.#pos += value.byteLength;
  }
  string(tag, value) {
    this.bytes(tag, new TextEncoder().encode(value));
  }
  message(tag, value, fun) {
    const writer = new _MessageWriter();
    fun(writer, value);
    this.bytes(tag, writer.data());
  }
  int32(tag, value) {
    this.#tag(tag, VARINT);
    this.#varint(value);
  }
  uint32(tag, value) {
    this.int32(tag, value);
  }
  bool(tag, value) {
    this.int32(tag, value ? 1 : 0);
  }
  sint64(tag, value) {
    this.#tag(tag, VARINT);
    this.#varintBig(value << 1n ^ value >> 63n);
  }
  double(tag, value) {
    this.#tag(tag, FIXED_64);
    this.#ensure(8);
    this.#view.setFloat64(this.#pos, value, true);
    this.#pos += 8;
  }
  data() {
    return new Uint8Array(this.#buf, 0, this.#pos);
  }
};
function writeProtobufMessage(value, fun) {
  const w = new MessageWriter();
  fun(w, value);
  return w.data();
}
__name(writeProtobufMessage, "writeProtobufMessage");

// node_modules/@libsql/hrana-client/lib-esm/id_alloc.js
var IdAlloc = class {
  static {
    __name(this, "IdAlloc");
  }
  // Set of all allocated ids
  #usedIds;
  // Set of all free ids lower than `#usedIds.size`
  #freeIds;
  constructor() {
    this.#usedIds = /* @__PURE__ */ new Set();
    this.#freeIds = /* @__PURE__ */ new Set();
  }
  // Returns an id that was free, and marks it as used.
  alloc() {
    for (const freeId2 of this.#freeIds) {
      this.#freeIds.delete(freeId2);
      this.#usedIds.add(freeId2);
      if (!this.#usedIds.has(this.#usedIds.size - 1)) {
        this.#freeIds.add(this.#usedIds.size - 1);
      }
      return freeId2;
    }
    const freeId = this.#usedIds.size;
    this.#usedIds.add(freeId);
    return freeId;
  }
  free(id) {
    if (!this.#usedIds.delete(id)) {
      throw new InternalError("Freeing an id that is not allocated");
    }
    this.#freeIds.delete(this.#usedIds.size);
    if (id < this.#usedIds.size) {
      this.#freeIds.add(id);
    }
  }
};

// node_modules/@libsql/hrana-client/lib-esm/util.js
function impossible(value, message) {
  throw new InternalError(message);
}
__name(impossible, "impossible");

// node_modules/@libsql/hrana-client/lib-esm/value.js
function valueToProto(value) {
  if (value === null) {
    return null;
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
    }
    return value;
  } else if (typeof value === "bigint") {
    if (value < minInteger || value > maxInteger) {
      throw new RangeError("This bigint value is too large to be represented as a 64-bit integer and passed as argument");
    }
    return value;
  } else if (typeof value === "boolean") {
    return value ? 1n : 0n;
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else if (value instanceof Uint8Array) {
    return value;
  } else if (value instanceof Date) {
    return +value.valueOf();
  } else if (typeof value === "object") {
    return "" + value.toString();
  } else {
    throw new TypeError("Unsupported type of value");
  }
}
__name(valueToProto, "valueToProto");
var minInteger = -9223372036854775808n;
var maxInteger = 9223372036854775807n;
function valueFromProto(value, intMode) {
  if (value === null) {
    return null;
  } else if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "bigint") {
    if (intMode === "number") {
      const num = Number(value);
      if (!Number.isSafeInteger(num)) {
        throw new RangeError("Received integer which is too large to be safely represented as a JavaScript number");
      }
      return num;
    } else if (intMode === "bigint") {
      return value;
    } else if (intMode === "string") {
      return "" + value;
    } else {
      throw new MisuseError("Invalid value for IntMode");
    }
  } else if (value instanceof Uint8Array) {
    return value.slice().buffer;
  } else if (value === void 0) {
    throw new ProtoError("Received unrecognized type of Value");
  } else {
    throw impossible(value, "Impossible type of Value");
  }
}
__name(valueFromProto, "valueFromProto");

// node_modules/@libsql/hrana-client/lib-esm/result.js
function stmtResultFromProto(result) {
  return {
    affectedRowCount: result.affectedRowCount,
    lastInsertRowid: result.lastInsertRowid,
    columnNames: result.cols.map((col) => col.name),
    columnDecltypes: result.cols.map((col) => col.decltype)
  };
}
__name(stmtResultFromProto, "stmtResultFromProto");
function rowsResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  const rows = result.rows.map((row) => rowFromProto(stmtResult.columnNames, row, intMode));
  return { ...stmtResult, rows };
}
__name(rowsResultFromProto, "rowsResultFromProto");
function rowResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  let row;
  if (result.rows.length > 0) {
    row = rowFromProto(stmtResult.columnNames, result.rows[0], intMode);
  }
  return { ...stmtResult, row };
}
__name(rowResultFromProto, "rowResultFromProto");
function valueResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  let value;
  if (result.rows.length > 0 && stmtResult.columnNames.length > 0) {
    value = valueFromProto(result.rows[0][0], intMode);
  }
  return { ...stmtResult, value };
}
__name(valueResultFromProto, "valueResultFromProto");
function rowFromProto(colNames, values, intMode) {
  const row = {};
  Object.defineProperty(row, "length", { value: values.length });
  for (let i = 0; i < values.length; ++i) {
    const value = valueFromProto(values[i], intMode);
    Object.defineProperty(row, i, { value });
    const colName = colNames[i];
    if (colName !== void 0 && !Object.hasOwn(row, colName)) {
      Object.defineProperty(row, colName, { value, enumerable: true });
    }
  }
  return row;
}
__name(rowFromProto, "rowFromProto");
function errorFromProto(error) {
  return new ResponseError(error.message, error);
}
__name(errorFromProto, "errorFromProto");

// node_modules/@libsql/hrana-client/lib-esm/sql.js
var Sql = class {
  static {
    __name(this, "Sql");
  }
  #owner;
  #sqlId;
  #closed;
  /** @private */
  constructor(owner, sqlId) {
    this.#owner = owner;
    this.#sqlId = sqlId;
    this.#closed = void 0;
  }
  /** @private */
  _getSqlId(owner) {
    if (this.#owner !== owner) {
      throw new MisuseError("Attempted to use SQL text opened with other object");
    } else if (this.#closed !== void 0) {
      throw new ClosedError("SQL text is closed", this.#closed);
    }
    return this.#sqlId;
  }
  /** Remove the SQL text from the server, releasing resouces. */
  close() {
    this._setClosed(new ClientError("SQL text was manually closed"));
  }
  /** @private */
  _setClosed(error) {
    if (this.#closed === void 0) {
      this.#closed = error;
      this.#owner._closeSql(this.#sqlId);
    }
  }
  /** True if the SQL text is closed (removed from the server). */
  get closed() {
    return this.#closed !== void 0;
  }
};
function sqlToProto(owner, sql) {
  if (sql instanceof Sql) {
    return { sqlId: sql._getSqlId(owner) };
  } else {
    return { sql: "" + sql };
  }
}
__name(sqlToProto, "sqlToProto");

// node_modules/@libsql/hrana-client/lib-esm/queue.js
var Queue = class {
  static {
    __name(this, "Queue");
  }
  #pushStack;
  #shiftStack;
  constructor() {
    this.#pushStack = [];
    this.#shiftStack = [];
  }
  get length() {
    return this.#pushStack.length + this.#shiftStack.length;
  }
  push(elem) {
    this.#pushStack.push(elem);
  }
  shift() {
    if (this.#shiftStack.length === 0 && this.#pushStack.length > 0) {
      this.#shiftStack = this.#pushStack.reverse();
      this.#pushStack = [];
    }
    return this.#shiftStack.pop();
  }
  first() {
    return this.#shiftStack.length !== 0 ? this.#shiftStack[this.#shiftStack.length - 1] : this.#pushStack[0];
  }
};

// node_modules/@libsql/hrana-client/lib-esm/stmt.js
var Stmt = class {
  static {
    __name(this, "Stmt");
  }
  /** The SQL statement text. */
  sql;
  /** @private */
  _args;
  /** @private */
  _namedArgs;
  /** Initialize the statement with given SQL text. */
  constructor(sql) {
    this.sql = sql;
    this._args = [];
    this._namedArgs = /* @__PURE__ */ new Map();
  }
  /** Binds positional parameters from the given `values`. All previous positional bindings are cleared. */
  bindIndexes(values) {
    this._args.length = 0;
    for (const value of values) {
      this._args.push(valueToProto(value));
    }
    return this;
  }
  /** Binds a parameter by a 1-based index. */
  bindIndex(index, value) {
    if (index !== (index | 0) || index <= 0) {
      throw new RangeError("Index of a positional argument must be positive integer");
    }
    while (this._args.length < index) {
      this._args.push(null);
    }
    this._args[index - 1] = valueToProto(value);
    return this;
  }
  /** Binds a parameter by name. */
  bindName(name, value) {
    this._namedArgs.set(name, valueToProto(value));
    return this;
  }
  /** Clears all bindings. */
  unbindAll() {
    this._args.length = 0;
    this._namedArgs.clear();
    return this;
  }
};
function stmtToProto(sqlOwner, stmt, wantRows) {
  let inSql;
  let args = [];
  let namedArgs = [];
  if (stmt instanceof Stmt) {
    inSql = stmt.sql;
    args = stmt._args;
    for (const [name, value] of stmt._namedArgs.entries()) {
      namedArgs.push({ name, value });
    }
  } else if (Array.isArray(stmt)) {
    inSql = stmt[0];
    if (Array.isArray(stmt[1])) {
      args = stmt[1].map((arg) => valueToProto(arg));
    } else {
      namedArgs = Object.entries(stmt[1]).map(([name, value]) => {
        return { name, value: valueToProto(value) };
      });
    }
  } else {
    inSql = stmt;
  }
  const { sql, sqlId } = sqlToProto(sqlOwner, inSql);
  return { sql, sqlId, args, namedArgs, wantRows };
}
__name(stmtToProto, "stmtToProto");

// node_modules/@libsql/hrana-client/lib-esm/batch.js
var Batch = class {
  static {
    __name(this, "Batch");
  }
  /** @private */
  _stream;
  #useCursor;
  /** @private */
  _steps;
  #executed;
  /** @private */
  constructor(stream, useCursor) {
    this._stream = stream;
    this.#useCursor = useCursor;
    this._steps = [];
    this.#executed = false;
  }
  /** Return a builder for adding a step to the batch. */
  step() {
    return new BatchStep(this);
  }
  /** Execute the batch. */
  execute() {
    if (this.#executed) {
      throw new MisuseError("This batch has already been executed");
    }
    this.#executed = true;
    const batch = {
      steps: this._steps.map((step) => step.proto)
    };
    if (this.#useCursor) {
      return executeCursor(this._stream, this._steps, batch);
    } else {
      return executeRegular(this._stream, this._steps, batch);
    }
  }
};
function executeRegular(stream, steps, batch) {
  return stream._batch(batch).then((result) => {
    for (let step = 0; step < steps.length; ++step) {
      const stepResult = result.stepResults.get(step);
      const stepError = result.stepErrors.get(step);
      steps[step].callback(stepResult, stepError);
    }
  });
}
__name(executeRegular, "executeRegular");
async function executeCursor(stream, steps, batch) {
  const cursor = await stream._openCursor(batch);
  try {
    let nextStep = 0;
    let beginEntry = void 0;
    let rows = [];
    for (; ; ) {
      const entry = await cursor.next();
      if (entry === void 0) {
        break;
      }
      if (entry.type === "step_begin") {
        if (entry.step < nextStep || entry.step >= steps.length) {
          throw new ProtoError("Server produced StepBeginEntry for unexpected step");
        } else if (beginEntry !== void 0) {
          throw new ProtoError("Server produced StepBeginEntry before terminating previous step");
        }
        for (let step = nextStep; step < entry.step; ++step) {
          steps[step].callback(void 0, void 0);
        }
        nextStep = entry.step + 1;
        beginEntry = entry;
        rows = [];
      } else if (entry.type === "step_end") {
        if (beginEntry === void 0) {
          throw new ProtoError("Server produced StepEndEntry but no step is active");
        }
        const stmtResult = {
          cols: beginEntry.cols,
          rows,
          affectedRowCount: entry.affectedRowCount,
          lastInsertRowid: entry.lastInsertRowid
        };
        steps[beginEntry.step].callback(stmtResult, void 0);
        beginEntry = void 0;
        rows = [];
      } else if (entry.type === "step_error") {
        if (beginEntry === void 0) {
          if (entry.step >= steps.length) {
            throw new ProtoError("Server produced StepErrorEntry for unexpected step");
          }
          for (let step = nextStep; step < entry.step; ++step) {
            steps[step].callback(void 0, void 0);
          }
        } else {
          if (entry.step !== beginEntry.step) {
            throw new ProtoError("Server produced StepErrorEntry for unexpected step");
          }
          beginEntry = void 0;
          rows = [];
        }
        steps[entry.step].callback(void 0, entry.error);
        nextStep = entry.step + 1;
      } else if (entry.type === "row") {
        if (beginEntry === void 0) {
          throw new ProtoError("Server produced RowEntry but no step is active");
        }
        rows.push(entry.row);
      } else if (entry.type === "error") {
        throw errorFromProto(entry.error);
      } else if (entry.type === "none") {
        throw new ProtoError("Server produced unrecognized CursorEntry");
      } else {
        throw impossible(entry, "Impossible CursorEntry");
      }
    }
    if (beginEntry !== void 0) {
      throw new ProtoError("Server closed Cursor before terminating active step");
    }
    for (let step = nextStep; step < steps.length; ++step) {
      steps[step].callback(void 0, void 0);
    }
  } finally {
    cursor.close();
  }
}
__name(executeCursor, "executeCursor");
var BatchStep = class {
  static {
    __name(this, "BatchStep");
  }
  /** @private */
  _batch;
  #conds;
  /** @private */
  _index;
  /** @private */
  constructor(batch) {
    this._batch = batch;
    this.#conds = [];
    this._index = void 0;
  }
  /** Add the condition that needs to be satisfied to execute the statement. If you use this method multiple
   * times, we join the conditions with a logical AND. */
  condition(cond) {
    this.#conds.push(cond._proto);
    return this;
  }
  /** Add a statement that returns rows. */
  query(stmt) {
    return this.#add(stmt, true, rowsResultFromProto);
  }
  /** Add a statement that returns at most a single row. */
  queryRow(stmt) {
    return this.#add(stmt, true, rowResultFromProto);
  }
  /** Add a statement that returns at most a single value. */
  queryValue(stmt) {
    return this.#add(stmt, true, valueResultFromProto);
  }
  /** Add a statement without returning rows. */
  run(stmt) {
    return this.#add(stmt, false, stmtResultFromProto);
  }
  #add(inStmt, wantRows, fromProto) {
    if (this._index !== void 0) {
      throw new MisuseError("This BatchStep has already been added to the batch");
    }
    const stmt = stmtToProto(this._batch._stream._sqlOwner(), inStmt, wantRows);
    let condition;
    if (this.#conds.length === 0) {
      condition = void 0;
    } else if (this.#conds.length === 1) {
      condition = this.#conds[0];
    } else {
      condition = { type: "and", conds: this.#conds.slice() };
    }
    const proto = { stmt, condition };
    return new Promise((outputCallback, errorCallback) => {
      const callback = /* @__PURE__ */ __name((stepResult, stepError) => {
        if (stepResult !== void 0 && stepError !== void 0) {
          errorCallback(new ProtoError("Server returned both result and error"));
        } else if (stepError !== void 0) {
          errorCallback(errorFromProto(stepError));
        } else if (stepResult !== void 0) {
          outputCallback(fromProto(stepResult, this._batch._stream.intMode));
        } else {
          outputCallback(void 0);
        }
      }, "callback");
      this._index = this._batch._steps.length;
      this._batch._steps.push({ proto, callback });
    });
  }
};
var BatchCond = class _BatchCond {
  static {
    __name(this, "BatchCond");
  }
  /** @private */
  _batch;
  /** @private */
  _proto;
  /** @private */
  constructor(batch, proto) {
    this._batch = batch;
    this._proto = proto;
  }
  /** Create a condition that evaluates to true when the given step executes successfully.
   *
   * If the given step fails error or is skipped because its condition evaluated to false, this
   * condition evaluates to false.
   */
  static ok(step) {
    return new _BatchCond(step._batch, { type: "ok", step: stepIndex(step) });
  }
  /** Create a condition that evaluates to true when the given step fails.
   *
   * If the given step succeeds or is skipped because its condition evaluated to false, this condition
   * evaluates to false.
   */
  static error(step) {
    return new _BatchCond(step._batch, { type: "error", step: stepIndex(step) });
  }
  /** Create a condition that is a logical negation of another condition.
   */
  static not(cond) {
    return new _BatchCond(cond._batch, { type: "not", cond: cond._proto });
  }
  /** Create a condition that is a logical AND of other conditions.
   */
  static and(batch, conds) {
    for (const cond of conds) {
      checkCondBatch(batch, cond);
    }
    return new _BatchCond(batch, { type: "and", conds: conds.map((e) => e._proto) });
  }
  /** Create a condition that is a logical OR of other conditions.
   */
  static or(batch, conds) {
    for (const cond of conds) {
      checkCondBatch(batch, cond);
    }
    return new _BatchCond(batch, { type: "or", conds: conds.map((e) => e._proto) });
  }
  /** Create a condition that evaluates to true when the SQL connection is in autocommit mode (not inside an
   * explicit transaction). This requires protocol version 3 or higher.
   */
  static isAutocommit(batch) {
    batch._stream.client()._ensureVersion(3, "BatchCond.isAutocommit()");
    return new _BatchCond(batch, { type: "is_autocommit" });
  }
};
function stepIndex(step) {
  if (step._index === void 0) {
    throw new MisuseError("Cannot add a condition referencing a step that has not been added to the batch");
  }
  return step._index;
}
__name(stepIndex, "stepIndex");
function checkCondBatch(expectedBatch, cond) {
  if (cond._batch !== expectedBatch) {
    throw new MisuseError("Cannot mix BatchCond objects for different Batch objects");
  }
}
__name(checkCondBatch, "checkCondBatch");

// node_modules/@libsql/hrana-client/lib-esm/describe.js
function describeResultFromProto(result) {
  return {
    paramNames: result.params.map((p) => p.name),
    columns: result.cols,
    isExplain: result.isExplain,
    isReadonly: result.isReadonly
  };
}
__name(describeResultFromProto, "describeResultFromProto");

// node_modules/@libsql/hrana-client/lib-esm/stream.js
var Stream = class {
  static {
    __name(this, "Stream");
  }
  /** @private */
  constructor(intMode) {
    this.intMode = intMode;
  }
  /** Execute a statement and return rows. */
  query(stmt) {
    return this.#execute(stmt, true, rowsResultFromProto);
  }
  /** Execute a statement and return at most a single row. */
  queryRow(stmt) {
    return this.#execute(stmt, true, rowResultFromProto);
  }
  /** Execute a statement and return at most a single value. */
  queryValue(stmt) {
    return this.#execute(stmt, true, valueResultFromProto);
  }
  /** Execute a statement without returning rows. */
  run(stmt) {
    return this.#execute(stmt, false, stmtResultFromProto);
  }
  #execute(inStmt, wantRows, fromProto) {
    const stmt = stmtToProto(this._sqlOwner(), inStmt, wantRows);
    return this._execute(stmt).then((r) => fromProto(r, this.intMode));
  }
  /** Return a builder for creating and executing a batch.
   *
   * If `useCursor` is true, the batch will be executed using a Hrana cursor, which will stream results from
   * the server to the client, which consumes less memory on the server. This requires protocol version 3 or
   * higher.
   */
  batch(useCursor = false) {
    return new Batch(this, useCursor);
  }
  /** Parse and analyze a statement. This requires protocol version 2 or higher. */
  describe(inSql) {
    const protoSql = sqlToProto(this._sqlOwner(), inSql);
    return this._describe(protoSql).then(describeResultFromProto);
  }
  /** Execute a sequence of statements separated by semicolons. This requires protocol version 2 or higher.
   * */
  sequence(inSql) {
    const protoSql = sqlToProto(this._sqlOwner(), inSql);
    return this._sequence(protoSql);
  }
  /** Representation of integers returned from the database. See {@link IntMode}.
   *
   * This value affects the results of all operations on this stream.
   */
  intMode;
};

// node_modules/@libsql/hrana-client/lib-esm/cursor.js
var Cursor = class {
  static {
    __name(this, "Cursor");
  }
};

// node_modules/@libsql/hrana-client/lib-esm/ws/cursor.js
var fetchChunkSize = 1e3;
var fetchQueueSize = 10;
var WsCursor = class extends Cursor {
  static {
    __name(this, "WsCursor");
  }
  #client;
  #stream;
  #cursorId;
  #entryQueue;
  #fetchQueue;
  #closed;
  #done;
  /** @private */
  constructor(client, stream, cursorId) {
    super();
    this.#client = client;
    this.#stream = stream;
    this.#cursorId = cursorId;
    this.#entryQueue = new Queue();
    this.#fetchQueue = new Queue();
    this.#closed = void 0;
    this.#done = false;
  }
  /** Fetch the next entry from the cursor. */
  async next() {
    for (; ; ) {
      if (this.#closed !== void 0) {
        throw new ClosedError("Cursor is closed", this.#closed);
      }
      while (!this.#done && this.#fetchQueue.length < fetchQueueSize) {
        this.#fetchQueue.push(this.#fetch());
      }
      const entry = this.#entryQueue.shift();
      if (this.#done || entry !== void 0) {
        return entry;
      }
      await this.#fetchQueue.shift().then((response) => {
        if (response === void 0) {
          return;
        }
        for (const entry2 of response.entries) {
          this.#entryQueue.push(entry2);
        }
        this.#done ||= response.done;
      });
    }
  }
  #fetch() {
    return this.#stream._sendCursorRequest(this, {
      type: "fetch_cursor",
      cursorId: this.#cursorId,
      maxCount: fetchChunkSize
    }).then((resp) => resp, (error) => {
      this._setClosed(error);
      return void 0;
    });
  }
  /** @private */
  _setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    this.#stream._sendCursorRequest(this, {
      type: "close_cursor",
      cursorId: this.#cursorId
    }).catch(() => void 0);
    this.#stream._cursorClosed(this);
  }
  /** Close the cursor. */
  close() {
    this._setClosed(new ClientError("Cursor was manually closed"));
  }
  /** True if the cursor is closed. */
  get closed() {
    return this.#closed !== void 0;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/ws/stream.js
var WsStream = class _WsStream extends Stream {
  static {
    __name(this, "WsStream");
  }
  #client;
  #streamId;
  #queue;
  #cursor;
  #closing;
  #closed;
  /** @private */
  static open(client) {
    const streamId = client._streamIdAlloc.alloc();
    const stream = new _WsStream(client, streamId);
    const responseCallback = /* @__PURE__ */ __name(() => void 0, "responseCallback");
    const errorCallback = /* @__PURE__ */ __name((e) => stream.#setClosed(e), "errorCallback");
    const request = { type: "open_stream", streamId };
    client._sendRequest(request, { responseCallback, errorCallback });
    return stream;
  }
  /** @private */
  constructor(client, streamId) {
    super(client.intMode);
    this.#client = client;
    this.#streamId = streamId;
    this.#queue = new Queue();
    this.#cursor = void 0;
    this.#closing = false;
    this.#closed = void 0;
  }
  /** Get the {@link WsClient} object that this stream belongs to. */
  client() {
    return this.#client;
  }
  /** @private */
  _sqlOwner() {
    return this.#client;
  }
  /** @private */
  _execute(stmt) {
    return this.#sendStreamRequest({
      type: "execute",
      streamId: this.#streamId,
      stmt
    }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _batch(batch) {
    return this.#sendStreamRequest({
      type: "batch",
      streamId: this.#streamId,
      batch
    }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _describe(protoSql) {
    this.#client._ensureVersion(2, "describe()");
    return this.#sendStreamRequest({
      type: "describe",
      streamId: this.#streamId,
      sql: protoSql.sql,
      sqlId: protoSql.sqlId
    }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _sequence(protoSql) {
    this.#client._ensureVersion(2, "sequence()");
    return this.#sendStreamRequest({
      type: "sequence",
      streamId: this.#streamId,
      sql: protoSql.sql,
      sqlId: protoSql.sqlId
    }).then((_response) => {
      return void 0;
    });
  }
  /** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
   * explicit transaction). This requires protocol version 3 or higher.
   */
  getAutocommit() {
    this.#client._ensureVersion(3, "getAutocommit()");
    return this.#sendStreamRequest({
      type: "get_autocommit",
      streamId: this.#streamId
    }).then((response) => {
      return response.isAutocommit;
    });
  }
  #sendStreamRequest(request) {
    return new Promise((responseCallback, errorCallback) => {
      this.#pushToQueue({ type: "request", request, responseCallback, errorCallback });
    });
  }
  /** @private */
  _openCursor(batch) {
    this.#client._ensureVersion(3, "cursor");
    return new Promise((cursorCallback, errorCallback) => {
      this.#pushToQueue({ type: "cursor", batch, cursorCallback, errorCallback });
    });
  }
  /** @private */
  _sendCursorRequest(cursor, request) {
    if (cursor !== this.#cursor) {
      throw new InternalError("Cursor not associated with the stream attempted to execute a request");
    }
    return new Promise((responseCallback, errorCallback) => {
      if (this.#closed !== void 0) {
        errorCallback(new ClosedError("Stream is closed", this.#closed));
      } else {
        this.#client._sendRequest(request, { responseCallback, errorCallback });
      }
    });
  }
  /** @private */
  _cursorClosed(cursor) {
    if (cursor !== this.#cursor) {
      throw new InternalError("Cursor was closed, but it was not associated with the stream");
    }
    this.#cursor = void 0;
    this.#flushQueue();
  }
  #pushToQueue(entry) {
    if (this.#closed !== void 0) {
      entry.errorCallback(new ClosedError("Stream is closed", this.#closed));
    } else if (this.#closing) {
      entry.errorCallback(new ClosedError("Stream is closing", void 0));
    } else {
      this.#queue.push(entry);
      this.#flushQueue();
    }
  }
  #flushQueue() {
    for (; ; ) {
      const entry = this.#queue.first();
      if (entry === void 0 && this.#cursor === void 0 && this.#closing) {
        this.#setClosed(new ClientError("Stream was gracefully closed"));
        break;
      } else if (entry?.type === "request" && this.#cursor === void 0) {
        const { request, responseCallback, errorCallback } = entry;
        this.#queue.shift();
        this.#client._sendRequest(request, { responseCallback, errorCallback });
      } else if (entry?.type === "cursor" && this.#cursor === void 0) {
        const { batch, cursorCallback } = entry;
        this.#queue.shift();
        const cursorId = this.#client._cursorIdAlloc.alloc();
        const cursor = new WsCursor(this.#client, this, cursorId);
        const request = {
          type: "open_cursor",
          streamId: this.#streamId,
          cursorId,
          batch
        };
        const responseCallback = /* @__PURE__ */ __name(() => void 0, "responseCallback");
        const errorCallback = /* @__PURE__ */ __name((e) => cursor._setClosed(e), "errorCallback");
        this.#client._sendRequest(request, { responseCallback, errorCallback });
        this.#cursor = cursor;
        cursorCallback(cursor);
      } else {
        break;
      }
    }
  }
  #setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    if (this.#cursor !== void 0) {
      this.#cursor._setClosed(error);
    }
    for (; ; ) {
      const entry = this.#queue.shift();
      if (entry !== void 0) {
        entry.errorCallback(error);
      } else {
        break;
      }
    }
    const request = { type: "close_stream", streamId: this.#streamId };
    const responseCallback = /* @__PURE__ */ __name(() => this.#client._streamIdAlloc.free(this.#streamId), "responseCallback");
    const errorCallback = /* @__PURE__ */ __name(() => void 0, "errorCallback");
    this.#client._sendRequest(request, { responseCallback, errorCallback });
  }
  /** Immediately close the stream. */
  close() {
    this.#setClosed(new ClientError("Stream was manually closed"));
  }
  /** Gracefully close the stream. */
  closeGracefully() {
    this.#closing = true;
    this.#flushQueue();
  }
  /** True if the stream is closed or closing. */
  get closed() {
    return this.#closed !== void 0 || this.#closing;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/shared/json_encode.js
function Stmt2(w, msg) {
  if (msg.sql !== void 0) {
    w.string("sql", msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.number("sql_id", msg.sqlId);
  }
  w.arrayObjects("args", msg.args, Value);
  w.arrayObjects("named_args", msg.namedArgs, NamedArg);
  w.boolean("want_rows", msg.wantRows);
}
__name(Stmt2, "Stmt");
function NamedArg(w, msg) {
  w.string("name", msg.name);
  w.object("value", msg.value, Value);
}
__name(NamedArg, "NamedArg");
function Batch2(w, msg) {
  w.arrayObjects("steps", msg.steps, BatchStep2);
}
__name(Batch2, "Batch");
function BatchStep2(w, msg) {
  if (msg.condition !== void 0) {
    w.object("condition", msg.condition, BatchCond2);
  }
  w.object("stmt", msg.stmt, Stmt2);
}
__name(BatchStep2, "BatchStep");
function BatchCond2(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "ok" || msg.type === "error") {
    w.number("step", msg.step);
  } else if (msg.type === "not") {
    w.object("cond", msg.cond, BatchCond2);
  } else if (msg.type === "and" || msg.type === "or") {
    w.arrayObjects("conds", msg.conds, BatchCond2);
  } else if (msg.type === "is_autocommit") {
  } else {
    throw impossible(msg, "Impossible type of BatchCond");
  }
}
__name(BatchCond2, "BatchCond");
function Value(w, msg) {
  if (msg === null) {
    w.stringRaw("type", "null");
  } else if (typeof msg === "bigint") {
    w.stringRaw("type", "integer");
    w.stringRaw("value", "" + msg);
  } else if (typeof msg === "number") {
    w.stringRaw("type", "float");
    w.number("value", msg);
  } else if (typeof msg === "string") {
    w.stringRaw("type", "text");
    w.string("value", msg);
  } else if (msg instanceof Uint8Array) {
    w.stringRaw("type", "blob");
    w.stringRaw("base64", gBase64.fromUint8Array(msg));
  } else if (msg === void 0) {
  } else {
    throw impossible(msg, "Impossible type of Value");
  }
}
__name(Value, "Value");

// node_modules/@libsql/hrana-client/lib-esm/ws/json_encode.js
function ClientMsg(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "hello") {
    if (msg.jwt !== void 0) {
      w.string("jwt", msg.jwt);
    }
  } else if (msg.type === "request") {
    w.number("request_id", msg.requestId);
    w.object("request", msg.request, Request2);
  } else {
    throw impossible(msg, "Impossible type of ClientMsg");
  }
}
__name(ClientMsg, "ClientMsg");
function Request2(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "open_stream") {
    w.number("stream_id", msg.streamId);
  } else if (msg.type === "close_stream") {
    w.number("stream_id", msg.streamId);
  } else if (msg.type === "execute") {
    w.number("stream_id", msg.streamId);
    w.object("stmt", msg.stmt, Stmt2);
  } else if (msg.type === "batch") {
    w.number("stream_id", msg.streamId);
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "open_cursor") {
    w.number("stream_id", msg.streamId);
    w.number("cursor_id", msg.cursorId);
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "close_cursor") {
    w.number("cursor_id", msg.cursorId);
  } else if (msg.type === "fetch_cursor") {
    w.number("cursor_id", msg.cursorId);
    w.number("max_count", msg.maxCount);
  } else if (msg.type === "sequence") {
    w.number("stream_id", msg.streamId);
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "describe") {
    w.number("stream_id", msg.streamId);
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "store_sql") {
    w.number("sql_id", msg.sqlId);
    w.string("sql", msg.sql);
  } else if (msg.type === "close_sql") {
    w.number("sql_id", msg.sqlId);
  } else if (msg.type === "get_autocommit") {
    w.number("stream_id", msg.streamId);
  } else {
    throw impossible(msg, "Impossible type of Request");
  }
}
__name(Request2, "Request");

// node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_encode.js
function Stmt3(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
  for (const arg of msg.args) {
    w.message(3, arg, Value2);
  }
  for (const arg of msg.namedArgs) {
    w.message(4, arg, NamedArg2);
  }
  w.bool(5, msg.wantRows);
}
__name(Stmt3, "Stmt");
function NamedArg2(w, msg) {
  w.string(1, msg.name);
  w.message(2, msg.value, Value2);
}
__name(NamedArg2, "NamedArg");
function Batch3(w, msg) {
  for (const step of msg.steps) {
    w.message(1, step, BatchStep3);
  }
}
__name(Batch3, "Batch");
function BatchStep3(w, msg) {
  if (msg.condition !== void 0) {
    w.message(1, msg.condition, BatchCond3);
  }
  w.message(2, msg.stmt, Stmt3);
}
__name(BatchStep3, "BatchStep");
function BatchCond3(w, msg) {
  if (msg.type === "ok") {
    w.uint32(1, msg.step);
  } else if (msg.type === "error") {
    w.uint32(2, msg.step);
  } else if (msg.type === "not") {
    w.message(3, msg.cond, BatchCond3);
  } else if (msg.type === "and") {
    w.message(4, msg.conds, BatchCondList);
  } else if (msg.type === "or") {
    w.message(5, msg.conds, BatchCondList);
  } else if (msg.type === "is_autocommit") {
    w.message(6, void 0, Empty);
  } else {
    throw impossible(msg, "Impossible type of BatchCond");
  }
}
__name(BatchCond3, "BatchCond");
function BatchCondList(w, msg) {
  for (const cond of msg) {
    w.message(1, cond, BatchCond3);
  }
}
__name(BatchCondList, "BatchCondList");
function Value2(w, msg) {
  if (msg === null) {
    w.message(1, void 0, Empty);
  } else if (typeof msg === "bigint") {
    w.sint64(2, msg);
  } else if (typeof msg === "number") {
    w.double(3, msg);
  } else if (typeof msg === "string") {
    w.string(4, msg);
  } else if (msg instanceof Uint8Array) {
    w.bytes(5, msg);
  } else if (msg === void 0) {
  } else {
    throw impossible(msg, "Impossible type of Value");
  }
}
__name(Value2, "Value");
function Empty(_w, _msg) {
}
__name(Empty, "Empty");

// node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_encode.js
function ClientMsg2(w, msg) {
  if (msg.type === "hello") {
    w.message(1, msg, HelloMsg);
  } else if (msg.type === "request") {
    w.message(2, msg, RequestMsg);
  } else {
    throw impossible(msg, "Impossible type of ClientMsg");
  }
}
__name(ClientMsg2, "ClientMsg");
function HelloMsg(w, msg) {
  if (msg.jwt !== void 0) {
    w.string(1, msg.jwt);
  }
}
__name(HelloMsg, "HelloMsg");
function RequestMsg(w, msg) {
  w.int32(1, msg.requestId);
  const request = msg.request;
  if (request.type === "open_stream") {
    w.message(2, request, OpenStreamReq);
  } else if (request.type === "close_stream") {
    w.message(3, request, CloseStreamReq);
  } else if (request.type === "execute") {
    w.message(4, request, ExecuteReq);
  } else if (request.type === "batch") {
    w.message(5, request, BatchReq);
  } else if (request.type === "open_cursor") {
    w.message(6, request, OpenCursorReq);
  } else if (request.type === "close_cursor") {
    w.message(7, request, CloseCursorReq);
  } else if (request.type === "fetch_cursor") {
    w.message(8, request, FetchCursorReq);
  } else if (request.type === "sequence") {
    w.message(9, request, SequenceReq);
  } else if (request.type === "describe") {
    w.message(10, request, DescribeReq);
  } else if (request.type === "store_sql") {
    w.message(11, request, StoreSqlReq);
  } else if (request.type === "close_sql") {
    w.message(12, request, CloseSqlReq);
  } else if (request.type === "get_autocommit") {
    w.message(13, request, GetAutocommitReq);
  } else {
    throw impossible(request, "Impossible type of Request");
  }
}
__name(RequestMsg, "RequestMsg");
function OpenStreamReq(w, msg) {
  w.int32(1, msg.streamId);
}
__name(OpenStreamReq, "OpenStreamReq");
function CloseStreamReq(w, msg) {
  w.int32(1, msg.streamId);
}
__name(CloseStreamReq, "CloseStreamReq");
function ExecuteReq(w, msg) {
  w.int32(1, msg.streamId);
  w.message(2, msg.stmt, Stmt3);
}
__name(ExecuteReq, "ExecuteReq");
function BatchReq(w, msg) {
  w.int32(1, msg.streamId);
  w.message(2, msg.batch, Batch3);
}
__name(BatchReq, "BatchReq");
function OpenCursorReq(w, msg) {
  w.int32(1, msg.streamId);
  w.int32(2, msg.cursorId);
  w.message(3, msg.batch, Batch3);
}
__name(OpenCursorReq, "OpenCursorReq");
function CloseCursorReq(w, msg) {
  w.int32(1, msg.cursorId);
}
__name(CloseCursorReq, "CloseCursorReq");
function FetchCursorReq(w, msg) {
  w.int32(1, msg.cursorId);
  w.uint32(2, msg.maxCount);
}
__name(FetchCursorReq, "FetchCursorReq");
function SequenceReq(w, msg) {
  w.int32(1, msg.streamId);
  if (msg.sql !== void 0) {
    w.string(2, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(3, msg.sqlId);
  }
}
__name(SequenceReq, "SequenceReq");
function DescribeReq(w, msg) {
  w.int32(1, msg.streamId);
  if (msg.sql !== void 0) {
    w.string(2, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(3, msg.sqlId);
  }
}
__name(DescribeReq, "DescribeReq");
function StoreSqlReq(w, msg) {
  w.int32(1, msg.sqlId);
  w.string(2, msg.sql);
}
__name(StoreSqlReq, "StoreSqlReq");
function CloseSqlReq(w, msg) {
  w.int32(1, msg.sqlId);
}
__name(CloseSqlReq, "CloseSqlReq");
function GetAutocommitReq(w, msg) {
  w.int32(1, msg.streamId);
}
__name(GetAutocommitReq, "GetAutocommitReq");

// node_modules/@libsql/hrana-client/lib-esm/shared/json_decode.js
function Error2(obj) {
  const message = string(obj["message"]);
  const code = stringOpt(obj["code"]);
  return { message, code };
}
__name(Error2, "Error");
function StmtResult(obj) {
  const cols = arrayObjectsMap(obj["cols"], Col);
  const rows = array(obj["rows"]).map((rowObj) => arrayObjectsMap(rowObj, Value3));
  const affectedRowCount = number(obj["affected_row_count"]);
  const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
  const lastInsertRowid = lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0;
  return { cols, rows, affectedRowCount, lastInsertRowid };
}
__name(StmtResult, "StmtResult");
function Col(obj) {
  const name = stringOpt(obj["name"]);
  const decltype = stringOpt(obj["decltype"]);
  return { name, decltype };
}
__name(Col, "Col");
function BatchResult(obj) {
  const stepResults = /* @__PURE__ */ new Map();
  array(obj["step_results"]).forEach((value, i) => {
    if (value !== null) {
      stepResults.set(i, StmtResult(object(value)));
    }
  });
  const stepErrors = /* @__PURE__ */ new Map();
  array(obj["step_errors"]).forEach((value, i) => {
    if (value !== null) {
      stepErrors.set(i, Error2(object(value)));
    }
  });
  return { stepResults, stepErrors };
}
__name(BatchResult, "BatchResult");
function CursorEntry(obj) {
  const type = string(obj["type"]);
  if (type === "step_begin") {
    const step = number(obj["step"]);
    const cols = arrayObjectsMap(obj["cols"], Col);
    return { type: "step_begin", step, cols };
  } else if (type === "step_end") {
    const affectedRowCount = number(obj["affected_row_count"]);
    const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
    const lastInsertRowid = lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0;
    return { type: "step_end", affectedRowCount, lastInsertRowid };
  } else if (type === "step_error") {
    const step = number(obj["step"]);
    const error = Error2(object(obj["error"]));
    return { type: "step_error", step, error };
  } else if (type === "row") {
    const row = arrayObjectsMap(obj["row"], Value3);
    return { type: "row", row };
  } else if (type === "error") {
    const error = Error2(object(obj["error"]));
    return { type: "error", error };
  } else {
    throw new ProtoError("Unexpected type of CursorEntry");
  }
}
__name(CursorEntry, "CursorEntry");
function DescribeResult(obj) {
  const params = arrayObjectsMap(obj["params"], DescribeParam);
  const cols = arrayObjectsMap(obj["cols"], DescribeCol);
  const isExplain = boolean(obj["is_explain"]);
  const isReadonly = boolean(obj["is_readonly"]);
  return { params, cols, isExplain, isReadonly };
}
__name(DescribeResult, "DescribeResult");
function DescribeParam(obj) {
  const name = stringOpt(obj["name"]);
  return { name };
}
__name(DescribeParam, "DescribeParam");
function DescribeCol(obj) {
  const name = string(obj["name"]);
  const decltype = stringOpt(obj["decltype"]);
  return { name, decltype };
}
__name(DescribeCol, "DescribeCol");
function Value3(obj) {
  const type = string(obj["type"]);
  if (type === "null") {
    return null;
  } else if (type === "integer") {
    const value = string(obj["value"]);
    return BigInt(value);
  } else if (type === "float") {
    return number(obj["value"]);
  } else if (type === "text") {
    return string(obj["value"]);
  } else if (type === "blob") {
    return gBase64.toUint8Array(string(obj["base64"]));
  } else {
    throw new ProtoError("Unexpected type of Value");
  }
}
__name(Value3, "Value");

// node_modules/@libsql/hrana-client/lib-esm/ws/json_decode.js
function ServerMsg(obj) {
  const type = string(obj["type"]);
  if (type === "hello_ok") {
    return { type: "hello_ok" };
  } else if (type === "hello_error") {
    const error = Error2(object(obj["error"]));
    return { type: "hello_error", error };
  } else if (type === "response_ok") {
    const requestId = number(obj["request_id"]);
    const response = Response2(object(obj["response"]));
    return { type: "response_ok", requestId, response };
  } else if (type === "response_error") {
    const requestId = number(obj["request_id"]);
    const error = Error2(object(obj["error"]));
    return { type: "response_error", requestId, error };
  } else {
    throw new ProtoError("Unexpected type of ServerMsg");
  }
}
__name(ServerMsg, "ServerMsg");
function Response2(obj) {
  const type = string(obj["type"]);
  if (type === "open_stream") {
    return { type: "open_stream" };
  } else if (type === "close_stream") {
    return { type: "close_stream" };
  } else if (type === "execute") {
    const result = StmtResult(object(obj["result"]));
    return { type: "execute", result };
  } else if (type === "batch") {
    const result = BatchResult(object(obj["result"]));
    return { type: "batch", result };
  } else if (type === "open_cursor") {
    return { type: "open_cursor" };
  } else if (type === "close_cursor") {
    return { type: "close_cursor" };
  } else if (type === "fetch_cursor") {
    const entries = arrayObjectsMap(obj["entries"], CursorEntry);
    const done = boolean(obj["done"]);
    return { type: "fetch_cursor", entries, done };
  } else if (type === "sequence") {
    return { type: "sequence" };
  } else if (type === "describe") {
    const result = DescribeResult(object(obj["result"]));
    return { type: "describe", result };
  } else if (type === "store_sql") {
    return { type: "store_sql" };
  } else if (type === "close_sql") {
    return { type: "close_sql" };
  } else if (type === "get_autocommit") {
    const isAutocommit = boolean(obj["is_autocommit"]);
    return { type: "get_autocommit", isAutocommit };
  } else {
    throw new ProtoError("Unexpected type of Response");
  }
}
__name(Response2, "Response");

// node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_decode.js
var Error3 = {
  default() {
    return { message: "", code: void 0 };
  },
  1(r, msg) {
    msg.message = r.string();
  },
  2(r, msg) {
    msg.code = r.string();
  }
};
var StmtResult2 = {
  default() {
    return {
      cols: [],
      rows: [],
      affectedRowCount: 0,
      lastInsertRowid: void 0
    };
  },
  1(r, msg) {
    msg.cols.push(r.message(Col2));
  },
  2(r, msg) {
    msg.rows.push(r.message(Row));
  },
  3(r, msg) {
    msg.affectedRowCount = Number(r.uint64());
  },
  4(r, msg) {
    msg.lastInsertRowid = r.sint64();
  }
};
var Col2 = {
  default() {
    return { name: void 0, decltype: void 0 };
  },
  1(r, msg) {
    msg.name = r.string();
  },
  2(r, msg) {
    msg.decltype = r.string();
  }
};
var Row = {
  default() {
    return [];
  },
  1(r, msg) {
    msg.push(r.message(Value4));
  }
};
var BatchResult2 = {
  default() {
    return { stepResults: /* @__PURE__ */ new Map(), stepErrors: /* @__PURE__ */ new Map() };
  },
  1(r, msg) {
    const [key, value] = r.message(BatchResultStepResult);
    msg.stepResults.set(key, value);
  },
  2(r, msg) {
    const [key, value] = r.message(BatchResultStepError);
    msg.stepErrors.set(key, value);
  }
};
var BatchResultStepResult = {
  default() {
    return [0, StmtResult2.default()];
  },
  1(r, msg) {
    msg[0] = r.uint32();
  },
  2(r, msg) {
    msg[1] = r.message(StmtResult2);
  }
};
var BatchResultStepError = {
  default() {
    return [0, Error3.default()];
  },
  1(r, msg) {
    msg[0] = r.uint32();
  },
  2(r, msg) {
    msg[1] = r.message(Error3);
  }
};
var CursorEntry2 = {
  default() {
    return { type: "none" };
  },
  1(r) {
    return r.message(StepBeginEntry);
  },
  2(r) {
    return r.message(StepEndEntry);
  },
  3(r) {
    return r.message(StepErrorEntry);
  },
  4(r) {
    return { type: "row", row: r.message(Row) };
  },
  5(r) {
    return { type: "error", error: r.message(Error3) };
  }
};
var StepBeginEntry = {
  default() {
    return { type: "step_begin", step: 0, cols: [] };
  },
  1(r, msg) {
    msg.step = r.uint32();
  },
  2(r, msg) {
    msg.cols.push(r.message(Col2));
  }
};
var StepEndEntry = {
  default() {
    return {
      type: "step_end",
      affectedRowCount: 0,
      lastInsertRowid: void 0
    };
  },
  1(r, msg) {
    msg.affectedRowCount = r.uint32();
  },
  2(r, msg) {
    msg.lastInsertRowid = r.uint64();
  }
};
var StepErrorEntry = {
  default() {
    return {
      type: "step_error",
      step: 0,
      error: Error3.default()
    };
  },
  1(r, msg) {
    msg.step = r.uint32();
  },
  2(r, msg) {
    msg.error = r.message(Error3);
  }
};
var DescribeResult2 = {
  default() {
    return {
      params: [],
      cols: [],
      isExplain: false,
      isReadonly: false
    };
  },
  1(r, msg) {
    msg.params.push(r.message(DescribeParam2));
  },
  2(r, msg) {
    msg.cols.push(r.message(DescribeCol2));
  },
  3(r, msg) {
    msg.isExplain = r.bool();
  },
  4(r, msg) {
    msg.isReadonly = r.bool();
  }
};
var DescribeParam2 = {
  default() {
    return { name: void 0 };
  },
  1(r, msg) {
    msg.name = r.string();
  }
};
var DescribeCol2 = {
  default() {
    return { name: "", decltype: void 0 };
  },
  1(r, msg) {
    msg.name = r.string();
  },
  2(r, msg) {
    msg.decltype = r.string();
  }
};
var Value4 = {
  default() {
    return void 0;
  },
  1(r) {
    return null;
  },
  2(r) {
    return r.sint64();
  },
  3(r) {
    return r.double();
  },
  4(r) {
    return r.string();
  },
  5(r) {
    return r.bytes();
  }
};

// node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_decode.js
var ServerMsg2 = {
  default() {
    return { type: "none" };
  },
  1(r) {
    return { type: "hello_ok" };
  },
  2(r) {
    return r.message(HelloErrorMsg);
  },
  3(r) {
    return r.message(ResponseOkMsg);
  },
  4(r) {
    return r.message(ResponseErrorMsg);
  }
};
var HelloErrorMsg = {
  default() {
    return { type: "hello_error", error: Error3.default() };
  },
  1(r, msg) {
    msg.error = r.message(Error3);
  }
};
var ResponseErrorMsg = {
  default() {
    return { type: "response_error", requestId: 0, error: Error3.default() };
  },
  1(r, msg) {
    msg.requestId = r.int32();
  },
  2(r, msg) {
    msg.error = r.message(Error3);
  }
};
var ResponseOkMsg = {
  default() {
    return {
      type: "response_ok",
      requestId: 0,
      response: { type: "none" }
    };
  },
  1(r, msg) {
    msg.requestId = r.int32();
  },
  2(r, msg) {
    msg.response = { type: "open_stream" };
  },
  3(r, msg) {
    msg.response = { type: "close_stream" };
  },
  4(r, msg) {
    msg.response = r.message(ExecuteResp);
  },
  5(r, msg) {
    msg.response = r.message(BatchResp);
  },
  6(r, msg) {
    msg.response = { type: "open_cursor" };
  },
  7(r, msg) {
    msg.response = { type: "close_cursor" };
  },
  8(r, msg) {
    msg.response = r.message(FetchCursorResp);
  },
  9(r, msg) {
    msg.response = { type: "sequence" };
  },
  10(r, msg) {
    msg.response = r.message(DescribeResp);
  },
  11(r, msg) {
    msg.response = { type: "store_sql" };
  },
  12(r, msg) {
    msg.response = { type: "close_sql" };
  },
  13(r, msg) {
    msg.response = r.message(GetAutocommitResp);
  }
};
var ExecuteResp = {
  default() {
    return { type: "execute", result: StmtResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(StmtResult2);
  }
};
var BatchResp = {
  default() {
    return { type: "batch", result: BatchResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(BatchResult2);
  }
};
var FetchCursorResp = {
  default() {
    return { type: "fetch_cursor", entries: [], done: false };
  },
  1(r, msg) {
    msg.entries.push(r.message(CursorEntry2));
  },
  2(r, msg) {
    msg.done = r.bool();
  }
};
var DescribeResp = {
  default() {
    return { type: "describe", result: DescribeResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(DescribeResult2);
  }
};
var GetAutocommitResp = {
  default() {
    return { type: "get_autocommit", isAutocommit: false };
  },
  1(r, msg) {
    msg.isAutocommit = r.bool();
  }
};

// node_modules/@libsql/hrana-client/lib-esm/ws/client.js
var subprotocolsV2 = /* @__PURE__ */ new Map([
  ["hrana2", { version: 2, encoding: "json" }],
  ["hrana1", { version: 1, encoding: "json" }]
]);
var subprotocolsV3 = /* @__PURE__ */ new Map([
  ["hrana3-protobuf", { version: 3, encoding: "protobuf" }],
  ["hrana3", { version: 3, encoding: "json" }],
  ["hrana2", { version: 2, encoding: "json" }],
  ["hrana1", { version: 1, encoding: "json" }]
]);
var WsClient = class extends Client {
  static {
    __name(this, "WsClient");
  }
  #socket;
  // List of callbacks that we queue until the socket transitions from the CONNECTING to the OPEN state.
  #openCallbacks;
  // Have we already transitioned from CONNECTING to OPEN and fired the callbacks in #openCallbacks?
  #opened;
  // Stores the error that caused us to close the client (and the socket). If we are not closed, this is
  // `undefined`.
  #closed;
  // Have we received a response to our "hello" from the server?
  #recvdHello;
  // Subprotocol negotiated with the server. It is only available after the socket transitions to the OPEN
  // state.
  #subprotocol;
  // Has the `getVersion()` function been called? This is only used to validate that the API is used
  // correctly.
  #getVersionCalled;
  // A map from request id to the responses that we expect to receive from the server.
  #responseMap;
  // An allocator of request ids.
  #requestIdAlloc;
  // An allocator of stream ids.
  /** @private */
  _streamIdAlloc;
  // An allocator of cursor ids.
  /** @private */
  _cursorIdAlloc;
  // An allocator of SQL text ids.
  #sqlIdAlloc;
  /** @private */
  constructor(socket, jwt) {
    super();
    this.#socket = socket;
    this.#openCallbacks = [];
    this.#opened = false;
    this.#closed = void 0;
    this.#recvdHello = false;
    this.#subprotocol = void 0;
    this.#getVersionCalled = false;
    this.#responseMap = /* @__PURE__ */ new Map();
    this.#requestIdAlloc = new IdAlloc();
    this._streamIdAlloc = new IdAlloc();
    this._cursorIdAlloc = new IdAlloc();
    this.#sqlIdAlloc = new IdAlloc();
    this.#socket.binaryType = "arraybuffer";
    this.#socket.addEventListener("open", () => this.#onSocketOpen());
    this.#socket.addEventListener("close", (event) => this.#onSocketClose(event));
    this.#socket.addEventListener("error", (event) => this.#onSocketError(event));
    this.#socket.addEventListener("message", (event) => this.#onSocketMessage(event));
    this.#send({ type: "hello", jwt });
  }
  // Send (or enqueue to send) a message to the server.
  #send(msg) {
    if (this.#closed !== void 0) {
      throw new InternalError("Trying to send a message on a closed client");
    }
    if (this.#opened) {
      this.#sendToSocket(msg);
    } else {
      const openCallback = /* @__PURE__ */ __name(() => this.#sendToSocket(msg), "openCallback");
      const errorCallback = /* @__PURE__ */ __name(() => void 0, "errorCallback");
      this.#openCallbacks.push({ openCallback, errorCallback });
    }
  }
  // The socket transitioned from CONNECTING to OPEN
  #onSocketOpen() {
    const protocol = this.#socket.protocol;
    if (protocol === void 0) {
      this.#setClosed(new ClientError("The `WebSocket.protocol` property is undefined. This most likely means that the WebSocket implementation provided by the environment is broken. If you are using Miniflare 2, please update to Miniflare 3, which fixes this problem."));
      return;
    } else if (protocol === "") {
      this.#subprotocol = { version: 1, encoding: "json" };
    } else {
      this.#subprotocol = subprotocolsV3.get(protocol);
      if (this.#subprotocol === void 0) {
        this.#setClosed(new ProtoError(`Unrecognized WebSocket subprotocol: ${JSON.stringify(protocol)}`));
        return;
      }
    }
    for (const callbacks of this.#openCallbacks) {
      callbacks.openCallback();
    }
    this.#openCallbacks.length = 0;
    this.#opened = true;
  }
  #sendToSocket(msg) {
    const encoding = this.#subprotocol.encoding;
    if (encoding === "json") {
      const jsonMsg = writeJsonObject(msg, ClientMsg);
      this.#socket.send(jsonMsg);
    } else if (encoding === "protobuf") {
      const protobufMsg = writeProtobufMessage(msg, ClientMsg2);
      this.#socket.send(protobufMsg);
    } else {
      throw impossible(encoding, "Impossible encoding");
    }
  }
  /** Get the protocol version negotiated with the server, possibly waiting until the socket is open. */
  getVersion() {
    return new Promise((versionCallback, errorCallback) => {
      this.#getVersionCalled = true;
      if (this.#closed !== void 0) {
        errorCallback(this.#closed);
      } else if (!this.#opened) {
        const openCallback = /* @__PURE__ */ __name(() => versionCallback(this.#subprotocol.version), "openCallback");
        this.#openCallbacks.push({ openCallback, errorCallback });
      } else {
        versionCallback(this.#subprotocol.version);
      }
    });
  }
  // Make sure that the negotiated version is at least `minVersion`.
  /** @private */
  _ensureVersion(minVersion, feature) {
    if (this.#subprotocol === void 0 || !this.#getVersionCalled) {
      throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the WebSocket server is not yet known. Use Client.getVersion() to wait until the version is available.`);
    } else if (this.#subprotocol.version < minVersion) {
      throw new ProtocolVersionError(`${feature} is supported on protocol version ${minVersion} and higher, but the WebSocket server only supports version ${this.#subprotocol.version}`);
    }
  }
  // Send a request to the server and invoke a callback when we get the response.
  /** @private */
  _sendRequest(request, callbacks) {
    if (this.#closed !== void 0) {
      callbacks.errorCallback(new ClosedError("Client is closed", this.#closed));
      return;
    }
    const requestId = this.#requestIdAlloc.alloc();
    this.#responseMap.set(requestId, { ...callbacks, type: request.type });
    this.#send({ type: "request", requestId, request });
  }
  // The socket encountered an error.
  #onSocketError(event) {
    const eventMessage = event.message;
    const message = eventMessage ?? "WebSocket was closed due to an error";
    this.#setClosed(new WebSocketError(message));
  }
  // The socket was closed.
  #onSocketClose(event) {
    let message = `WebSocket was closed with code ${event.code}`;
    if (event.reason) {
      message += `: ${event.reason}`;
    }
    this.#setClosed(new WebSocketError(message));
  }
  // Close the client with the given error.
  #setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    for (const callbacks of this.#openCallbacks) {
      callbacks.errorCallback(error);
    }
    this.#openCallbacks.length = 0;
    for (const [requestId, responseState] of this.#responseMap.entries()) {
      responseState.errorCallback(error);
      this.#requestIdAlloc.free(requestId);
    }
    this.#responseMap.clear();
    this.#socket.close();
  }
  // We received a message from the socket.
  #onSocketMessage(event) {
    if (this.#closed !== void 0) {
      return;
    }
    try {
      let msg;
      const encoding = this.#subprotocol.encoding;
      if (encoding === "json") {
        if (typeof event.data !== "string") {
          this.#socket.close(3003, "Only text messages are accepted with JSON encoding");
          this.#setClosed(new ProtoError("Received non-text message from server with JSON encoding"));
          return;
        }
        msg = readJsonObject(JSON.parse(event.data), ServerMsg);
      } else if (encoding === "protobuf") {
        if (!(event.data instanceof ArrayBuffer)) {
          this.#socket.close(3003, "Only binary messages are accepted with Protobuf encoding");
          this.#setClosed(new ProtoError("Received non-binary message from server with Protobuf encoding"));
          return;
        }
        msg = readProtobufMessage(new Uint8Array(event.data), ServerMsg2);
      } else {
        throw impossible(encoding, "Impossible encoding");
      }
      this.#handleMsg(msg);
    } catch (e) {
      this.#socket.close(3007, "Could not handle message");
      this.#setClosed(e);
    }
  }
  // Handle a message from the server.
  #handleMsg(msg) {
    if (msg.type === "none") {
      throw new ProtoError("Received an unrecognized ServerMsg");
    } else if (msg.type === "hello_ok" || msg.type === "hello_error") {
      if (this.#recvdHello) {
        throw new ProtoError("Received a duplicated hello response");
      }
      this.#recvdHello = true;
      if (msg.type === "hello_error") {
        throw errorFromProto(msg.error);
      }
      return;
    } else if (!this.#recvdHello) {
      throw new ProtoError("Received a non-hello message before a hello response");
    }
    if (msg.type === "response_ok") {
      const requestId = msg.requestId;
      const responseState = this.#responseMap.get(requestId);
      this.#responseMap.delete(requestId);
      if (responseState === void 0) {
        throw new ProtoError("Received unexpected OK response");
      }
      this.#requestIdAlloc.free(requestId);
      try {
        if (responseState.type !== msg.response.type) {
          console.dir({ responseState, msg });
          throw new ProtoError("Received unexpected type of response");
        }
        responseState.responseCallback(msg.response);
      } catch (e) {
        responseState.errorCallback(e);
        throw e;
      }
    } else if (msg.type === "response_error") {
      const requestId = msg.requestId;
      const responseState = this.#responseMap.get(requestId);
      this.#responseMap.delete(requestId);
      if (responseState === void 0) {
        throw new ProtoError("Received unexpected error response");
      }
      this.#requestIdAlloc.free(requestId);
      responseState.errorCallback(errorFromProto(msg.error));
    } else {
      throw impossible(msg, "Impossible ServerMsg type");
    }
  }
  /** Open a {@link WsStream}, a stream for executing SQL statements. */
  openStream() {
    return WsStream.open(this);
  }
  /** Cache a SQL text on the server. This requires protocol version 2 or higher. */
  storeSql(sql) {
    this._ensureVersion(2, "storeSql()");
    const sqlId = this.#sqlIdAlloc.alloc();
    const sqlObj = new Sql(this, sqlId);
    const responseCallback = /* @__PURE__ */ __name(() => void 0, "responseCallback");
    const errorCallback = /* @__PURE__ */ __name((e) => sqlObj._setClosed(e), "errorCallback");
    const request = { type: "store_sql", sqlId, sql };
    this._sendRequest(request, { responseCallback, errorCallback });
    return sqlObj;
  }
  /** @private */
  _closeSql(sqlId) {
    if (this.#closed !== void 0) {
      return;
    }
    const responseCallback = /* @__PURE__ */ __name(() => this.#sqlIdAlloc.free(sqlId), "responseCallback");
    const errorCallback = /* @__PURE__ */ __name((e) => this.#setClosed(e), "errorCallback");
    const request = { type: "close_sql", sqlId };
    this._sendRequest(request, { responseCallback, errorCallback });
  }
  /** Close the client and the WebSocket. */
  close() {
    this.#setClosed(new ClientError("Client was manually closed"));
  }
  /** True if the client is closed. */
  get closed() {
    return this.#closed !== void 0;
  }
};

// node_modules/@libsql/isomorphic-fetch/web.js
var _fetch = fetch;
var _Request = Request;
var _Headers = Headers;

// node_modules/@libsql/hrana-client/lib-esm/queue_microtask.js
var _queueMicrotask;
if (typeof queueMicrotask !== "undefined") {
  _queueMicrotask = queueMicrotask;
} else {
  const resolved = Promise.resolve();
  _queueMicrotask = /* @__PURE__ */ __name((callback) => {
    resolved.then(callback);
  }, "_queueMicrotask");
}

// node_modules/@libsql/hrana-client/lib-esm/byte_queue.js
var ByteQueue = class {
  static {
    __name(this, "ByteQueue");
  }
  #array;
  #shiftPos;
  #pushPos;
  constructor(initialCap) {
    this.#array = new Uint8Array(new ArrayBuffer(initialCap));
    this.#shiftPos = 0;
    this.#pushPos = 0;
  }
  get length() {
    return this.#pushPos - this.#shiftPos;
  }
  data() {
    return this.#array.slice(this.#shiftPos, this.#pushPos);
  }
  push(chunk) {
    this.#ensurePush(chunk.byteLength);
    this.#array.set(chunk, this.#pushPos);
    this.#pushPos += chunk.byteLength;
  }
  #ensurePush(pushLength) {
    if (this.#pushPos + pushLength <= this.#array.byteLength) {
      return;
    }
    const filledLength = this.#pushPos - this.#shiftPos;
    if (filledLength + pushLength <= this.#array.byteLength && 2 * this.#pushPos >= this.#array.byteLength) {
      this.#array.copyWithin(0, this.#shiftPos, this.#pushPos);
    } else {
      let newCap = this.#array.byteLength;
      do {
        newCap *= 2;
      } while (filledLength + pushLength > newCap);
      const newArray = new Uint8Array(new ArrayBuffer(newCap));
      newArray.set(this.#array.slice(this.#shiftPos, this.#pushPos), 0);
      this.#array = newArray;
    }
    this.#pushPos = filledLength;
    this.#shiftPos = 0;
  }
  shift(length) {
    this.#shiftPos += length;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/http/json_decode.js
function PipelineRespBody(obj) {
  const baton = stringOpt(obj["baton"]);
  const baseUrl = stringOpt(obj["base_url"]);
  const results = arrayObjectsMap(obj["results"], StreamResult);
  return { baton, baseUrl, results };
}
__name(PipelineRespBody, "PipelineRespBody");
function StreamResult(obj) {
  const type = string(obj["type"]);
  if (type === "ok") {
    const response = StreamResponse(object(obj["response"]));
    return { type: "ok", response };
  } else if (type === "error") {
    const error = Error2(object(obj["error"]));
    return { type: "error", error };
  } else {
    throw new ProtoError("Unexpected type of StreamResult");
  }
}
__name(StreamResult, "StreamResult");
function StreamResponse(obj) {
  const type = string(obj["type"]);
  if (type === "close") {
    return { type: "close" };
  } else if (type === "execute") {
    const result = StmtResult(object(obj["result"]));
    return { type: "execute", result };
  } else if (type === "batch") {
    const result = BatchResult(object(obj["result"]));
    return { type: "batch", result };
  } else if (type === "sequence") {
    return { type: "sequence" };
  } else if (type === "describe") {
    const result = DescribeResult(object(obj["result"]));
    return { type: "describe", result };
  } else if (type === "store_sql") {
    return { type: "store_sql" };
  } else if (type === "close_sql") {
    return { type: "close_sql" };
  } else if (type === "get_autocommit") {
    const isAutocommit = boolean(obj["is_autocommit"]);
    return { type: "get_autocommit", isAutocommit };
  } else {
    throw new ProtoError("Unexpected type of StreamResponse");
  }
}
__name(StreamResponse, "StreamResponse");
function CursorRespBody(obj) {
  const baton = stringOpt(obj["baton"]);
  const baseUrl = stringOpt(obj["base_url"]);
  return { baton, baseUrl };
}
__name(CursorRespBody, "CursorRespBody");

// node_modules/@libsql/hrana-client/lib-esm/http/protobuf_decode.js
var PipelineRespBody2 = {
  default() {
    return { baton: void 0, baseUrl: void 0, results: [] };
  },
  1(r, msg) {
    msg.baton = r.string();
  },
  2(r, msg) {
    msg.baseUrl = r.string();
  },
  3(r, msg) {
    msg.results.push(r.message(StreamResult2));
  }
};
var StreamResult2 = {
  default() {
    return { type: "none" };
  },
  1(r) {
    return { type: "ok", response: r.message(StreamResponse2) };
  },
  2(r) {
    return { type: "error", error: r.message(Error3) };
  }
};
var StreamResponse2 = {
  default() {
    return { type: "none" };
  },
  1(r) {
    return { type: "close" };
  },
  2(r) {
    return r.message(ExecuteStreamResp);
  },
  3(r) {
    return r.message(BatchStreamResp);
  },
  4(r) {
    return { type: "sequence" };
  },
  5(r) {
    return r.message(DescribeStreamResp);
  },
  6(r) {
    return { type: "store_sql" };
  },
  7(r) {
    return { type: "close_sql" };
  },
  8(r) {
    return r.message(GetAutocommitStreamResp);
  }
};
var ExecuteStreamResp = {
  default() {
    return { type: "execute", result: StmtResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(StmtResult2);
  }
};
var BatchStreamResp = {
  default() {
    return { type: "batch", result: BatchResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(BatchResult2);
  }
};
var DescribeStreamResp = {
  default() {
    return { type: "describe", result: DescribeResult2.default() };
  },
  1(r, msg) {
    msg.result = r.message(DescribeResult2);
  }
};
var GetAutocommitStreamResp = {
  default() {
    return { type: "get_autocommit", isAutocommit: false };
  },
  1(r, msg) {
    msg.isAutocommit = r.bool();
  }
};
var CursorRespBody2 = {
  default() {
    return { baton: void 0, baseUrl: void 0 };
  },
  1(r, msg) {
    msg.baton = r.string();
  },
  2(r, msg) {
    msg.baseUrl = r.string();
  }
};

// node_modules/@libsql/hrana-client/lib-esm/http/cursor.js
var HttpCursor = class extends Cursor {
  static {
    __name(this, "HttpCursor");
  }
  #stream;
  #encoding;
  #reader;
  #queue;
  #closed;
  #done;
  /** @private */
  constructor(stream, encoding) {
    super();
    this.#stream = stream;
    this.#encoding = encoding;
    this.#reader = void 0;
    this.#queue = new ByteQueue(16 * 1024);
    this.#closed = void 0;
    this.#done = false;
  }
  async open(response) {
    if (response.body === null) {
      throw new ProtoError("No response body for cursor request");
    }
    this.#reader = response.body.getReader();
    const respBody = await this.#nextItem(CursorRespBody, CursorRespBody2);
    if (respBody === void 0) {
      throw new ProtoError("Empty response to cursor request");
    }
    return respBody;
  }
  /** Fetch the next entry from the cursor. */
  next() {
    return this.#nextItem(CursorEntry, CursorEntry2);
  }
  /** Close the cursor. */
  close() {
    this._setClosed(new ClientError("Cursor was manually closed"));
  }
  /** @private */
  _setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    this.#stream._cursorClosed(this);
    if (this.#reader !== void 0) {
      this.#reader.cancel();
    }
  }
  /** True if the cursor is closed. */
  get closed() {
    return this.#closed !== void 0;
  }
  async #nextItem(jsonFun, protobufDef) {
    for (; ; ) {
      if (this.#done) {
        return void 0;
      } else if (this.#closed !== void 0) {
        throw new ClosedError("Cursor is closed", this.#closed);
      }
      if (this.#encoding === "json") {
        const jsonData = this.#parseItemJson();
        if (jsonData !== void 0) {
          const jsonText = new TextDecoder().decode(jsonData);
          const jsonValue = JSON.parse(jsonText);
          return readJsonObject(jsonValue, jsonFun);
        }
      } else if (this.#encoding === "protobuf") {
        const protobufData = this.#parseItemProtobuf();
        if (protobufData !== void 0) {
          return readProtobufMessage(protobufData, protobufDef);
        }
      } else {
        throw impossible(this.#encoding, "Impossible encoding");
      }
      if (this.#reader === void 0) {
        throw new InternalError("Attempted to read from HTTP cursor before it was opened");
      }
      const { value, done } = await this.#reader.read();
      if (done && this.#queue.length === 0) {
        this.#done = true;
      } else if (done) {
        throw new ProtoError("Unexpected end of cursor stream");
      } else {
        this.#queue.push(value);
      }
    }
  }
  #parseItemJson() {
    const data = this.#queue.data();
    const newlineByte = 10;
    const newlinePos = data.indexOf(newlineByte);
    if (newlinePos < 0) {
      return void 0;
    }
    const jsonData = data.slice(0, newlinePos);
    this.#queue.shift(newlinePos + 1);
    return jsonData;
  }
  #parseItemProtobuf() {
    const data = this.#queue.data();
    let varintValue = 0;
    let varintLength = 0;
    for (; ; ) {
      if (varintLength >= data.byteLength) {
        return void 0;
      }
      const byte = data[varintLength];
      varintValue |= (byte & 127) << 7 * varintLength;
      varintLength += 1;
      if (!(byte & 128)) {
        break;
      }
    }
    if (data.byteLength < varintLength + varintValue) {
      return void 0;
    }
    const protobufData = data.slice(varintLength, varintLength + varintValue);
    this.#queue.shift(varintLength + varintValue);
    return protobufData;
  }
};

// node_modules/@libsql/hrana-client/lib-esm/http/json_encode.js
function PipelineReqBody(w, msg) {
  if (msg.baton !== void 0) {
    w.string("baton", msg.baton);
  }
  w.arrayObjects("requests", msg.requests, StreamRequest);
}
__name(PipelineReqBody, "PipelineReqBody");
function StreamRequest(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "close") {
  } else if (msg.type === "execute") {
    w.object("stmt", msg.stmt, Stmt2);
  } else if (msg.type === "batch") {
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "sequence") {
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "describe") {
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "store_sql") {
    w.number("sql_id", msg.sqlId);
    w.string("sql", msg.sql);
  } else if (msg.type === "close_sql") {
    w.number("sql_id", msg.sqlId);
  } else if (msg.type === "get_autocommit") {
  } else {
    throw impossible(msg, "Impossible type of StreamRequest");
  }
}
__name(StreamRequest, "StreamRequest");
function CursorReqBody(w, msg) {
  if (msg.baton !== void 0) {
    w.string("baton", msg.baton);
  }
  w.object("batch", msg.batch, Batch2);
}
__name(CursorReqBody, "CursorReqBody");

// node_modules/@libsql/hrana-client/lib-esm/http/protobuf_encode.js
function PipelineReqBody2(w, msg) {
  if (msg.baton !== void 0) {
    w.string(1, msg.baton);
  }
  for (const req of msg.requests) {
    w.message(2, req, StreamRequest2);
  }
}
__name(PipelineReqBody2, "PipelineReqBody");
function StreamRequest2(w, msg) {
  if (msg.type === "close") {
    w.message(1, msg, CloseStreamReq2);
  } else if (msg.type === "execute") {
    w.message(2, msg, ExecuteStreamReq);
  } else if (msg.type === "batch") {
    w.message(3, msg, BatchStreamReq);
  } else if (msg.type === "sequence") {
    w.message(4, msg, SequenceStreamReq);
  } else if (msg.type === "describe") {
    w.message(5, msg, DescribeStreamReq);
  } else if (msg.type === "store_sql") {
    w.message(6, msg, StoreSqlStreamReq);
  } else if (msg.type === "close_sql") {
    w.message(7, msg, CloseSqlStreamReq);
  } else if (msg.type === "get_autocommit") {
    w.message(8, msg, GetAutocommitStreamReq);
  } else {
    throw impossible(msg, "Impossible type of StreamRequest");
  }
}
__name(StreamRequest2, "StreamRequest");
function CloseStreamReq2(_w, _msg) {
}
__name(CloseStreamReq2, "CloseStreamReq");
function ExecuteStreamReq(w, msg) {
  w.message(1, msg.stmt, Stmt3);
}
__name(ExecuteStreamReq, "ExecuteStreamReq");
function BatchStreamReq(w, msg) {
  w.message(1, msg.batch, Batch3);
}
__name(BatchStreamReq, "BatchStreamReq");
function SequenceStreamReq(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
}
__name(SequenceStreamReq, "SequenceStreamReq");
function DescribeStreamReq(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
}
__name(DescribeStreamReq, "DescribeStreamReq");
function StoreSqlStreamReq(w, msg) {
  w.int32(1, msg.sqlId);
  w.string(2, msg.sql);
}
__name(StoreSqlStreamReq, "StoreSqlStreamReq");
function CloseSqlStreamReq(w, msg) {
  w.int32(1, msg.sqlId);
}
__name(CloseSqlStreamReq, "CloseSqlStreamReq");
function GetAutocommitStreamReq(_w, _msg) {
}
__name(GetAutocommitStreamReq, "GetAutocommitStreamReq");
function CursorReqBody2(w, msg) {
  if (msg.baton !== void 0) {
    w.string(1, msg.baton);
  }
  w.message(2, msg.batch, Batch3);
}
__name(CursorReqBody2, "CursorReqBody");

// node_modules/@libsql/hrana-client/lib-esm/http/stream.js
var HttpStream = class extends Stream {
  static {
    __name(this, "HttpStream");
  }
  #client;
  #baseUrl;
  #jwt;
  #fetch;
  #baton;
  #queue;
  #flushing;
  #cursor;
  #closing;
  #closeQueued;
  #closed;
  #sqlIdAlloc;
  /** @private */
  constructor(client, baseUrl, jwt, customFetch) {
    super(client.intMode);
    this.#client = client;
    this.#baseUrl = baseUrl.toString();
    this.#jwt = jwt;
    this.#fetch = customFetch;
    this.#baton = void 0;
    this.#queue = new Queue();
    this.#flushing = false;
    this.#closing = false;
    this.#closeQueued = false;
    this.#closed = void 0;
    this.#sqlIdAlloc = new IdAlloc();
  }
  /** Get the {@link HttpClient} object that this stream belongs to. */
  client() {
    return this.#client;
  }
  /** @private */
  _sqlOwner() {
    return this;
  }
  /** Cache a SQL text on the server. */
  storeSql(sql) {
    const sqlId = this.#sqlIdAlloc.alloc();
    this.#sendStreamRequest({ type: "store_sql", sqlId, sql }).then(() => void 0, (error) => this._setClosed(error));
    return new Sql(this, sqlId);
  }
  /** @private */
  _closeSql(sqlId) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#sendStreamRequest({ type: "close_sql", sqlId }).then(() => this.#sqlIdAlloc.free(sqlId), (error) => this._setClosed(error));
  }
  /** @private */
  _execute(stmt) {
    return this.#sendStreamRequest({ type: "execute", stmt }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _batch(batch) {
    return this.#sendStreamRequest({ type: "batch", batch }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _describe(protoSql) {
    return this.#sendStreamRequest({
      type: "describe",
      sql: protoSql.sql,
      sqlId: protoSql.sqlId
    }).then((response) => {
      return response.result;
    });
  }
  /** @private */
  _sequence(protoSql) {
    return this.#sendStreamRequest({
      type: "sequence",
      sql: protoSql.sql,
      sqlId: protoSql.sqlId
    }).then((_response) => {
      return void 0;
    });
  }
  /** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
   * explicit transaction). This requires protocol version 3 or higher.
   */
  getAutocommit() {
    this.#client._ensureVersion(3, "getAutocommit()");
    return this.#sendStreamRequest({
      type: "get_autocommit"
    }).then((response) => {
      return response.isAutocommit;
    });
  }
  #sendStreamRequest(request) {
    return new Promise((responseCallback, errorCallback) => {
      this.#pushToQueue({ type: "pipeline", request, responseCallback, errorCallback });
    });
  }
  /** @private */
  _openCursor(batch) {
    return new Promise((cursorCallback, errorCallback) => {
      this.#pushToQueue({ type: "cursor", batch, cursorCallback, errorCallback });
    });
  }
  /** @private */
  _cursorClosed(cursor) {
    if (cursor !== this.#cursor) {
      throw new InternalError("Cursor was closed, but it was not associated with the stream");
    }
    this.#cursor = void 0;
    _queueMicrotask(() => this.#flushQueue());
  }
  /** Immediately close the stream. */
  close() {
    this._setClosed(new ClientError("Stream was manually closed"));
  }
  /** Gracefully close the stream. */
  closeGracefully() {
    this.#closing = true;
    _queueMicrotask(() => this.#flushQueue());
  }
  /** True if the stream is closed. */
  get closed() {
    return this.#closed !== void 0 || this.#closing;
  }
  /** @private */
  _setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    if (this.#cursor !== void 0) {
      this.#cursor._setClosed(error);
    }
    this.#client._streamClosed(this);
    for (; ; ) {
      const entry = this.#queue.shift();
      if (entry !== void 0) {
        entry.errorCallback(error);
      } else {
        break;
      }
    }
    if ((this.#baton !== void 0 || this.#flushing) && !this.#closeQueued) {
      this.#queue.push({
        type: "pipeline",
        request: { type: "close" },
        responseCallback: /* @__PURE__ */ __name(() => void 0, "responseCallback"),
        errorCallback: /* @__PURE__ */ __name(() => void 0, "errorCallback")
      });
      this.#closeQueued = true;
      _queueMicrotask(() => this.#flushQueue());
    }
  }
  #pushToQueue(entry) {
    if (this.#closed !== void 0) {
      throw new ClosedError("Stream is closed", this.#closed);
    } else if (this.#closing) {
      throw new ClosedError("Stream is closing", void 0);
    } else {
      this.#queue.push(entry);
      _queueMicrotask(() => this.#flushQueue());
    }
  }
  #flushQueue() {
    if (this.#flushing || this.#cursor !== void 0) {
      return;
    }
    if (this.#closing && this.#queue.length === 0) {
      this._setClosed(new ClientError("Stream was gracefully closed"));
      return;
    }
    const endpoint = this.#client._endpoint;
    if (endpoint === void 0) {
      this.#client._endpointPromise.then(() => this.#flushQueue(), (error) => this._setClosed(error));
      return;
    }
    const firstEntry = this.#queue.shift();
    if (firstEntry === void 0) {
      return;
    } else if (firstEntry.type === "pipeline") {
      const pipeline = [firstEntry];
      for (; ; ) {
        const entry = this.#queue.first();
        if (entry !== void 0 && entry.type === "pipeline") {
          pipeline.push(entry);
          this.#queue.shift();
        } else if (entry === void 0 && this.#closing && !this.#closeQueued) {
          pipeline.push({
            type: "pipeline",
            request: { type: "close" },
            responseCallback: /* @__PURE__ */ __name(() => void 0, "responseCallback"),
            errorCallback: /* @__PURE__ */ __name(() => void 0, "errorCallback")
          });
          this.#closeQueued = true;
          break;
        } else {
          break;
        }
      }
      this.#flushPipeline(endpoint, pipeline);
    } else if (firstEntry.type === "cursor") {
      this.#flushCursor(endpoint, firstEntry);
    } else {
      throw impossible(firstEntry, "Impossible type of QueueEntry");
    }
  }
  #flushPipeline(endpoint, pipeline) {
    this.#flush(() => this.#createPipelineRequest(pipeline, endpoint), (resp) => decodePipelineResponse(resp, endpoint.encoding), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (respBody) => handlePipelineResponse(pipeline, respBody), (error) => pipeline.forEach((entry) => entry.errorCallback(error)));
  }
  #flushCursor(endpoint, entry) {
    const cursor = new HttpCursor(this, endpoint.encoding);
    this.#cursor = cursor;
    this.#flush(() => this.#createCursorRequest(entry, endpoint), (resp) => cursor.open(resp), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (_respBody) => entry.cursorCallback(cursor), (error) => entry.errorCallback(error));
  }
  #flush(createRequest, decodeResponse, getBaton, getBaseUrl, handleResponse, handleError) {
    let promise;
    try {
      const request = createRequest();
      const fetch2 = this.#fetch;
      promise = fetch2(request);
    } catch (error) {
      promise = Promise.reject(error);
    }
    this.#flushing = true;
    promise.then((resp) => {
      if (!resp.ok) {
        return errorFromResponse(resp).then((error) => {
          throw error;
        });
      }
      return decodeResponse(resp);
    }).then((r) => {
      this.#baton = getBaton(r);
      this.#baseUrl = getBaseUrl(r) ?? this.#baseUrl;
      handleResponse(r);
    }).catch((error) => {
      this._setClosed(error);
      handleError(error);
    }).finally(() => {
      this.#flushing = false;
      this.#flushQueue();
    });
  }
  #createPipelineRequest(pipeline, endpoint) {
    return this.#createRequest(new URL(endpoint.pipelinePath, this.#baseUrl), {
      baton: this.#baton,
      requests: pipeline.map((entry) => entry.request)
    }, endpoint.encoding, PipelineReqBody, PipelineReqBody2);
  }
  #createCursorRequest(entry, endpoint) {
    if (endpoint.cursorPath === void 0) {
      throw new ProtocolVersionError(`Cursors are supported only on protocol version 3 and higher, but the HTTP server only supports version ${endpoint.version}.`);
    }
    return this.#createRequest(new URL(endpoint.cursorPath, this.#baseUrl), {
      baton: this.#baton,
      batch: entry.batch
    }, endpoint.encoding, CursorReqBody, CursorReqBody2);
  }
  #createRequest(url, reqBody, encoding, jsonFun, protobufFun) {
    let bodyData;
    let contentType;
    if (encoding === "json") {
      bodyData = writeJsonObject(reqBody, jsonFun);
      contentType = "application/json";
    } else if (encoding === "protobuf") {
      bodyData = writeProtobufMessage(reqBody, protobufFun);
      contentType = "application/x-protobuf";
    } else {
      throw impossible(encoding, "Impossible encoding");
    }
    const headers = new _Headers();
    headers.set("content-type", contentType);
    if (this.#jwt !== void 0) {
      headers.set("authorization", `Bearer ${this.#jwt}`);
    }
    return new _Request(url.toString(), { method: "POST", headers, body: bodyData });
  }
};
function handlePipelineResponse(pipeline, respBody) {
  if (respBody.results.length !== pipeline.length) {
    throw new ProtoError("Server returned unexpected number of pipeline results");
  }
  for (let i = 0; i < pipeline.length; ++i) {
    const result = respBody.results[i];
    const entry = pipeline[i];
    if (result.type === "ok") {
      if (result.response.type !== entry.request.type) {
        throw new ProtoError("Received unexpected type of response");
      }
      entry.responseCallback(result.response);
    } else if (result.type === "error") {
      entry.errorCallback(errorFromProto(result.error));
    } else if (result.type === "none") {
      throw new ProtoError("Received unrecognized type of StreamResult");
    } else {
      throw impossible(result, "Received impossible type of StreamResult");
    }
  }
}
__name(handlePipelineResponse, "handlePipelineResponse");
async function decodePipelineResponse(resp, encoding) {
  if (encoding === "json") {
    const respJson = await resp.json();
    return readJsonObject(respJson, PipelineRespBody);
  } else if (encoding === "protobuf") {
    const respData = await resp.arrayBuffer();
    return readProtobufMessage(new Uint8Array(respData), PipelineRespBody2);
  } else {
    throw impossible(encoding, "Impossible encoding");
  }
}
__name(decodePipelineResponse, "decodePipelineResponse");
async function errorFromResponse(resp) {
  const respType = resp.headers.get("content-type") ?? "text/plain";
  if (respType === "application/json") {
    const respBody = await resp.json();
    if ("message" in respBody) {
      return errorFromProto(respBody);
    }
  }
  let message = `Server returned HTTP status ${resp.status}`;
  if (respType === "text/plain") {
    const respBody = (await resp.text()).trim();
    if (respBody !== "") {
      message += `: ${respBody}`;
    }
  }
  if (resp.status === 404) {
    message += ". It seems that the libsql server is outdated, please try updating the database.";
  }
  return new HttpServerError(message, resp.status);
}
__name(errorFromResponse, "errorFromResponse");

// node_modules/@libsql/hrana-client/lib-esm/http/client.js
var checkEndpoints = [
  {
    versionPath: "v3-protobuf",
    pipelinePath: "v3-protobuf/pipeline",
    cursorPath: "v3-protobuf/cursor",
    version: 3,
    encoding: "protobuf"
  }
  /*
  {
      versionPath: "v3",
      pipelinePath: "v3/pipeline",
      cursorPath: "v3/cursor",
      version: 3,
      encoding: "json",
  },
  */
];
var fallbackEndpoint = {
  versionPath: "v2",
  pipelinePath: "v2/pipeline",
  cursorPath: void 0,
  version: 2,
  encoding: "json"
};
var HttpClient = class extends Client {
  static {
    __name(this, "HttpClient");
  }
  #url;
  #jwt;
  #fetch;
  #closed;
  #streams;
  /** @private */
  _endpointPromise;
  /** @private */
  _endpoint;
  /** @private */
  constructor(url, jwt, customFetch, protocolVersion = 2) {
    super();
    this.#url = url;
    this.#jwt = jwt;
    this.#fetch = customFetch ?? _fetch;
    this.#closed = void 0;
    this.#streams = /* @__PURE__ */ new Set();
    if (protocolVersion == 3) {
      this._endpointPromise = findEndpoint(this.#fetch, this.#url);
      this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
    } else {
      this._endpointPromise = Promise.resolve(fallbackEndpoint);
      this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
    }
  }
  /** Get the protocol version supported by the server. */
  async getVersion() {
    if (this._endpoint !== void 0) {
      return this._endpoint.version;
    }
    return (await this._endpointPromise).version;
  }
  // Make sure that the negotiated version is at least `minVersion`.
  /** @private */
  _ensureVersion(minVersion, feature) {
    if (minVersion <= fallbackEndpoint.version) {
      return;
    } else if (this._endpoint === void 0) {
      throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the HTTP server is not yet known. Use Client.getVersion() to wait until the version is available.`);
    } else if (this._endpoint.version < minVersion) {
      throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the HTTP server only supports version ${this._endpoint.version}.`);
    }
  }
  /** Open a {@link HttpStream}, a stream for executing SQL statements. */
  openStream() {
    if (this.#closed !== void 0) {
      throw new ClosedError("Client is closed", this.#closed);
    }
    const stream = new HttpStream(this, this.#url, this.#jwt, this.#fetch);
    this.#streams.add(stream);
    return stream;
  }
  /** @private */
  _streamClosed(stream) {
    this.#streams.delete(stream);
  }
  /** Close the client and all its streams. */
  close() {
    this.#setClosed(new ClientError("Client was manually closed"));
  }
  /** True if the client is closed. */
  get closed() {
    return this.#closed !== void 0;
  }
  #setClosed(error) {
    if (this.#closed !== void 0) {
      return;
    }
    this.#closed = error;
    for (const stream of Array.from(this.#streams)) {
      stream._setClosed(new ClosedError("Client was closed", error));
    }
  }
};
async function findEndpoint(customFetch, clientUrl) {
  const fetch2 = customFetch;
  for (const endpoint of checkEndpoints) {
    const url = new URL(endpoint.versionPath, clientUrl);
    const request = new _Request(url.toString(), { method: "GET" });
    const response = await fetch2(request);
    await response.arrayBuffer();
    if (response.ok) {
      return endpoint;
    }
  }
  return fallbackEndpoint;
}
__name(findEndpoint, "findEndpoint");

// node_modules/@libsql/hrana-client/lib-esm/index.js
function openWs(url, jwt, protocolVersion = 2) {
  if (typeof _WebSocket === "undefined") {
    throw new WebSocketUnsupportedError("WebSockets are not supported in this environment");
  }
  var subprotocols = void 0;
  if (protocolVersion == 3) {
    subprotocols = Array.from(subprotocolsV3.keys());
  } else {
    subprotocols = Array.from(subprotocolsV2.keys());
  }
  const socket = new _WebSocket(url, subprotocols);
  return new WsClient(socket, jwt);
}
__name(openWs, "openWs");
function openHttp(url, jwt, customFetch, protocolVersion = 2) {
  return new HttpClient(url instanceof URL ? url : new URL(url), jwt, customFetch, protocolVersion);
}
__name(openHttp, "openHttp");

// node_modules/@libsql/client/lib-esm/hrana.js
var HranaTransaction = class {
  static {
    __name(this, "HranaTransaction");
  }
  #mode;
  #version;
  // Promise that is resolved when the BEGIN statement completes, or `undefined` if we haven't executed the
  // BEGIN statement yet.
  #started;
  /** @private */
  constructor(mode, version2) {
    this.#mode = mode;
    this.#version = version2;
    this.#started = void 0;
  }
  execute(stmt) {
    return this.batch([stmt]).then((results) => results[0]);
  }
  async batch(stmts) {
    const stream = this._getStream();
    if (stream.closed) {
      throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
    }
    try {
      const hranaStmts = stmts.map(stmtToHrana);
      let rowsPromises;
      if (this.#started === void 0) {
        this._getSqlCache().apply(hranaStmts);
        const batch = stream.batch(this.#version >= 3);
        const beginStep = batch.step();
        const beginPromise = beginStep.run(transactionModeToBegin(this.#mode));
        let lastStep = beginStep;
        rowsPromises = hranaStmts.map((hranaStmt) => {
          const stmtStep = batch.step().condition(BatchCond.ok(lastStep));
          if (this.#version >= 3) {
            stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
          }
          const rowsPromise = stmtStep.query(hranaStmt);
          rowsPromise.catch(() => void 0);
          lastStep = stmtStep;
          return rowsPromise;
        });
        this.#started = batch.execute().then(() => beginPromise).then(() => void 0);
        try {
          await this.#started;
        } catch (e) {
          this.close();
          throw e;
        }
      } else {
        if (this.#version < 3) {
          await this.#started;
        } else {
        }
        this._getSqlCache().apply(hranaStmts);
        const batch = stream.batch(this.#version >= 3);
        let lastStep = void 0;
        rowsPromises = hranaStmts.map((hranaStmt) => {
          const stmtStep = batch.step();
          if (lastStep !== void 0) {
            stmtStep.condition(BatchCond.ok(lastStep));
          }
          if (this.#version >= 3) {
            stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
          }
          const rowsPromise = stmtStep.query(hranaStmt);
          rowsPromise.catch(() => void 0);
          lastStep = stmtStep;
          return rowsPromise;
        });
        await batch.execute();
      }
      const resultSets = [];
      for (const rowsPromise of rowsPromises) {
        const rows = await rowsPromise;
        if (rows === void 0) {
          throw new LibsqlError("Statement in a transaction was not executed, probably because the transaction has been rolled back", "TRANSACTION_CLOSED");
        }
        resultSets.push(resultSetFromHrana(rows));
      }
      return resultSets;
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  async executeMultiple(sql) {
    const stream = this._getStream();
    if (stream.closed) {
      throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
    }
    try {
      if (this.#started === void 0) {
        this.#started = stream.run(transactionModeToBegin(this.#mode)).then(() => void 0);
        try {
          await this.#started;
        } catch (e) {
          this.close();
          throw e;
        }
      } else {
        await this.#started;
      }
      await stream.sequence(sql);
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  async rollback() {
    try {
      const stream = this._getStream();
      if (stream.closed) {
        return;
      }
      if (this.#started !== void 0) {
      } else {
        return;
      }
      const promise = stream.run("ROLLBACK").catch((e) => {
        throw mapHranaError(e);
      });
      stream.closeGracefully();
      await promise;
    } catch (e) {
      throw mapHranaError(e);
    } finally {
      this.close();
    }
  }
  async commit() {
    try {
      const stream = this._getStream();
      if (stream.closed) {
        throw new LibsqlError("Cannot commit the transaction because it is already closed", "TRANSACTION_CLOSED");
      }
      if (this.#started !== void 0) {
        await this.#started;
      } else {
        return;
      }
      const promise = stream.run("COMMIT").catch((e) => {
        throw mapHranaError(e);
      });
      stream.closeGracefully();
      await promise;
    } catch (e) {
      throw mapHranaError(e);
    } finally {
      this.close();
    }
  }
};
async function executeHranaBatch(mode, version2, batch, hranaStmts) {
  const beginStep = batch.step();
  const beginPromise = beginStep.run(transactionModeToBegin(mode));
  let lastStep = beginStep;
  const stmtPromises = hranaStmts.map((hranaStmt) => {
    const stmtStep = batch.step().condition(BatchCond.ok(lastStep));
    if (version2 >= 3) {
      stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
    }
    const stmtPromise = stmtStep.query(hranaStmt);
    lastStep = stmtStep;
    return stmtPromise;
  });
  const commitStep = batch.step().condition(BatchCond.ok(lastStep));
  if (version2 >= 3) {
    commitStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
  }
  const commitPromise = commitStep.run("COMMIT");
  const rollbackStep = batch.step().condition(BatchCond.not(BatchCond.ok(commitStep)));
  rollbackStep.run("ROLLBACK").catch((_) => void 0);
  await batch.execute();
  const resultSets = [];
  await beginPromise;
  for (const stmtPromise of stmtPromises) {
    const hranaRows = await stmtPromise;
    if (hranaRows === void 0) {
      throw new LibsqlError("Statement in a batch was not executed, probably because the transaction has been rolled back", "TRANSACTION_CLOSED");
    }
    resultSets.push(resultSetFromHrana(hranaRows));
  }
  await commitPromise;
  return resultSets;
}
__name(executeHranaBatch, "executeHranaBatch");
function stmtToHrana(stmt) {
  if (typeof stmt === "string") {
    return new Stmt(stmt);
  }
  const hranaStmt = new Stmt(stmt.sql);
  if (Array.isArray(stmt.args)) {
    hranaStmt.bindIndexes(stmt.args);
  } else {
    for (const [key, value] of Object.entries(stmt.args)) {
      hranaStmt.bindName(key, value);
    }
  }
  return hranaStmt;
}
__name(stmtToHrana, "stmtToHrana");
function resultSetFromHrana(hranaRows) {
  const columns = hranaRows.columnNames.map((c) => c ?? "");
  const columnTypes = hranaRows.columnDecltypes.map((c) => c ?? "");
  const rows = hranaRows.rows;
  const rowsAffected = hranaRows.affectedRowCount;
  const lastInsertRowid = hranaRows.lastInsertRowid !== void 0 ? hranaRows.lastInsertRowid : void 0;
  return new ResultSetImpl(columns, columnTypes, rows, rowsAffected, lastInsertRowid);
}
__name(resultSetFromHrana, "resultSetFromHrana");
function mapHranaError(e) {
  if (e instanceof ClientError) {
    const code = mapHranaErrorCode(e);
    return new LibsqlError(e.message, code, void 0, e);
  }
  return e;
}
__name(mapHranaError, "mapHranaError");
function mapHranaErrorCode(e) {
  if (e instanceof ResponseError && e.code !== void 0) {
    return e.code;
  } else if (e instanceof ProtoError) {
    return "HRANA_PROTO_ERROR";
  } else if (e instanceof ClosedError) {
    return e.cause instanceof ClientError ? mapHranaErrorCode(e.cause) : "HRANA_CLOSED_ERROR";
  } else if (e instanceof WebSocketError) {
    return "HRANA_WEBSOCKET_ERROR";
  } else if (e instanceof HttpServerError) {
    return "SERVER_ERROR";
  } else if (e instanceof ProtocolVersionError) {
    return "PROTOCOL_VERSION_ERROR";
  } else if (e instanceof InternalError) {
    return "INTERNAL_ERROR";
  } else {
    return "UNKNOWN";
  }
}
__name(mapHranaErrorCode, "mapHranaErrorCode");

// node_modules/@libsql/client/lib-esm/sql_cache.js
var SqlCache = class {
  static {
    __name(this, "SqlCache");
  }
  #owner;
  #sqls;
  capacity;
  constructor(owner, capacity) {
    this.#owner = owner;
    this.#sqls = new Lru();
    this.capacity = capacity;
  }
  // Replaces SQL strings with cached `hrana.Sql` objects in the statements in `hranaStmts`. After this
  // function returns, we guarantee that all `hranaStmts` refer to valid (not closed) `hrana.Sql` objects,
  // but _we may invalidate any other `hrana.Sql` objects_ (by closing them, thus removing them from the
  // server).
  //
  // In practice, this means that after calling this function, you can use the statements only up to the
  // first `await`, because concurrent code may also use the cache and invalidate those statements.
  apply(hranaStmts) {
    if (this.capacity <= 0) {
      return;
    }
    const usedSqlObjs = /* @__PURE__ */ new Set();
    for (const hranaStmt of hranaStmts) {
      if (typeof hranaStmt.sql !== "string") {
        continue;
      }
      const sqlText = hranaStmt.sql;
      let sqlObj = this.#sqls.get(sqlText);
      if (sqlObj === void 0) {
        while (this.#sqls.size + 1 > this.capacity) {
          const [evictSqlText, evictSqlObj] = this.#sqls.peekLru();
          if (usedSqlObjs.has(evictSqlObj)) {
            break;
          }
          evictSqlObj.close();
          this.#sqls.delete(evictSqlText);
        }
        if (this.#sqls.size + 1 <= this.capacity) {
          sqlObj = this.#owner.storeSql(sqlText);
          this.#sqls.set(sqlText, sqlObj);
        }
      }
      if (sqlObj !== void 0) {
        hranaStmt.sql = sqlObj;
        usedSqlObjs.add(sqlObj);
      }
    }
  }
};
var Lru = class {
  static {
    __name(this, "Lru");
  }
  // This maps keys to the cache values. The entries are ordered by their last use (entires that were used
  // most recently are at the end).
  #cache;
  constructor() {
    this.#cache = /* @__PURE__ */ new Map();
  }
  get(key) {
    const value = this.#cache.get(key);
    if (value !== void 0) {
      this.#cache.delete(key);
      this.#cache.set(key, value);
    }
    return value;
  }
  set(key, value) {
    this.#cache.set(key, value);
  }
  peekLru() {
    for (const entry of this.#cache.entries()) {
      return entry;
    }
    return void 0;
  }
  delete(key) {
    this.#cache.delete(key);
  }
  get size() {
    return this.#cache.size;
  }
};

// node_modules/@libsql/client/lib-esm/ws.js
function _createClient(config) {
  if (config.scheme !== "wss" && config.scheme !== "ws") {
    throw new LibsqlError(`The WebSocket client supports only "libsql:", "wss:" and "ws:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (config.encryptionKey !== void 0) {
    throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
  }
  if (config.scheme === "ws" && config.tls) {
    throw new LibsqlError(`A "ws:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
  } else if (config.scheme === "wss" && !config.tls) {
    throw new LibsqlError(`A "wss:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
  }
  const url = encodeBaseUrl(config.scheme, config.authority, config.path);
  let client;
  try {
    client = openWs(url, config.authToken);
  } catch (e) {
    if (e instanceof WebSocketUnsupportedError) {
      const suggestedScheme = config.scheme === "wss" ? "https" : "http";
      const suggestedUrl = encodeBaseUrl(suggestedScheme, config.authority, config.path);
      throw new LibsqlError(`This environment does not support WebSockets, please switch to the HTTP client by using a "${suggestedScheme}:" URL (${JSON.stringify(suggestedUrl)}). For more information, please read ${supportedUrlLink}`, "WEBSOCKETS_NOT_SUPPORTED");
    }
    throw mapHranaError(e);
  }
  return new WsClient2(client, url, config.authToken, config.intMode);
}
__name(_createClient, "_createClient");
var maxConnAgeMillis = 60 * 1e3;
var sqlCacheCapacity = 100;
var WsClient2 = class {
  static {
    __name(this, "WsClient");
  }
  #url;
  #authToken;
  #intMode;
  // State of the current connection. The `hrana.WsClient` inside may be closed at any moment due to an
  // asynchronous error.
  #connState;
  // If defined, this is a connection that will be used in the future, once it is ready.
  #futureConnState;
  closed;
  protocol;
  /** @private */
  constructor(client, url, authToken, intMode) {
    this.#url = url;
    this.#authToken = authToken;
    this.#intMode = intMode;
    this.#connState = this.#openConn(client);
    this.#futureConnState = void 0;
    this.closed = false;
    this.protocol = "ws";
  }
  async execute(stmt) {
    const streamState = await this.#openStream();
    try {
      const hranaStmt = stmtToHrana(stmt);
      streamState.conn.sqlCache.apply([hranaStmt]);
      const hranaRowsPromise = streamState.stream.query(hranaStmt);
      streamState.stream.closeGracefully();
      return resultSetFromHrana(await hranaRowsPromise);
    } catch (e) {
      throw mapHranaError(e);
    } finally {
      this._closeStream(streamState);
    }
  }
  async batch(stmts, mode = "deferred") {
    const streamState = await this.#openStream();
    try {
      const hranaStmts = stmts.map(stmtToHrana);
      const version2 = await streamState.conn.client.getVersion();
      streamState.conn.sqlCache.apply(hranaStmts);
      const batch = streamState.stream.batch(version2 >= 3);
      const resultsPromise = executeHranaBatch(mode, version2, batch, hranaStmts);
      return await resultsPromise;
    } catch (e) {
      throw mapHranaError(e);
    } finally {
      this._closeStream(streamState);
    }
  }
  async transaction(mode = "write") {
    const streamState = await this.#openStream();
    try {
      const version2 = await streamState.conn.client.getVersion();
      return new WsTransaction(this, streamState, mode, version2);
    } catch (e) {
      this._closeStream(streamState);
      throw mapHranaError(e);
    }
  }
  async executeMultiple(sql) {
    const streamState = await this.#openStream();
    try {
      const promise = streamState.stream.sequence(sql);
      streamState.stream.closeGracefully();
      await promise;
    } catch (e) {
      throw mapHranaError(e);
    } finally {
      this._closeStream(streamState);
    }
  }
  sync() {
    return Promise.resolve();
  }
  async #openStream() {
    if (this.closed) {
      throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
    }
    const now = /* @__PURE__ */ new Date();
    const ageMillis = now.valueOf() - this.#connState.openTime.valueOf();
    if (ageMillis > maxConnAgeMillis && this.#futureConnState === void 0) {
      const futureConnState = this.#openConn();
      this.#futureConnState = futureConnState;
      futureConnState.client.getVersion().then((_version) => {
        if (this.#connState !== futureConnState) {
          if (this.#connState.streamStates.size === 0) {
            this.#connState.client.close();
          } else {
          }
        }
        this.#connState = futureConnState;
        this.#futureConnState = void 0;
      }, (_e) => {
        this.#futureConnState = void 0;
      });
    }
    if (this.#connState.client.closed) {
      try {
        if (this.#futureConnState !== void 0) {
          this.#connState = this.#futureConnState;
        } else {
          this.#connState = this.#openConn();
        }
      } catch (e) {
        throw mapHranaError(e);
      }
    }
    const connState = this.#connState;
    try {
      if (connState.useSqlCache === void 0) {
        connState.useSqlCache = await connState.client.getVersion() >= 2;
        if (connState.useSqlCache) {
          connState.sqlCache.capacity = sqlCacheCapacity;
        }
      }
      const stream = connState.client.openStream();
      stream.intMode = this.#intMode;
      const streamState = { conn: connState, stream };
      connState.streamStates.add(streamState);
      return streamState;
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  #openConn(client) {
    try {
      client ??= openWs(this.#url, this.#authToken);
      return {
        client,
        useSqlCache: void 0,
        sqlCache: new SqlCache(client, 0),
        openTime: /* @__PURE__ */ new Date(),
        streamStates: /* @__PURE__ */ new Set()
      };
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  _closeStream(streamState) {
    streamState.stream.close();
    const connState = streamState.conn;
    connState.streamStates.delete(streamState);
    if (connState.streamStates.size === 0 && connState !== this.#connState) {
      connState.client.close();
    }
  }
  close() {
    this.#connState.client.close();
    this.closed = true;
  }
};
var WsTransaction = class extends HranaTransaction {
  static {
    __name(this, "WsTransaction");
  }
  #client;
  #streamState;
  /** @private */
  constructor(client, state, mode, version2) {
    super(mode, version2);
    this.#client = client;
    this.#streamState = state;
  }
  /** @private */
  _getStream() {
    return this.#streamState.stream;
  }
  /** @private */
  _getSqlCache() {
    return this.#streamState.conn.sqlCache;
  }
  close() {
    this.#client._closeStream(this.#streamState);
  }
  get closed() {
    return this.#streamState.stream.closed;
  }
};

// node_modules/@libsql/client/lib-esm/http.js
function _createClient2(config) {
  if (config.scheme !== "https" && config.scheme !== "http") {
    throw new LibsqlError(`The HTTP client supports only "libsql:", "https:" and "http:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (config.encryptionKey !== void 0) {
    throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
  }
  if (config.scheme === "http" && config.tls) {
    throw new LibsqlError(`A "http:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
  } else if (config.scheme === "https" && !config.tls) {
    throw new LibsqlError(`A "https:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
  }
  const url = encodeBaseUrl(config.scheme, config.authority, config.path);
  return new HttpClient2(url, config.authToken, config.intMode, config.fetch);
}
__name(_createClient2, "_createClient");
var sqlCacheCapacity2 = 30;
var HttpClient2 = class {
  static {
    __name(this, "HttpClient");
  }
  #client;
  protocol;
  /** @private */
  constructor(url, authToken, intMode, customFetch) {
    this.#client = openHttp(url, authToken, customFetch);
    this.#client.intMode = intMode;
    this.protocol = "http";
  }
  async execute(stmt) {
    try {
      const hranaStmt = stmtToHrana(stmt);
      let rowsPromise;
      const stream = this.#client.openStream();
      try {
        rowsPromise = stream.query(hranaStmt);
      } finally {
        stream.closeGracefully();
      }
      return resultSetFromHrana(await rowsPromise);
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  async batch(stmts, mode = "deferred") {
    try {
      const hranaStmts = stmts.map(stmtToHrana);
      const version2 = await this.#client.getVersion();
      let resultsPromise;
      const stream = this.#client.openStream();
      try {
        const sqlCache = new SqlCache(stream, sqlCacheCapacity2);
        sqlCache.apply(hranaStmts);
        const batch = stream.batch(false);
        resultsPromise = executeHranaBatch(mode, version2, batch, hranaStmts);
      } finally {
        stream.closeGracefully();
      }
      return await resultsPromise;
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  async transaction(mode = "write") {
    try {
      const version2 = await this.#client.getVersion();
      return new HttpTransaction(this.#client.openStream(), mode, version2);
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  async executeMultiple(sql) {
    try {
      let promise;
      const stream = this.#client.openStream();
      try {
        promise = stream.sequence(sql);
      } finally {
        stream.closeGracefully();
      }
      await promise;
    } catch (e) {
      throw mapHranaError(e);
    }
  }
  sync() {
    throw new LibsqlError("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
  }
  close() {
    this.#client.close();
  }
  get closed() {
    return this.#client.closed;
  }
};
var HttpTransaction = class extends HranaTransaction {
  static {
    __name(this, "HttpTransaction");
  }
  #stream;
  #sqlCache;
  /** @private */
  constructor(stream, mode, version2) {
    super(mode, version2);
    this.#stream = stream;
    this.#sqlCache = new SqlCache(stream, sqlCacheCapacity2);
  }
  /** @private */
  _getStream() {
    return this.#stream;
  }
  /** @private */
  _getSqlCache() {
    return this.#sqlCache;
  }
  close() {
    this.#stream.close();
  }
  get closed() {
    return this.#stream.closed;
  }
};

// node_modules/@libsql/client/lib-esm/web.js
function createClient(config) {
  return _createClient3(expandConfig(config, true));
}
__name(createClient, "createClient");
function _createClient3(config) {
  if (config.scheme === "ws" || config.scheme === "wss") {
    return _createClient(config);
  } else if (config.scheme === "http" || config.scheme === "https") {
    return _createClient2(config);
  } else {
    throw new LibsqlError(`The client that uses Web standard APIs supports only "libsql:", "wss:", "ws:", "https:" and "http:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
}
__name(_createClient3, "_createClient");

// src/topics_vectors.json
var topics_vectors_default = {
  topics: [
    {
      page_id: "wangchuk",
      page_title: "Sonam Wangchuk",
      topic_name: "Sonam Wangchuk",
      query: "Sonam+Wangchuk"
    },
    {
      page_id: "pune_pollution",
      page_title: "Pune Air Pollution",
      topic_name: "Pune Air Pollution",
      query: "Pune+air+pollution"
    },
    {
      page_id: "pune_pollution",
      page_title: "Pune Air Pollution",
      topic_name: "Pimpri Chinchwad Air Pollution",
      query: "Pimpri+Chinchwad+air+pollution"
    },
    {
      page_id: "pune_metro",
      page_title: "Pune Metro",
      topic_name: "Pune Metro",
      query: "Pune+metro"
    },
    {
      page_id: "trees_nashik",
      page_title: "Nashik trees",
      topic_name: "Nashik trees",
      query: "Nashik+trees"
    },
    {
      page_id: "red_fort_incident",
      page_title: "red_fort_incident",
      topic_name: "Red Fort Incident",
      query: "Red+Fort+Blast+Incident"
    },
    {
      page_id: "pmpml_buses",
      page_title: "PMPML Buses",
      topic_name: "PMPML Buses",
      query: "PMPML+buses"
    },
    {
      page_id: "bulgaria_incident",
      page_title: "Bulgaria incident",
      topic_name: "Bulgaria Incident",
      query: "Bulgaria+Incident"
    },
    {
      page_id: "bulgaria_incident",
      page_title: "Bulgaria incident",
      topic_name: "Bulgaria protest",
      query: "Bulgaria+Protest"
    },
    {
      page_id: "sydney_mass_shooting",
      page_title: "Sydney mass shooting",
      topic_name: "Sydney mass shooting",
      query: "Sydney+mass+shooting"
    }
  ],
  embeddings: [
    [
      -0.0028658314,
      -0.038089663,
      -0.039810967,
      -0.017339205,
      0.05504795,
      0.03525614,
      0.0014427529,
      -0.030591497,
      0.0029231773,
      0.022549355,
      0.07337258,
      0.0301623,
      0.024615793,
      -0.03271841,
      -0.019336216,
      -0.03516445,
      0.0435824,
      -0.014341604,
      -0.06527721,
      0.027372308,
      0.018966047,
      -0.054341037,
      0.03897175,
      -7299985e-9,
      0.019534327,
      -0.03959541,
      906556e-8,
      0.013462072,
      -0.040981963,
      -0.036644947,
      0.0050885086,
      0.031240761,
      -7014071e-9,
      0.017526358,
      -0.028673045,
      -0.0026434634,
      -74058963e-11,
      0.0413305,
      0.054693665,
      -0.055314973,
      -0.017652173,
      0.05944241,
      -0.015187919,
      -0.018703729,
      -0.012167551,
      0.0049968576,
      0.014178696,
      -0.018784583,
      -5366322e-9,
      -0.0024819341,
      0.04382196,
      -0.05813412,
      -0.05661726,
      0.08741922,
      -0.016959982,
      -0.03872951,
      -0.018800128,
      -0.085434124,
      -0.019934753,
      -0.025867559,
      -0.012630133,
      0.019140143,
      -0.03482615,
      -0.065604135,
      0.027829012,
      -0.060881555,
      -0.0073731975,
      -0.01272657,
      -0.018409133,
      0.040492456,
      -0.0037730257,
      0.04167013,
      -0.022437869,
      0.05024434,
      0.038798854,
      -0.02339509,
      -0.03500112,
      0.024818162,
      0.08040071,
      0.0074853655,
      -0.055346522,
      0.0058103194,
      0.037604954,
      0.06334718,
      -6861272e-9,
      0.01193274,
      0.060920276,
      8185471e-9,
      -0.010808496,
      0.030657582,
      0.024003752,
      0.06348431,
      -0.023069527,
      -0.03892187,
      0.09714574,
      -0.05766614,
      3515741e-9,
      -0.0591903,
      0.09862586,
      0.07675419,
      0.06468805,
      0.03825807,
      0.0067681493,
      -0.024668332,
      5020054e-9,
      0.04542683,
      -0.03925371,
      -0.02271577,
      -0.07716602,
      0.032327052,
      -0.05404578,
      -0.019148339,
      -0.015625462,
      -0.0099680405,
      0.0040872437,
      -0.03906647,
      -0.054264013,
      -0.021905407,
      0.0032045855,
      0.07063156,
      -0.059237316,
      3344087e-9,
      -0.0087525025,
      0.017553683,
      -0.03870198,
      -4144547e-9,
      -0.07135585,
      0.010025707,
      0.016876379,
      -0.07305895,
      0.058095004,
      -0.048395447,
      -5052741e-9,
      0.0074259453,
      -0.015111554,
      -9095013e-9,
      0.033493545,
      -0.021437407,
      0.03584111,
      -26712634e-11,
      0.047461003,
      -0.011175543,
      -0.03427189,
      0.036879558,
      4965667e-9,
      6908967e-9,
      0.04842949,
      0.09248619,
      -0.05895514,
      -0.023687445,
      -0.022482386,
      -14564615e-11,
      0.039166342,
      -0.068265766,
      -0.0154256355,
      -0.021404143,
      0.036303453,
      -0.022579102,
      0.036593027,
      0.012246792,
      0.028821738,
      -0.030557016,
      0.03144626,
      0.013342281,
      -0.022398533,
      0.0072780196,
      0.024820171,
      -8693185e-9,
      0.018471913,
      0.015450933,
      -0.075342305,
      8307489e-11,
      -0.0193596,
      -0.03287619,
      -0.019392079,
      -0.0012349895,
      9469582e-10,
      -497605e-8,
      -0.020298019,
      0.03152578,
      0.051896833,
      7710967e-9,
      -0.07762843,
      -5135649e-9,
      0.025450427,
      -0.029458055,
      3880427e-9,
      -0.0050623277,
      -0.018825926,
      0.038352486,
      -0.024365155,
      0.015195893,
      -0.10944846,
      0.03464696,
      -0.07251617,
      -0.06112238,
      -9119453e-9,
      -25396317e-11,
      0.05574135,
      -0.105572715,
      0.0546684,
      0.042601954,
      0.0025081874,
      0.02015549,
      -0.035080954,
      0.061630145,
      -0.06773001,
      -8563915e-9,
      0.053307764,
      -0.0657717,
      0.041228507,
      -8858851e-9,
      -0.0010111148,
      -0.018870018,
      -0.040447447,
      0.021314135,
      0.026719684,
      0.0018554508,
      0.030567529,
      -5629096e-9,
      -0.014680162,
      0.026560456,
      -0.019419443,
      0.02400727,
      0.018847592,
      0.08863762,
      -0.023706088,
      63118164e-11,
      0.014109055,
      -0.010587438,
      -7948124e-9,
      -0.050715648,
      -0.0021407169,
      0.05630001,
      0.02693755,
      8481955e-9,
      0.04204954,
      -0.063702844,
      6425441e-9,
      -0.023935795,
      0.09506768,
      0.014568956,
      0.04259845,
      0.06605593,
      0.0016277093,
      0.058377102,
      0.055995602,
      -2588049e-9,
      0.016022412,
      -0.01971671,
      -5971001e-10,
      -0.055631932,
      0.01458919,
      -0.0010468782,
      3994134e-9,
      -0.03588738,
      0.051790573,
      -0.014529318,
      -0.07890312,
      -9224289e-9,
      5863924e-9,
      -0.022134766,
      0.037208345,
      -0.044976402,
      -0.05227784,
      0.019160055,
      -0.040862802,
      0.026252016,
      0.1033525,
      -6816527e-9,
      0.0027515113,
      -0.043133862,
      0.0017858153,
      -0.034858454,
      0.05117129,
      -0.02143331,
      -0.03243171,
      0.030599307,
      -6641711e-10,
      0.014645277,
      0.022514578,
      -0.012440262,
      -0.069840714,
      3931828e-9,
      -7240418e-9,
      -0.063547626,
      -0.0025726175,
      -0.012767424,
      -0.022883529,
      -0.057043087,
      0.027334018,
      0.06982366,
      0.013365349,
      -0.025387516,
      0.033559132,
      -0.014723,
      -7819622e-9,
      3916982e-9,
      5779205e-9,
      0.017825983,
      0.036336448,
      0.053970966,
      -0.024582125,
      -0.0037792844,
      0.04199689,
      -0.024783283,
      -0.05836403,
      0.0018494714,
      -0.029668696,
      0.0786439,
      0.014585792,
      0.015672974,
      -0.08582807,
      -0.0037223208,
      0.0033733416,
      0.012356822,
      -0.13727006,
      0.016545793,
      0.026706789,
      0.03374382,
      -0.0032848807,
      -7900182e-9,
      -0.028610134,
      0.017594185,
      0.03357007,
      -0.01860273,
      -0.03158981,
      -9812803e-9,
      -0.020519799,
      0.04496993,
      0.016354157,
      -0.0030672688,
      -0.020353729,
      -4422073e-9,
      74204983e-11,
      0.020423817,
      -0.025957124,
      0.012674824,
      0.075713724,
      0.04770809,
      0.031113714,
      -9228703e-9,
      0.03481786,
      -0.04847886,
      -0.013705393,
      -0.028358204,
      0.0349045,
      -0.013576924,
      0.028095284,
      0.0037283746,
      -0.0019831676,
      9692278e-9,
      -0.015936408,
      0.022783568,
      0.0012276002,
      77672245e-11,
      -0.048624005,
      0.07012216,
      0.055714313,
      -9832056e-9,
      8214568e-9,
      0.04512893,
      -0.013032152,
      0.026851894,
      -0.0029653783,
      -785257e-8,
      0.026813451,
      0.029002259,
      -0.0023659444,
      -0.04676374,
      0.030973589,
      0.05125493,
      0.023181293,
      0.0015354813,
      0.08786943,
      -0.027553346,
      -0.0076321703,
      3710884e-9,
      -0.041227583,
      -0.07238674,
      -0.037273522,
      0.022569163,
      7970341e-9,
      -0.013090739,
      0.017519707,
      0.08560021,
      -0.08902048,
      -9119105e-9,
      -0.045876786,
      0.03264079,
      -0.03032108,
      0.0525684,
      0.041979853,
      9042792e-9,
      -668355e-8,
      -0.0016335855,
      0.013262117,
      0.043151356,
      -0.0153650055,
      0.036470383,
      0.018443944,
      0.028589228,
      0.095811754,
      -0.057108555,
      -0.04054206,
      -0.0021453362,
      0.078550585,
      0.034021858,
      0.053084895,
      -0.03280147,
      0.02016084,
      7941033e-9,
      -0.0110814525,
      -0.01874144,
      -0.059649643,
      2268114e-9,
      0.03191635,
      -0.025540916,
      0.017448522,
      0.0026398085,
      -0.04387022,
      62096136e-11,
      0.025003456,
      0.013347267,
      -0.037200928,
      -0.05729274,
      0.037797302,
      -0.036268532,
      -0.021199096,
      0.019491123,
      0.047990955,
      0.07479108,
      -0.018956274,
      -0.024133384,
      0.04225673,
      0.02020244,
      -0.04561748,
      -0.029584179,
      0.055334616,
      0.038211234,
      0.07632953,
      -0.07127655,
      0.03837459,
      0.030778037,
      0.010645406,
      9142976e-10,
      0.010085644,
      0.05887334,
      -0.03886641,
      0.025291804,
      -0.0052297385,
      0.034854393,
      0.034109574,
      4145906e-9,
      -0.039657142,
      -0.017231878,
      -0.0059271874,
      -5038077e-9,
      0.0060654134,
      -0.07053182,
      -0.024044447,
      0.015875187,
      0.038473476,
      0.05895739,
      0.029251305,
      0.036478747,
      -0.03780199,
      0.05321465,
      -0.0288831,
      0.023954859,
      0.05697925,
      -0.03669556,
      0.010990509,
      -0.012915856,
      -0.071070485,
      -0.041491643,
      0.03712958,
      -0.0064244447,
      -907282e-8,
      7494318e-11,
      -0.021195497,
      -0.0026273853,
      -0.03392744,
      0.0284847,
      0.08838553,
      -0.04295095,
      -0.019609444,
      0.016987368,
      0.046284564,
      9446853e-9,
      -0.016609099,
      0.010532299,
      6431026e-10,
      -0.022199659,
      -0.016650701,
      -0.024191005,
      0.07196185,
      6651544e-9,
      -0.05346749,
      -0.019596476,
      0.02051837,
      0.040648263,
      0.015933067,
      -5403047e-10,
      8467983e-9,
      -0.02107957,
      -0.014517552,
      -0.0029979497,
      0.06039819,
      0.013301516,
      -0.01906786,
      0.0048390846,
      0.018714843,
      -6539119e-9,
      -4709936e-9,
      0.0304197,
      -0.0685595,
      0.024340328,
      -0.020594811,
      0.0011989422,
      -0.026098737,
      0.025455838,
      0.032135002,
      -0.035228778,
      0.035263136,
      -0.0024183607,
      -0.037550885,
      0.026066419,
      0.072194695,
      -0.019646594,
      -0.018682225,
      5451985e-9,
      0.034859404,
      6889366e-10,
      0.02858297,
      0.079574876,
      0.03688196,
      0.021770278,
      0.0022215757,
      0.024470733,
      -0.035041783,
      -0.0041662673,
      -0.025253562,
      0.017999124,
      0.033953257,
      -22737762e-11,
      0.04462936,
      0.031903774,
      6349748e-9,
      0.050519828,
      -0.01680953,
      -9496852e-9,
      -0.0021701823,
      -0.011788705,
      -0.0628251,
      -0.010748823,
      0.04185915,
      0.02025766,
      -0.0018250165,
      0.0041196942,
      0.023971843,
      -0.026106212,
      -0.0109936865,
      -0.017306767,
      0.02631538,
      0.0018559602,
      0.0063554645,
      0.021669246,
      0.0046494734,
      -0.015552169,
      0.024472484,
      0.020092769,
      0.0085161105,
      -0.07160513,
      5604238e-9,
      0.0011482808,
      -0.069921896,
      0.015203342,
      0.03628244,
      -0.06062851,
      0.041167315,
      0.06617282,
      0.060767967,
      -4062789e-9,
      -0.053888083,
      0.014031779,
      -0.027798682,
      -0.05141799,
      0.047721718,
      6296675e-9,
      -0.081888564,
      0.030615851,
      71838644e-11,
      -17788282e-11,
      6625521e-9,
      -0.044840004,
      -0.04457103,
      -0.017271832,
      0.0019277465,
      0.05077501,
      837736e-8,
      0.013085687,
      0.047447573,
      0.025462754,
      0.045059744,
      -0.024633598,
      -0.01563703,
      -0.0347711,
      -0.028860195,
      7056646e-9,
      0.025481526,
      905382e-8,
      -0.023620185,
      -0.03240003,
      -0.045837183,
      -0.0016409161,
      0.016994553,
      -8200229e-9,
      0.057237394,
      -0.0034023314,
      0.027435893,
      0.037374943,
      -0.0038606117,
      -0.0076381443,
      -0.08691877,
      0.033164132,
      -0.045154363,
      0.017172357,
      0.045898296,
      0.0014214374,
      -8629185e-9,
      0.058895234,
      0.048200976,
      -0.0034578962,
      -0.03264717,
      0.04771017,
      0.0088251205,
      9791425e-9,
      0.0060742325,
      -0.012562504,
      -0.013786174,
      0.04324209,
      0.03629421,
      0.032982256,
      -0.055789202,
      -0.050644577,
      0.013943748,
      0.04406727,
      0.02978201,
      0.045790456,
      -523463e-8,
      0.020122288,
      -8349957e-9,
      0.016680866,
      1483635e-9,
      -0.019567758,
      -0.045666568,
      -0.020742605,
      -4188869e-10,
      0.0332951,
      -0.019916652,
      -0.054650947,
      0.02092109,
      -25307467e-12,
      0.015532914,
      -0.010989821,
      -0.025501814,
      -0.03671431,
      -9274248e-9,
      0.018684413,
      0.02692722,
      0.019430188,
      -0.057132963,
      0.0535946,
      -0.0141646415,
      -0.031972982,
      9203817e-10,
      -24294735e-11,
      -0.05913904,
      0.05719998,
      0.033348873,
      -1084202e-9,
      -0.028053394,
      -0.0074676583,
      0.018396167,
      0.05588254,
      0.028634446,
      0.030093925,
      -0.016681097,
      0.049178794,
      0.01787463,
      -0.028223688,
      -0.04769033,
      0.023521293,
      0.012983113,
      0.015270498,
      -0.023438312,
      0.03124701,
      0.015412756,
      8524954e-9,
      -0.049159307,
      -0.04487897,
      -0.046978053,
      -0.03642555,
      0.011934191,
      0.0027509457,
      0.038109932,
      -0.0035571447,
      -4073427e-9,
      8763168e-9,
      0.0051893573,
      -0.0075478526,
      0.03180092,
      -0.0730859,
      -0.0046366514,
      -0.03277483,
      0.04530079,
      -0.022706576,
      0.013805378,
      -0.017864676,
      0.017127506,
      -0.019816153,
      0.047577836,
      0.035558257,
      0.013702514,
      -0.0098295985,
      5821338e-9,
      -0.024084328,
      -0.053308584,
      0.031924482,
      0.060912922,
      -0.0047172895,
      -0.010807597,
      0.05998346,
      0.04113156,
      0.01620374,
      -0.022204481,
      -0.054623347,
      -0.03896335,
      -0.028985823,
      -0.0075885165,
      -0.017497508,
      -0.02922804,
      -0.066861264,
      -0.023535263,
      -0.026352273,
      0.014919136,
      -0.025868602,
      -0.017537408,
      -0.01016034,
      -0.033685908,
      0.0147672845,
      0.023639899,
      0.014342567,
      0.047107447,
      -18617309e-11,
      -0.015723247,
      -0.029553533,
      -63045695e-11,
      4852173e-9,
      -0.051385857,
      0.046615355,
      0.0059737847,
      0.0035518876,
      0.013509518,
      -0.012271943,
      0.05468524,
      -7428648e-9
    ],
    [
      -0.036960185,
      -4751237e-10,
      -0.053776354,
      -0.058272306,
      -0.045798156,
      -0.04355196,
      -0.021390183,
      -0.03359776,
      0.029179236,
      9352083e-9,
      0.048296373,
      -0.010589128,
      0.038577635,
      0.013569818,
      0.07435804,
      -6559969e-9,
      0.040926494,
      -0.061731834,
      0.0040978603,
      -0.049590237,
      0.031407807,
      0.028413031,
      0.016586386,
      0.03315329,
      -0.04685682,
      -0.012716722,
      -0.03390793,
      0.0031002394,
      -0.037612963,
      -0.012138162,
      0.041841898,
      0.041909285,
      -0.0023248745,
      0.029293267,
      -0.018116834,
      0.050961703,
      0.019048827,
      0.026947144,
      857784e-8,
      -0.07882479,
      -0.072570145,
      0.028954279,
      -0.014263214,
      0.0328834,
      -0.047417056,
      -0.019450683,
      0.0057792612,
      0.0488228,
      -0.03160059,
      0.046482284,
      -7182414e-9,
      -0.02600894,
      -0.03404664,
      0.014438671,
      -0.0383073,
      -0.04255995,
      -0.053322274,
      0.010398041,
      0.04339844,
      0.053178217,
      -0.0012921325,
      -0.013586789,
      -0.030072156,
      -0.020186003,
      0.019299787,
      -0.038796768,
      -0.019458001,
      -0.06380344,
      -0.053630397,
      0.0606482,
      9124331e-9,
      0.040618565,
      -0.028007565,
      -0.024880499,
      0.043743405,
      -0.023365298,
      -9984011e-9,
      0.02401893,
      -0.019021193,
      -6595535e-9,
      -0.049184576,
      0.043229952,
      0.01254019,
      0.07220627,
      0.016853603,
      -0.0351917,
      0.050273947,
      -0.05733667,
      -112729e-8,
      0.019023258,
      0.017814796,
      -0.0017806345,
      -0.029182725,
      -0.0026764371,
      0.058451824,
      -0.03045802,
      -0.028985107,
      -0.05736311,
      0.08956566,
      -0.0131195225,
      0.03416305,
      0.03997507,
      -6246011e-9,
      -0.078247115,
      -0.01485051,
      0.054812327,
      -0.08689007,
      0.010462512,
      -0.01222816,
      0.01656949,
      -0.0374817,
      -0.0328056,
      0.019311368,
      0.071898244,
      -0.014287546,
      6191059e-9,
      -0.062712714,
      -9831716e-10,
      -0.0629406,
      0.03506818,
      -0.041495237,
      -0.029372716,
      -0.07214781,
      0.01665607,
      -0.012992833,
      -0.0021427204,
      -0.043473907,
      0.08066659,
      -0.016966967,
      -0.02878083,
      -0.012902931,
      -0.018910352,
      -0.019268623,
      0.027968088,
      -6279359e-9,
      0.045108706,
      0.076981924,
      -0.0070552193,
      0.015212971,
      -6830204e-9,
      9992257e-9,
      5835886e-9,
      -0.05467919,
      -8345853e-9,
      0.038937207,
      0.015459801,
      0.066852994,
      -0.017210444,
      -0.01753986,
      0.021477673,
      -0.011360161,
      -0.038017944,
      0.042044625,
      9062537e-9,
      0.011346695,
      0.014835553,
      0.055733703,
      -0.02633939,
      0.04778813,
      0.036133822,
      0.081520595,
      -0.02305599,
      -6525135e-9,
      -0.019076003,
      0.0038745531,
      -0.0010733667,
      -0.017213231,
      -0.07171404,
      -0.038347483,
      -0.027879784,
      0.020116124,
      -0.057049762,
      0.0024738915,
      -0.08025454,
      9974594e-9,
      -0.0024262962,
      -36379005e-11,
      -0.03253962,
      -0.044796992,
      -0.0469804,
      0.099267066,
      -0.021335943,
      -0.052840095,
      -0.046073273,
      4364406e-9,
      -0.02243395,
      0.06416576,
      -0.042049833,
      0.03792318,
      -0.012337713,
      0.0076490254,
      0.0152716655,
      -0.0149815185,
      -0.012033182,
      -0.056137055,
      0.035248715,
      -3564207e-9,
      -0.028694838,
      0.055807933,
      -0.0714822,
      0.013601621,
      8019577e-9,
      -0.029255036,
      0.058742102,
      3023921e-9,
      0.03517147,
      0.028481968,
      -0.017257018,
      29620808e-11,
      -0.0022123773,
      -7011551e-9,
      0.028347006,
      -0.022606345,
      -0.026114194,
      3346683e-9,
      0.06399541,
      0.046396222,
      0.014665955,
      0.015150594,
      -0.034254424,
      0.06023721,
      -5196246e-9,
      0.060476393,
      0.04852863,
      0.024920274,
      0.019760484,
      -0.024504973,
      -0.02292671,
      -0.01180424,
      0.020365309,
      9469471e-9,
      0.014998958,
      -0.020940786,
      0.07227378,
      -0.045218997,
      0.03828368,
      -0.017554604,
      -0.022846472,
      0.014051685,
      7772169e-9,
      0.0053362907,
      -0.054499745,
      0.05819123,
      -5913243e-9,
      5705269e-9,
      0.06889212,
      0.041054115,
      0.023107799,
      0.020012368,
      -0.06701374,
      -0.049704153,
      -0.0798859,
      0.033653703,
      0.012754647,
      0.023709387,
      -0.010522381,
      8386129e-9,
      0.02828045,
      -0.04245096,
      -0.051803008,
      -0.0057458873,
      -0.048897978,
      0.020416811,
      -0.02208248,
      -0.022676082,
      -0.034060165,
      -9062705e-9,
      -0.0068788263,
      0.053697456,
      9775557e-9,
      0.04843227,
      -0.07319043,
      -0.02698927,
      -0.013265277,
      3509747e-9,
      -9165358e-9,
      0.030131577,
      -0.021388888,
      -0.020537484,
      -0.020260908,
      0.0075615626,
      0.044740487,
      -0.0046647433,
      -0.01769376,
      0.016660444,
      -0.037197765,
      0.024839856,
      -0.019117301,
      -0.023689838,
      1794093e-9,
      0.08413486,
      0.022130972,
      -9226042e-9,
      -0.05445446,
      0.040726412,
      -0.042457912,
      0.039750878,
      0.043519452,
      -0.07088245,
      -0.029432436,
      0.07422902,
      0.06562748,
      0.044131197,
      0.0032758592,
      0.024163872,
      -0.015486414,
      -0.05973954,
      -0.02027089,
      -0.0076649534,
      0.025536483,
      0.052246794,
      0.0461023,
      -0.013383769,
      0.047643177,
      -0.043513507,
      -0.0013266172,
      -0.06895641,
      0.030461341,
      -0.030231785,
      0.029848244,
      -0.04703529,
      -0.012388914,
      -0.041642725,
      0.034827348,
      0.06378998,
      -0.0038068916,
      0.028501134,
      9778946e-10,
      0.07038704,
      0.043551024,
      -65126125e-11,
      -0.022089208,
      0.026507668,
      0.0040108464,
      0.012280614,
      0.0036166597,
      -0.07771327,
      0.01740458,
      0.06862325,
      -0.023512835,
      -3275276e-10,
      -0.018272048,
      -0.07401089,
      0.037595857,
      0.02141189,
      0.0039365203,
      0.020968504,
      -0.0025261801,
      0.10465839,
      -0.04531748,
      0.062135804,
      0.024678914,
      0.037858482,
      -0.030370925,
      -0.04124765,
      -8938755e-9,
      -505238e-8,
      8831587e-9,
      0.030333264,
      -0.014137001,
      -0.019169308,
      0.030803278,
      -0.017511237,
      0.04034384,
      -0.031818114,
      0.018846797,
      0.024515817,
      0.024567002,
      -0.020284697,
      -0.03725519,
      0.011276195,
      9940483e-9,
      0.0028485926,
      7968083e-10,
      0.034042776,
      -0.04214792,
      -0.0079430705,
      -0.012553786,
      -0.048579674,
      0.025522906,
      0.018633896,
      0.0046282904,
      0.0038585481,
      0.029180288,
      -92466257e-11,
      4622004e-9,
      -0.058454163,
      -0.017073903,
      -0.0145460805,
      0.041189894,
      0.029652016,
      0.076791495,
      0.010023864,
      0.030316545,
      -0.03105098,
      21122363e-11,
      -0.06019521,
      0.03664905,
      0.03272986,
      -0.03737964,
      0.037491426,
      0.0032001084,
      0.02708772,
      -0.018970368,
      -0.017073583,
      0.013487621,
      0.03684294,
      -0.019526098,
      -0.02278298,
      -0.016659359,
      -0.034217056,
      -0.056521274,
      -0.036291245,
      0.0151774045,
      -0.024480512,
      7486512e-9,
      0.04050332,
      0.012140349,
      -0.014393729,
      -0.08327033,
      -0.0046336055,
      0.034012966,
      -0.0046153325,
      -0.0051422813,
      -0.078513004,
      -0.04535746,
      0.063964255,
      -3160156e-9,
      6731887e-9,
      0.0074386015,
      0.056399982,
      0.0086806975,
      -0.031199867,
      0.013472573,
      0.05817618,
      -0.04451376,
      7943384e-9,
      -0.023439066,
      -0.011300762,
      0.053633265,
      -0.069178455,
      0.039256386,
      -0.052364726,
      0.026319627,
      0.04945054,
      0.03905478,
      0.027475009,
      -0.011304039,
      -0.020308362,
      0.03173863,
      0.0036852786,
      0.026494214,
      0.06761189,
      -0.032723106,
      -0.013078218,
      -0.032724045,
      8244655e-9,
      0.018050453,
      -0.0065061124,
      -0.0061928057,
      -0.016812969,
      0.013763427,
      -4662041e-9,
      0.07305875,
      0.02975564,
      -0.0018417666,
      0.012061362,
      0.0068077217,
      -0.02620575,
      -0.03178058,
      0.01987161,
      -0.032963436,
      -0.014219088,
      -0.0052495557,
      -0.058764275,
      0.022591477,
      2229527e-9,
      -0.021045253,
      0.02428432,
      0.014120194,
      0.037760723,
      0.019619731,
      -0.058833588,
      0.04003701,
      0.053732008,
      -0.017832918,
      -0.054364227,
      -0.0033614822,
      0.031170864,
      0.0059834314,
      -0.075299576,
      -0.03515183,
      0.020403564,
      -0.021158695,
      -0.047552694,
      0.025454903,
      -0.010376833,
      -0.037860934,
      -0.072759405,
      0.012481906,
      0.029862018,
      -6938725e-10,
      0.032772522,
      -0.042244602,
      -0.07281391,
      -0.011450504,
      -0.011155344,
      -0.0036917462,
      0.06291082,
      0.059077088,
      0.03191982,
      0.025327206,
      0.0080434745,
      0.03310669,
      46089964e-11,
      0.0027324175,
      -0.012694586,
      4619047e-9,
      -0.04596009,
      0.016546246,
      -0.062314257,
      -0.03840893,
      0.08106652,
      0.0035039268,
      0.048164688,
      -9939906e-9,
      -0.05412163,
      0.030097071,
      0.113005266,
      -0.042859703,
      0.05101315,
      -0.026255367,
      0.0015676988,
      0.03637469,
      -0.022873279,
      0.083772086,
      4484794e-9,
      0.038302246,
      -0.038654,
      3890491e-9,
      -0.012765431,
      4565256e-9,
      -0.02723515,
      0.019748382,
      0.040057894,
      -0.019020272,
      -0.031722568,
      -0.0031528063,
      0.022719642,
      0.011494432,
      0.0064703473,
      -0.010508522,
      0.01851317,
      -0.072722666,
      -0.01578747,
      -0.030109059,
      0.060059614,
      0.029637638,
      0.024688702,
      -0.07807169,
      0.0051876823,
      -0.0038229346,
      0.037418004,
      0.026239086,
      -0.03321891,
      -0.045955554,
      -0.05662684,
      0.047135744,
      -0.037113495,
      -0.03247442,
      -2460137e-9,
      -0.0012868093,
      0.027802369,
      -0.045880333,
      0.049737148,
      0.0027646963,
      -0.03568505,
      0.036307026,
      -0.045076508,
      -0.042064957,
      -6712664e-9,
      0.018141113,
      0.0533802,
      -0.037904967,
      -0.050043102,
      -8362669e-9,
      5492644e-9,
      0.039576285,
      0.048012137,
      6130666e-10,
      -0.037334505,
      -0.042986173,
      -0.017135086,
      -0.063594796,
      0.0024007922,
      9666809e-9,
      -0.015980383,
      -0.013968474,
      -0.040609825,
      -8418308e-9,
      -67618996e-11,
      0.051733643,
      0.116046615,
      0.055001877,
      -0.03363516,
      -0.014437231,
      -0.019591196,
      -0.024994368,
      -0.07490557,
      -0.02157565,
      6020038e-9,
      0.021869583,
      -0.021240482,
      -0.028867438,
      -0.022166675,
      -0.035194345,
      -8025441e-10,
      -0.022084361,
      -0.010245394,
      0.03764196,
      -0.020662174,
      0.0047973916,
      8669209e-9,
      -0.019505085,
      -0.06861119,
      0.020681767,
      -0.05290929,
      0.010800973,
      -7166523e-9,
      0.027290702,
      -4116325e-9,
      0.023511406,
      0.011837673,
      -0.012322937,
      -0.040470917,
      0.014169478,
      -0.040187243,
      0.014602327,
      0.03271458,
      -0.056046568,
      0.05843968,
      -0.01485442,
      6086307e-9,
      0.03138851,
      -0.031281065,
      0.01583954,
      -638364e-8,
      -0.0018166043,
      -0.019442387,
      -0.0046381983,
      -23344444e-11,
      0.053369742,
      -0.02626619,
      0.02474951,
      -0.025119152,
      0.01411616,
      -0.010480966,
      -0.019562842,
      0.021029523,
      -0.0017435487,
      -21092776e-11,
      -0.01975353,
      -0.016756836,
      0.045375705,
      0.0074319006,
      0.036771014,
      0.02817307,
      -0.021328308,
      -32375532e-11,
      0.013624361,
      5401549e-9,
      -0.0057382775,
      -0.039601408,
      0.03110745,
      9307057e-9,
      -0.0040761894,
      0.049534846,
      3482019e-9,
      -0.026108887,
      0.03524872,
      0.020546373,
      -0.03114158,
      -0.016424838,
      -0.02545057,
      8321993e-9,
      0.013833168,
      0.04287881,
      0.05202768,
      -9343367e-9,
      0.08347981,
      0.039188914,
      -0.0058262893,
      -0.030726403,
      0.025974253,
      0.023405924,
      0.0036188995,
      -0.0016634534,
      -0.023182001,
      -0.020876735,
      0.043080293,
      5833651e-9,
      -0.027622955,
      -0.051562972,
      -0.051646322,
      -0.01309662,
      0.012384521,
      0.11175505,
      0.040698998,
      -0.045268763,
      0.020894347,
      -0.045632813,
      -0.017502738,
      0.030830504,
      -9684032e-9,
      0.037450667,
      -0.019428713,
      0.015843935,
      0.02178056,
      -0.0022392995,
      5331182e-10,
      0.022774594,
      -0.036460772,
      0.033251863,
      0.059953906,
      0.057083756,
      0.0017446234,
      -0.025015067,
      -0.05068998,
      -0.0037762946,
      0.101217225,
      -0.0062779943,
      -0.010018268,
      -0.0077806003,
      0.093926795,
      -5293984e-9,
      9461159e-9,
      -0.018895267,
      -0.024935981,
      -0.018787745,
      -1584729e-9,
      -605357e-8,
      -0.022344036,
      -0.018897122,
      -0.012339852,
      -0.08313051,
      -0.023583943,
      0.0076670754,
      0.015386979,
      0.018832734,
      -0.011398367,
      -0.04870045,
      -0.039906505,
      3101758e-9,
      0.0037491722,
      0.045621864,
      0.031227801,
      9078183e-9,
      -0.036810763,
      -0.023877928,
      -0.016136892,
      -0.022069814,
      0.06003502,
      -0.052992042,
      -0.03357287,
      -0.038886428,
      0.019744484,
      0.059372623,
      0.011673826
    ],
    [
      -0.03416863,
      -376352e-8,
      -0.08733914,
      -0.052769233,
      -0.021498112,
      -0.04603184,
      -0.043558262,
      -0.047217306,
      0.034076698,
      0.012155426,
      0.05404866,
      648952e-8,
      0.021771695,
      0.026471453,
      0.08618819,
      2807264e-9,
      0.059092246,
      -0.05222566,
      -0.012264327,
      -0.039095834,
      0.029490586,
      0.03336052,
      0.014936595,
      0.059375476,
      -0.040744007,
      0.0022046599,
      -0.026968792,
      -44336508e-11,
      -0.04328159,
      -0.01809308,
      0.045814924,
      0.04647968,
      -0.017355477,
      0.02412917,
      -0.0035372025,
      0.056761805,
      6658226e-10,
      0.048872754,
      57792966e-11,
      -0.06858136,
      -0.07603408,
      0.033893075,
      -0.016050624,
      0.0037097624,
      -0.043645915,
      -0.02415195,
      -0.0050359587,
      0.049750645,
      -0.041317187,
      0.045345478,
      -0.013939889,
      -0.025403757,
      -0.038181376,
      0.01994616,
      -0.023609927,
      -0.03512971,
      -0.05513788,
      0.0044836667,
      0.027801136,
      0.010405303,
      -0.026729267,
      -0.018441066,
      -0.027475096,
      -0.037377264,
      0.042612515,
      -0.030122964,
      -0.026769217,
      -0.06289965,
      -0.059079297,
      0.05862894,
      0.010016668,
      0.039592125,
      -0.035672106,
      -0.037631683,
      0.027724024,
      -0.039643716,
      -5901392e-9,
      0.037892845,
      -458738e-8,
      8075769e-10,
      -0.06590001,
      0.05242165,
      0.01526776,
      0.06654416,
      0.017705001,
      -0.025290212,
      0.045589607,
      -0.03417112,
      4084282e-9,
      0.016790193,
      0.022923497,
      -4347275e-9,
      -8226175e-9,
      -0.0049712225,
      0.06675078,
      -0.033884816,
      -0.025726838,
      -0.052836068,
      0.08632357,
      -0.04250002,
      0.030099321,
      0.04339623,
      -0.0193923,
      -0.09550165,
      -0.014538048,
      0.06359725,
      -0.09134105,
      0.0079957135,
      -0.017334761,
      0.039004575,
      -0.057498783,
      -0.02033812,
      0.03295684,
      0.069961086,
      -0.030345973,
      -0.012323441,
      -0.055060476,
      -8638103e-9,
      -0.057759598,
      0.048069455,
      -0.041393258,
      -0.023696207,
      -0.06275091,
      0.027482426,
      -0.018289108,
      -0.0052633667,
      -0.06434769,
      0.06979653,
      -0.018555196,
      -0.03602022,
      -0.021967184,
      -0.013077897,
      -0.027057774,
      0.020546727,
      -0.013897571,
      0.049007755,
      0.0710716,
      -6275497e-9,
      0.015247708,
      0.0059491266,
      0.0065700356,
      0.018856673,
      -0.063933834,
      -0.03181981,
      0.012158227,
      5248303e-9,
      0.074303575,
      0.0011862954,
      -0.027942916,
      0.033572875,
      -0.012178815,
      -0.039053023,
      0.06597728,
      0.01706987,
      0.015495415,
      0.02036292,
      0.03313067,
      -0.034779005,
      0.03845178,
      0.0518643,
      0.05402216,
      -0.024156833,
      -5183462e-9,
      -0.0058290213,
      0.0074587185,
      -0.01090121,
      -0.019921191,
      -0.065651454,
      -0.03885439,
      -0.049850564,
      0.03897374,
      -0.08443051,
      0.015633473,
      -0.07743298,
      0.013957797,
      -9603826e-9,
      0.0061532157,
      -0.01059069,
      -0.024290036,
      -0.060663734,
      0.078123376,
      -0.01881713,
      -0.062929496,
      -0.025353288,
      8167951e-9,
      -0.02662443,
      0.08690239,
      -0.015054686,
      0.024161723,
      -0.035658255,
      0.01830887,
      0.0061878585,
      -0.0214131,
      -995599e-8,
      -0.049860243,
      0.027798299,
      -0.01613363,
      -0.011049153,
      0.028118363,
      -0.06953531,
      0.024490716,
      9074568e-9,
      -0.037240572,
      0.023430265,
      0.0018684265,
      0.051611576,
      0.023201669,
      -0.03143135,
      -0.0086814575,
      0.0052650664,
      0.0015275613,
      0.046790704,
      51365193e-11,
      -0.019619118,
      -0.019171227,
      0.06559222,
      0.043618385,
      0.032654017,
      9327526e-9,
      -0.030919565,
      0.025153324,
      -8214528e-9,
      0.043139435,
      0.04522211,
      0.017917305,
      4850751e-9,
      -0.013277733,
      -0.022138942,
      -0.025905771,
      0.027208071,
      9246879e-9,
      0.02558564,
      -0.018204145,
      0.0765605,
      -0.026310815,
      0.054510918,
      0.0045032795,
      -0.018166158,
      0.015164492,
      4046408e-9,
      0.019652784,
      -0.027392222,
      0.060959537,
      -58828737e-11,
      -0.02401437,
      0.05862092,
      0.054531515,
      0.025536943,
      0.021353098,
      -0.037418015,
      -0.04620395,
      -0.07615605,
      0.027024973,
      0.02828195,
      9936004e-9,
      6708624e-9,
      8780484e-9,
      0.057969518,
      -0.05355478,
      -0.04318295,
      23984486e-11,
      -0.036314297,
      0.035483032,
      -0.018747097,
      -0.021852763,
      -0.028360475,
      -0.016013952,
      0.0027653028,
      0.06400597,
      6748641e-9,
      0.033879645,
      -0.06438821,
      -0.029854028,
      -5643342e-9,
      0.028065152,
      -0.016565967,
      0.0031935947,
      -0.016556405,
      -0.0292402,
      -8635718e-9,
      0.034196507,
      0.023446243,
      -0.0057631787,
      -0.024666958,
      0.014381956,
      -0.037007757,
      0.03674028,
      -0.03194286,
      -0.036129177,
      -0.014285097,
      0.09087313,
      5915097e-9,
      -0.023183709,
      -0.05489225,
      0.03612634,
      -0.06004541,
      0.020952232,
      0.028333293,
      -0.078887634,
      -0.0280671,
      0.0567564,
      0.058958877,
      0.025359431,
      0.0134268785,
      0.018245565,
      -0.021056503,
      -0.043379616,
      -0.014224128,
      -0.0118252495,
      0.030464223,
      0.06186554,
      0.04649748,
      -0.03354065,
      0.037934437,
      -0.035005387,
      -0.0011669213,
      -0.08194575,
      0.01102559,
      -0.012059103,
      0.03906384,
      -0.054269418,
      -0.025356181,
      -0.04543468,
      0.05027891,
      0.04228233,
      -0.01660406,
      0.032989834,
      -0.01694358,
      0.08268648,
      0.044093546,
      7377075e-9,
      -0.010396228,
      0.027837649,
      -0.0052682506,
      0.0053459527,
      -0.0014041194,
      -0.070457496,
      0.0039284048,
      0.08694263,
      -0.027526136,
      8759211e-9,
      -0.013880174,
      -0.0696377,
      0.02484658,
      0.024383174,
      0.010593948,
      0.027635949,
      0.0055724327,
      0.11213128,
      -0.042337675,
      0.07791648,
      0.039206706,
      0.050648548,
      -0.018205676,
      -0.04202538,
      -0.011802625,
      -0.0016149072,
      9353675e-9,
      0.04808817,
      -0.01612991,
      -0.027139422,
      0.0353392,
      -4736114e-9,
      0.034484155,
      -0.0131527865,
      0.039527748,
      0.034831394,
      0.028437948,
      -0.011189667,
      -0.028132439,
      8339931e-9,
      8621213e-9,
      -22784e-8,
      -0.0114299515,
      0.0056344857,
      -0.046371587,
      0.0019950964,
      -0.017162506,
      -0.040565223,
      0.017984172,
      -95475896e-11,
      0.0019276221,
      -0.0026002976,
      0.017978616,
      -0.013572388,
      -44883165e-11,
      -0.06605551,
      -0.015106162,
      -0.030734392,
      0.042965375,
      0.011223934,
      0.0822581,
      0.02663776,
      0.017091544,
      -0.035547815,
      0.029269531,
      -0.053622313,
      0.033095617,
      0.039125085,
      -0.013790972,
      0.05157438,
      -3744846e-9,
      0.029901823,
      -0.02393255,
      -0.019724682,
      -6103489e-9,
      0.041866083,
      -6476784e-9,
      -0.016576275,
      0.014357795,
      -0.015737673,
      -0.032667316,
      -0.030823056,
      3912289e-9,
      -0.03137725,
      4909348e-9,
      0.038919494,
      -0.0057892576,
      -0.012972904,
      -0.07753799,
      9589296e-9,
      0.011592407,
      7883187e-9,
      7531697e-9,
      -0.08516834,
      -0.049614444,
      0.053049255,
      6821616e-9,
      4382995e-9,
      0.0076321503,
      0.055784184,
      0.010572951,
      -0.022996645,
      -0.0057050656,
      0.039502256,
      -0.023970343,
      0.022977188,
      -0.015459222,
      0.0016028848,
      0.06293256,
      -0.053298548,
      0.039328255,
      -0.03454016,
      0.01594986,
      0.022340732,
      0.04408579,
      0.02439261,
      -0.014142596,
      -0.023282781,
      0.03170493,
      -0.013435423,
      0.020008136,
      0.04454857,
      -0.02450815,
      -6845445e-9,
      -0.0139257945,
      -5317987e-9,
      0.013738604,
      -0.018191313,
      -0.0037913912,
      -0.020356305,
      0.012171588,
      -0.01959513,
      0.08489917,
      0.01794887,
      0.01226452,
      0.014352562,
      6706981e-9,
      -0.014457558,
      -0.036247253,
      0.013869984,
      -0.020270336,
      -0.010718552,
      564375e-8,
      -0.06438407,
      0.01501181,
      0.01938886,
      -0.033626635,
      0.033192463,
      0.011689163,
      0.036101274,
      0.017125208,
      -0.04557421,
      0.039272927,
      0.05187207,
      -711864e-8,
      -0.048677582,
      0.022374175,
      0.038451143,
      -0.013605034,
      -0.06285527,
      -0.04092185,
      0.041834574,
      -0.015238066,
      -0.054370385,
      0.0212087,
      -0.0019385897,
      -0.025814895,
      -0.073813185,
      0.040778045,
      0.037142724,
      -0.015102984,
      0.034466527,
      -0.055213008,
      -0.054568276,
      -0.023869477,
      -0.010986562,
      -0.02204498,
      0.06287006,
      0.051619075,
      0.038891718,
      0.018652696,
      -9242288e-9,
      0.019763246,
      8016835e-9,
      -5541121e-9,
      -0.018632228,
      -0.0066801184,
      -0.031706616,
      0.02009075,
      -0.079885066,
      -0.046562556,
      0.08277216,
      0.010398227,
      0.04405358,
      -8698973e-9,
      -0.03820643,
      8023815e-10,
      0.10685781,
      -0.03153591,
      0.035272777,
      -0.030428236,
      0.027549516,
      0.012926014,
      -0.015612204,
      0.095321156,
      0.012283767,
      0.025928074,
      -0.038515788,
      0.0040770243,
      0.016785579,
      113163536e-12,
      -0.055691868,
      0.017173992,
      0.021791859,
      -0.012964321,
      -0.032618526,
      0.0017231251,
      0.017881995,
      0.018343316,
      0.021486077,
      0.012671886,
      0.010805882,
      -0.086523585,
      -0.029265419,
      -0.02967952,
      0.057511996,
      0.030975122,
      0.015257587,
      -0.08492458,
      9955172e-9,
      0.016575806,
      0.047224645,
      0.018729743,
      -0.031351864,
      -0.033490106,
      -0.044377167,
      0.065886155,
      -0.032072444,
      -0.0046696956,
      0.0059304344,
      -0.0070429933,
      0.043851726,
      -0.041245677,
      0.053155992,
      -0.0078825075,
      -0.041808967,
      0.036548015,
      -0.04231877,
      -0.030176789,
      0.0047533438,
      8948041e-9,
      0.034036893,
      -0.036870416,
      -0.014709791,
      9604216e-9,
      9834819e-9,
      0.046586204,
      0.02900422,
      -53471717e-11,
      -0.030735265,
      -0.032517094,
      -0.021293892,
      -0.06939817,
      -0.01894033,
      851747e-8,
      -0.034560833,
      0.0034630627,
      -0.030431286,
      -0.019223955,
      2233883e-9,
      0.047024485,
      0.13019298,
      0.042490687,
      -0.02824144,
      -0.039361324,
      -0.013954366,
      -0.014603102,
      -0.07705621,
      -8562186e-9,
      -7094459e-9,
      0.0229002,
      -0.011342541,
      -0.029786656,
      -0.026945744,
      -0.036409993,
      -0.014127665,
      -0.022965534,
      -0.0019270764,
      0.030348632,
      -4852566e-9,
      7478265e-9,
      0.0104489615,
      -9382321e-9,
      -0.07735367,
      0.01647987,
      -0.044552553,
      0.011660171,
      -0.011541955,
      0.032004938,
      -18260106e-11,
      0.025550105,
      0.022765905,
      -0.028825028,
      -0.035089474,
      0.019327672,
      -0.020816151,
      0.0013752035,
      0.025817825,
      -0.03363774,
      0.07605801,
      -0.03416072,
      0.0045214156,
      -0.0044076657,
      -0.034744024,
      414349e-8,
      -8119912e-9,
      -0.0105144875,
      -8888389e-9,
      0.010959911,
      -89435966e-11,
      0.07301441,
      -0.041111715,
      0.039079037,
      -0.022197329,
      0.014927712,
      -0.0066825086,
      -0.021025954,
      -4498837e-9,
      -8002862e-9,
      0.010631825,
      -0.013471492,
      -0.014364169,
      0.04976296,
      -0.0076187057,
      0.018846774,
      0.02635855,
      -0.0135241095,
      -0.013162455,
      0.0066691423,
      4462352e-9,
      -0.0038102213,
      -0.05468838,
      0.02706948,
      7144245e-9,
      -0.01128836,
      0.035803575,
      -0.010465673,
      -0.033876546,
      0.056130372,
      0.027199037,
      -0.017496506,
      -0.018067295,
      -830663e-8,
      9884054e-9,
      0.0066172136,
      0.031944636,
      0.05892532,
      -0.0057781017,
      0.08463671,
      0.027559375,
      -0.0046409657,
      -0.027967595,
      0.012761675,
      0.01610083,
      0.024379414,
      8647442e-9,
      -0.035820175,
      0.0019087429,
      0.043198157,
      -0.0010630606,
      -0.02855228,
      -0.026768,
      -0.075065866,
      -689786e-9,
      0.011711252,
      0.07968918,
      0.0366111,
      -0.02767974,
      0.023851782,
      -0.036087222,
      -0.021920402,
      0.02526292,
      -0.01847825,
      0.024763111,
      -0.013917841,
      0.019400885,
      0.015432007,
      -0.017767856,
      -0.0026215706,
      0.036115304,
      -0.02516771,
      0.015510764,
      0.053017307,
      0.05936778,
      0.012293306,
      -6163197e-9,
      -0.03988489,
      -9592466e-9,
      0.09431288,
      -0.010078777,
      -0.0134023735,
      -0.0104796495,
      0.08469975,
      -8776509e-9,
      0.021397239,
      -0.02770205,
      -0.0231554,
      -0.012667845,
      4905557e-9,
      0.013478851,
      -0.0434296,
      -9850506e-9,
      9911434e-9,
      -0.07727923,
      -0.019623006,
      0.011897605,
      0.01729877,
      8054385e-9,
      0.016544273,
      -0.055260796,
      -0.046931,
      0.011059768,
      -0.010450909,
      0.062468983,
      0.040883847,
      -0.014842511,
      -0.029912569,
      -0.021280233,
      -8476236e-9,
      -0.024645848,
      0.07129816,
      -0.048111178,
      -0.04010613,
      -0.03759175,
      0.020985983,
      0.052201673,
      0.0065505253
    ],
    [
      -8724745e-9,
      0.0067588715,
      -0.061495394,
      -0.050580326,
      -0.035384346,
      3409514e-9,
      -0.019312447,
      0.0050064917,
      -0.0038373654,
      0.032516453,
      0.037407942,
      6802761e-9,
      0.034527846,
      0.0075088763,
      0.03940417,
      -0.0023169548,
      -0.022580687,
      -0.028974028,
      -0.050701547,
      -0.023151996,
      9942628e-9,
      0.0047368333,
      0.031673692,
      8809387e-9,
      -0.04631056,
      -0.030677104,
      -0.037492365,
      0.021153925,
      -0.043060865,
      0.015698418,
      0.062044535,
      0.041140884,
      -0.030206382,
      0.016604748,
      0.018926175,
      0.010714526,
      0.019647865,
      0.015542605,
      84750546e-11,
      -0.0522976,
      -0.027278548,
      0.026251007,
      0.023597686,
      0.025618713,
      -0.0062293857,
      -0.0014625412,
      0.016371205,
      -530999e-8,
      -0.016745226,
      0.01264209,
      -0.0056434567,
      -0.015192518,
      -0.018121017,
      0.033205256,
      -0.044192668,
      -0.04328893,
      -0.032688014,
      -0.033296313,
      0.039985094,
      0.031230856,
      0.0030922117,
      -0.037600122,
      -0.0021382174,
      -0.01715163,
      0.021432998,
      -0.09165476,
      -0.06121091,
      -0.03470502,
      -0.07458118,
      0.02522831,
      0.014541853,
      0.020549556,
      -0.043542575,
      0.020192616,
      0.0028856278,
      -0.047589406,
      0.022384446,
      0.017524112,
      -0.03169983,
      -8020646e-9,
      -0.03843939,
      0.052032303,
      66882226e-11,
      0.07515718,
      0.027215037,
      -0.012596169,
      0.06858888,
      -0.059817582,
      -0.036630373,
      8903405e-9,
      0.017248226,
      0.010670069,
      0.020198759,
      -8391105e-9,
      0.038626652,
      -0.071916044,
      -0.030868936,
      -0.022806566,
      0.10697291,
      0.024804343,
      0.026742008,
      0.022922851,
      -0.011780676,
      -0.04295511,
      -23204583e-11,
      0.030090876,
      -0.089211725,
      0.016060589,
      0.035137676,
      0.0021562225,
      -0.018100148,
      0.03370186,
      -0.0068690977,
      0.05384183,
      -0.0044397768,
      0.056530423,
      -0.024786672,
      -0.039234675,
      -0.08697006,
      0.034399446,
      -0.05346086,
      -0.030267999,
      -0.09015627,
      0.057357356,
      -0.036045663,
      0.026555216,
      -0.025443595,
      0.033499017,
      -0.04858866,
      -0.023067879,
      -0.0038889844,
      -0.02969258,
      -0.032612447,
      0.011194282,
      -0.02668194,
      0.018718697,
      0.045688704,
      0.024601353,
      -8136495e-9,
      -34184539e-11,
      0.028926319,
      0.0035928513,
      -0.08402332,
      -0.014666724,
      -0.011952046,
      0.020041412,
      -0.0049449746,
      0.014726373,
      -0.039322414,
      0.0041015004,
      80542e-7,
      -0.038913127,
      0.03030761,
      -0.03539662,
      9609024e-9,
      -0.045809597,
      0.06373383,
      -0.02569072,
      0.07281236,
      0.0075632567,
      0.053329136,
      -0.052806113,
      -0.010023461,
      -0.033471003,
      0.034903113,
      -0.027381873,
      -0.038509425,
      -0.021832572,
      -8531326e-9,
      -0.03432709,
      0.012401982,
      -3944688e-9,
      0.039137762,
      -0.039098736,
      0.01452114,
      44490985e-11,
      0.0013380169,
      -0.053389054,
      0.0019332394,
      -0.048553422,
      0.09022526,
      -0.04677583,
      8315379e-9,
      -0.0115667395,
      -0.0073184073,
      -0.015806492,
      0.016359337,
      6785472e-9,
      0.012383892,
      0.04846638,
      0.0153121,
      -0.0012595764,
      -0.016386505,
      -3879191e-9,
      0.024092615,
      0.011270008,
      -5481555e-10,
      803863e-8,
      0.0180945,
      -0.06600822,
      0.012872749,
      -0.0047641452,
      -9733085e-11,
      0.016931113,
      -0.0036065322,
      0.011342454,
      -0.028840551,
      -0.0793953,
      -0.020869425,
      -0.024120186,
      0.022008825,
      0.05479039,
      -0.018688345,
      -0.047692224,
      -0.0062528807,
      0.057449333,
      0.089367196,
      0.0062414794,
      0.01018898,
      -0.04466157,
      0.05220477,
      0.04078665,
      0.10288385,
      -0.0017581077,
      6298319e-9,
      0.038664244,
      -0.035754442,
      -6851415e-9,
      0.040232744,
      -0.040987447,
      0.015865661,
      -0.012985527,
      -0.055850998,
      0.056159183,
      -0.019217253,
      0.038518634,
      8450434e-9,
      -0.027802063,
      0.010765081,
      0.010293004,
      -0.01206596,
      0.013259524,
      -4372005e-9,
      0.033384427,
      0.054719966,
      0.07158849,
      0.0345154,
      -0.0018968183,
      2887153e-9,
      -0.05117326,
      -0.044391695,
      -6371596e-9,
      0.038286418,
      -0.042070072,
      -2855281e-9,
      -0.025932027,
      0.05837653,
      0.066960596,
      -0.047102544,
      -0.03182599,
      -0.0016801943,
      -0.020272685,
      0.027191672,
      -0.0019730015,
      -0.03793602,
      -0.04457003,
      -0.012446194,
      -0.010164515,
      0.04414122,
      -0.046065066,
      0.06357603,
      -0.017996484,
      -0.0063026296,
      -8621396e-9,
      8728438e-9,
      0.010417845,
      0.0142141925,
      0.040389583,
      -0.01298865,
      -0.02316234,
      -0.051078577,
      0.0022277718,
      0.011444624,
      0.020110188,
      0.030440288,
      -0.057496674,
      -0.0028709183,
      0.03330462,
      0.0017822718,
      0.0208791,
      0.083768964,
      0.032917187,
      0.0075294855,
      -0.0043926938,
      0.019336477,
      -0.06720373,
      0.054016277,
      0.058209,
      -0.018800598,
      0.015410342,
      0.08162644,
      0.031959176,
      0.019558622,
      -0.051564347,
      0.015203189,
      -0.041577384,
      -0.022446379,
      -6070887e-9,
      -0.039767426,
      4342716e-9,
      0.06901541,
      0.0355591,
      -8240638e-9,
      9669019e-9,
      -0.030561198,
      0.04295618,
      -0.11719601,
      -0.0025005494,
      -0.038198862,
      0.036611527,
      -0.042641386,
      0.029634107,
      -0.07831545,
      0.036950633,
      7361072e-9,
      0.0062830867,
      0.01570598,
      5195738e-10,
      0.04073969,
      0.076676965,
      -730167e-8,
      29028367e-11,
      -0.041528247,
      0.022113252,
      0.03413253,
      0.035862792,
      -0.045600887,
      8607445e-9,
      0.03734893,
      -0.018376311,
      0.038110673,
      0.014972035,
      -0.016280811,
      81069017e-11,
      -0.0045013786,
      0.021686392,
      7540839e-9,
      0.0070752804,
      0.08308679,
      9280704e-9,
      0.011489867,
      0.07521795,
      0.0071469937,
      -0.014423795,
      -0.032157607,
      -0.0067343065,
      -0.016678173,
      0.0061509437,
      0.03548982,
      -0.03755727,
      9883294e-9,
      0.059997924,
      -0.07039726,
      0.0026253972,
      -0.018393174,
      0.0033701842,
      -0.02056468,
      0.0023807462,
      -0.043612964,
      -0.02476098,
      0.0070204083,
      -0.032262295,
      -0.0017881861,
      0.014407597,
      0.016563416,
      -0.045731947,
      -0.0019001418,
      -0.019628206,
      0.01127443,
      -0.013479071,
      0.032359574,
      0.0055858446,
      0.012776936,
      0.037788402,
      0.0029642237,
      0.072589196,
      -0.042769343,
      -866105e-8,
      -144394e-10,
      0.05560897,
      0.010895829,
      0.051868953,
      -0.014260012,
      5062532e-9,
      -0.021621233,
      -0.0159024,
      -0.055693675,
      0.08180418,
      0.04023734,
      -0.014489536,
      -0.0030155203,
      0.0044674855,
      0.049984526,
      -0.028563084,
      -0.032688238,
      0.010434735,
      0.0413266,
      -0.04433107,
      -0.045872204,
      -0.081446536,
      -0.022476869,
      -0.08274362,
      -0.060204063,
      0.017076274,
      -0.043373846,
      0.016627902,
      -0.012978724,
      -12257528e-11,
      -0.027369935,
      -0.083012104,
      -0.020627944,
      0.044223726,
      -4103591e-9,
      -0.014000701,
      -0.04322526,
      -0.11851055,
      -0.0041216235,
      -0.019381467,
      -0.0065003964,
      -7952863e-9,
      0.014633225,
      -0.014829204,
      -0.046480205,
      0.052486043,
      0.0432139,
      -0.021978639,
      -0.0032951438,
      -6320132e-9,
      0.0011436997,
      3913792e-10,
      -0.0589744,
      0.0066552637,
      -0.0025437267,
      -0.011237257,
      0.04365162,
      0.04199903,
      0.051317472,
      0.0017052206,
      0.021245461,
      0.06054576,
      -0.020438185,
      -0.015737135,
      0.03674388,
      -0.041402604,
      -0.018902438,
      -0.028207978,
      0.022290543,
      0.02349509,
      -0.037447743,
      0.020320995,
      -0.033387825,
      0.0020719054,
      -8959862e-9,
      0.05005005,
      2545434e-9,
      -0.042131644,
      7993407e-10,
      0.028722554,
      -0.015811129,
      -0.017975869,
      0.0462871,
      -0.04056936,
      -0.016138501,
      -0.026641801,
      -0.019307239,
      9646956e-9,
      0.01205551,
      -0.0243147,
      0.022432182,
      -21229939e-11,
      -0.017249685,
      0.028817873,
      -0.07301171,
      0.06169383,
      0.022595149,
      -0.034269255,
      -0.033239875,
      0.0033838602,
      0.027365379,
      -0.026269814,
      -0.052493088,
      0.014292924,
      5578844e-9,
      -0.0058851587,
      -0.057685193,
      0.023868257,
      0.029345568,
      -0.021447903,
      -0.035955213,
      -0.022755114,
      969503e-8,
      0.010137414,
      -0.02369319,
      -0.033208925,
      -0.052296385,
      2417712e-9,
      -0.027774287,
      6932303e-9,
      0.022902198,
      0.05628247,
      0.02917915,
      0.02094827,
      -0.014483344,
      -0.015193959,
      -0.016981533,
      -0.0064669177,
      -0.023397762,
      -0.03005904,
      -0.051518805,
      -0.0028092058,
      -0.06960577,
      -0.012227005,
      0.04548015,
      0.026881056,
      0.05302469,
      -0.048156906,
      8063671e-9,
      0.033931833,
      0.06160423,
      -0.014853819,
      0.06113456,
      0.023804044,
      0.031335413,
      -0.0063801357,
      -9666064e-9,
      0.08960661,
      -0.0127782235,
      0.020426264,
      -0.01355687,
      0.026778659,
      -0.045686528,
      -0.0023757597,
      -0.06651815,
      0.049964547,
      0.04146805,
      0.03005943,
      -0.031142134,
      0.0011206215,
      0.0071508745,
      0.034940742,
      0.029321766,
      0.02463752,
      0.012988643,
      -0.07911029,
      -0.02386311,
      4120613e-9,
      0.06279322,
      -467751e-9,
      0.015267668,
      -0.08427926,
      -0.01548474,
      0.014982002,
      0.04726207,
      0.014931463,
      9284324e-9,
      9936342e-9,
      -0.03457067,
      0.05101403,
      -0.07334281,
      -0.039479725,
      692388e-8,
      -0.01632532,
      0.014466018,
      -0.010719838,
      0.062007286,
      -0.0143264085,
      -0.03488973,
      0.028753906,
      -249696e-8,
      -0.034637682,
      0.028995432,
      0.06119952,
      0.0865844,
      0.017477918,
      -0.07021324,
      -8931336e-10,
      -0.019586783,
      0.028875059,
      0.04563805,
      3097714e-9,
      -0.05309485,
      -0.077501275,
      0.011770752,
      -0.06580983,
      0.028629823,
      -0.013231709,
      -0.02509162,
      0.013891012,
      -0.014730335,
      -0.04054969,
      0.0024470263,
      0.06780335,
      0.061428774,
      0.08817401,
      -7805811e-9,
      0.011334289,
      -0.018101877,
      -0.042973123,
      -0.04701793,
      0.0114459535,
      0.06479822,
      0.027745692,
      -0.05342787,
      -0.024073806,
      -0.0065130787,
      75996366e-12,
      0.012724292,
      0.02037157,
      7443546e-10,
      0.035885345,
      0.018887585,
      0.0105043445,
      0.020490823,
      -0.045360837,
      -0.0489353,
      0.043639842,
      -0.034476385,
      0.016090302,
      0.015706427,
      0.013594845,
      0.020330898,
      3156516e-9,
      0.022046331,
      0.049281914,
      -0.014293619,
      0.014003605,
      -0.066588975,
      0.011053431,
      9844278e-9,
      -0.0160107,
      9574396e-9,
      0.0011431393,
      0.0154046845,
      0.039660852,
      -5327213e-9,
      0.037444863,
      -9422383e-9,
      -0.017461687,
      -0.0358569,
      -0.0028599864,
      -0.036372643,
      0.029340254,
      -0.038566425,
      0.010193075,
      -28428948e-11,
      0.0016403053,
      -0.027008824,
      0.024059452,
      0.025831055,
      9008672e-9,
      -0.011502189,
      -0.0036957145,
      0.04151523,
      0.016124599,
      -0.017506754,
      -0.0051531373,
      0.0091726845,
      -0.014782312,
      -0.02543057,
      -0.0071575474,
      0.027426587,
      -0.015601394,
      -0.06874752,
      0.031401765,
      -0.021791594,
      7923561e-9,
      0.02719038,
      0.0025593725,
      -0.013899554,
      0.083727874,
      4918566e-9,
      -0.041634504,
      -0.021320611,
      -0.03948816,
      0.013381876,
      0.025623798,
      0.027309194,
      0.02780458,
      -0.05964387,
      0.0521821,
      0.0044854754,
      -0.04836996,
      -0.0140802,
      0.04063528,
      -0.010089463,
      0.0316626,
      0.022977406,
      -5264059e-9,
      -0.037086423,
      0.04211525,
      -0.048624504,
      -0.0113941375,
      -0.05234048,
      -0.06889891,
      0.023124939,
      -0.010413289,
      0.09009604,
      0.05214193,
      -0.014051073,
      -0.013492271,
      -0.044315945,
      -0.076222315,
      0.038687155,
      -0.015159986,
      0.039873186,
      0.019283095,
      0.019771757,
      -0.01248899,
      0.022783821,
      0.023854468,
      0.029549537,
      -0.03547541,
      0.01563216,
      0.0967767,
      0.021714061,
      0.036781672,
      -0.018435368,
      -0.039854035,
      -0.012931018,
      0.12588859,
      -0.026573658,
      -0.02870233,
      -9183645e-9,
      0.092479736,
      -0.011182511,
      -8779227e-9,
      -0.035881188,
      -0.01437332,
      -0.011640609,
      -4518742e-9,
      0.042400274,
      0.03906828,
      -0.082487024,
      -0.02813903,
      -0.06998914,
      -0.0041736187,
      0.016011156,
      0.0038918126,
      -0.02050345,
      -0.034289844,
      -0.07138562,
      -4147348e-9,
      -0.011875746,
      -0.03458271,
      0.044568945,
      0.04251873,
      0.025468642,
      -0.039488237,
      0.043585926,
      7440203e-9,
      -0.04378854,
      0.051449813,
      -0.028524276,
      -0.020066189,
      -0.027889524,
      0.05065566,
      0.03188669,
      8029254e-9
    ],
    [
      -0.04670875,
      0.052250564,
      -0.047112104,
      -0.033600386,
      -0.03673254,
      -5108529e-9,
      0.012997677,
      -0.05063873,
      0.06069907,
      0.031290554,
      0.029988276,
      0.02466324,
      0.02510682,
      -9290862e-9,
      0.052130133,
      -0.0449014,
      0.0688624,
      0.017585808,
      -0.02933502,
      -0.04466592,
      0.047420092,
      -0.023808785,
      0.011361649,
      0.060481783,
      -0.0013474667,
      3756443e-9,
      -0.061533146,
      -0.012471027,
      0.0062037045,
      -0.055023607,
      0.019367373,
      0.048571777,
      0.021243406,
      7383921e-9,
      -0.01562143,
      0.0023489888,
      6295541e-9,
      0.033006925,
      -0.047094848,
      -0.048279315,
      -0.051281724,
      0.031308178,
      0.0196381,
      -0.025518302,
      -0.03855543,
      -0.051547863,
      -0.0034628434,
      0.06645235,
      -0.05103937,
      0.042700045,
      -0.0015099526,
      -0.028135497,
      0.023701226,
      0.0085593825,
      -0.014542388,
      -0.042277675,
      0.012144337,
      -0.027180465,
      -0.024372272,
      0.03372977,
      -0.016221233,
      -0.04341788,
      0.024256354,
      -0.043616008,
      -0.0090537025,
      -0.021996275,
      -0.061654404,
      -0.0042136577,
      -0.038660686,
      0.0030012052,
      -0.03568524,
      0.049536873,
      -0.05740929,
      0.0026216467,
      0.010912666,
      -9731848e-9,
      0.0034610755,
      866571e-8,
      0.06535026,
      0.07039964,
      -0.019673623,
      0.05374897,
      0.014710342,
      0.05288867,
      -0.03422926,
      -0.015480638,
      0.011786431,
      -0.07379565,
      -0.0366096,
      -0.0019610825,
      0.034034263,
      0.016515672,
      -0.012385611,
      -0.018047731,
      0.04224088,
      -0.023983464,
      -0.032196406,
      -0.051540688,
      0.13700657,
      0.03387339,
      -0.048085574,
      -0.029150914,
      -0.027314797,
      -0.043623038,
      -0.028186731,
      0.028655708,
      -0.08363146,
      -0.0032674773,
      9072071e-9,
      0.016217824,
      -0.03100716,
      -0.015630333,
      0.0038560668,
      -0.042057335,
      -0.017320994,
      -0.0032721334,
      -0.03234584,
      0.024358124,
      -0.07396829,
      0.02502381,
      -0.021234509,
      -0.0367582,
      -0.02855485,
      0.08959025,
      0.023792978,
      0.023894064,
      -0.05585947,
      -8377814e-9,
      -0.04680657,
      0.012251553,
      -0.0075802044,
      -0.015754785,
      -0.022093372,
      0.036813475,
      -0.044143084,
      0.014599634,
      0.028865032,
      6823275e-9,
      0.013848138,
      0.028364068,
      0.027350327,
      -0.013633525,
      -0.021290205,
      0.06365172,
      0.06512396,
      0.031305667,
      0.040591408,
      0.08264107,
      0.035810847,
      0.0038050497,
      0.045247898,
      -0.022773262,
      0.022119971,
      -0.012546615,
      -0.0019046016,
      9818493e-10,
      0.015855223,
      0.018141806,
      0.010262704,
      -0.038772378,
      0.08950502,
      -0.029274177,
      -0.013802362,
      -0.017529672,
      -0.034742054,
      -0.0086525725,
      -0.0045243646,
      -0.016295796,
      -0.037369445,
      -0.03865092,
      0.0206456,
      -0.07844536,
      -0.08504126,
      -0.02001659,
      0.016240027,
      -0.0064077526,
      -0.021761289,
      -0.06282092,
      0.034315836,
      -9260272e-9,
      0.065609224,
      0.031486597,
      -82829973e-11,
      -0.017228736,
      -0.0015111512,
      -0.028916197,
      0.019474695,
      -0.019158974,
      0.053699065,
      0.02816456,
      -0.015265479,
      9548252e-9,
      -0.064881206,
      0.04354677,
      -0.07176551,
      -0.01822811,
      -1566753e-9,
      0.0026180102,
      8029715e-9,
      -0.07113161,
      -0.029918794,
      -0.04835356,
      -3203484e-9,
      0.03744861,
      0.0021848553,
      -4372546e-9,
      0.025155185,
      0.024657631,
      -0.018320361,
      -0.071520664,
      0.07310258,
      0.014374768,
      -0.03265373,
      -0.032466646,
      0.020748083,
      0.020207059,
      0.049482767,
      0.020134388,
      0.0553755,
      0.0028088968,
      -0.0067450665,
      0.012910773,
      0.07838169,
      0.019522345,
      -0.025123293,
      -0.022696102,
      -0.011384175,
      0.0015294629,
      0.044497203,
      -0.0093156155,
      -0.0015045349,
      9470378e-10,
      0.023105582,
      0.048305277,
      -0.013386762,
      0.050372817,
      -0.028547257,
      -0.025220616,
      0.055020005,
      0.01831637,
      0.05837947,
      -0.049612924,
      0.12308608,
      0.025192356,
      0.1021877,
      0.061903138,
      0.014045369,
      0.020983387,
      0.016455168,
      0.018131504,
      -0.01985638,
      -0.02116807,
      0.014258713,
      -3344023e-9,
      -0.035288777,
      -0.022870116,
      0.039514437,
      4120204e-9,
      -0.017214127,
      -0.036865346,
      -5580744e-9,
      -0.042375553,
      0.02149027,
      -0.056044646,
      -0.0022084983,
      -0.037293468,
      -0.029545628,
      0.0127549125,
      0.065627806,
      -0.020564036,
      0.024772065,
      -0.06777284,
      -8379632e-9,
      -0.021915946,
      0.0047315364,
      19238858e-12,
      -0.013567875,
      -0.0096000405,
      0.028229361,
      -0.04308262,
      0.064173646,
      -0.023132743,
      6850793e-9,
      -4274269e-9,
      0.012402324,
      -0.025254244,
      -0.04140167,
      -0.024203613,
      -0.065490134,
      0.024038818,
      0.02283405,
      0.055415418,
      -0.017342906,
      0.0054846606,
      86145796e-11,
      -0.02764873,
      0.045372393,
      0.06275036,
      -0.04832591,
      -0.027657239,
      0.09674934,
      0.05153847,
      -0.028005173,
      0.0236342,
      -0.027411973,
      -0.027698673,
      0.013049834,
      -0.016779266,
      0.011310152,
      -0.0045352113,
      0.01866857,
      0.04886903,
      -0.07188914,
      -0.032792136,
      -0.04403336,
      0.014955628,
      -0.110152006,
      -0.03898017,
      -0.046807416,
      2117887e-9,
      -0.023120623,
      0.03506067,
      0.011526945,
      0.039448682,
      0.04030046,
      0.018683845,
      -0.0019462245,
      -0.013580196,
      0.037622884,
      0.04365378,
      -5843083e-9,
      -0.018382879,
      0.0069295075,
      -0.032970287,
      0.053394243,
      0.030708503,
      -0.019944968,
      0.017276078,
      0.03749543,
      -0.033679314,
      0.0050682076,
      0.03485643,
      0.0037532616,
      0.045000985,
      0.02612307,
      -0.020376666,
      0.06388376,
      -0.0032317822,
      0.06482845,
      -0.06572347,
      0.044661276,
      0.0048458003,
      0.07560998,
      0.0035578709,
      0.013556819,
      -0.0041070203,
      0.028168177,
      0.038528923,
      -0.021725973,
      0.011116747,
      -89069246e-12,
      0.03423637,
      0.04739331,
      -0.03697985,
      -0.04569343,
      0.040272433,
      8707356e-9,
      0.07637361,
      -0.03251766,
      2680341e-9,
      -8411436e-11,
      -0.04300082,
      -0.013374736,
      0.011333033,
      -0.0014509775,
      4516775e-9,
      -0.060823582,
      93177974e-11,
      -0.0276492,
      0.028401626,
      0.0032742445,
      -42300095e-11,
      -2612107e-10,
      0.054420147,
      0.0062401136,
      0.022039304,
      -0.035571773,
      -0.02402478,
      4896097e-9,
      0.0072784754,
      0.01142449,
      0.022557205,
      0.03567069,
      0.017943703,
      0.016685601,
      0.021563962,
      -0.04303276,
      0.03611979,
      0.03528549,
      0.015048143,
      -25615696e-11,
      0.02061262,
      0.0064342534,
      -0.011021289,
      373449e-8,
      -0.0016446823,
      0.012255454,
      -0.02677007,
      0.035693098,
      -0.028044378,
      -0.012336576,
      0.0074121184,
      -0.10100983,
      0.030435758,
      0.013780138,
      -0.029201144,
      0.063649006,
      -0.024509534,
      -0.01122036,
      -0.01684226,
      4132757e-9,
      0.033255488,
      0.020014413,
      0.041937336,
      -0.046498753,
      -0.05217815,
      0.020619916,
      -8775363e-9,
      0.014013264,
      -9173304e-9,
      0.06889779,
      0.023172513,
      0.0027951833,
      -0.0079382695,
      0.04570326,
      -2386963e-9,
      1780546e-9,
      -0.028352657,
      -0.040000144,
      0.040187705,
      -0.03431094,
      0.030528083,
      0.021432238,
      0.025415953,
      0.054548718,
      0.055593025,
      0.074452184,
      0.029904129,
      -0.0034864333,
      0.037016064,
      -930966e-8,
      -0.015732363,
      0.04648049,
      -0.030469792,
      0.014695416,
      0.015781388,
      5266407e-9,
      0.07623003,
      0.028227523,
      473787e-8,
      0.026122358,
      -0.013518225,
      -0.016295513,
      0.034450423,
      0.04855621,
      980489e-8,
      -9242986e-9,
      0.030105753,
      -0.04707111,
      -0.04537811,
      0.061866265,
      -0.027316723,
      -0.013472248,
      0.023478016,
      -0.020921832,
      0.04373654,
      0.032902498,
      0.0036334891,
      0.03727429,
      -0.0072669243,
      0.049076546,
      0.027561842,
      -0.07694739,
      0.07125768,
      0.049593277,
      -0.01254472,
      0.0061540087,
      0.0039097345,
      0.019763464,
      0.012525538,
      -0.07934407,
      0.03493966,
      -0.022820566,
      -0.01671618,
      -0.026412165,
      0.013475103,
      0.0013835286,
      -7706938e-9,
      -0.061186824,
      0.045891102,
      -0.012344557,
      0.035092052,
      -0.031002581,
      3388883e-10,
      -0.0450432,
      0.0329827,
      -0.056330945,
      -0.031395447,
      0.078775294,
      6624769e-9,
      0.013361123,
      0.028866759,
      -0.022324856,
      0.040833034,
      -0.023839377,
      -0.071443826,
      -0.015968205,
      5888071e-9,
      -0.011789313,
      -45832427e-11,
      -0.06622266,
      -0.017067762,
      0.06603244,
      -0.019687802,
      0.013738046,
      0.01422063,
      -9721904e-9,
      0.020590756,
      0.13800332,
      -0.03995256,
      746487e-8,
      0.0025721532,
      912134e-8,
      0.054909818,
      0.021620803,
      0.028479882,
      8937887e-9,
      -0.027532808,
      -0.042331237,
      0.041191272,
      -0.030072525,
      0.010286103,
      -0.013212493,
      0.023554223,
      0.06180879,
      -0.013899025,
      -0.0086536445,
      0.024128173,
      0.044477478,
      8965624e-9,
      6302453e-9,
      -0.010746014,
      9611685e-9,
      -0.083884105,
      -0.04799645,
      -0.017002841,
      0.039276306,
      0.041432776,
      -0.02748575,
      -0.025687862,
      0.014854262,
      0.03868383,
      0.06211811,
      -0.0068846974,
      -9423138e-9,
      -0.01650255,
      0.019224377,
      0.108407155,
      -0.025546473,
      0.034907304,
      0.02441143,
      -0.026475891,
      0.044962265,
      -3142859e-10,
      0.021945845,
      0.0021557822,
      -3806614e-9,
      0.032050133,
      -0.06540587,
      -0.06881007,
      0.01581604,
      -0.021618124,
      0.022963414,
      0.03326722,
      -0.0105935335,
      5972703e-9,
      0.025199702,
      0.054363295,
      0.031733725,
      -14994305e-11,
      -0.03440841,
      -8667612e-9,
      -0.056954876,
      -2227274e-9,
      -6582222e-9,
      0.046928532,
      0.017996464,
      -0.012532234,
      0.028750641,
      -0.030858051,
      -0.048562024,
      0.023338344,
      0.048391387,
      0.06868794,
      -0.0355461,
      -0.021531167,
      -0.01826993,
      -0.011561756,
      0.025038306,
      -0.03936051,
      -0.044916425,
      0.032537337,
      -0.045921594,
      -0.0066168136,
      -0.054067023,
      -0.048553746,
      -0.04224724,
      0.033993166,
      9909062e-9,
      0.056871947,
      -0.020263316,
      -0.0021454399,
      -0.032121003,
      -0.044677045,
      -0.036780354,
      -0.016311442,
      -0.055915855,
      0.053094387,
      598701e-8,
      -0.014547788,
      0.025792519,
      0.027076326,
      -0.0039250413,
      12622125e-11,
      -0.056619167,
      0.029830087,
      0.030437715,
      947712e-8,
      0.019330524,
      -0.033090074,
      0.0117806075,
      -0.066474885,
      0.029856967,
      0.030709574,
      -0.043766644,
      0.07955594,
      0.025102634,
      -0.0061776782,
      -0.038510796,
      0.07782213,
      -0.021075826,
      0.011997086,
      -0.053073663,
      0.016588014,
      7737694e-9,
      -0.031434454,
      -0.071823806,
      -0.025629172,
      5176336e-9,
      -0.010121952,
      -0.021793853,
      979538e-8,
      -0.014012295,
      8493912e-9,
      0.012120929,
      0.03147708,
      -0.031563345,
      0.0068147522,
      0.0064841183,
      -0.012669271,
      7936778e-9,
      -0.010874014,
      -0.018809777,
      -0.024804996,
      0.052268878,
      8159811e-9,
      0.0426627,
      0.033057164,
      9165641e-10,
      0.031783126,
      0.021665968,
      0.014424736,
      -92532125e-11,
      -0.046477094,
      0.05112523,
      0.038116783,
      0.023986438,
      0.020851785,
      -0.043237243,
      0.06681001,
      0.0058477246,
      0.0071340725,
      0.0073362947,
      -0.041814093,
      -0.028899256,
      0.074250974,
      -0.020962425,
      0.0499212,
      -0.027845759,
      -0.0071781008,
      -0.015972087,
      0.024341503,
      9277975e-9,
      -0.010718472,
      0.031621166,
      -4290299e-9,
      0.05056749,
      0.016018404,
      -0.0207572,
      0.011810815,
      -0.06966564,
      -0.037220623,
      0.017822199,
      -0.015970761,
      -3450519e-9,
      -8469058e-9,
      -691805e-9,
      5459719e-9,
      0.03360684,
      0.020153131,
      0.020283751,
      8700134e-9,
      0.033678688,
      0.03007143,
      0.05186051,
      0.012469371,
      -0.019099664,
      0.011496068,
      -0.018216172,
      0.085960925,
      -0.07005182,
      0.03839863,
      -0.024891982,
      0.031230161,
      -0.0028119623,
      0.023793655,
      -0.014031918,
      -0.018306885,
      -0.013868721,
      0.0021808424,
      0.037372988,
      0.019305205,
      -0.03481274,
      -0.013258922,
      -0.02720931,
      0.027765496,
      -3562423e-9,
      8603344e-9,
      0.054972254,
      6641487e-9,
      -0.047896575,
      -0.031257123,
      -0.016879492,
      0.017727163,
      0.05342882,
      -0.02014204,
      -0.030797243,
      -0.043879118,
      -0.0025432114,
      0.07570632,
      -0.0903413,
      0.03793169,
      2665515e-9,
      -0.026871484,
      -0.01381774,
      0.015978234,
      0.044770103,
      -0.0029876202
    ],
    [
      0.021114955,
      -0.010814707,
      -0.025738176,
      -0.07424806,
      44756895e-11,
      0.062693626,
      -0.02190643,
      -0.042343184,
      0.028910264,
      0.054298732,
      0.014669997,
      -0.040735763,
      0.09193931,
      -0.011064165,
      870438e-8,
      91829634e-11,
      0.04137922,
      0.030986182,
      -0.03149221,
      -0.022354554,
      64707146e-11,
      -0.048195593,
      0.032837573,
      0.020021014,
      -0.060371395,
      -0.055113647,
      -0.012950156,
      0.044343237,
      -0.07285699,
      4391994e-9,
      0.017009236,
      -9169706e-9,
      0.04682184,
      0.020515569,
      0.057337034,
      35637422e-11,
      -0.0037048084,
      0.01404184,
      0.0574988,
      -0.019414967,
      -0.017432917,
      0.0013096145,
      -0.027871538,
      0.06356976,
      -496257e-8,
      0.0020339757,
      0.05894047,
      0.022568984,
      -0.0023688711,
      0.023245435,
      0.0049325423,
      -8700699e-9,
      -0.04145799,
      -2584264e-9,
      -0.05843768,
      -0.070889115,
      -0.05208018,
      -0.035520677,
      0.06430485,
      -0.035121832,
      -0.0076892963,
      0.023010751,
      -0.026088124,
      -0.013341605,
      0.020345004,
      -0.04674212,
      -0.029132163,
      -0.048142232,
      -0.051184073,
      -0.023047682,
      -0.028130563,
      0.025570828,
      -0.08676309,
      -0.014080958,
      -830063e-8,
      -0.05567229,
      0.03540009,
      -0.028118687,
      4603174e-9,
      0.019967824,
      -0.010122389,
      -0.012007154,
      0.028914215,
      0.057848748,
      -0.07579287,
      -0.033386536,
      -0.013286235,
      -0.012563034,
      -9460033e-9,
      0.04839426,
      -0.0033746585,
      -0.052795254,
      0.0010811676,
      -9381041e-9,
      5393975e-10,
      -0.020021528,
      -0.040443797,
      -0.026705477,
      0.09879981,
      0.028516779,
      -0.010192375,
      -8622056e-9,
      9205194e-9,
      -0.0034155832,
      0.0058066957,
      0.010935806,
      -0.01963187,
      -0.09753245,
      -0.023187479,
      4745072e-9,
      -0.0367988,
      -0.026611988,
      0.01206622,
      0.014718762,
      -0.04887465,
      0.061694905,
      0.024749413,
      -0.0031603177,
      -0.025499098,
      -0.027434457,
      0.0062202234,
      0.015497703,
      -0.06484253,
      0.021315755,
      0.031206582,
      0.054928005,
      -0.042359676,
      0.012483356,
      -0.04426838,
      -0.0064754025,
      -0.010311561,
      -0.04590806,
      0.047153972,
      -0.015679598,
      -0.08795115,
      65237086e-11,
      0.05619238,
      0.0052770046,
      0.028116733,
      0.018361378,
      0.047182683,
      0.0307126,
      -0.043265868,
      7141456e-9,
      0.042124536,
      0.0029248868,
      -0.018383957,
      -0.019080501,
      0.014639593,
      0.0054845545,
      -9829357e-9,
      0.0072416407,
      -0.022169108,
      0.010245669,
      0.015992342,
      5308762e-9,
      8755734e-9,
      -0.07558368,
      -0.0015083636,
      -0.039193038,
      -0.024924953,
      -0.06215737,
      0.06746698,
      3997691e-9,
      -0.05641497,
      -0.028628333,
      0.0013479056,
      -0.07765011,
      0.021338837,
      -2154341e-9,
      0.043290816,
      -0.03766629,
      -0.07417194,
      -0.11272702,
      0.0165435,
      9014556e-9,
      0.027190277,
      0.06514682,
      -0.016344301,
      -0.055836294,
      0.055493712,
      -0.089123785,
      0.03563767,
      -0.038482543,
      -0.014473094,
      0.064486586,
      0.06747826,
      -0.041616842,
      0.028364468,
      -0.033456434,
      -0.05987743,
      0.018976033,
      8280249e-9,
      0.051169205,
      -0.018765036,
      0.0111453505,
      -0.046705134,
      -0.02108711,
      -0.046234567,
      -0.0019527375,
      0.06972281,
      0.04767844,
      -0.025735745,
      0.01691113,
      0.047240198,
      0.03736235,
      -0.03252705,
      -0.017207773,
      0.0070018503,
      -0.027915321,
      0.0023819488,
      0.026433188,
      37217812e-11,
      -0.07015732,
      0.0059044855,
      -0.0150794415,
      0.030940559,
      0.045520063,
      0.11670538,
      0.012860204,
      -0.014009496,
      0.022956053,
      -9961196e-9,
      0.030446647,
      0.013474751,
      -0.0040572844,
      -0.0376289,
      -0.071834676,
      0.014863602,
      -0.053801067,
      0.086438894,
      -0.059628304,
      0.012934222,
      0.050908636,
      -0.022978794,
      0.019741673,
      0.05355165,
      -0.0013961073,
      -8869005e-9,
      0.0023947917,
      -0.010726187,
      8699011e-9,
      0.014752719,
      0.0069016903,
      0.042282414,
      -4677312e-9,
      0.0010740643,
      -7130559e-9,
      -5874654e-9,
      -0.025505332,
      -0.04859964,
      -0.03288078,
      0.024785077,
      3753394e-9,
      -0.04124941,
      -0.015573183,
      0.029244022,
      -5702773e-10,
      -0.011080474,
      0.016526476,
      0.0161379,
      -0.0224056,
      0.02961473,
      0.0016829812,
      -8346021e-9,
      18243192e-12,
      -0.0011406175,
      0.052285023,
      0.07542869,
      0.016031701,
      -0.031182269,
      5717768e-10,
      -0.0050627207,
      -8819576e-9,
      0.03984349,
      -4711883e-9,
      -0.024966616,
      -0.019001303,
      -0.044799525,
      -0.028110052,
      -0.0031862108,
      0.019595506,
      8611692e-9,
      -0.0104362415,
      0.038526554,
      0.016488556,
      0.025506182,
      0.0088025285,
      -0.02428037,
      0.0050430195,
      0.0788732,
      0.048177425,
      0.013057671,
      0.016917508,
      -25774105e-11,
      -0.063074484,
      -0.03364423,
      0.010336689,
      0.06162744,
      0.04655191,
      0.03956135,
      0.10981557,
      0.0072279186,
      -0.06345841,
      0.046611816,
      0.0045690364,
      -0.0032302826,
      0.010955093,
      -0.070857145,
      0.0208703,
      0.056613185,
      0.096940555,
      -0.038395427,
      -0.019079007,
      -0.020932205,
      23549523e-11,
      -0.1303774,
      6874079e-9,
      0.04036279,
      0.027963385,
      -8795369e-9,
      0.03487985,
      -0.015129609,
      -0.02912207,
      -0.04618387,
      0.049215447,
      0.0066471794,
      0.01315505,
      9950227e-9,
      -0.013480069,
      0.0105055105,
      0.049392648,
      -0.011908071,
      0.0068415846,
      0.019637343,
      -0.01272593,
      -0.056584097,
      0.0014151897,
      0.046376128,
      -0.0013688195,
      0.04357351,
      -0.013316337,
      944354e-8,
      -0.019937467,
      0.011869615,
      -0.05946926,
      0.03571598,
      0.012261943,
      0.038170777,
      0.029047118,
      0.0034046795,
      0.031619456,
      0.024406835,
      -0.040271055,
      0.024649836,
      0.041722983,
      0.023863297,
      1692882e-9,
      0.0033120948,
      -0.02159326,
      -0.0011583009,
      0.10696851,
      0.050720453,
      -9652451e-9,
      0.055325743,
      0.0038391722,
      0.015291379,
      0.029086571,
      0.026664177,
      -0.025049772,
      0.036360074,
      -0.027743548,
      -694257e-8,
      0.051614176,
      0.058475252,
      -0.029820172,
      -0.048947476,
      0.016612694,
      0.02738495,
      0.042544305,
      0.028235704,
      0.022434678,
      -0.018815106,
      0.093049504,
      -8502057e-9,
      8947012e-9,
      -0.046585526,
      0.022811295,
      -0.03187911,
      0.05317722,
      -0.032972712,
      0.031792,
      -0.043581262,
      -0.04356275,
      -0.027816314,
      -0.021765038,
      -0.03522224,
      -0.0030122201,
      0.07454608,
      0.018426772,
      -0.020517176,
      0.022951648,
      0.052110896,
      0.012549905,
      0.018819202,
      -0.0055528604,
      983656e-8,
      -0.010826642,
      0.04757368,
      -0.034453306,
      -0.013769236,
      -0.028243234,
      -0.028521908,
      -0.041639823,
      -0.028215185,
      -0.06753523,
      0.0025154091,
      -8469905e-9,
      -0.015680678,
      0.0012992711,
      0.026719062,
      -0.024696086,
      0.0087222345,
      -0.021162618,
      -0.024409316,
      -0.011603567,
      -0.01907926,
      -0.0011256984,
      21572573e-11,
      0.056483004,
      -0.019943029,
      0.06143664,
      0.036553778,
      0.030838069,
      9634809e-9,
      -0.027249916,
      0.0026571222,
      -0.032471307,
      -0.030694092,
      -0.015453558,
      0.015021904,
      -0.046124693,
      -0.013985818,
      0.020795273,
      -0.01143919,
      -0.0023239828,
      -0.010808452,
      0.013186427,
      0.026327875,
      -0.04976934,
      -0.0046942043,
      -0.03088062,
      -0.05555443,
      0.022989804,
      -9717099e-11,
      -0.011357214,
      -0.01503526,
      -0.030400999,
      -0.025598068,
      -0.04973231,
      -0.03951111,
      -0.053736433,
      0.06363491,
      0.04323225,
      0.042164348,
      -5973399e-9,
      0.019213807,
      0.011579047,
      -0.018419778,
      -6060296e-9,
      9012739e-10,
      0.055071346,
      0.013969757,
      -3815618e-9,
      -0.08008373,
      -4951748e-9,
      0.0010151779,
      0.032360405,
      -0.039212193,
      0.029136537,
      -0.024166897,
      0.011966281,
      -0.066582985,
      0.014690971,
      -0.01924132,
      -0.03868685,
      -0.028642789,
      0.023732563,
      0.048339777,
      0.023457926,
      -0.0043582493,
      0.050337743,
      -0.0378547,
      -0.024028633,
      -0.04746838,
      -0.01709474,
      -0.0036463214,
      0.0144342845,
      -0.0059803813,
      -0.0034192358,
      -0.017194437,
      -15916135e-11,
      9222967e-9,
      -0.026445827,
      -0.041376118,
      -5456759e-9,
      -0.03822473,
      -7675997e-10,
      0.060738433,
      0.024786118,
      0.07707178,
      0.034216315,
      -0.022718014,
      -0.0062964694,
      0.012129951,
      -8110841e-9,
      0.026837094,
      -0.05781838,
      -0.059810746,
      -8703465e-9,
      85900526e-11,
      3090787e-9,
      0.03182176,
      -0.0170038,
      0.036510747,
      -0.026354231,
      -0.064315386,
      5881257e-9,
      0.049122997,
      -0.025733955,
      -0.03865532,
      0.10036464,
      0.069734044,
      0.045625187,
      4009645e-9,
      0.0836405,
      -0.019824298,
      -0.03489869,
      0.0194949,
      -0.0029436678,
      0.0089450525,
      -0.023095312,
      -9431898e-9,
      8182574e-9,
      0.0360294,
      -8781858e-10,
      -0.043999042,
      0.012089687,
      0.053024363,
      0.079606526,
      0.05971615,
      -0.03202787,
      6686733e-9,
      0.012835914,
      -9279064e-9,
      -0.06519282,
      0.05428543,
      0.028142981,
      -0.02281647,
      -0.044012196,
      -9680875e-9,
      -3254653e-9,
      0.03640489,
      0.049085893,
      -0.0318917,
      0.018947488,
      -0.027175719,
      0.08626208,
      -0.04754027,
      0.0210791,
      1678671e-9,
      0.016463678,
      -5181885e-9,
      0.033442777,
      0.0703263,
      -6472799e-9,
      -0.011551477,
      -0.06092639,
      0.0058134957,
      -0.06874757,
      -9943372e-9,
      0.04705914,
      0.06644862,
      -0.049715415,
      -0.034638517,
      -0.0065292176,
      0.050130453,
      -46274284e-11,
      0.0031373112,
      0.023976656,
      6386509e-10,
      -0.021555668,
      -0.0052213296,
      -0.0126286,
      -0.028050873,
      0.051293086,
      -0.06219886,
      8284766e-10,
      -0.0046767155,
      0.034348544,
      0.033847965,
      -5415576e-10,
      -0.031732004,
      0.039818075,
      0.0736157,
      -48472066e-11,
      -0.03872075,
      0.018565178,
      0.023613006,
      0.0080572665,
      -0.042043652,
      0.010564357,
      -0.0180245,
      -0.047669057,
      -0.018586697,
      -0.023652066,
      0.0067365477,
      -0.029850109,
      -0.027749417,
      0.046488777,
      0.013746928,
      0.03706207,
      2303005e-9,
      -0.0029414413,
      -0.046888232,
      0.014899769,
      -0.023994425,
      0.01928046,
      0.0077050384,
      0.02624722,
      -0.030920746,
      -0.03750363,
      -0.02277501,
      -0.0104174595,
      -0.04059024,
      0.017741544,
      -0.016297366,
      0.021078555,
      0.059985567,
      -0.01897857,
      0.0027392851,
      0.010812168,
      -0.0016016118,
      -0.062214516,
      -0.026677264,
      0.059893023,
      0.06415038,
      -0.022823779,
      -0.035774563,
      0.014576034,
      0.019866928,
      -0.0074082534,
      -0.0069894264,
      0.043715246,
      0.010935589,
      -0.027514175,
      -0.04283631,
      -84742287e-11,
      -0.02986787,
      0.011935391,
      0.03056137,
      -0.0066280495,
      0.030494545,
      0.05595517,
      -0.013262364,
      -0.03923698,
      -0.0047838297,
      -0.0043637813,
      0.017577006,
      0.021652158,
      -0.02663252,
      -0.0016156066,
      0.0053666285,
      955205e-8,
      0.0011423384,
      -0.046826344,
      9971097e-9,
      -0.01657485,
      -0.04967333,
      0.017004158,
      -0.015767341,
      -0.044344258,
      -8571352e-9,
      0.04618026,
      8525205e-9,
      0.03664621,
      0.051147137,
      -9068108e-9,
      0.03156228,
      0.025761895,
      0.053707898,
      -0.055692486,
      -0.0363649,
      -3863051e-9,
      -0.029847253,
      0.016505862,
      -0.020394512,
      0.028500985,
      -5394237e-9,
      0.022786155,
      -0.032022044,
      0.032605138,
      0.0029347178,
      -0.061032962,
      0.059178155,
      0.018428113,
      0.04888134,
      0.048224896,
      -0.05301295,
      -0.035914566,
      -0.045052357,
      0.0055068117,
      0.015382666,
      -0.04804206,
      -0.029487241,
      -0.0056354557,
      0.028539442,
      0.03969242,
      0.037817437,
      0.020404024,
      -0.03539532,
      0.012785446,
      0.034729403,
      0.010331343,
      -0.0055191102,
      4569248e-9,
      -0.055955227,
      -0.011466356,
      -0.018296689,
      0.07330135,
      0.040708594,
      0.05719005,
      0.020419674,
      0.021138443,
      -0.0038371573,
      0.01987088,
      0.02736565,
      8208508e-9,
      -0.0367684,
      0.05330804,
      0.021977024,
      -0.0020026772,
      0.027313376,
      0.029023511,
      -0.024187634,
      0.029154357,
      439669e-8,
      -0.046407387,
      -9457483e-9,
      0.0014632606,
      -0.12299311,
      -0.023363845,
      0.015459316,
      6074674e-9,
      0.011969382,
      -0.026505314,
      0.05797871,
      -0.03726096,
      0.019040445,
      0.06263347,
      -0.048295826,
      0.03718858,
      -0.025836727,
      0.01961886,
      -0.027081832,
      0.081295714,
      0.0030243057,
      -0.04288549
    ],
    [
      0.0076538553,
      0.011994249,
      -0.045488115,
      -0.019663779,
      0.0028331664,
      -5491066e-9,
      -0.07068933,
      0.049519457,
      -0.0017344786,
      0.05162445,
      0.05179926,
      0.08216689,
      -0.0059824693,
      0.03668805,
      0.015844522,
      6743122e-9,
      -0.0031240422,
      -0.040089276,
      -0.09734749,
      -0.03800824,
      0.0049037123,
      0.048926264,
      0.02453517,
      0.0012597808,
      -0.0077446247,
      -0.0041864216,
      -0.040320486,
      -9921926e-9,
      -0.059304416,
      9065865e-9,
      0.03850406,
      0.046671726,
      -0.030133232,
      6946955e-9,
      0.04132364,
      -0.012737498,
      0.0057043084,
      0.05145767,
      0.042515308,
      -0.063664615,
      -0.043618824,
      0.03629296,
      0.07726696,
      -0.010093812,
      -0.095211044,
      -7558079e-9,
      -0.043639738,
      -0.04413053,
      0.0057610916,
      -0.0011358359,
      0.031652875,
      0.014027279,
      0.0065535465,
      0.044599816,
      -0.023459163,
      -0.025090571,
      -0.0105345035,
      -0.051378384,
      -0.024215918,
      0.03295138,
      5456274e-9,
      -0.051715378,
      -0.03446039,
      -0.03631734,
      -0.014349451,
      -0.05215781,
      -0.04324379,
      -0.04998504,
      -0.11667138,
      -0.03883562,
      -0.02292502,
      0.013706715,
      -0.011188885,
      -0.016101308,
      -0.0033975483,
      -0.07240186,
      0.04263083,
      0.01950372,
      0.021005433,
      0.041096613,
      0.0023482624,
      0.059871227,
      0.029133089,
      0.06028165,
      0.014813532,
      -0.0092214225,
      0.010260322,
      -0.06792592,
      -0.0077032126,
      5787213e-9,
      0.034806013,
      -704622e-8,
      0.020539492,
      -0.041415013,
      0.04803413,
      -0.041873418,
      -0.03394428,
      0.0032826716,
      0.13112557,
      63745794e-11,
      -0.030673226,
      0.015475404,
      -2451165e-9,
      -0.031947352,
      0.060233217,
      0.030414054,
      -0.0962545,
      7817503e-9,
      0.022324597,
      -0.015568868,
      -0.021781085,
      0.04299992,
      -0.047188964,
      0.05264512,
      0.010440708,
      0.015060219,
      -0.037405185,
      0.019976657,
      -8926484e-9,
      0.051561702,
      -0.019576702,
      -0.020348324,
      -0.036870334,
      0.08054884,
      -0.048019204,
      0.029357592,
      -0.046681423,
      -0.039544966,
      -0.03238967,
      0.011970477,
      463213e-8,
      -0.0024118668,
      -0.028979022,
      -0.05008076,
      -0.026745541,
      0.022108143,
      0.042055175,
      0.05364385,
      -0.044152133,
      0.032736696,
      0.032278076,
      -9691385e-9,
      -0.06410954,
      -0.022862347,
      -0.0727523,
      0.046107404,
      -0.013992914,
      0.079210766,
      -0.033723593,
      -0.0025313841,
      -0.019684436,
      -0.05112272,
      0.07247315,
      -0.04732709,
      0.043337982,
      -0.010537994,
      -19610787e-11,
      -0.040689386,
      0.048073508,
      0.036321208,
      0.06768179,
      -0.02087483,
      776971e-8,
      -0.020581208,
      0.013254413,
      -0.017102303,
      0.032269437,
      -0.025750384,
      -0.066180535,
      -0.028523497,
      0.059441682,
      -0.036397822,
      0.02700689,
      -0.059993252,
      1082492e-9,
      0.0072737215,
      0.02166054,
      -0.018516636,
      -8071327e-9,
      -0.0059077567,
      0.058588926,
      -5846328e-9,
      0.021455253,
      -0.0050312285,
      0.012481106,
      0.019036358,
      -0.026355827,
      0.048022073,
      0.044156842,
      0.013107197,
      0.0425327,
      -0.019065268,
      -0.018312776,
      0.018453455,
      0.032714546,
      0.025160791,
      -0.07432972,
      -0.02758763,
      0.0037987554,
      0.0010548756,
      8548274e-9,
      -0.029375011,
      -0.023565605,
      -0.04982466,
      -0.04204079,
      0.07380566,
      -0.026497688,
      -0.04636127,
      -0.0842338,
      -0.03816667,
      0.022234928,
      0.0100349905,
      0.012066683,
      -0.023271743,
      0.028880933,
      -0.014306477,
      0.066379085,
      0.0016987306,
      -0.046400268,
      -0.013253705,
      -0.016264286,
      -0.0037784053,
      0.05612942,
      -0.022341862,
      0.0015516646,
      0.015390384,
      -0.028601963,
      -0.017025227,
      0.04234627,
      -0.042475082,
      0.0025093192,
      0.023113439,
      -0.0537271,
      0.04391167,
      -0.04505669,
      0.082202576,
      0.022487639,
      0.015287155,
      -0.037257355,
      0.0198775,
      0.014218963,
      -0.021812333,
      -0.016184144,
      0.019507436,
      -0.026307616,
      0.038620945,
      0.08541084,
      0.014087415,
      -0.060379382,
      -0.037692394,
      -0.03402405,
      0.020721424,
      0.057973377,
      -0.03694361,
      -4910503e-9,
      -0.0054224315,
      0.05143101,
      0.07440644,
      -0.041247986,
      -0.03156338,
      -8531507e-9,
      0.017338447,
      0.015460775,
      -0.025387824,
      -0.03329419,
      -0.05536561,
      -0.039530143,
      0.01081605,
      0.0053393156,
      0.015266548,
      0.029987892,
      -0.055031806,
      -0.032589305,
      -0.01221915,
      -0.01609505,
      -0.048862226,
      8332231e-9,
      0.023392674,
      -3936142e-9,
      -0.06295392,
      -0.032368172,
      -0.021870196,
      0.079293154,
      -0.0045413035,
      7909338e-9,
      -0.022289857,
      0.08415407,
      -0.0028505719,
      2080616e-9,
      -0.013035983,
      0.07813175,
      0.05145745,
      0.01164615,
      -0.010179566,
      0.02274749,
      -0.037023302,
      0.040112235,
      0.024344565,
      -0.046494585,
      -0.05228419,
      0.029795922,
      -8810225e-9,
      -0.02422007,
      -0.011184711,
      -9144646e-9,
      -0.024377635,
      -0.04127075,
      -0.030010547,
      -0.022812156,
      0.0409579,
      -8194173e-9,
      0.020838205,
      -0.03207246,
      -0.03768097,
      -0.045664076,
      0.043606337,
      -0.09098252,
      0.05056242,
      -9036998e-10,
      0.030173738,
      -0.058318544,
      8752371e-9,
      -0.043700214,
      0.024382493,
      0.017175995,
      6708923e-9,
      -7167712e-9,
      0.030515997,
      0.011479695,
      0.046338566,
      0.012951926,
      -8639409e-9,
      0.0015759715,
      0.015734103,
      0.028913043,
      0.076655775,
      -0.054038238,
      -0.033557203,
      0.0073703784,
      -0.03844835,
      -9941906e-9,
      0.034983326,
      0.018053241,
      -0.027038608,
      89699024e-11,
      0.017865604,
      0.053135935,
      0.07840873,
      0.04938616,
      -0.02100484,
      0.026098011,
      0.07220012,
      0.045263942,
      -0.05577862,
      -0.017245634,
      0.037171334,
      0.032156512,
      0.023612954,
      0.050644174,
      -0.04046992,
      -0.03481471,
      0.06410274,
      -0.025782505,
      0.011872928,
      0.048394904,
      -5136551e-10,
      -0.021985328,
      0.041464254,
      -0.033057265,
      0.018389245,
      -0.048771188,
      -0.0029768252,
      -0.0017889651,
      -0.0043628593,
      0.03180307,
      -3363569e-9,
      -0.028294576,
      -0.01957143,
      0.024779256,
      0.044620167,
      -0.014267421,
      -908065e-8,
      -0.015980205,
      0.021063548,
      0.0054408303,
      0.018593902,
      -0.02091756,
      -0.020072162,
      -0.021785691,
      0.02244031,
      -0.031028861,
      0.05236815,
      -8740715e-9,
      -0.010720612,
      -0.024969952,
      -0.015875233,
      -9544715e-9,
      0.058216807,
      0.012372514,
      0.027396947,
      0.05494766,
      -0.056016237,
      0.036763497,
      0.0034029076,
      -0.03307814,
      -0.0036601396,
      0.0460601,
      0.022142882,
      -0.012155103,
      -0.01903694,
      0.0097382795,
      -0.03482719,
      -0.055633552,
      -0.0068018977,
      0.029592156,
      -0.014179574,
      0.02624272,
      -3200644e-9,
      9768194e-9,
      -0.02654445,
      -0.016017972,
      0.026968941,
      0.017078033,
      0.033835873,
      -0.05614699,
      -0.09978748,
      -0.0025268074,
      -9013582e-9,
      -0.038848806,
      0.0050441585,
      0.034858152,
      0.052056085,
      -0.021526184,
      -0.023171943,
      -4486432e-9,
      -0.021908997,
      -0.0039100624,
      0.03282778,
      0.055545364,
      -9398881e-9,
      -7249827e-9,
      -0.021772258,
      1642585e-9,
      -0.011022219,
      0.036525216,
      0.058743168,
      0.017146362,
      -0.03230054,
      -0.018167524,
      -0.010079465,
      0.02946337,
      -0.031745296,
      -7099192e-11,
      0.014880829,
      -0.049656436,
      0.0077258204,
      0.046059623,
      0.0036792883,
      -0.02231175,
      0.0050242557,
      -0.0075907577,
      -0.07225816,
      -0.030617857,
      0.05066598,
      -0.054528464,
      0.017335175,
      0.017031983,
      0.045517128,
      -0.046243515,
      -8220548e-9,
      0.058299143,
      -0.038880832,
      0.0065224846,
      -8773809e-9,
      -9901776e-10,
      -0.014164845,
      0.029106278,
      -7572142e-9,
      -0.048568998,
      0.0056944713,
      -0.0135047175,
      0.022371108,
      -0.0093888175,
      0.06912144,
      -0.0055186413,
      0.03498065,
      -0.02355102,
      -0.034871604,
      0.015628638,
      -0.028355977,
      0.034429405,
      0.041703936,
      0.0069588544,
      -0.011151627,
      -0.05609144,
      0.017992694,
      0.02425493,
      -0.022547657,
      -9086647e-9,
      0.011064436,
      0.0019525331,
      -0.0227266,
      -0.026113113,
      -0.04827625,
      -0.01678898,
      0.013763343,
      -0.022700861,
      -0.03770309,
      0.042140733,
      0.030662945,
      0.0024984246,
      -0.012514374,
      -0.013943525,
      -0.01624075,
      -8063997e-9,
      -0.013839328,
      -9053187e-9,
      -0.029748015,
      3714072e-9,
      0.0022343337,
      -0.04885352,
      -0.013659661,
      0.018476361,
      0.04072261,
      0.018370477,
      -935078e-8,
      -0.0069107627,
      0.047440063,
      0.06865183,
      0.027643591,
      -0.0024828208,
      -0.0026680375,
      0.039240588,
      -0.04189762,
      0.010793092,
      0.08132506,
      -0.023077063,
      0.0045603216,
      0.031246971,
      0.08109195,
      0.016259635,
      0.0017480826,
      -0.04394414,
      0.028975502,
      0.06141801,
      0.0036520376,
      0.012795513,
      -0.0047701076,
      -0.028642043,
      0.0299011,
      0.017752184,
      0.03072593,
      0.061903935,
      -0.041418754,
      -0.04896421,
      -0.019184299,
      0.029892676,
      0.0019526847,
      -0.036848374,
      -0.0728946,
      81945583e-11,
      -0.010957642,
      0.010976019,
      0.03249793,
      5445611e-9,
      0.0021208406,
      0.02728953,
      0.046009175,
      -0.024877978,
      0.016461356,
      0.04791121,
      0.016035087,
      0.010711739,
      -0.018001085,
      0.061650813,
      -0.026464656,
      -0.06936798,
      -0.0034040273,
      -0.0019512179,
      -0.011731284,
      0.03813307,
      -0.031382516,
      0.05659854,
      0.060973443,
      -0.03953485,
      0.035843033,
      -0.0066012437,
      7209419e-9,
      0.031459462,
      -0.0038412232,
      -0.07705608,
      -0.053820945,
      -0.010571467,
      -0.07350121,
      0.039136704,
      -0.02706811,
      31567336e-11,
      -0.016162634,
      -3279039e-10,
      -0.012172147,
      -0.020069405,
      0.024321912,
      0.070472136,
      0.02996967,
      0.03246902,
      0.024251696,
      0.0288381,
      -0.041342866,
      -0.04777271,
      -0.02892671,
      0.015224389,
      0.022460388,
      -0.06466634,
      -0.048017688,
      -0.026876813,
      -0.026502287,
      -0.010445121,
      -0.025903838,
      0.06786621,
      -0.0043033804,
      0.06651226,
      0.011544046,
      0.021834493,
      -0.015899628,
      -0.0458191,
      -0.01701132,
      0.0028489723,
      -9347922e-9,
      -0.04266233,
      0.025189577,
      7537905e-9,
      -0.010151949,
      0.049641192,
      5210007e-9,
      -0.06843037,
      0.05375821,
      -0.022013696,
      -0.013358516,
      -0.019714847,
      0.03470613,
      -0.03738825,
      0.0045353393,
      0.05114831,
      0.021572324,
      60720294e-11,
      0.05401258,
      0.051424198,
      -0.049809452,
      -5395958e-9,
      -0.026889626,
      0.012480948,
      -7877033e-9,
      0.012515337,
      0.035956424,
      0.016828492,
      0.03571074,
      -0.01848317,
      0.0046576136,
      0.08037679,
      0.036186107,
      -0.025742386,
      0.0146155255,
      0.02661499,
      -2805536e-9,
      -0.0415486,
      -0.031476054,
      -0.0034117128,
      -0.0070919306,
      9895779e-9,
      0.0132574905,
      0.020811725,
      -0.0141984075,
      -0.068391405,
      0.027341845,
      -0.0125921685,
      -0.030999841,
      0.054378405,
      0.021213807,
      -0.040505562,
      0.052239235,
      8705881e-9,
      -9006653e-9,
      -0.0013308661,
      -0.010561624,
      0.04723957,
      -0.043641917,
      9901524e-9,
      0.026289731,
      -0.07582178,
      0.021622242,
      0.018474612,
      -0.018663317,
      0.02115763,
      7536506e-9,
      -0.01032786,
      0.05337038,
      -8500712e-9,
      0.040906366,
      -0.017854122,
      0.03605655,
      0.017498806,
      0.018080935,
      -0.019215234,
      -0.069148436,
      -0.01149975,
      0.02211938,
      0.010819307,
      0.026486069,
      -8263004e-9,
      0.02764659,
      -0.052030675,
      -0.057063576,
      0.0457012,
      -0.024118442,
      -9795107e-9,
      -0.01571315,
      17873537e-11,
      -0.012555398,
      0.030223595,
      0.0083005335,
      0.0332786,
      0.0059452164,
      -0.03526902,
      0.074704334,
      33370805e-12,
      0.038311873,
      -0.04481406,
      -0.02482632,
      8712844e-9,
      0.058854,
      -0.019519078,
      -0.032565698,
      0.025888575,
      0.013133466,
      -0.012597045,
      -0.03427393,
      -0.03883513,
      -0.0126417065,
      -0.05810661,
      -0.080446646,
      0.061538763,
      0.012009537,
      -0.042953227,
      -0.0010397545,
      -0.04516779,
      0.020492718,
      -0.013735805,
      -0.06336808,
      0.02168778,
      -0.07575894,
      -0.102020875,
      -0.034397032,
      -0.031655125,
      -0.024293823,
      0.068089746,
      0.043775145,
      0.0028305273,
      -0.06758549,
      0.031982157,
      0.0021918537,
      -0.012656124,
      0.071842216,
      0.023020236,
      0.015460724,
      -0.017055914,
      0.03901256,
      0.042944737,
      9416273e-9
    ],
    [
      3163285e-9,
      -0.033363353,
      -0.038190905,
      -0.037151046,
      0.017635405,
      0.018977258,
      0.05262526,
      -0.012415957,
      -0.015844954,
      0.025427496,
      5379998e-9,
      0.028632697,
      0.06527445,
      0.052342072,
      0.08470469,
      -0.033540655,
      0.028103521,
      0.0263947,
      -0.05067831,
      -0.06103841,
      2246929e-9,
      -0.051471647,
      0.022794237,
      0.013366508,
      -0.10212021,
      -0.06718508,
      -0.025122862,
      0.022952683,
      -0.03788799,
      -0.024993408,
      0.048476547,
      -0.058058813,
      0.036087904,
      0.042005245,
      0.047930483,
      -0.036676172,
      -0.04504766,
      0.03231699,
      0.07489924,
      -0.02251948,
      -0.0049043675,
      0.0077745155,
      0.03603021,
      0.09499992,
      0.02608279,
      0.046536356,
      -0.010757879,
      0.014807913,
      -0.01451763,
      0.03554613,
      -0.028749213,
      -0.013605716,
      -0.05398211,
      0.020947888,
      -0.061571006,
      0.0016724853,
      -0.040163632,
      0.0036141553,
      0.053642824,
      -0.04718953,
      0.034455515,
      0.035820335,
      0.012491961,
      -0.012071486,
      0.013050172,
      -0.033212896,
      -0.0012043514,
      -0.051546123,
      -0.09559787,
      -0.050492946,
      0.016658925,
      0.08804187,
      -0.04529044,
      3258541e-9,
      0.028693574,
      -0.04210119,
      0.021044126,
      0.02141859,
      0.015452379,
      -0.0067574806,
      -0.0317636,
      -0.0010761393,
      24472433e-11,
      0.023997609,
      -0.059561457,
      0.03089194,
      -0.020954607,
      0.05067811,
      -0.03741886,
      0.026961537,
      0.0673825,
      -0.011602845,
      0.029075027,
      -0.019678377,
      0.07705114,
      -0.022945413,
      -0.040780343,
      -0.0062469295,
      0.036557816,
      0.011969612,
      -0.02266378,
      -0.035359155,
      -0.041647594,
      0.011396419,
      0.032701984,
      2983097e-9,
      0.018320473,
      -0.06319024,
      -0.04195328,
      0.010980584,
      5964994e-10,
      -0.017623544,
      0.0023685016,
      -7124123e-9,
      -93187904e-11,
      0.01513353,
      0.015579028,
      0.015144833,
      0.0051196143,
      -0.013774783,
      329635e-8,
      0.026140593,
      -0.043903183,
      0.0055929227,
      -0.019282002,
      0.023997976,
      -0.05485317,
      -0.0042410037,
      -0.043695316,
      -0.016429748,
      0.086055614,
      -6651774e-9,
      0.077040955,
      -0.0038788118,
      -0.044329602,
      0.0020969554,
      0.016791627,
      -0.02849265,
      -0.014331353,
      0.011326767,
      0.028384883,
      -0.012709411,
      -0.051519908,
      -0.0068090917,
      0.021359975,
      -0.021834772,
      0.01527702,
      -0.032828618,
      -8614757e-9,
      -0.014575232,
      -0.06499258,
      -0.011296221,
      -3418508e-9,
      0.015836446,
      -8989703e-9,
      -0.012457308,
      -0.022249263,
      -0.10053088,
      0.0017228806,
      -0.020460557,
      0.04168913,
      0.020439288,
      0.0040759863,
      0.021161951,
      -0.030910974,
      0.039139118,
      -0.025253452,
      -0.02398572,
      -0.013640121,
      -5653541e-9,
      0.027023098,
      -0.05766154,
      0.021003062,
      -0.10813972,
      0.02778981,
      0.03212443,
      36991196e-11,
      0.030234685,
      -0.05326128,
      -0.038399573,
      0.10942826,
      -0.010607288,
      8864829e-9,
      -0.013192871,
      -0.021933746,
      0.06473456,
      0.060309406,
      0.011515683,
      0.018205818,
      -0.037092377,
      -0.03005398,
      4408146e-9,
      -0.019515755,
      0.03039854,
      -0.053243272,
      0.014422979,
      -0.023083068,
      -0.03561382,
      0.02144224,
      -0.036696516,
      -0.014661113,
      0.06552107,
      -816946e-8,
      0.049089737,
      0.038876515,
      0.010858799,
      -0.06725673,
      0.017186355,
      0.014760525,
      0.0044432483,
      0.03459934,
      0.0015927505,
      -0.08839717,
      -0.060063973,
      0.044218604,
      -0.01381637,
      0.010616969,
      0.03013348,
      0.046449855,
      -0.038398355,
      -0.052614275,
      9536485e-9,
      0.049782977,
      0.017105654,
      42158307e-11,
      -0.026074383,
      -0.07940865,
      -0.025279915,
      0.010006703,
      -0.05179112,
      0.042439375,
      -0.035320677,
      0.016766513,
      -0.031511445,
      -0.029576221,
      0.084761694,
      0.02839497,
      0.011401064,
      0.059508763,
      -0.040628623,
      -0.02108335,
      -0.047630914,
      0.036042873,
      -0.03210585,
      0.0639891,
      -0.05406495,
      0.018841518,
      0.059992723,
      -0.02004983,
      0.03464636,
      -0.010961345,
      -0.078818545,
      0.07062218,
      0.0066490206,
      2127325e-9,
      -0.012449089,
      4571087e-9,
      0.040558673,
      0.0071803285,
      -0.0020980681,
      0.019585034,
      0.020327363,
      0.0027251856,
      -0.015215496,
      -0.011475067,
      0.0060366895,
      -0.04416322,
      0.02974621,
      0.054501075,
      -0.012338304,
      0.045006722,
      -7068048e-9,
      -0.014829427,
      8673931e-9,
      2360607e-9,
      0.08145838,
      0.018171139,
      -8275012e-9,
      -0.012097433,
      -8178174e-9,
      0.03653896,
      0.079595536,
      -0.045349438,
      -0.027202792,
      0.012395415,
      -0.022050424,
      0.028247701,
      -0.04497482,
      0.010779685,
      0.042754658,
      0.021821778,
      0.07484766,
      0.024737787,
      0.065119505,
      9506819e-9,
      -0.030849375,
      -0.058613688,
      0.039755113,
      0.038429808,
      -0.023153465,
      0.037478954,
      0.07880935,
      -0.0012255769,
      0.0023263523,
      0.03152967,
      -0.0056426646,
      9661221e-9,
      0.0076745865,
      -0.07027107,
      0.016480817,
      0.0097892275,
      0.058036182,
      0.049818248,
      0.03856816,
      -0.010638725,
      -2226022e-9,
      -0.10941893,
      0.014112985,
      0.027166385,
      0.058711626,
      0.035627287,
      0.04265578,
      -0.05172092,
      0.01885288,
      0.018550241,
      0.077720456,
      -0.01644471,
      0.020177145,
      0.043822974,
      0.0035183758,
      0.021015972,
      0.010941164,
      -0.011976788,
      -0.05851268,
      0.021538248,
      0.0062656617,
      -9348313e-9,
      89692045e-11,
      0.046297777,
      -49058354e-11,
      0.03953619,
      0.02874729,
      -0.021578686,
      70465e-7,
      9329871e-9,
      -0.026025467,
      0.018436877,
      0.022325076,
      -0.04833761,
      0.047931712,
      -0.012531845,
      -0.02024148,
      -0.041821066,
      -0.010065842,
      5737014e-9,
      -0.01711487,
      0.06651338,
      8527718e-9,
      0.043740038,
      4639664e-9,
      -0.0026482395,
      0.06346575,
      0.011839452,
      0.014252193,
      -0.015974417,
      -0.045407534,
      0.036819972,
      0.029497467,
      0.028923072,
      -0.019733686,
      0.016731357,
      -0.021374041,
      -0.017653178,
      0.0098625515,
      0.037189957,
      -0.014013507,
      -0.0071441834,
      0.028715698,
      -0.0052622054,
      3259252e-9,
      6554609e-9,
      0.03089636,
      -6674594e-9,
      0.052265007,
      8870851e-9,
      0.025056578,
      -0.053486135,
      -0.024138479,
      0.019598749,
      5188875e-9,
      -0.012782424,
      0.04846308,
      0.019952467,
      -0.02490495,
      0.019889347,
      0.01075524,
      -0.061394308,
      5465718e-9,
      0.017488362,
      4652106e-9,
      -0.014684239,
      0.022582931,
      0.053923775,
      0.010370895,
      -0.011897443,
      -0.02785994,
      0.044610437,
      -0.04517818,
      0.02126245,
      0.067062676,
      0.016372455,
      -0.030569836,
      -0.0052706217,
      -9504088e-9,
      -0.010480523,
      -0.060961023,
      0.02293491,
      -0.027792929,
      0.0083166165,
      -0.021662287,
      -0.027651004,
      0.0073128864,
      0.03250067,
      0.0141404485,
      0.0076231007,
      -0.030204589,
      -4370037e-9,
      703078e-8,
      0.0042660693,
      0.052919503,
      0.013846455,
      9182284e-9,
      0.039917503,
      0.0118253045,
      0.031129101,
      0.020661172,
      4207273e-9,
      0.014329654,
      -0.0147615075,
      -0.020427154,
      0.033735365,
      -0.021346213,
      0.021523096,
      0.0010534414,
      -613941e-8,
      -0.036533695,
      -28891806e-11,
      -0.010045522,
      0.02619657,
      -0.036643382,
      -0.016572105,
      -0.04843618,
      -0.026095985,
      -0.0042241355,
      -0.03916103,
      0.04626581,
      -0.0074522644,
      -0.0019198357,
      -0.06297981,
      -0.053317074,
      -0.060830332,
      74385543e-11,
      0.10184748,
      0.044630483,
      0.014297009,
      8733733e-9,
      7075902e-9,
      0.06578782,
      -64743e-8,
      0.048733022,
      0.010517511,
      0.0070816707,
      0.043478183,
      0.0071808295,
      -0.062692374,
      8401248e-9,
      -0.028038431,
      -0.031180283,
      -0.017416181,
      0.027751295,
      0.023453886,
      17563892e-11,
      -0.056932822,
      0.014436935,
      0.07654082,
      -0.041962653,
      -0.07773447,
      0.03614021,
      4643678e-9,
      -0.0046476102,
      0.025233844,
      0.060524724,
      7233548e-9,
      -0.045928326,
      -0.0045490735,
      -0.010788124,
      0.060186353,
      0.032635994,
      9328869e-9,
      0.05248211,
      0.089668445,
      -0.0051840907,
      -9880853e-9,
      -0.056693815,
      0.023470854,
      0.049366213,
      -7158203e-9,
      0.01978654,
      0.011147242,
      9985954e-9,
      0.033976257,
      0.0013012241,
      0.021085022,
      -0.012067341,
      -0.038225476,
      0.029663306,
      -0.078236975,
      -0.011855066,
      8446784e-9,
      -0.01084788,
      -0.032826908,
      5971125e-9,
      0.06502423,
      -0.03140748,
      0.04273345,
      -0.014304126,
      -9770052e-9,
      -0.016438076,
      0.058619574,
      0.045046855,
      5302982e-9,
      0.10955334,
      0.043380395,
      0.039332416,
      0.0282881,
      0.033293847,
      0.024697335,
      0.030309113,
      -0.0033954335,
      0.025464147,
      -0.0065717283,
      -0.030265665,
      -0.025635649,
      -9173088e-9,
      -0.02611333,
      0.047350165,
      -0.012623336,
      -0.036800344,
      0.019559065,
      0.03963637,
      0.016324835,
      -0.02845358,
      65189577e-11,
      -0.01624772,
      0.02171834,
      -4641654e-9,
      0.06290972,
      0.016507853,
      -0.057401545,
      0.047119543,
      0.0016589152,
      -0.028334823,
      0.0348344,
      0.016139869,
      0.03421503,
      0.022967199,
      -0.025865292,
      0.1135084,
      -0.011687039,
      0.0014116844,
      5779978e-9,
      0.035845034,
      -0.010691908,
      0.0067834533,
      0.02326512,
      0.010741445,
      -8375788e-9,
      0.029594893,
      -5760087e-9,
      -0.029226039,
      0.0246378,
      0.042320777,
      0.041087233,
      0.020947438,
      4309516e-9,
      0.03287822,
      0.04698432,
      -0.0046918886,
      0.013963692,
      0.043318268,
      0.0035329615,
      -0.03253183,
      8653479e-9,
      -0.033236023,
      -0.012589816,
      -8966562e-9,
      -0.073453836,
      -0.01943056,
      -0.035800327,
      0.050281726,
      0.036984064,
      0.014517075,
      0.012235828,
      0.04449537,
      0.017374093,
      0.0013644778,
      -0.0365899,
      -0.08722343,
      -9683846e-9,
      0.08924006,
      0.0031764435,
      -96037606e-11,
      0.016812883,
      -0.07442194,
      -0.02444249,
      -8496052e-9,
      -0.07189355,
      -0.026771855,
      -0.022839645,
      7870336e-9,
      -8288726e-9,
      0.065532245,
      0.01130544,
      0.0048520816,
      -0.064667396,
      -0.014345499,
      -0.02191816,
      0.010138532,
      -0.058104113,
      0.015628299,
      -0.050946373,
      -0.026596267,
      0.025898887,
      -0.036087617,
      -0.0049876682,
      0.03310884,
      0.04373183,
      0.021256937,
      6627602e-9,
      -0.03197733,
      0.040898748,
      0.09508071,
      0.04202809,
      0.051820066,
      -0.019947443,
      0.03488757,
      0.026557932,
      0.025914574,
      0.061667867,
      0.025351278,
      -0.0613746,
      0.023527687,
      -0.020886805,
      0.03785167,
      -0.024328198,
      -0.06585511,
      -0.029952992,
      0.0018198326,
      0.030850602,
      -0.032052346,
      0.023762688,
      -0.114440195,
      0.013986444,
      0.064399034,
      -0.045250855,
      0.017623348,
      0.0064217653,
      -0.02015018,
      -0.010478982,
      -0.01486772,
      -0.03647512,
      0.010082014,
      -0.03952766,
      0.0036697397,
      -0.01246864,
      -0.061486185,
      0.027718954,
      -9644629e-9,
      -0.029019685,
      697186e-8,
      -0.015612034,
      0.031147832,
      0.029586371,
      0.0020831192,
      0.022094738,
      0.011961707,
      0.018686218,
      0.037770446,
      0.019883271,
      0.0063585555,
      0.016012901,
      -0.044955976,
      -0.025617497,
      0.039060775,
      -0.0042136977,
      0.014611944,
      3856096e-9,
      0.027529828,
      -8753698e-9,
      0.039808046,
      0.028227717,
      -0.01444814,
      -0.036818866,
      -0.038848963,
      -0.0067046867,
      0.028625077,
      0.010242295,
      0.050999805,
      -0.0036090538,
      -0.015027761,
      -0.02121214,
      -0.019234715,
      -0.0039707134,
      -8002644e-9,
      -0.03118981,
      0.0065081418,
      9369294e-9,
      -0.03987165,
      -645448e-8,
      -0.013602976,
      0.0049170274,
      4931149e-9,
      0.036174588,
      0.022062905,
      0.032185003,
      0.01039824,
      -0.03970586,
      0.029802639,
      -0.023461279,
      0.095932804,
      0.041010506,
      0.0012383177,
      0.012569815,
      0.06699708,
      -0.036867,
      -0.038938984,
      0.0141094085,
      -0.03748394,
      -0.049031638,
      0.013354558,
      9564701e-9,
      -0.017463043,
      0.02880901,
      -8828431e-9,
      -4810309e-9,
      0.08447103,
      0.029343035,
      -0.032877762,
      4047115e-9,
      -0.064380735,
      -0.09398203,
      -0.020510089,
      0.01384458,
      0.018513607,
      0.016328065,
      -283039e-8,
      0.0038132179,
      -0.02617759,
      -0.022499721,
      0.053072277,
      0.021385936,
      0.04023582,
      -0.05487555,
      0.03203107,
      -0.03957564,
      0.023605239,
      0.014787989,
      -0.071860716
    ],
    [
      -0.056518096,
      -0.025499599,
      -0.028990475,
      -0.028066188,
      0.022581948,
      0.02061787,
      0.017949333,
      0.0021218895,
      0.0041374685,
      0.015503753,
      0.02440489,
      0.055042148,
      0.041764446,
      0.052211322,
      0.101386316,
      0.0021351117,
      0.021014642,
      0.015495078,
      -0.06159026,
      -0.07627249,
      -74292225e-11,
      -0.09256092,
      0.041586228,
      0.0028290849,
      -0.09678901,
      -0.07309326,
      -0.030364871,
      0.042745713,
      -0.050046943,
      -0.021166096,
      0.027251037,
      -0.08020968,
      0.036569655,
      0.057701506,
      -4182378e-9,
      -0.0019676737,
      -3597079e-9,
      0.02143248,
      0.055477217,
      -0.0013199843,
      -0.029549794,
      0.04447655,
      0.03347557,
      0.09545112,
      0.03853008,
      0.011290862,
      9590976e-9,
      -0.028460678,
      -0.02627588,
      0.037900686,
      -0.028088668,
      -0.020991633,
      -0.03797449,
      0.018780623,
      -0.0462027,
      0.038948663,
      -0.04508955,
      -7023744e-9,
      0.04713976,
      16570823e-11,
      0.040681634,
      0.035639852,
      -0.018384973,
      -0.0061499192,
      0.03000425,
      0.025847113,
      0.0034838503,
      -0.042320468,
      -0.07619976,
      -5856941e-9,
      0.01644714,
      0.0924791,
      -0.022645958,
      -5257152e-9,
      0.0071416385,
      -0.013993935,
      0.03233872,
      0.037632674,
      0.03499761,
      -0.025525264,
      -0.033829585,
      -0.024946887,
      -0.012719008,
      0.044276103,
      -0.059199646,
      0.02175732,
      -0.019030778,
      0.055156954,
      -0.059245687,
      -30844746e-11,
      0.059266478,
      -0.022998156,
      0.025760407,
      -0.019962713,
      0.07027616,
      -0.037024792,
      -0.044226997,
      6975815e-9,
      0.053053644,
      -0.010074406,
      -0.029550055,
      -0.033209853,
      -0.035733487,
      -0.023706144,
      0.019155886,
      0.014660374,
      0.012011448,
      -0.05931948,
      -0.017155305,
      0.017594116,
      -0.014996212,
      -0.039924305,
      0.015588027,
      0.041354492,
      0.0025568667,
      0.024111273,
      -6960031e-9,
      -0.013175557,
      0.017020898,
      8665355e-9,
      0.020392442,
      0.011462742,
      -0.044625197,
      0.02089856,
      -7532261e-9,
      0.016395459,
      -0.028830852,
      -0.0020476927,
      -0.061431434,
      -0.0095453495,
      0.070550635,
      0.04161361,
      0.07527812,
      0.0068637086,
      -0.04220013,
      7907868e-9,
      -0.0015552051,
      -0.025841098,
      -0.019982763,
      0.0025007268,
      0.040000897,
      0.010737519,
      -0.036248267,
      -2630212e-9,
      9306158e-9,
      -0.029031048,
      0.010708619,
      -0.018053718,
      -7405145e-9,
      -0.016748168,
      -0.07845261,
      -0.04836472,
      7956222e-9,
      -3270168e-9,
      -0.032796394,
      0.040604822,
      -0.013228293,
      -0.09260987,
      9557439e-9,
      -0.037050758,
      0.05421427,
      942616e-8,
      -0.03682887,
      0.017357307,
      -0.040517524,
      0.04593725,
      -0.014650028,
      -0.019675681,
      4444209e-10,
      -0.024307167,
      0.031126976,
      -0.07978998,
      0.030881824,
      -0.094875515,
      0.022775477,
      0.040752236,
      -0.030996777,
      0.019584002,
      -0.0119542405,
      -0.0391497,
      0.07651302,
      -0.024628712,
      0.011218152,
      0.036537554,
      -0.02964884,
      0.03267864,
      0.038269307,
      8272338e-9,
      0.0025004072,
      -0.019350512,
      -6833156e-10,
      0.011395342,
      -0.047382675,
      -0.02069128,
      -0.044429805,
      0.031528264,
      0.02999308,
      -0.044604145,
      0.011279841,
      -0.06334177,
      -0.013279726,
      0.062934436,
      0.0040901974,
      0.01197217,
      0.015064164,
      7575319e-9,
      -0.031947143,
      45320432e-11,
      -0.0026409263,
      -6025497e-9,
      0.013149682,
      -0.012022458,
      -0.07034445,
      -0.04747423,
      0.034580052,
      -0.0013287511,
      -7423417e-9,
      954043e-8,
      0.016343785,
      0.0028233042,
      -0.048002698,
      9326416e-9,
      0.04366826,
      0.024364114,
      0.016165733,
      -0.044115104,
      -0.045121625,
      7815582e-9,
      0.01905623,
      -0.04107387,
      0.04413651,
      -0.011246621,
      0.027126824,
      0.023532378,
      -0.024929794,
      0.069653004,
      0.015983833,
      0.01127183,
      0.08724364,
      -0.039716695,
      -0.020775063,
      -0.036743525,
      0.014276356,
      -0.0046207923,
      0.08305563,
      -0.04915502,
      -0.0024539628,
      0.053278908,
      -0.038270198,
      0.032645293,
      0.015987722,
      -0.066659056,
      0.055997666,
      -0.015949598,
      0.015472493,
      -0.053043865,
      -0.015710069,
      0.021216935,
      0.05329001,
      -0.018469973,
      0.026272088,
      0.016704636,
      -7687184e-9,
      -0.013696206,
      -0.018912023,
      0.0040718555,
      -5563271e-9,
      0.035778265,
      0.094879895,
      0.0022916165,
      0.06743628,
      -0.018907025,
      -0.03212123,
      -9115928e-9,
      -0.012410836,
      0.090838015,
      0.014445732,
      -0.0058648176,
      -2380079e-9,
      0.0028417625,
      -5825288e-9,
      0.09470721,
      -0.06684085,
      -0.017753147,
      0.021609843,
      0.013053022,
      0.022243734,
      -0.0154757025,
      5311827e-9,
      0.059706584,
      0.0033069502,
      0.07992703,
      -0.010391644,
      0.05194058,
      -0.017962625,
      -0.053102504,
      -0.04489619,
      0.026143156,
      0.054322388,
      -0.03123364,
      -0.013782886,
      0.078214735,
      -0.022002812,
      0.017841188,
      0.049443655,
      0.0014161237,
      3983973e-10,
      9731512e-9,
      -0.048754968,
      0.0339754,
      0.01875125,
      0.07068125,
      0.055712406,
      0.031142993,
      -0.015714629,
      -0.014399625,
      -0.0690127,
      0.011168344,
      0.012370963,
      0.037859797,
      0.032689445,
      0.060135636,
      -0.027553583,
      0.021645568,
      -0.01849659,
      0.07730216,
      -0.017740268,
      0.035264093,
      0.04783441,
      9815849e-9,
      0.045429595,
      0.0128812445,
      -0.030953601,
      -0.057254598,
      4434601e-10,
      0.035750084,
      -0.027963707,
      -0.01785045,
      0.055280644,
      0.017489884,
      0.0596619,
      0.054143753,
      -0.0175918,
      -0.0022717605,
      0.0017739907,
      -0.0352479,
      0.050924107,
      0.020264247,
      -0.038344443,
      0.033097904,
      -0.022717286,
      -0.017449502,
      -0.015461907,
      -0.01244218,
      -0.0036034966,
      4562117e-10,
      0.07116996,
      0.01812992,
      0.058630235,
      8296067e-9,
      -17479237e-11,
      0.03955138,
      -0.0015836585,
      0.057447147,
      -0.015503513,
      -0.030256914,
      -0.0074253706,
      0.04428989,
      -0.028257905,
      -0.03982378,
      0.016535101,
      0.0056168316,
      -0.018161489,
      22006317e-11,
      0.037749447,
      -8680555e-9,
      -8365499e-9,
      0.015787173,
      -0.011214836,
      0.060789246,
      -0.0020864413,
      0.03180781,
      -0.021295223,
      0.071704924,
      -0.020717459,
      -0.014687903,
      -0.014036636,
      -0.016884103,
      0.0018262884,
      0.019635329,
      -0.022181429,
      0.01456861,
      8783057e-9,
      -0.015458553,
      -0.0065331194,
      0.012425801,
      -0.05557272,
      -0.0036318703,
      5586812e-9,
      -6617696e-9,
      -0.015997812,
      0.015153195,
      0.05022326,
      0.03105451,
      8769811e-9,
      -0.030746417,
      0.07646594,
      -0.036004536,
      0.04629264,
      0.057400167,
      9613034e-9,
      -0.058048014,
      -0.0058394647,
      -0.0049726907,
      -0.0285827,
      -0.04823421,
      0.03029983,
      -0.02780809,
      0.012205874,
      -0.034264006,
      -0.01576507,
      -37079732e-11,
      0.024969826,
      -0.032330636,
      -4342441e-9,
      0.0033932757,
      0.012267324,
      0.01996475,
      0.01306291,
      0.034724448,
      0.053104073,
      -0.0013664451,
      0.036242437,
      0.03666525,
      -0.016803415,
      0.022252234,
      -0.018574098,
      -0.0058872104,
      -2493062e-9,
      -0.0022654328,
      0.027704695,
      -0.011136052,
      0.0017066878,
      0.011948389,
      -8168454e-9,
      -0.047611505,
      0.021368966,
      -0.0133420965,
      0.047672536,
      -0.048353706,
      -0.0026551522,
      -0.023553893,
      -0.011967944,
      0.0052881804,
      -0.010660593,
      0.047552913,
      -5232375e-9,
      0.019800913,
      -0.051114876,
      -0.01331211,
      -0.041655023,
      0.02366453,
      0.058974884,
      0.044886377,
      0.022612335,
      0.013259754,
      0.016184645,
      0.03265916,
      -0.0076951645,
      0.015839864,
      -0.010732797,
      0.02265052,
      0.023501515,
      0.011191232,
      -0.04094461,
      -2522251e-9,
      -0.0059191165,
      -0.025708674,
      -0.04617673,
      0.036848824,
      0.019865664,
      0.010076843,
      -0.08322362,
      0.019083964,
      0.0636305,
      -0.04699536,
      -0.061770633,
      0.024020985,
      -0.0081048105,
      -0.0016936503,
      6115733e-9,
      0.055485595,
      8855861e-9,
      -0.055240113,
      -0.019197987,
      7724402e-9,
      0.050454404,
      0.012136047,
      -90550905e-11,
      0.03306893,
      0.09390175,
      -0.026698412,
      -6939027e-9,
      -0.047974627,
      0.018348446,
      0.028670298,
      0.0072484673,
      -0.0043037347,
      0.0449406,
      0.044810295,
      0.04329127,
      0.014639592,
      -0.016849991,
      -7660572e-9,
      -0.028823499,
      1870665e-9,
      -0.054335136,
      -0.025523357,
      -0.010867917,
      0.010253074,
      -0.05632218,
      0.021271272,
      0.06315777,
      -0.044056404,
      0.050925665,
      -91784e-7,
      -0.03439721,
      -0.030752404,
      0.045117106,
      0.0480522,
      8551584e-9,
      0.09901807,
      0.05989401,
      0.020739675,
      0.022763655,
      0.026575692,
      0.024013678,
      0.04799959,
      -0.017677158,
      0.024522211,
      -0.013444632,
      -0.0041820547,
      -0.020609692,
      -0.022726558,
      0.016176617,
      0.029525578,
      -0.054624744,
      -5285311e-9,
      0.02073943,
      -0.018274568,
      0.0022933134,
      -0.030573394,
      0.0037954233,
      -0.07195272,
      0.014957223,
      -0.014576422,
      0.015039367,
      0.022346184,
      -0.042280138,
      0.014726466,
      -0.0019070985,
      -0.047132596,
      0.029951643,
      0.013895772,
      0.048495915,
      0.050617207,
      -771284e-9,
      0.118374124,
      56595146e-11,
      -0.011238671,
      -0.012541103,
      0.024481993,
      0.01084206,
      -0.016319474,
      0.05806292,
      -0.0051376503,
      -0.015876617,
      0.012409944,
      0.018258238,
      -0.035605572,
      0.020307088,
      0.03210807,
      0.03252216,
      0.028763592,
      -9753308e-9,
      0.047546413,
      0.033406906,
      -0.0218896,
      0.029562254,
      0.08217829,
      553461e-8,
      -0.04412526,
      9977259e-9,
      -0.030578768,
      0.01582589,
      -0.032735374,
      -0.05063978,
      -0.0138172675,
      -0.015907103,
      0.026091173,
      0.042676188,
      931177e-8,
      0.033907942,
      0.060566954,
      0.0069125574,
      -0.010316821,
      -0.016607383,
      -0.096035175,
      -0.032938767,
      0.09079022,
      -0.04375176,
      -0.03247726,
      0.05273522,
      -0.030502465,
      -0.03301697,
      0.0071322517,
      -0.044875823,
      -0.022695897,
      -0.0034922773,
      -0.022510584,
      -0.0019433248,
      0.04412116,
      7582997e-9,
      8446474e-9,
      -0.09088846,
      0.0013523395,
      -8857828e-9,
      -0.018519873,
      -0.047873203,
      0.024794884,
      -0.03766449,
      -0.024996078,
      0.025935715,
      -0.052404035,
      -0.020916298,
      0.06516583,
      0.06737933,
      0.03175784,
      0.024470573,
      -0.046348657,
      0.010430056,
      0.065276615,
      0.0057093785,
      0.038182713,
      -0.029591294,
      0.013800926,
      -0.016332572,
      0.03495882,
      0.05084136,
      0.0356279,
      -0.05361847,
      0.0030256396,
      -9684273e-9,
      0.028576732,
      -0.02570839,
      -0.054834995,
      -0.055193957,
      0.014727369,
      0.04745515,
      -0.01556085,
      0.038460586,
      -0.11309199,
      0.052752618,
      0.07433574,
      -0.01656449,
      0.022492932,
      -0.027636174,
      6057482e-9,
      0.01719588,
      -0.015618962,
      -0.018012095,
      0.038982183,
      -0.06314939,
      8984407e-9,
      0.0032851184,
      -0.05080744,
      0.045055296,
      -0.011459868,
      -0.02163673,
      -5404976e-9,
      -8660437e-9,
      0.010002856,
      0.05125272,
      0.0013154292,
      95260824e-12,
      8751329e-9,
      0.025782632,
      0.056147307,
      0.04214192,
      0.0033748073,
      0.027249163,
      -0.03657986,
      -0.048356812,
      0.048132602,
      -0.0049820635,
      0.015697436,
      0.014145929,
      0.040794156,
      -0.035819944,
      0.045552693,
      0.03246698,
      -0.02049382,
      -0.032648005,
      -0.053933874,
      -0.020055098,
      -76399045e-11,
      0.0144512355,
      0.03923564,
      -0.020881081,
      -0.0072955023,
      0.012048742,
      -0.019221859,
      8493603e-9,
      5520436e-9,
      -0.028395586,
      0.024951579,
      -0.026423637,
      -9762591e-9,
      -0.020569034,
      0.0071286336,
      0.043525044,
      0.024066705,
      0.0401097,
      -0.011589796,
      0.028387994,
      0.023981567,
      -0.037846662,
      0.042937342,
      -8021181e-9,
      0.078590006,
      0.0621287,
      -0.017708905,
      0.03253779,
      0.06502723,
      -0.01846832,
      -0.034619905,
      -1792984e-9,
      -0.05401724,
      -0.03727644,
      -0.0061901347,
      24404303e-11,
      -0.043003082,
      0.0029236516,
      -0.02489681,
      -4251077e-9,
      0.06324464,
      0.0284772,
      -0.03441233,
      0.015448586,
      -0.047419246,
      -0.051282953,
      -0.029720103,
      -0.0019237103,
      0.016338134,
      0.051229157,
      0.01288134,
      0.05341323,
      -703172e-8,
      -0.0034804298,
      0.061303943,
      -24567763e-11,
      0.027233887,
      -0.05634185,
      0.037070863,
      -0.058227472,
      -0.016437983,
      0.03476669,
      -0.07517631
    ],
    [
      0.059899855,
      -0.0074116345,
      -0.017380273,
      -0.079729766,
      0.047318306,
      0.054350633,
      0.023557957,
      -0.011883338,
      0.06230201,
      0.030927582,
      -8416344e-9,
      -0.016045356,
      0.06716954,
      -0.027794287,
      0.024965068,
      0.0030320878,
      -0.016853305,
      -1386543e-9,
      0.0057243914,
      -0.055897273,
      -0.054838646,
      0.01594402,
      8625097e-9,
      -8010909e-9,
      -0.081065916,
      0.024020791,
      -0.015139091,
      0.010292991,
      -0.08229631,
      -0.027777147,
      0.029387314,
      -0.06697499,
      0.012985095,
      0.03727079,
      0.0039166184,
      -0.036663175,
      0.01757813,
      -0.025441073,
      0.018602267,
      -0.027960675,
      0.0014615786,
      0.03169149,
      0.0282993,
      0.07652074,
      0.023895564,
      0.04446814,
      -7716892e-9,
      -0.039491925,
      -0.032757614,
      0.02409116,
      0.018640716,
      -0.022767585,
      -0.030763015,
      0.013902367,
      -0.04727838,
      -0.070139945,
      -0.03272875,
      0.021586658,
      8180439e-9,
      -0.031393908,
      0.010197612,
      -0.0018221729,
      -0.050537895,
      -7306907e-10,
      9436676e-9,
      -0.02868746,
      0.011236823,
      0.013361346,
      -0.02195157,
      0.032625,
      0.025040213,
      0.025707614,
      0.013955442,
      -0.039276507,
      0.059165377,
      -0.03500221,
      -0.015372928,
      -0.04987809,
      -0.024537217,
      0.04262938,
      -0.022017268,
      -0.012785202,
      0.056603283,
      -0.045800906,
      0.04556221,
      0.027055472,
      -5504325e-9,
      -0.043608718,
      3754357e-9,
      -0.039297506,
      9673048e-9,
      0.021173228,
      -0.0026259995,
      -0.025726214,
      -25330315e-11,
      -0.03413355,
      -0.030113595,
      -0.041019436,
      0.052703075,
      -0.0239882,
      -0.0014078348,
      -0.027914913,
      -6887447e-9,
      0.0021199863,
      0.09528399,
      0.037760653,
      -4592361e-9,
      0.03194716,
      -9087177e-9,
      -0.034507938,
      -0.067601435,
      0.014467009,
      0.04229737,
      0.07048825,
      -0.0032150252,
      0.07497753,
      -0.048697934,
      0.03699908,
      -0.031624727,
      0.040634204,
      -0.071372956,
      -5001029e-9,
      -0.076428734,
      0.056612454,
      -0.0036845524,
      0.03794054,
      38566403e-11,
      0.0029059944,
      -629833e-8,
      0.041892298,
      0.07283488,
      -0.04762577,
      8146108e-9,
      -0.023463858,
      -0.024513341,
      -0.05492598,
      0.09261489,
      0.012730247,
      0.030138265,
      0.010916928,
      0.043963518,
      0.013580353,
      0.0042644856,
      -0.04569757,
      0.045987643,
      -0.03995683,
      -0.0037162153,
      -0.030857349,
      -0.07162474,
      0.011671949,
      -0.019310547,
      1984385e-9,
      -0.016510488,
      -0.06497572,
      16620253e-11,
      0.015419326,
      0.10789626,
      -0.03425937,
      -0.021736607,
      -0.024944114,
      0.03168919,
      -0.042948037,
      0.01621033,
      0.068599306,
      0.013384676,
      0.03581659,
      -0.045452535,
      -0.038387034,
      -7000253e-9,
      -80731156e-11,
      -0.031655625,
      0.028805545,
      -8860146e-9,
      -0.09401827,
      -0.0054744217,
      -0.034550674,
      -0.027355222,
      0.0467074,
      8545715e-9,
      -4279884e-9,
      0.09504841,
      0.030807545,
      -6673966e-9,
      -0.061032914,
      -0.08925134,
      0.02034303,
      0.05281746,
      0.0010496508,
      0.041203942,
      0.016757166,
      -0.076267116,
      0.04230492,
      -0.06665221,
      -0.019393642,
      -0.016301129,
      -0.06036221,
      0.025729274,
      -0.0397115,
      0.062571295,
      -9163416e-9,
      -0.0611884,
      0.03739893,
      -0.01897402,
      0.04205197,
      -0.019930944,
      -0.0054879445,
      -0.041275088,
      -0.043234166,
      -0.025415733,
      -0.01957922,
      0.02293205,
      -0.0057379655,
      -0.079964,
      -0.04091822,
      0.0333387,
      -0.018724142,
      0.10169009,
      0.034477454,
      0.066155665,
      -0.010734414,
      9724395e-9,
      -0.046393923,
      0.055944547,
      -0.020513527,
      0.06702705,
      0.0028240988,
      -0.06223737,
      0.021714587,
      -0.021473512,
      0.04016416,
      0.038215447,
      80036244e-11,
      0.015011038,
      -0.0029042556,
      -0.07275581,
      0.013080987,
      -0.019840635,
      -0.01207354,
      -0.010878235,
      0.03470812,
      -0.026459645,
      -0.011651573,
      -0.027996982,
      -0.028519832,
      -0.0030784025,
      -0.0028288714,
      0.0021905506,
      0.029577615,
      -0.06459311,
      -0.024784425,
      -0.022926945,
      -0.015924191,
      0.04527642,
      0.01418992,
      -0.063631706,
      -0.079843335,
      0.010184089,
      -0.036135808,
      0.0053921393,
      -0.017288392,
      0.015380995,
      -0.016865686,
      -0.07181354,
      -0.01895781,
      -0.0060556647,
      -0.07998049,
      -0.057196915,
      -0.030530067,
      0.090367176,
      -0.04679917,
      9750606e-9,
      -0.038408905,
      -0.043149084,
      -0.02298634,
      -0.070453696,
      0.041912608,
      -7977552e-9,
      0.021714661,
      -0.05680954,
      0.029453598,
      -0.031634618,
      -83672156e-11,
      0.0021569952,
      8763068e-9,
      -114878e-8,
      -0.03873119,
      -0.04581496,
      -0.04306031,
      -0.0046547437,
      920891e-8,
      0.03928653,
      0.03674934,
      -0.0387565,
      -0.0073751616,
      -0.043901846,
      -0.013107867,
      0.024299558,
      0.059409834,
      -8134517e-9,
      0.036145493,
      0.014615145,
      0.06509383,
      -0.045883454,
      806422e-8,
      -0.023444295,
      -0.04373869,
      -0.0580239,
      0.01707809,
      6856037e-10,
      0.021807939,
      0.03506355,
      5873734e-9,
      -3062261e-9,
      -0.0040925215,
      -0.07130344,
      -0.048627198,
      -0.064389765,
      -0.04579151,
      -29495292e-11,
      0.014992943,
      0.025039317,
      0.028678587,
      0.016148625,
      0.043840356,
      8976886e-9,
      0.05724829,
      0.028796948,
      -7991894e-9,
      0.05062473,
      -0.016007258,
      9839841e-10,
      0.038069643,
      0.015323561,
      -0.017586438,
      -0.023423655,
      0.010830576,
      -0.0055620917,
      0.028068816,
      8128821e-9,
      -0.010681596,
      0.034886695,
      0.025383601,
      0.021499345,
      0.026584487,
      -0.013954967,
      -0.0010922314,
      -5794401e-9,
      0.0116259055,
      -7973213e-9,
      0.030196203,
      0.030008554,
      -0.0032666419,
      -0.027290557,
      0.0011975187,
      -0.016852198,
      0.024165502,
      0.06680849,
      0.010444529,
      -0.043180775,
      -0.038577374,
      0.0017044607,
      0.035398092,
      -8764963e-9,
      -0.04346703,
      -0.012683148,
      -0.04542242,
      -8451382e-10,
      0.04688518,
      0.018971356,
      -8697785e-9,
      -0.024318397,
      -0.04991596,
      -0.048835568,
      0.021371378,
      0.0040080487,
      -0.0056465715,
      -0.01673079,
      0.0047806934,
      -0.046154417,
      -0.020984951,
      -0.023542859,
      -0.016876677,
      -0.0011474608,
      0.027358627,
      -0.0035241735,
      0.043850187,
      -0.08567068,
      -0.015890656,
      -0.07217253,
      0.025949538,
      -0.016835092,
      0.059522588,
      -0.021654675,
      -0.030875415,
      9835115e-9,
      -0.0048867934,
      -0.047465857,
      0.021744711,
      -0.035096984,
      0.0071240575,
      -0.010079897,
      -6228681e-10,
      0.06615882,
      0.018612549,
      0.027093336,
      -0.015431035,
      0.020435655,
      0.034193963,
      -0.05274653,
      -0.04946189,
      -0.023897314,
      -0.013249211,
      -0.03439469,
      6222774e-10,
      -0.0047400594,
      -0.022334356,
      -4534242e-10,
      -0.04599107,
      2766803e-9,
      0.0015068713,
      -0.030904671,
      -0.01899334,
      0.035861686,
      0.035786144,
      0.020316796,
      -0.011977328,
      -0.0030478612,
      0.0077776196,
      0.018255565,
      0.028906386,
      0.048679426,
      0.07018376,
      -0.016998647,
      0.03809492,
      0.032608643,
      -0.014653429,
      -0.019830544,
      -0.06374498,
      -0.0011862811,
      0.023259439,
      -3997554e-9,
      -0.015733447,
      0.04602787,
      -0.0056657298,
      -0.06253181,
      -0.025118029,
      0.018717218,
      0.033906933,
      0.030327423,
      -0.0062198294,
      -0.026306584,
      -0.041261278,
      -0.0019931213,
      -0.026824942,
      -0.03196431,
      -0.014765298,
      -0.052133758,
      -0.02513864,
      -0.04614009,
      -0.020220697,
      -0.025552148,
      -0.05529652,
      0.054559242,
      0.03330106,
      0.030433014,
      -0.031635083,
      0.0066224686,
      0.035427507,
      -0.0055327984,
      0.058728416,
      0.017248118,
      0.014638074,
      0.012355119,
      -0.03365371,
      -8283643e-9,
      0.015220346,
      4910732e-9,
      0.012610234,
      0.022117022,
      -0.022434495,
      -0.024861591,
      -0.048166126,
      0.018874098,
      -0.040812794,
      -0.014002987,
      -0.04422499,
      -0.030477885,
      -3779283e-9,
      0.0072369976,
      -0.01229826,
      0.011098091,
      -0.018690908,
      -0.03760552,
      0.011411592,
      -0.058315746,
      -0.042451512,
      -0.014682563,
      0.0073920507,
      0.04698725,
      0.0039856588,
      0.013843393,
      -0.045843083,
      0.024373852,
      -0.023706485,
      -0.050827734,
      -0.01961824,
      -0.025352547,
      -96185e-7,
      0.06189343,
      -0.04454739,
      0.029429054,
      -0.030868988,
      0.0023332986,
      -0.035710193,
      345644e-8,
      0.043411445,
      -0.07656063,
      0.0023328129,
      -0.016423684,
      -9077379e-9,
      -0.018147487,
      -0.041691482,
      0.06028799,
      -0.0541863,
      0.014291829,
      -0.026376741,
      0.026914356,
      -0.018687123,
      0.06458014,
      -0.032165106,
      -0.030832639,
      0.07845159,
      0.015912289,
      0.02142667,
      -4116077e-9,
      0.034329493,
      -0.0055597033,
      -0.025893565,
      -0.028049216,
      0.09124391,
      0.03667821,
      -0.02760714,
      -0.0011018498,
      0.0091004595,
      0.03932289,
      0.03277646,
      -0.0045620115,
      0.050467778,
      0.014754907,
      -0.049142476,
      -5358905e-9,
      0.032899246,
      -0.046283815,
      -0.056876343,
      0.027446596,
      -0.013718101,
      0.010632049,
      -0.046305947,
      0.0082004275,
      -0.024316425,
      -0.039193533,
      -7690582e-10,
      0.026133604,
      0.012460018,
      0.0057017365,
      0.02374191,
      -0.020348765,
      0.021232143,
      -0.077600256,
      0.05649992,
      0.0060779084,
      -0.0019882366,
      -0.0081181815,
      0.016650358,
      -0.026429234,
      0.05527366,
      0.0019933502,
      0.021632997,
      0.015153594,
      -0.044683058,
      0.011630077,
      0.058293246,
      0.044150066,
      0.036507457,
      -0.04242375,
      -0.025471736,
      -0.0030860805,
      -0.017890502,
      -0.036962323,
      0.02986873,
      0.043960236,
      0.05467491,
      -0.02513492,
      -0.025967456,
      0.0060812086,
      -0.0051189805,
      0.041300263,
      -0.0113567775,
      0.024329972,
      -0.0037331302,
      -0.012314184,
      -546336e-8,
      0.0063872417,
      0.0187459,
      -0.051937528,
      -0.010817247,
      0.04347139,
      -0.07159869,
      -0.0044918866,
      0.020837633,
      0.04059114,
      0.010241802,
      8133763e-9,
      -0.041089907,
      -0.045618773,
      0.0027129748,
      -0.03764895,
      -0.029975366,
      -5947228e-9,
      0.037100688,
      0.036948707,
      0.017349117,
      0.0029681262,
      -0.045742035,
      -0.043689862,
      -8855051e-9,
      0.021041596,
      -0.016778301,
      -0.053814583,
      0.064716026,
      -0.02963415,
      -0.0054887827,
      -0.02237944,
      0.10579649,
      -0.018259747,
      0.014037353,
      -0.053248297,
      0.038356252,
      -0.06558222,
      -0.015118693,
      0.0056539336,
      0.090447694,
      0.0042192303,
      0.011469742,
      -0.0324837,
      0.0021331152,
      0.020492578,
      0.0011643455,
      1365826e-9,
      -0.031858403,
      -0.0015928086,
      0.038719792,
      -0.034455027,
      0.050842203,
      -0.0017145602,
      0.03262891,
      -0.069448,
      192506e-8,
      -0.041159105,
      0.0051475232,
      0.057789262,
      -748527e-8,
      0.032507554,
      0.025171224,
      -0.047195263,
      -0.036430005,
      -0.025249004,
      0.020394608,
      -0.030942736,
      0.0013541792,
      -44204568e-11,
      -8320701e-9,
      -0.05739718,
      0.014183759,
      -0.018035306,
      -0.08019637,
      0.044956572,
      -0.024304168,
      0.0071877907,
      -5836141e-9,
      79910905e-11,
      -0.029010432,
      0.0265274,
      -314994e-8,
      0.027260538,
      0.015517717,
      0.039834525,
      0.015954452,
      -0.03235285,
      0.014948437,
      0.03295209,
      -0.04290121,
      -0.034009147,
      0.04720138,
      0.012954534,
      9898444e-9,
      -0.054681484,
      0.05008158,
      -0.049727485,
      9239304e-10,
      -0.020119963,
      -0.033892263,
      0.052152846,
      -0.07534157,
      0.05665553,
      -9005437e-9,
      0.016856942,
      6815433e-9,
      0.021610621,
      0.028009389,
      -0.010454304,
      -0.040149026,
      -0.014400761,
      0.020958863,
      -0.022869356,
      0.049444925,
      -6174342e-9,
      -0.053581662,
      0.021386886,
      0.032365125,
      -0.019061543,
      4607721e-9,
      0.062540516,
      0.048231557,
      0.01065951,
      -0.018578213,
      0.039578155,
      0.014869982,
      -0.03573411,
      0.019195553,
      0.02218011,
      222554e-8,
      0.032851063,
      0.086193666,
      -0.019847153,
      -0.049612425,
      0.054115757,
      -0.061135747,
      0.0439509,
      0.0022006286,
      0.030524984,
      -0.014779941,
      0.026861692,
      -0.0026778134,
      -0.03423518,
      -0.0013272492,
      0.0101100905,
      -0.04363649,
      -0.026233498,
      -0.020141326,
      -0.11881153,
      -0.022731578,
      0.018607777,
      -0.017670577,
      0.01631495,
      -0.030736813,
      -0.01183641,
      -0.028505584,
      0.040535282,
      0.048140272,
      -0.057221297,
      0.04934979,
      -0.03564722,
      0.04565423,
      -0.012087745,
      0.017807746,
      0.10412233,
      -0.013634177
    ]
  ]
};

// src/index.ts
import manifest from "__STATIC_CONTENT_MANIFEST";
var app = new Hono2();
app.use("/*", cors());
var getDb = /* @__PURE__ */ __name((c) => {
  return createClient({
    url: c.env.TURSO_DB_URL,
    authToken: c.env.TURSO_DB_TOKEN
  });
}, "getDb");
app.get("/api/topics", async (c) => {
  const db = getDb(c);
  try {
    const result = await db.execute(`
      SELECT 
        page_id, 
        COUNT(*) as count, 
        MAX(date) as latest_date 
      FROM articles 
      GROUP BY page_id
      ORDER BY latest_date DESC
    `);
    const topics = result.rows.map((row) => ({
      page_id: row.page_id,
      count: row.count,
      latest_date: row.latest_date
    }));
    return c.json(topics);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/articles", async (c) => {
  const db = getDb(c);
  const topic = c.req.query("topic");
  const date = c.req.query("date");
  const limit = c.req.query("limit") || "100";
  let query = "SELECT id, date, page_id, title, summary, priority, type FROM articles";
  const params = [];
  const conditions = [];
  if (date) {
    conditions.push("date = ?");
    params.push(date);
  }
  if (topic) {
    conditions.push("page_id = ?");
    params.push(topic);
  }
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY date DESC LIMIT ?";
  params.push(parseInt(limit));
  try {
    const result = await db.execute({ sql: query, args: params });
    const articles = [];
    for (const row of result.rows) {
      const articleId = row.id;
      const sourcesRes = await db.execute({
        sql: "SELECT link, original_link, source, scraped_text FROM sources WHERE article_id = ?",
        args: [articleId]
      });
      const sources = sourcesRes.rows.map((s) => ({
        link: s.link,
        original_link: s.original_link,
        source: s.source,
        scraped_text: s.scraped_text
      }));
      articles.push({
        id: row.id,
        date: row.date,
        page_id: row.page_id,
        title: row.title,
        summary: row.summary,
        priority: row.priority,
        type: row.type,
        sources
      });
    }
    return c.json(articles);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});
app.get("/api/search", async (c) => {
  const q = c.req.query("q");
  const mode = c.req.query("mode") || "semantic";
  if (!q) return c.json([]);
  const topics = topics_vectors_default.topics;
  if (mode === "simple") {
    const query = q.toLowerCase();
    const results = topics.map((t) => {
      let score = 0;
      const tName = t.topic_name.toLowerCase();
      const pTitle = t.page_title.toLowerCase();
      if (tName === query || pTitle === query) score = 1;
      else if (tName.includes(query) || pTitle.includes(query)) score = 0.8;
      else if (query.split(" ").some((w) => tName.includes(w))) score = 0.5;
      return {
        page_id: t.page_id,
        title: t.topic_name,
        score,
        summary: `Topic: ${t.topic_name}`
      };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
    return c.json(results);
  }
  try {
    const apiKey = c.env.GEMINI_API_KEY;
    const model = c.env.EMBEDDING_MODEL || "models/text-embedding-004";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text: q }] }
      })
    });
    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }
    const data = await response.json();
    const queryEmbedding = data.embedding.values;
    const topicEmbeddings = topics_vectors_default.embeddings;
    const results = topics.map((topic, i) => {
      const topicVec = topicEmbeddings[i];
      const score = cosineSimilarity(queryEmbedding, topicVec);
      return {
        page_id: topic.page_id,
        title: topic.topic_name,
        score,
        summary: `News about ${topic.topic_name}`
      };
    }).filter((r) => r.score > 0.4).sort((a, b) => b.score - a.score).slice(0, 5);
    return c.json(results);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Search failed" }, 500);
  }
});
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}
__name(cosineSimilarity, "cosineSimilarity");
app.get("/*", module({
  root: "./",
  manifest,
  rewriteRequestPath: /* @__PURE__ */ __name((path) => {
    if (path === "/") return "/index.html";
    if (path.includes(".")) return path;
    return "/index.html";
  }, "rewriteRequestPath")
}));
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-el1bqC/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-el1bqC/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
