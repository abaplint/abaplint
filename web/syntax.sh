#!/bin/bash
set -x #echo on
cd "${0%/*}"
set +x #echo off
rm -f ./syntax/*.txt
rm -f ./syntax/*.svg
set -x #echo on
node ../build/src/abap/graphs.js
node ./generate.js
set +x #echo off
rm -f ./syntax/*.txt