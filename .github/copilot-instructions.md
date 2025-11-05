# curlyjs - AI Coding Agent Instructions

## Project Overview

**curlyjs** is a lightweight JavaScript/TypeScript template engine with Jinja2-like syntax. It parses templates into an Abstract Syntax Tree (AST) for efficient rendering, supporting variables, control flow, loops, operators, and custom methods.

### Architecture

The codebase follows a clear **parse → analyze → render** pipeline:

1. **Parser** (`parser.ts` + `exprParser.ts`) - Tokenizes template strings and builds AST
   - `parseTemplate()` handles top-level template syntax (`{{`, `{%`, `{#`)
   - `parseExpression()` uses Shunting-yard algorithm for operator precedence
   - Supports nested structures (if/elif/else, for loops) with depth tracking

2. **AST** (`ast.ts`) - Defines node types: `TextNode`, `InterpolationNode`, `ForLoopNode`, `IfNode`, `CommentNode`
   - Expression nodes: `LiteralNode`, `VariableNode`, `BinaryOpNode`, `UnaryOpNode`, `MethodCallNode`

3. **Analyzer** (`analyzer.ts`) - Extracts variables and method names from AST
   - Loop variables are tracked separately and excluded from variable extraction

4. **Renderer** (`renderer.ts`) - Evaluates AST nodes against data/methods to produce output

5. **Template** (`template.ts`) - Main API class wrapping the pipeline
   - Provides `render()`, `toJSON()`, `fromJSON()` for serialization
   - Reconstructs template strings from AST for round-trip serialization

### Key Patterns

**Private Fields**: Template class uses `#template` and `#ast` private fields (not TypeScript `private`)

**Operator Precedence**: `exprParser.ts` defines precedence table - **critical for math/logic correctness**
- Right-associative: `**` (exponentiation)
- Left-associative: most operators (arithmetic, comparison, logical)
- Unary operators: `!`, `~` (handled in tokenization)

**Nested Control Flow**: `findMatchingEnd()` tracks depth to handle nested if/for blocks correctly

**Error Messages**: Throw descriptive errors with position info (e.g., "Unclosed tag at position X")

## Development Workflow

### Building
```bash
yarn rollup      # Clean + build CJS/ESM/types
yarn clean       # Remove dist/
```

Build outputs: `dist/index.js` (CJS), `dist/index.mjs` (ESM), `dist/index.d.ts` (types)

### Testing
```bash
yarn test        # Run all Jest tests
```

**Test Structure**:
- Tests organized by feature: `operators.test.ts`, `conditionals.test.ts`, `loops.test.ts`, etc.
- Use `testMethods` from `helpers.ts` for common functions (upper, lower, join, etc.)
- **Pattern**: `const t = new Template('...')` → `expect(t.render(data, methods)).toBe('...')`

**Testing Requirements**:
- Write tests for new operators/syntax features
- Test edge cases: empty strings, missing variables, nested structures
- Verify operator precedence (e.g., `2 + 3 * 4` should be `14`, not `20`)
- Check AST serialization round-trips: `Template.fromJSON(t.toJSON()).render(data)` equals `t.render(data)`

### Code Style
- MIT license header required in all source files
- TypeScript strict mode enabled
- Use `lodash` for utility functions (already a dependency)
- Prefer explicit type annotations for public APIs

## Common Tasks

### Adding New Operators
1. Add operator to `OPERATORS` table in `exprParser.ts` with precedence/associativity
2. Update `BinaryOpNode` type in `ast.ts` if needed
3. Handle evaluation in `evaluateExpression()` (renderer.ts)
4. Add tests covering precedence interactions with existing operators
5. Update README.md operator documentation

### Adding New Syntax
1. Define new AST node type in `ast.ts`
2. Add parsing logic in `parser.ts` (for `{%` tags) or `exprParser.ts` (for expressions)
3. Implement rendering in `renderer.ts`
4. Update `reconstructTemplate()` in `template.ts` for serialization
5. Add analyzer support if new syntax introduces variables/methods
6. Write comprehensive tests + update README

### Debugging Parser Issues
- Check token stream: Add logging in `tokenize()` to see token sequence
- Verify postfix conversion: Log output of `infixToPostfix()` for expression parsing
- Use `t.toJSON()` to inspect parsed AST structure
- Test minimal reproducible case in isolation

## Critical Constraints

**Do Not Break**:
- AST structure changes must maintain `toJSON()`/`fromJSON()` compatibility
- Operator precedence changes can break existing templates - require major version bump
- All existing tests must pass - no regressions in template rendering

**Performance**:
- Parser runs once per Template instance (templates are reusable)
- Avoid regex in hot rendering paths
- Expression evaluation is recursive - watch stack depth for deeply nested expressions

## Testing Best Practices

**CRITICAL:** Always write and run tests yourself. Never ask user to verify code.

- Use `runTests` tool with specific file paths when available
- Run full test suite after parser/AST changes: `yarn test`
- Add test cases BEFORE implementing features (TDD approach)
- Verify test descriptions match actual test logic
- Ensure tests would fail if implementation was broken

## General Development Guidelines

### Code Quality
- Extract repeated logic into focused helper functions
- Delete unused code immediately (or move to `.temp/` with clear labels)
- Remove debug logging before committing
- Verify changes with tests after refactoring

### Before Coding
1. Understand the feature request and edge cases
2. Check existing patterns in similar features (e.g., see how `if` blocks work before adding `while`)
3. Plan AST node structure and parsing strategy
4. Write test cases outlining expected behavior
5. Implement and verify with tests

### Error Handling
- Throw errors with context (position in template, problematic syntax)
- Handle edge cases: empty strings, undefined variables, mismatched brackets
- Test error conditions (e.g., unclosed tags, invalid syntax)

### Documentation
- Update README.md for user-facing features
- Add JSDoc comments for complex parsing logic
- Include code examples in documentation
