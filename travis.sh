#!/bin/bash
cd ..
git clone https://github.com/larshp/abaplint.git -b gh-pages pages
cp -r abaplint/web/* pages/
cd pages
git status
git config --global user.email "builds@travis-ci.com"
git config --global user.name "Travis CI"
git add -A
git status
git commit -m "Travis build $TRAVIS_BUILD_NUMBER"
git push -q https://$GITHUB_API_KEY@github.com/larshp/abaplint.git gh-pages > /dev/null 2>&1