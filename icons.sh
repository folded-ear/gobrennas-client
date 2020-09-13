#!/usr/bin/env bash

cd `dirname $0`
SRC=src/icons.svg
OUT=public

convert --help > /dev/null
if [ $? != 1 ]; then
  echo "It looks like you don't have ImageMagick installed, so fix that first."
  exit
fi

function spit() {
  x=$1
  fn=$2
  sed -e 's/width="24" height="24"/width="'$x'" height="'$x'"/' $SRC | convert svg:- $OUT/$fn
}

echo "I rebuild the icons in the public directory, w/ a little interactive"
echo "help from you to twiddle the uncommented blocks in $SRC"
echo

echo -n "First, uncomment the 'library' block and press Enter: "
read
spit 192 library.png
echo

echo -n "Now, uncomment the 'plan' block and press Enter: "
read
spit 192 plan.png
echo

echo -n "Now 'shop': "
read
spit 192 shop.png
echo

echo -n "And finally, the logo: "
read
for x in 192 384 512; do
  spit $x android-chrome-${x}x$x.png
done

spit 150 mstile-150x150.png

spit 180 apple-touch-icon.png
sed -e 's/fill="#bf360c"/fill="none"/' $SRC > $OUT/safari-pinned-tab.svg

for x in 16 32 48; do
  spit $x favicon-${x}x$x.png
  convert -colors 256 $OUT/favicon-${x}x$x.png favicon-${x}x$x.ico
done
convert favicon-48x48.ico favicon-32x32.ico favicon-16x16.ico $OUT/favicon.ico
rm favicon-*.ico
