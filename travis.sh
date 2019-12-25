#!/bin/bash
cd ..
git clone https://github.com/abaplint/syntax.abaplint.org.git

git config --global user.email "builds@travis-ci.com"
git config --global user.name "Travis CI"

cp -r abaplint/web/syntax/* syntax.abaplint.org/
cd syntax.abaplint.org
git status
git add -A
git status
git commit -m "Travis build $TRAVIS_BUILD_NUMBER"
git push -q https://$GITHUB_API_KEY@github.com/abaplint/syntax.abaplint.org.git > /dev/null 2>&1
