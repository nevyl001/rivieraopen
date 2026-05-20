import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for TextEncoder/TextDecoder in Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for Request/Response/Headers (Next.js web APIs)
if (typeof Request === "undefined") {
  global.Request = class Request {};
  global.Response = class Response {};
  global.Headers = class Headers {};
  global.FormData = class FormData {
    constructor() {
      this.data = new Map();
    }
    append(key, value) {
      this.data.set(key, value);
    }
    get(key) {
      return this.data.get(key);
    }
  };
}

// Set environment for tests
process.env.NEXT_PUBLIC_ENV = "dev";
