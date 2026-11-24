# Time Sum Calculator

A Next.js and TypeScript calculator for adding durations and applying multipliers.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `npm run build` and
`npm start` for a production build, `npm test` to run the calculation tests, or
`npm run typecheck` to check TypeScript types.
The tests use `tsx` to support all Node.js versions listed above.

On Windows PowerShell, use `npm.cmd` instead of `npm` if the execution policy
blocks `npm.ps1` (for example, `npm.cmd run dev`).

The Next.js app and global styles are in `app/`; the calculation logic is in
`lib/`.
