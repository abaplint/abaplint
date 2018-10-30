#!/bin/bash
set -x #echo on
cd "${0%/*}"
cp ../build/bundle.js playground/script/bundle.js
cp ../node_modules/codemirror-abap/build/abap.js playground/script/