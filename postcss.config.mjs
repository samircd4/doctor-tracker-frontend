/**
 * postcss.config.mjs
 * Tailwind CSS v4 via PostCSS: the setup recommended in the Next.js docs.
 * (Replaced the experimental @tailwindcss/turbopack loader, which did not
 * pick up changes to globals.css while `next dev` was running.)
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
