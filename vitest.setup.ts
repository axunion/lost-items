import "@testing-library/jest-dom";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

// jest-dom's bundled Vitest typings target Vitest 4's Assertion<T>; Vitest 5
// reads custom matcher types from Matchers<R, T> instead.
declare module "vitest" {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends TestingLibraryMatchers<unknown, R> {}
}

// jsdom does not implement object URLs; stub them for components that create
// image previews via URL.createObjectURL / revokeObjectURL.
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:mock";
  URL.revokeObjectURL = () => {};
}
