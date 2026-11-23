# Python/GitHub Trivia App

A daily GitHub and Python trivia app, built in guided milestones to practice
branches, pull requests, hosting, and scheduled automation.

## How it works

One shared question each day, four choices, and one attempt per browser per day.
After submitting, see the correct answer and explanation. Your history, points,
and accuracy are saved in `localStorage` in this browser only. There are no
accounts, API credentials, paid services, or production Python server.

The 30-question bank contains 15 GitHub and 15 Python questions. It rotates by
calendar date at midnight `America/New_York`, including daylight saving changes,
using the device clock. An open tab checks for a new day every 15 seconds.
Clearing browser data removes scores; different devices and browsers have separate
histories. Answers are public source data: this is a learning game, not an exam.
If storage is blocked, the game explains that progress is temporary.

## Run locally

Install [uv](https://docs.astral.sh/uv/getting-started/installation/), then run:

```sh
uv sync --locked
uv run main.py
```

Open http://127.0.0.1:8000/. Use the local HTTP server rather than opening the
HTML file directly, because the app fetches its question bank. Python 3.14 and
uv are used for development only; Node 24+ is needed for JavaScript tests.

## Verify

```sh
uv run ruff check .
uv run ruff format --check .
uv run pytest
node --test tests/game.test.mjs
node --check web/app.mjs
uv run python build.py
```

The build validates the bank and copies only public assets into ignored `dist/`.
It also generates `build.json` with a UTC build timestamp for checking automation.

## GitHub Pages hosting (free)

1. Use a **public** GitHub repository for GitHub Free Pages hosting. No paid plan
   or third-party hosting account is needed. Do not change visibility without
   reviewing existing repository contents.
2. Push these changes to a feature branch and open a pull request. The
   **Check and deploy trivia** workflow runs Python and JavaScript checks.
3. In the repository, open **Settings → Pages → Build and deployment** and
   choose **GitHub Actions** as the source.
4. Merge the passing pull request into `main`. The workflow builds `dist/` and
   deploys it with the `github-pages` environment. No custom secrets are needed.
5. Open the URL in the successful deployment job. For the current repository,
   the expected URL after renaming is https://ahimmelm-ui.github.io/Python-GitHub-Trivia-App/.

See GitHub's [custom Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
This checkout has not been committed, pushed, or deployed automatically.

## Practice your first GitHub change

1. Create an issue called **Build the local trivia preview** in your GitHub repository.
2. Create a branch for these changes: `git switch -c feature/local-trivia`.
3. Review `git status` and `git diff`. Stage only the intended project files;
   leave unrelated changes such as an already tracked `.DS_Store` unstaged.
4. Commit with a concise message, such as `Add local daily trivia preview`.
5. Push with `git push -u origin feature/local-trivia`.
6. Open a pull request with a description, verification results, and `Closes #N`
   using the issue number. Review the diff before merging.

Practice reviewing a failed check by deliberately breaking a question in a
feature branch, then fixing it before merging. Keep `main` passing.

## Project layout

- `web/`: static HTML, CSS, JavaScript, and JSON question bank.
- `main.py`: standard-library local preview server.
- `question_bank.py`, `build.py`: validation and static packaging.
- `tests/`: Python content/build tests and Node gameplay tests.
- `.github/workflows/pages.yml`: checks, deployment, and scheduled automation.

Questions live in `web/questions.json`. Each has a unique stable `id`,
`category` (`GitHub` or `Python`), `prompt`, four distinct `options`, zero-based
`correct_index`, and an `explanation`. Preserve order and stable IDs when editing.
Adding or reordering questions changes the rotation for future/unanswered days;
already saved answers retain a snapshot of their original question and solution.
Update the bank-size tests when intentionally expanding the bank.

## Scheduled automation

The same workflow runs daily at 17:17 UTC to revalidate, test, and redeploy the
site with fresh build metadata. It does not write commits or store player data.
In **Actions → Check and deploy trivia → Run workflow**, select `main` to rerun
it manually. Inspect the check/deploy job logs and the deployed `build.json`.

GitHub may delay scheduled runs and disables schedules on inactive public repos
after 60 days; re-enable the workflow if needed. Gameplay continues even if a job
is delayed because the question is chosen in the browser, not by the workflow.
See [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
