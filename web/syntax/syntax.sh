#!/bin/bash
set -x #echo on
cd "${0%/*}"
set +x #echo off
mkdir ./build/ -p
rm -f ./build/*.json
rm -f ./build/*.svg
set -x #echo on
node ./graphs.js
node ./generate.js
set +x #echo off
rm -f ./build/*.json
cp ./public/* ./build/
node ./where_used.js