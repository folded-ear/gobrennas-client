#!/usr/bin/env bash

cd `dirname $0`
SRC=src/icons.svg
OUT=public
IMAGE_NAME=gobrennas-icons:latest

if [ "$1" = "--spit" ]; then
  shift
  x=$1
  fn=$2
  sed -e 's/width="24" height="24"/width="'$x'" height="'$x'"/' $SRC \
    | convert svg:- $OUT/$fn
  exit
fi

function dkr() {
  docker run --rm -v "$(pwd):/app" $IMAGE_NAME "$@"
}

function spit() {
  dkr ./icons.sh --spit "$@"
}

echo
echo "I rebuild the icons in the public directory, w/ a little interactive"
echo "help from you to twiddle various uncommented blocks in $SRC"
echo
echo "Building the ImageMagick Docker image, since macOS can't do SVG?!"
docker build --pull -f Dockerfile-icons -t $IMAGE_NAME .
dkr convert -version
echo

echo -n "First, uncomment the 'library' block and press Enter: "
read
for x in 96 192; do
  spit $x library-${x}x$x.png
done
echo

echo -n "Now, uncomment the 'plan' block and press Enter: "
read
for x in 96 192; do
  spit $x plan-${x}x$x.png
done
echo

echo -n "Now 'shop': "
read
for x in 96 192; do
  spit $x shop-${x}x$x.png
done
echo

echo -n "And finally, the logo: "
read
for x in 96 192 384 512; do
  spit $x android-chrome-${x}x$x.png
done

spit 150 mstile-150x150.png

spit 180 apple-touch-icon.png
sed -e 's/fill="#F57F17"/fill="none"/' $SRC > $OUT/safari-pinned-tab.svg

for x in 16 32 48; do
  spit $x favicon-${x}x$x.png
  convert -colors 256 $OUT/favicon-${x}x$x.png favicon-${x}x$x.ico
done
convert favicon-48x48.ico favicon-32x32.ico favicon-16x16.ico $OUT/favicon.ico
rm favicon-*.ico
