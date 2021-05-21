# Web Infra

A monorepo to maintain infra tools and others that can be shared and reused across projects for PingCAP FE team.

Each one of them will be published under `@pingcap` scope. The initial implementation includes the followings:

## cli

This is a command-line tool focused on diagnosing and providing suggestions and quick fixes to help us integrate infrastructures and enforce best practices.

_We'll add other functionality on it as our needs change._

This tool is not designed to be an all-in-one, black-box solution. We already have decent tools in almost every use case. Babel, Eslint, Webpack, Vite, Prettier, Jest or any others you name it. In most cases, we have to spend lots of time on each one of them doing all kinds of configurations so they can be properly used in every single project. And as time passes, each project may change it, or bring in other new tools and so we have to do it again and again.

So we made this tool to ease the pain and every project could easily share and use consistent configurations with very little effort, perhaps one single command in your terminal would have done all the job for you.

Creating a wrapper around those libraries to build an unified tool is another way to make it but it'll be hard to customize and scale. For example, we may have already suffered the pain with react-scripts when we were trying to customize webpack config in create-react-app projects.

It provides two simple commands: `doctor` and `fix`.

For example, running `wi doctor`(wi for web infra) will scan the current directory and run a check of a list of rules and conventions then print the results and tips for quick fix.

`wi fix [scope]` would do the quick fix.

## prettier-config

shared Prettier configs.

`wi fix prettier` command will install prettier and set up configs for you.

Or you could manually do the followings:

1. `yarn add prettier @pingcap/prettier-config`
2. Edit your `package.json`

```jsonc
{
  // ...
  "prettier": "@pingcap/prettier-config"
}
```

3. Add commit hooks.

## eslint-config

Eslint configs.

`wi fix eslint` will install eslint dependencies and apply lint rules for you.

## tsconfig

Common TypeScript configs.

## uikit

#TODO Shared UI components.

## github-actions

#TODO Common github actions.
