#!/bin/bash
set -x #echo on
cd "${0%/*}"
cp ../build/bundle.js playground/script/bundle.js