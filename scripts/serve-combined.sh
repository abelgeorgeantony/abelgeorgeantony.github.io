#!/usr/bin/env bash
set -euo pipefail

main_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
gallery_dir="${GALLERY_REPO:-$(cd "$main_dir/../gallery" && pwd)}"
host="${HOST:-127.0.0.1}"
port="${PORT:-4000}"
build_root="${TMPDIR:-/tmp}/abel-site-combined"
gallery_source="$build_root/gallery-source"
gallery_site="$build_root/gallery-site"

copy_source() {
  local source_dir="$1"
  local target_dir="$2"

  mkdir -p "$target_dir"

  (
    cd "$source_dir"
    find . \
      -path './.git' -prune -o \
      -path './_site' -prune -o \
      -path './.jekyll-cache' -prune -o \
      -path './.bundle' -prune -o \
      -path './vendor' -prune -o \
      -print
  ) | while IFS= read -r entry; do
    [ "$entry" = "." ] && continue

    if [ -d "$source_dir/$entry" ]; then
      mkdir -p "$target_dir/$entry"
    else
      cp "$source_dir/$entry" "$target_dir/$entry"
    fi
  done
}

# Wrap the build process in a function so the watcher can call it
build_combined_site() {
  echo "=> Building main site..."
  (
    cd "$main_dir"
    bundle exec jekyll build
  )

  rm -rf "$build_root"
  mkdir -p "$gallery_source"

  copy_source "$gallery_dir" "$gallery_source"
  mkdir -p "$gallery_source/_layouts" "$gallery_source/assets"
  cp -R "$main_dir/_layouts/." "$gallery_source/_layouts/"
  cp -R "$main_dir/assets/." "$gallery_source/assets/"
  cp -R "$gallery_dir/assets/." "$gallery_source/assets/"

  local_gallery_config="$build_root/gallery-local.yml"
  {
    printf 'remote_theme:\n'
    printf 'theme:\n'
    printf 'plugins:\n'
    printf '  - jekyll-seo-tag\n'
    printf '  - jekyll-sitemap\n'
  } > "$local_gallery_config"

  echo "=> Building gallery site..."
  (
    cd "$gallery_dir"
    bundle exec jekyll build \
      --source "$gallery_source" \
      --destination "$gallery_site" \
      --config "$gallery_source/_config.yml,$local_gallery_config"
  )

  rm -rf "$main_dir/_site/gallery"
  mkdir -p "$main_dir/_site/gallery"
  cp -R "$gallery_site/." "$main_dir/_site/gallery/"
  echo "=> Combined build complete."
}

# 1. Handle BUILD_ONLY flag
if [ "${BUILD_ONLY:-0}" = "1" ]; then
  build_combined_site
  printf 'Built combined site at %s/_site\n' "$main_dir"
  exit 0
fi

# 2. Perform the initial build
build_combined_site

# 3. Start the file watcher in the background
if command -v inotifywait >/dev/null 2>&1; then
  echo "=> Starting file watcher..."
  (
    # Watch both directories recursively, ignoring build outputs and git folders
    while inotifywait -q -r -e modify,create,delete,move \
      --exclude '(/\.git/|/_site/|/\.jekyll-cache/|/\.bundle/|/vendor/)' \
      "$main_dir" "$gallery_dir"; do
      echo "=> File change detected, rebuilding..."
      build_combined_site
    done
  ) &
  WATCHER_PID=$!
  # Ensure the background watcher is killed when you exit the script (Ctrl+C)
  trap 'kill $WATCHER_PID 2>/dev/null' EXIT
else
  echo "[!] inotifywait not found. Auto-rebuild is disabled."
  echo "    Install with: sudo apt install inotify-tools"
fi

# 4. Start the hot-reload server
cd "$main_dir/_site"
if command -v live-server >/dev/null 2>&1; then
  printf '=> Starting live-server at http://%s:%s/\n' "$host" "$port"
  # The --wait=1000 flag debounces the browser refresh so it waits 1 second 
  # for the Jekyll build to finish writing files before reloading.
  live-server . --host="$host" --port="$port" --wait=1000
else
  echo "[!] live-server not found. Hot-reload is disabled."
  echo "    Install with: npm install -g live-server"
  printf '=> Serving static combined site at http://%s:%s/\n' "$host" "$port"
  ruby -run -e httpd . -b "$host" -p "$port"
fi