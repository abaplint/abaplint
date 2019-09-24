#!/bin/bash
cd ..
git clone https://github.com/abaplint/playground.abaplint.org.git
git clone https://github.com/abaplint/syntax.abaplint.org.git

git config --global user.email "builds@travis-ci.com"
git config --global user.name "Travis CI"

cp abaplint/web/playground/index.html playground.abaplint.org/
cp -r abaplint/web/playground/build/* playground.abaplint.org/build/
cp -r abaplint/web/playground/img/* playground.abaplint.org/img/
cd playground.abaplint.org
git status
git add -A
git status
git commit -m "Travis build $TRAVIS_BUILD_NUMBER"
git push -q https://$GITHUB_API_KEY@github.com/abaplint/playground.abaplint.org.git > /dev/null 2>&1

cd ..

cp -r abaplint/web/syntax/* syntax.abaplint.org/
cd syntax.abaplint.org
git status
git add -A
git status
git commit -m "Travis build $TRAVIS_BUILD_NUMBER"
git push -q https://$GITHUB_API_KEY@github.com/abaplint/syntax.abaplint.org.git > /dev/null 2>&1