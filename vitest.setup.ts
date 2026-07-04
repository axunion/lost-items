import "@testing-library/jest-dom";

// jsdom does not implement object URLs; stub them for components that create
// image previews via URL.createObjectURL / revokeObjectURL.
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:mock";
  URL.revokeObjectURL = () => {};
}
