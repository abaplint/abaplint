#!/bin/bash
ABAPLINTVER=$(grep version\" package.json | cut -d\" -f4)
if [ -f build/src/runner.js ]; then
  sed -i "s|{{ VERSION }}|"$ABAPLINTVER"|" build/src/runner.js
fi
if [ -f build/web/src/runner.js ]; then
  sed -i "s|{{ VERSION }}|"$ABAPLINTVER"|" build/web/src/runner.js
fi