# Digicomp Technologies documentation

This repository generates the static documentation site for Digicomp Technologies development boards with [VitePress](https://vitepress.dev/).

## Requirements

- Node.js 22 or later (the supported version is recorded in `.nvmrc`)
- npm

## Install and develop locally

```sh
npm install
npm run docs:dev
```

Open the local URL printed by VitePress, normally `http://localhost:5173`. Changes to Markdown pages and `.vitepress/config.mts` are reflected automatically.

## Generate and test the static site

```sh
npm run docs:build
npm run docs:preview
```

The generated, publishable files are in `.vitepress/dist/`. `docs:preview` serves that exact output locally, normally at `http://localhost:4173`.

## Deploy to shared hosting

1. Run `npm run docs:build`.
2. Upload the *contents* of `.vitepress/dist/` to the document root of the `docs` subdomain.
3. Do not upload the repository, `node_modules`, or `dist` itself as an extra parent directory.

The default base path is `/`, which is correct for `https://docs.example.com/`. If the site is instead hosted below a path such as `https://example.com/docs/`, use:

```sh
DOCS_BASE=/docs/ npm run docs:build
```

## Deploy to GitHub Pages

The included workflow at `.github/workflows/deploy.yml` builds and publishes the site on every push to `main`.

1. Push this repository to GitHub.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main`, or run the workflow manually from the Actions tab.
4. In **Settings → Pages**, enter the custom domain (for example, `docs.example.com`), then create the DNS record GitHub requests and enable HTTPS when it becomes available.

A `docs` subdomain is hosted at `/`, so it works with the default build. If this is deployed at a GitHub project URL such as `https://account.github.io/repository/`, set `DOCS_BASE=/repository/` in the workflow's build step.
