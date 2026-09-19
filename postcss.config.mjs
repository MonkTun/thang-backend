// Tailwind v4 is only used by the blog editor / blog renderer layer
// (styles/blog.css). The rest of the site keeps its hand-written CSS in
// styles/globals.css — Tailwind's preflight is deliberately NOT imported so
// existing pages are untouched (see the scoped `.tw-reset` in blog.css).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
