# Python list operation engine (V1)

Pure TypeScript simulation of beginner Python list behavior. Later phases consume this layer for UI, history, and animation. It does not execute Python and is not wired to the playground yet.

## PythonValue model

Supported values are a typed union, not strings:

- `{ type: "string"; value: string }`
- `{ type: "number"; value: number }`
- `{ type: "boolean"; value: boolean }`
- `{ type: "none"; value: null }`

Helpers: `pythonString()`, `pythonNumber()`, `pythonBoolean()`, `pythonNone()`.

Equality is type-aware via `pythonValueEquals()`. `"1"` is not `1`, and `True` is not `1`.

## ListItem identity

```ts
type ListItem = { id: string; value: PythonValue }
```

`id` is a stable visual identity for GSAP Flip later. It is **not** derived from the current index. New values get new IDs from `crypto.randomUUID()`. Reorder operations keep existing IDs.

## Entry point

```ts
import { executeOperation } from "@/lib/python";

const result = executeOperation({
  method: "append",
  list,
  variableName: "fruits",
  args: { value: pythonString("mango") },
});
```

The engine never mutates the input array or its item objects.

## Result contract

Every call returns:

- `before` / `after` — cloned `ListItem[]` snapshots
- `mutates` — whether the original list would change in Python
- `returnValue` — `None`, a scalar, or a new list (`copy` / `sorted`)
- `error` — structured educational error, or omitted on success
- `code` — generated Python source
- `explanation` — short learner-facing text
- `animation` — semantic instruction for a future GSAP layer (not animated here)

Learner mistakes return `error` instead of throwing. Unexpected programming bugs may still throw.

## Structured errors

```ts
type PlaygroundError = {
  type: "ValueError" | "IndexError" | "TypeError"
  message: string
  friendlyMessage: string
}
```

On error, `after` matches `before` and `mutates` is `false`.

## V1 limitations

- No nested lists, dicts, or other objects
- No arbitrary Python execution
- `index(value)` only — no `start` / `stop`
- `True == 1` is false (Python would treat `bool` as a subclass of `int`)
- Mixed-type `sort()` / `sorted()` returns `TypeError`, including number + boolean lists
- `copy()` is a shallow educational copy; copied cells get new visual IDs
- Sort animation metadata records ID order only; it is not Timsort
- Variable names accept a simple identifier pattern and otherwise fall back to `items`
