#!/bin/bash
cd ..
git clone https://github.com/abaplint/playground.abaplint.org.git
git clone https://github.com/abaplint/syntax.abaplint.org.git

git config --global user.email "builds@travis-ci.com"
git config --global user.name "Travis CI"

cp -r abaplint/web/playground/public/* playground.abaplint.org/
cp abaplint/web/playground/build/json.worker.bundle.js playground.abaplint.org/
cp abaplint/web/playground/build/editor.worker.bundle.js playground.abaplint.org/
cp abaplint/web/playground/build/app.worker.bundle.js playground.abaplint.org/
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