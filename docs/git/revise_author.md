revise_author.md

### Check the author in history
```
$ git log --pretty=full | grep  -E '(Author|Commit): (.*)$' | sed 's/Author: //g' | sed 's/Commit: //g' | sort -u
```

### Revise the author email and name
git filter-branch --env-filter '
    if [ "$GIT_COMMITTER_EMAIL" = "noreply@github.com" ]; then
        export GIT_COMMITTER_NAME="Richard Li"
        export GIT_COMMITTER_EMAIL="lifuzu+bepro@gmail.com"
    fi
    if [ "$GIT_AUTHOR_EMAIL" = "noreply@github.com" ]; then
        export GIT_AUTHOR_NAME="Richard Li"
        export GIT_AUTHOR_EMAIL="lifuzu+bepro@gmail.com"
    fi
    if [ "$GIT_COMMITTER_EMAIL" = "lifuzu@users.noreply.github.com" ]; then
        export GIT_COMMITTER_NAME="Richard Li"
        export GIT_COMMITTER_EMAIL="lifuzu+bepro@gmail.com"
    fi
    if [ "$GIT_AUTHOR_EMAIL" = "lifuzu@users.noreply.github.com" ]; then
        export GIT_AUTHOR_NAME="Richard Li"
        export GIT_AUTHOR_EMAIL="lifuzu+bepro@gmail.com"
    fi
    if [ "$GIT_COMMITTER_EMAIL" = "lifuzu+pro@gmail.com" ]; then
        export GIT_COMMITTER_NAME="Richard Li"
        export GIT_COMMITTER_EMAIL="lifuzu+bepro@gmail.com"
    fi
    if [ "$GIT_AUTHOR_EMAIL" = "lifuzu+pro@gmail.com" ]; then
        export GIT_AUTHOR_NAME="Richard Li"
        export GIT_AUTHOR_EMAIL="lifuzu+bepro@gmail.com"
    fi
' --tag-name-filter cat -f -- --all

### Check the author in history again to make sure the author is corrected
```
$ git log --pretty=full | grep  -E '(Author|Commit): (.*)$' | sed 's/Author: //g' | sed 's/Commit: //g' | sort -u
```

### Rewriting the remote author history
```
$ git push --force --tags origin 'refs/heads/*'
```

### Reference:
https://www.everythingcli.org/git-like-a-pro-rewrite-author-history/