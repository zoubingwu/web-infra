# Coding Guideline

## Style

We use `prettier` to automatically format code, the config is under `prettier-config` package.

## Common Practices

- Use TypesScript by default, using JavaScript for some simple scripting is allowed but using it with `//@ts-check` is preferred.

- Use `const` and `let`, declare all local variables with `const` by default, unless a variable needs to be reassigned. The `var` keyword must not be used.

- Every local variable declaration declares only one variable: declarations such as `let a = 1, b = 2;` are not preferred.

- Use named exports by default, only use default export when exporting a React component.

```typescript
// AVOID
export default function someFunction() {}
```

```typescript
// PREFER
export function someFunction() {}
```

- Avoid `any` where possible. If you find `any`s in code, consider replace it with whether a generic or `unknown`.

- Generally avoid adding boolean arguments to a method in cases where that argument means "do something extra". In these cases, prefer breaking the behavior up into different functions.

```typescript
// AVOID
function turnLeftOrRight(dir: boolean = false) {
  // ...
}
```

```typescript
// PREFER
function turn(dir: 'left' | 'right' = 'left') {
  // ...
}
```

- Name classes based on their responsibility. Names should capture what the code _does_,
  not how it is used:

```typescript
/** NO: */
class DefaultRouteReuseStrategy {}

/** YES: */
class NonStoringRouteReuseStrategy {}
```

- Use `readonly` members wherever possible.

- The name of a method should capture the action performed _by_ that method rather than describing when the method will be called. For example:

```typescript
/** AVOID: does not describe what the function does. */
handleClick() {
  // ...
}

/** PREFER: describes the action performed by the function. */
checkClusterInfo() {
  // ...
}
```
