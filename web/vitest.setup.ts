// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import type { AxeResults } from 'axe-core';

// Manually implement toHaveNoViolations matcher since vitest-axe exports are type-only
function toHaveNoViolations(results: AxeResults) {
  const violations = results.violations;
  const pass = violations.length === 0;

  const message = () => {
    if (pass) {
      return 'Expected violations but found none';
    }

    const violationMessages = violations
      .map(
        (violation) =>
          `${violation.impact}: ${violation.description}\n` +
          violation.nodes
            .map((node) => `  - ${node.html}\n    ${node.failureSummary}`)
            .join('\n'),
      )
      .join('\n\n');

    return `Expected no accessibility violations but found ${violations.length}:\n\n${violationMessages}`;
  };

  return { pass, message };
}

// Extend Vitest matchers
expect.extend({ toHaveNoViolations });

// Polyfill for Radix UI pointer capture (not available in jsdom)
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = function () {
      return false;
    };
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = function () {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = function () {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {};
  }
}

// Polyfill for Web APIs needed by Next.js
// These are required for testing files that import from 'next/server'
if (typeof Request === 'undefined') {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;

    constructor(input: string | Request, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
    }
  } as unknown as typeof Request;
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    status: number;
    statusText: string;
    headers: Headers;
    body: unknown;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
    }

    json() {
      return Promise.resolve(JSON.parse(this.body as string));
    }
  } as unknown as typeof Response;
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    private headers: Map<string, string> = new Map();

    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) =>
            this.headers.set(key.toLowerCase(), value),
          );
        } else if (init instanceof Headers) {
          init.forEach((value, key) => this.headers.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) =>
            this.headers.set(key.toLowerCase(), value),
          );
        }
      }
    }

    get(name: string) {
      return this.headers.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }

    has(name: string) {
      return this.headers.has(name.toLowerCase());
    }

    delete(name: string) {
      this.headers.delete(name.toLowerCase());
    }

    forEach(callback: (value: string, key: string, parent: Headers) => void) {
      this.headers.forEach((value, key) => callback(value, key, this));
    }
  } as unknown as typeof Headers;
}
