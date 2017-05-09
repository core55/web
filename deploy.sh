#!/bin/bash

RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

printf "\n > ${CYAN}Deploy to ${MAGENTA}production${NC}. "
read -p "Are you sure (y/n)? " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted."
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

echo "Deploying.."

git checkout deploy || git checkout -b deploy
git reset --hard
git merge -X theirs --no-edit master

npm run build

git add -A
git commit -m "New deploy"
git subtree push --prefix dist heroku master
# git push --force heroku `git subtree split --prefix dist HEAD`:master
git checkout master
