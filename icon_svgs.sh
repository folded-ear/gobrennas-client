#!/usr/bin/env bash

cd "$(dirname $0)"
SRC=src/icons.svg
OUT=icons

mkdir -p "$OUT"

echo
echo "I rebuild the SVG icons in the '$OUT' directory, w/ a little interactive"
echo "help from you to twiddle various uncommented blocks in '$SRC'"
echo

echo -n "First, comment out the logo block, uncomment 'library', and press Enter: "
read
cp $SRC $OUT/library.svg
echo

echo -n "Now, uncomment the 'plan' block and press Enter: "
read
cp $SRC $OUT/plan.svg
echo

echo -n "Now 'shop': "
read
cp $SRC $OUT/shop.svg
echo

echo -n "And finally, the logo: "
read
cp $SRC $OUT/logo.svg
echo

for fn in $OUT/*.svg; do
  npm run min-xml -- $fn
done

echo
echo "To generate binaries, run 'icons.sh'"
