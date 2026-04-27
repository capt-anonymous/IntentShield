/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c0e10",
        panel: "#16181b",
        border: "#2b2b2b",
        terracotta: {
          500: "#D9836C",
          400: "#F2A282",
        },
        green: {
          400: "#39ff14", // neon
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'block': '4px 4px 0px 0px var(--tw-shadow-color)',
        'block-sm': '2px 2px 0px 0px var(--tw-shadow-color)',
        'block-lg': '8px 8px 0px 0px var(--tw-shadow-color)',
      }
    },
  },
  plugins: [],
};
