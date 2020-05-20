# pronouns.me

A small website for previewing, visualizing, and sharing pronoun sets.

## Developing

This website uses [Next.js](https://nextjs.org/) on top of React and TypeScript. If PRing, please follow the
[Prettier](https://prettier.io/), [ESLint](https://eslint.org/), and [Stylelint](https://stylelint.io/) guidelines
defined in `package.json`.

- To start a Next.js development server, use `npm run dev`.
- To start a production-ready server, use `npm run build`, followed by `npm run start`.
- To run the app through ESLint/Prettier and Stylelint, use `npm run lint`.

Due to the way the app uses URL paths, pre-rendering pages doesn't make much sense.
Still looking for ways to potentially fix this (maybe pre-define a bunch of pages based on our preset pronoun list?).
