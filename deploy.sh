#!/bin/bash
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
git checkout master
