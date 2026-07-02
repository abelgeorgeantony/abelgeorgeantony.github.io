# Abel George Antony Personal Site

This site is split across two GitHub Pages repositories:

- `abelgeorgeantony.github.io` is the main user site. It owns the shared layout, CSS, fonts, and most shared JavaScript.
- `gallery` is a project site. On GitHub Pages it is mounted at `/gallery/`, and it uses this main repo as a Jekyll remote theme.

## GitHub Pages Setup

Push and deploy the main repo first whenever shared layout or asset files change. The gallery repo builds against the main repo as its remote theme, so it needs the latest main repo code to be available on GitHub.

For the `gallery` repository, GitHub Pages should publish from:

- Source: deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

With that setup, these URLs should share one origin:

- Main site: `https://abelgeorgeantony.github.io/`
- Gallery page: `https://abelgeorgeantony.github.io/gallery/`
- Gallery assets: `https://abelgeorgeantony.github.io/gallery/assets/images/...`

## Local Testing

The closest match to GitHub Pages is a combined local build:

```sh
cd abelgeorgeantony.github.io
bash scripts/serve-combined.sh
```

Then open:

- `http://127.0.0.1:4000/`
- `http://127.0.0.1:4000/gallery/`

For network testing from another device on the same network:

```sh
cd abelgeorgeantony.github.io
HOST=0.0.0.0 PORT=4000 bash scripts/serve-combined.sh
```

Then open `http://<your-computer-ip>:4000/` from the other device.

You can still run each repo with `bundle exec jekyll serve` while working on one repo in isolation, but the combined helper is the reliable way to test interlinks because GitHub Pages also serves both sites under one host.
