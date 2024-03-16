#!/usr/bin/env bash

cd "$(dirname $0)"
SRC=icons
OUT=public

if [ "$1" = "--spit" ]; then
  shift
  x=$1
  fn=$2
  src=$3
  sed -e 's/width="24" height="24"/width="'$x'" height="'$x'"/' $src \
    | convert svg:- $OUT/$fn
  exit
fi

if [ "$1" = "--beta" ]; then
  echo "Using beta's icon color"
  sed -e 's/#F57F17/#1976d2/' -i '.prod' $SRC/*.svg
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

spit 180 apple-touch-icon.png $SRC/logo.svg
sed -e 's/fill="#F57F17"/fill="none"/' $SRC/logo.svg > $OUT/safari-pinned-tab.svg
sed -e 's/fill="#1976d2"/fill="none"/' -i '' $OUT/safari-pinned-tab.svg

for x in 16 32 48; do
  spit $x favicon-${x}x$x.png $SRC/logo.svg
  dkr convert -colors 256 $OUT/favicon-${x}x$x.png favicon-${x}x$x.ico
done
dkr convert favicon-48x48.ico favicon-32x32.ico favicon-16x16.ico $OUT/favicon.ico
rm favicon-*.ico

for f in $SRC/*.svg.prod; do
  if [ -f "$f" ]; then
    mv "$f" "${f%.*}"
  fi
done
