# Repository Guidelines

## Project Structure & Module Organization

Python/GitHub Trivia App is a static GitHub Pages app with no accounts. `web/` contains HTML, CSS, JavaScript modules, and `questions.json`. `main.py` serves the local preview; `question_bank.py` validates content and `build.py` packages public assets into ignored `dist/`. Python and Node tests live in `tests/`. `pyproject.toml`, `uv.lock`, and `.python-version` define the uv development environment.

## Build, Test, and Development Commands

Use Python 3.14+, uv, and Node 24+ for development. The published app needs only a browser.

- `uv sync --locked` — synchronize `.venv` with the committed lockfile.
- `uv run main.py` — serve `web/` at localhost:8000.
- `uv run python build.py` — validate content and package static assets.
- `uv run pytest` — run the test suite.
- `node --test tests/game.test.mjs` — test game rules and Eastern date boundaries.
- `uv run ruff check .` — lint Python.
- `uv run ruff format --check .` — check Python formatting.
- `uv add <package>` — add a runtime dependency.

Commit dependency changes with the lockfile. Keep environments, caches, secrets, and generated files out of commits. Keep the app static, with browser-only history and free hosting.

## Coding Style & Naming Conventions

Use four-space Python indentation, `snake_case` functions, and Ruff formatting. Use two-space JavaScript indentation, `camelCase` functions, and ES modules. Render question text with `textContent`, not HTML. Keep asset URLs relative so project Pages paths work. Preserve question IDs and order; edits must not rewrite saved history snapshots.

## Testing Guidelines

Use pytest (`test_*.py`) and Node's built-in runner (`*.test.mjs`). Cover content validation, static packaging, grading, duplicate attempts, saved history, and Eastern midnight/DST boundaries. Keep tests deterministic and offline. No numeric coverage threshold is configured. GitHub Actions checks PRs and deploys passing `main` builds; a daily schedule exercises automation.

## Commit & Pull Request Guidelines

The history currently uses short, imperative-style summaries (for example, `setting up`). Keep commits focused and write concise subjects such as `Add input validation`. Pull requests should explain what changed, why it changed, and how it was verified. Link related issues when available. Include terminal output for behavior changes and screenshots only when a visual interface is introduced. Do not commit generated caches, local environment files, or editor metadata.
