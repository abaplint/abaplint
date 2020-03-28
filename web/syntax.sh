#!/bin/bash
set -x #echo on
cd "${0%/*}"
set +x #echo off
rm -f ./syntax/*.json
rm -f ./syntax/*.svg
set -x #echo on
node ./graphs.js
node ./generate.js
set +x #echo off
rm -f ./syntax/*.json