# GitHub Workflow

MemoryOS includes GitHub-ready project files for issues, pull requests, and CI.

## Pull Requests

Use `.github/PULL_REQUEST_TEMPLATE.md`. Every PR should include:

- A short summary of the user-visible change.
- Verification commands run locally.
- Risk notes for schema, UI, deployment, or environment changes.

## Issues

Use the bug report template for reproducible failures and the feature request template for practical product improvements. Feature requests should explain how the idea fits the existing MemoryOS systems: memory map, smart links, timeline, heatmaps, quick capture, offline sync, media, projects, music, or locations.

## CI

`.github/workflows/ci.yml` runs on pushes to `main`/`master` and pull requests. It installs dependencies, generates the Prisma client, runs typecheck, lint, build, and a production dependency audit.

## Branch Naming

Recommended branch prefixes:

- `feature/` for new user-facing features.
- `fix/` for bugs.
- `docs/` for documentation-only work.
- `chore/` for tooling and maintenance.
