#!/bin/bash
ABAPLINTVER=$(grep version\" package.json | cut -d\" -f4)
sed -i "s|{{ VERSION }}|"$ABAPLINTVER"|" build/src/runner.js