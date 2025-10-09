# Repo Setup & Remotes

Remote

- Origin (HTTPS): `https://github.com/palthol/temple-underground-signup.git`
- Default branch: `main`

Initial Setup

- Set remote and push:
  - `git remote add origin https://github.com/palthol/temple-underground-signup.git`
  - `git push -u origin main`

SSH Alternative

- If you prefer SSH:
  - `git remote set-url origin git@github.com:palthol/temple-underground-signup.git`
  - Ensure your SSH key is added to GitHub.

Branching & Commits

- Branch names: `feat/...`, `fix/...`, `docs/...`, `chore/...`
- Conventional Commits for messages (e.g., `feat(form): add signature step`).

Pull & Sync

- Update local main: `git pull --rebase origin main`
- Push feature branch: `git push -u origin feat/your-branch`

Notes

- Ensure your GitHub auth is configured (HTTPS PAT or SSH key) before pushing.
- See `AGENTS.md` for working agreements and `docs/` for system docs.
