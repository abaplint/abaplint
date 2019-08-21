#!/bin/bash
ABAPLINTVER=$(grep version\" package.json | cut -d\" -f4)
if [ -f build/src/registry.js ]; then
  sed -i "s|{{ VERSION }}|"$ABAPLINTVER"|" build/src/registry.js
fi
if [ -f build/web/src/registry.js ]; then
  sed -i "s|{{ VERSION }}|"$ABAPLINTVER"|" build/web/src/registry.js
fi