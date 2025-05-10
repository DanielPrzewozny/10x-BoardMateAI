import { fetch, Headers, Request, Response } from "undici";

// Dodaj fetch do globalnego obiektu
if (!globalThis.fetch) {
  Object.assign(globalThis, {
    fetch,
    Headers,
    Request,
    Response,
  });
}

export { fetch, Headers, Request, Response };
