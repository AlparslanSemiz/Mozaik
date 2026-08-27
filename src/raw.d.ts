// Vite's `?raw` import, declared once.
//
// `tsconfig.json` sets `types: ["vitest/globals"]` on purpose, so `vite/client`
// is not pulled in wholesale — this project deliberately does not have Node's
// globals in scope inside `src/`, and a stray `process` or `Buffer` compiling
// silently would be exactly the wrong thing in a file that ships to a browser.
// One declaration is cheaper than that whole surface.
declare module '*?raw' {
  const text: string;
  export default text;
}
