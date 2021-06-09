# Git

## Workflow

- Fork the repo.

- Create a Git branch from where you want to base your work, usually master.

- Write code, add test cases, and commit your work (see below for message format).

- Run lints and/or formatters. (generally they will be in git hooks)

- Run tests and make sure all tests pass.

- Before push, run **`git pull --rebase`** or **`git pull upstream master--rebase`** (assuming you have remote repo named as upstream, change it accodingly!) to make sure you have latest changes in local, resolve conflicts if there are any.

- **Always use _rebase_ to keep commit history clean!**

- Push changes to the forked repo under your name instead of the original one.

- Your PR will be reviewed by two maintainers, who may request some changes.

  - Once you've made changes, your PR must be re-reviewed and approved.

  - If the PR becomes out of date, you can use GitHub's 'update branch' button.

  - If there are conflicts, you can rebase (or merge) and resolve them locally. Then force push to your PR branch.
    You do not need to get re-review just for resolving conflicts, but you should request re-review if there are significant changes.

- Our CI system automatically tests all pull requests.

- If all tests passed and got an approval, reviewers will merge your PR.

## Commit Message

We use conventional commit message. The commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to the consumers of your library:

- `fix`: a commit of the type fix patches a bug in your codebase (this correlates with PATCH in Semantic Versioning).
- `feat`: a commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).
- **BREAKING CHANGE**: a commit that has a footer `BREAKING CHANGE:`, or appends a `!` after the type/scope, introduces a breaking API change (correlating with `MAJOR` in Semantic Versioning). A BREAKING CHANGE can be part of commits of any type.
- types other than fix: and feat: are allowed, for example `@commitlint/config-conventional` (based on the the Angular convention) recommends build:, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, and others.
- footers other than BREAKING CHANGE: <description> may be provided and follow a convention similar to git trailer format.

### Example

Commit message with description and breaking change footer

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

Commit message with `!` to draw attention to breaking change

```
refactor!: drop support for Node 6
```

### Why Use Conventional Commits

- Automatically generating CHANGELOGs.
- Automatically determining a semantic version bump (based on the types of commits landed).
- Communicating the nature of changes to teammates, the public, and other stakeholders.
- Triggering build and publish processes.
- Making it easier for people to contribute to your projects, by allowing them to explore a more structured commit history.
