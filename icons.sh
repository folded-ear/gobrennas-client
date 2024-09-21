#!/usr/bin/env bash

cd "$(dirname $0)"
SRC=icons
OUT=public
API=../gobrennas-api

if [ "$1" = "--spit" ]; then
  shift
  x=$1
  fn=$2
  src=$3
  sed -e 's/width="24" height="24"/width="'$x'" height="'$x'"/' $src \
    | convert svg:- $OUT/$fn
  exit
fi

if [ "$1" = "--mode" ]; then
  if [ -z "$2" ]; then
    echo "You haven't specified a mode (e.g., '$0 --mode beta')"
    exit 1
  fi
  MODE="$2"
  # emulate Vite's env loading
  function env_stack() {
    for fn in .env .env.local .env.$1 .env.$1.local; do
      if [ -f "env/$fn" ]; then
        echo "loading '$fn' for '$1'"
        # shellcheck disable=SC1090
        source "env/$fn"
      fi
    done
  }
  env_stack "production"
  TC_BASE="$VITE_THEME_COLOR"
  env_stack "$MODE"
  TC_TARGET="$VITE_THEME_COLOR"
  if [ "$TC_BASE" = "$TC_TARGET" ]; then
    echo "Mode '$MODE' doesn't use a custom color - nothing to do"
    exit 0
  else
    echo "Using $TC_TARGET as icon color for '$MODE' (vs $TC_BASE)"
    sed -e "s/$TC_BASE/$TC_TARGET/" -i '.prod' $SRC/*.svg
    # this one is direct
    sed -e "s/$TC_BASE/$TC_TARGET/" -i '' $OUT/browserconfig.xml
  fi
fi

function spit() {
  echo -n "> "
  echo "$@"
  dkr ./icons.sh --spit "$@"
}

if [ "$CI" ]; then
  # in CI, run directly
  function dkr() {
    "$@"
  }
else
  # outside CI, protect from macOS
  IMAGE_NAME=gobrennas-icons:latest
  function dkr() {
    docker run --rm -v "$(pwd):/app" $IMAGE_NAME "$@"
  }

  echo "Building the ImageMagick Docker image, since macOS can't do SVG?!"
  docker build --pull -f Dockerfile-icons -t $IMAGE_NAME .
fi

dkr convert -version
echo

# remove whatever is already there
rm -f $OUT/*.png $OUT/*.ico $OUT/*.svg

for x in 96 192; do
  spit $x library-${x}x$x.png $SRC/library.svg
done

for x in 96 192; do
  spit $x plan-${x}x$x.png $SRC/plan.svg
done

for x in 96 192; do
  spit $x shop-${x}x$x.png $SRC/shop.svg
done

for x in 96 192 384 512; do
  spit $x android-chrome-${x}x$x.png $SRC/logo.svg
done

spit 150 mstile-150x150.png $SRC/logo.svg

spit 180 apple-touch-icon-180x180.png $SRC/logo.svg
## backwards compat
cp $OUT/apple-touch-icon-180x180.png $OUT/apple-touch-icon.png

for x in 16 32 48; do
  spit $x favicon-${x}x$x.png $SRC/logo.svg
  dkr convert -colors 256 $OUT/favicon-${x}x$x.png favicon-${x}x$x.ico
done
dkr convert favicon-48x48.ico favicon-32x32.ico favicon-16x16.ico $OUT/favicon.ico
rm favicon-*.ico
# SVG too!
cp $SRC/logo.svg $OUT/favicon.svg
if [ -d $API ]; then
  echo "Copying favicons to the API too"
  cp $OUT/favicon.* $API/src/main/resources/public/
fi

# this will be a no-op if there wasn't a color munge
for f in $SRC/*.svg.prod; do
  if [ -f "$f" ]; then
    mv "$f" "${f%.*}"
  fi
done
