# /push — Git push current branch

Stage all changes, commit if anything unstaged, push to origin/main.

## Steps

1. `git status` — check what's uncommitted
2. If uncommitted changes exist, run `/commit` flow first
3. `git push origin main`
4. Confirm push succeeded, print commit count pushed

## Rules
- Never force push to main
- Never skip hooks
- If push fails due to diverged history, tell user — do not auto-rebase
