#!/usr/bin/env bash
set -euo pipefail

# 1. Define all repository directories
main_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
gallery_dir="${GALLERY_REPO:-$(cd "$main_dir/../gallery" && pwd)}"
posts_dir="${POSTS_REPO:-$(cd "$main_dir/../posts" && pwd)}"
host="${HOST:-127.0.0.1}"
port="${PORT:-4000}"
build_root="${TMPDIR:-/tmp}/abel-site-combined"

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

# 2. Generic build function for any sub-repository
build_subproject() {
  local sub_dir="$1"
  local sub_name="$2"
  
  local sub_source="$build_root/${sub_name}-source"
  local sub_site="$build_root/${sub_name}-site"

  echo "=> Building ${sub_name} site..."
  rm -rf "$sub_source" "$sub_site"
  mkdir -p "$sub_source/_layouts" "$sub_source/assets"

  # Copy subrepo content, then overlay main theme assets
  copy_source "$sub_dir" "$sub_source"
  cp -R "$main_dir/_layouts/." "$sub_source/_layouts/"
  cp -R "$main_dir/assets/." "$sub_source/assets/"
  
  # Re-apply the subrepo's specific assets if they exist (to override theme defaults)
  if [ -d "$sub_dir/assets" ]; then
    cp -R "$sub_dir/assets/." "$sub_source/assets/"
  fi

  local_config="$build_root/${sub_name}-local.yml"
  {
    printf 'remote_theme:\n'
    printf 'theme:\n'
    printf 'plugins:\n'
    printf '  - jekyll-seo-tag\n'
    printf '  - jekyll-sitemap\n'
  } > "$local_config"

  (
    cd "$sub_dir"
    bundle exec jekyll build \
      --source "$sub_source" \
      --destination "$sub_site" \
      --config "$sub_source/_config.yml,$local_config"
  )

  # Mount the built sub-site into the main _site folder
  mkdir -p "$main_dir/_site/$sub_name"
  cp -R "$sub_site/." "$main_dir/_site/$sub_name/"
  echo "=> ${sub_name} build complete and mounted."
}

# 3. Build all subprojects upfront
build_subproject "$gallery_dir" "gallery"
build_subproject "$posts_dir" "posts"

# 4. Watch subprojects in the background for changes
if command -v inotifywait >/dev/null 2>&1; then
  echo "=> Starting background watcher for sub-repositories..."
  (
    # Add posts_dir to the inotifywait monitor list
    while inotifywait -q -r -e modify,create,delete,move \
      --exclude '(/\.git/|/_site/|/\.jekyll-cache/|/\.bundle/|/vendor/)' \
      "$gallery_dir" "$posts_dir"; do
      
      build_subproject "$gallery_dir" "gallery"
      build_subproject "$posts_dir" "posts"
    done
  ) &
  WATCHER_PID=$!
  trap 'kill $WATCHER_PID 2>/dev/null' EXIT
else
  echo "[!] inotifywait not found. Sub-repositories will not auto-rebuild."
fi

# 5. Create a temporary config to protect the mounted folders
dev_config="$build_root/main-dev.yml"
# Add "posts" to the keep_files array
echo 'keep_files: ["gallery", "posts"]' > "$dev_config"

# 6. Start the native Jekyll server with Livereload for the main repo
cd "$main_dir"
echo "=> Starting Jekyll native livereload server..."
bundle exec jekyll serve \
  --livereload \
  --host "$host" \
  --port "$port" \
  --config _config.yml,"$dev_config"