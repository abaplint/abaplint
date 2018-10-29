#!/bin/bash
cd ..
git clone https://github.com/abaplint/web.playground.git
git clone https://github.com/abaplint/web.syntax.git

git config --global user.email "builds@travis-ci.com"
git config --global user.name "Travis CI"

cp -r abaplint/web/playground/* web.playground/
cd web.playground
git status
git add -A
git status
git commit -m "Travis build $TRAVIS_BUILD_NUMBER"
git push -q https://$GITHUB_API_KEY@github.com/abaplint/web.playground.git > /dev/null 2>&1

cd ..

cp -r abaplint/web/syntax/* web.syntax/
cd web.syntax
git status
git add -A
git status
git commit -m "Travis build $TRAVIS_BUILD_NUMBER"
git push -q https://$GITHUB_API_KEY@github.com/abaplint/web.syntax.git > /dev/null 2>&1