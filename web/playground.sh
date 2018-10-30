#!/bin/bash
set -x #echo on
cd "${0%/*}"
cp ../build/bundle.js playground/script/bundle.js
cp ../node_modules/codemirror/lib/codemirror.js playground/script/
cp ../node_modules/codemirror/addon/selection/mark-selection.js playground/script/
cp ../node_modules/codemirror/lib/codemirror.css playground/style/
cp ../node_modules/codemirror/theme/mbo.css playground/style/
cp ../node_modules/codemirror-abap/build/abap.js playground/script/