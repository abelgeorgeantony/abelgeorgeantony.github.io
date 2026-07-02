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

cd "$main_dir"
bundle exec jekyll build

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

cd "$gallery_dir"
bundle exec jekyll build \
  --source "$gallery_source" \
  --destination "$gallery_site" \
  --config "$gallery_source/_config.yml,$local_gallery_config"

rm -rf "$main_dir/_site/gallery"
mkdir -p "$main_dir/_site/gallery"
cp -R "$gallery_site/." "$main_dir/_site/gallery/"

if [ "${BUILD_ONLY:-0}" = "1" ]; then
  printf 'Built combined site at %s/_site\n' "$main_dir"
  exit 0
fi

cd "$main_dir/_site"
printf 'Serving combined site at http://%s:%s/\n' "$host" "$port"
printf 'Gallery is mounted at http://%s:%s/gallery/\n' "$host" "$port"
ruby -run -e httpd . -b "$host" -p "$port"
