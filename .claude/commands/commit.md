# /commit — Commit changes

Create a conventional commit for staged/unstaged changes in this repo.

## Rules
- Format: `type(scope): short description` where scope is `server`, `client`, `docs`, or omitted for root
- Types: feat, fix, chore, docs, refactor, style
- Subject line ≤ 72 chars
- No AI authorship. No Co-Authored-By lines. Ever.
- Body only when the WHY is non-obvious

## Steps

1. Run `git diff` and `git status` to understand what changed
2. Run `git log --oneline -5` to match existing message style
3. Stage relevant files (avoid .env, secrets, node_modules)
4. Write commit message and commit

## Scopes
- `server` — anything in server/src/
- `client` — anything in client/src/
- `docs` — README, CLAUDE.md, parser-config.md
- no scope — root config, .gitignore, both sides together
