# Naming Conventions

Follow [Microsoft/TypeScript/wiki/Coding-guidelines](Microsoft/TypeScript/wiki/Coding-guidelines) in general.

Classes:

- use PascalCase, the first letter is always uppercase for types.
- Example: `Car`, `ApplicationMetadata`.
- In general prefer single words, so it can be expanded by prepend or append other words.
- Should not end with `Impl` or any other word which describes a specific implementation of an interface.

Interfaces:

- Follow the same rules as Classes.
- Should not have `I` or `Interface` in the name or any other way of identifying it as an interface. Naming is hard and developers are lazy, this helps us to avoid bad namings. There are some disscussions about this at [TypeScript-Handbook/issues/121](https://github.com/microsoft/TypeScript-Handbook/issues/121) and [stackoverflow](https://stackoverflow.com/questions/31876947/confused-about-the-interface-and-class-coding-guidelines-for-typescript/41967120#41967120).

Methods and functions:

- Example: `bootstrap`, `someMethod`.
- Should be camel case with first letter lowercase.

Constants:

- Should be all uppercase with SNAKE_CASE.
- Example: `CORE_DIRECTIVES`.

React Components:

- use PascalCase like classes.
- Example: `UsageOverview`.
- One component per file, use the component name as file name, if it is a directory, use it as directory name and export component in index.ts.

Hooks:

- Use camel case, always starts with `use`.
- Example: `useSomeHook`.
