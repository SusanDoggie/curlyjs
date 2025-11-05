# AI Coding Agent Instructions for CurlyJS

## Project Overview

CurlyJS is a lightweight, AST-based JavaScript template engine with Jinja2-like syntax. The architecture follows a clean parsing pipeline:

**Template String → Tokenization → AST → Evaluation → Rendered Output**

### Core Components (src/)

- **`template.ts`**: Main API - `Template` class with `.render()`, `.toJSON()`, `.fromJSON()`, `.variables`, `.methods`
- **`parser.ts`**: Converts template strings to AST nodes (TextNode, InterpolationNode, ForLoopNode, IfNode, CommentNode)
- **`exprParser.ts`**: Expression parser using Shunting-yard algorithm for operator precedence
- **`evaluator.ts`**: Evaluates expression AST nodes (handles variables, operators, method calls)
- **`renderer.ts`**: Traverses AST and generates output strings
- **`analyzer.ts`**: Extracts variables and methods from AST for dependency analysis
- **`ast.ts`**: TypeScript interfaces for all AST node types
- **`types.ts`**: Public API types (`TemplateData`, `TemplateMethods`)

### Key Architecture Patterns

1. **Two-Level AST**: Template AST (control flow) wraps Expression AST (calculations/conditions)
2. **Immutability**: Template instances are immutable; AST is built once at construction
3. **Private fields**: Use `#` syntax for encapsulation (`#template`, `#ast`)
4. **Serialization**: `toJSON()` exports AST, `fromJSON()` reconstructs by converting AST back to template string
5. **Dependency extraction**: `variables` and `methods` getters analyze AST without execution

## Development Workflows

### Build & Test Commands

```bash
yarn rollup              # Build dist/ (CJS + ESM + .d.ts)
yarn test                # Run Jest tests
yarn clean               # Remove dist/
```

### Testing Patterns

- **Use `runTests` tool** for test execution (preferred over terminal commands)
- **Test location**: `tests/*.test.ts` with comprehensive coverage
- **Test helpers**: Import `testMethods` from `tests/helpers.ts` for common template methods (upper, lower, join, etc.)
- **Test structure**: Use `describe` blocks organized by feature, test edge cases explicitly
- **Assertion style**: Direct Jest `expect()` assertions, test both success and error cases
- **CRITICAL: JSON Serialization Testing**: When adding new features (operators, value types, syntax), **always** add corresponding tests to `tests/json-serialization.test.ts` to ensure templates can be serialized and reconstructed correctly. This includes:
  - New data types (e.g., Decimal, BigInt)
  - New operators (arithmetic, logical, bitwise)
  - New syntax features (control flow, expressions)
  - The reconstructed template must produce identical output to the original

### Making Changes

1. **Parser changes**: Update `parser.ts` → regenerate AST → update `template.ts` reconstruction if needed
2. **New operators**: Add to `OPERATORS` table in `exprParser.ts` with precedence, implement in `evaluator.ts`
3. **New node types**: Define in `ast.ts` → implement parsing, rendering, analysis, reconstruction
4. **New data types/features**: Add tests to `tests/json-serialization.test.ts` for serialization round-trip
5. **Always verify**: Run tests after any changes to parser/evaluator (template syntax is fragile)

## Project-Specific Conventions

### Error Handling
- Throw descriptive errors with position info: `throw new Error('Unclosed tag at position ' + pos)`
- Missing variables render as empty string (no errors)
- Invalid syntax throws during parsing (fail-fast)

### Expression Parsing
- Uses **Shunting-yard algorithm** for operator precedence
- Right-associative: `**` (exponentiation)
- Left-associative: All other binary operators
- Unary operators: `!` (logical NOT), `~` (bitwise NOT)

### Template Syntax Support
- Variables: `{{ user.name }}`
- Control flow: `{% if condition %}...{% elif %}...{% else %}...{% endif %}`
- Loops: `{% for item, index in items %}...{% endfor %}`
- Comments: `{# ignored #}`
- Method calls: `{{ upper(name) }}`, `{{ format(str, arg1, arg2) }}`

### Code Style
- TypeScript `strict` mode enabled
- Use lodash `_.get()`, `_.isNil()`, `_.isEqual()` for safe data access
- Prefer `const` over `let`, avoid `var`
- Export only public API from `index.ts` (template, ast, types)

## Critical Implementation Details

### Parser State Management
- Track depth counters for nested structures (if/for blocks)
- Use `findMatchingEnd()` to locate block terminators
- Handle `elif`/`else` at correct nesting level (check depth === 0)

### Expression Evaluation
- Array literals in expressions are stored as `LiteralNode` with array value
- Method calls store argument count during parsing for correct stack unwinding
- Use `evalExprNode()` recursively for nested expressions

### Serialization Round-Trip
- `toJSON()` → AST → `JSON.stringify()` → storage/network
- `fromJSON()` → AST → `reconstructTemplate()` → `new Template()` → same behavior
- Reconstruction must preserve exact template syntax for variables/methods extraction
- **CRITICAL**: Always test new features with JSON serialization in `tests/json-serialization.test.ts`
- When adding new operators, data types, or syntax features, verify the reconstructed template produces identical output to the original

## Common Pitfalls

- **Don't parse template strings multiple times** - cache Template instances
- **Loop variables excluded from `.variables`** - they're local scope
- **Comments render as empty string** - not removed from AST (for analysis)
- **Missing closing tags** - parser throws, must be caught by consumer
- **Operator precedence** - use parentheses in complex expressions to avoid surprises
- **Forgetting JSON serialization tests** - new features must work after `toJSON()`/`fromJSON()` round-trip

---

## AI Agent Guidelines

### Development Best Practices

#### File Header and License Requirements
**CRITICAL:** Always use the correct license header format for all source and test files.
- **Every new file** (source code, tests, configuration) must include the full MIT License header
- **License format**: Use the exact same format as existing files in the project
- **Before creating any new file**: Check an existing file in the same directory to confirm the exact license format
- **When updating license**: If you notice a file with an incomplete license header, update it to match the full format above
- **Never use shortened versions**: Always use the complete MIT License text, not abbreviated versions

#### Test Execution and Verification Responsibility
**CRITICAL:** The agent must always write and run the tests by itself. Never ask the user to test the code or verify correctness. The agent is responsible for:
- Writing appropriate tests for new or modified code
- Running the tests automatically after making changes
- Verifying that all tests pass and the code is correct before considering the task complete
- Only reporting results to the user after self-verification

**Never delegate testing or verification to the user.**

### Deprecated APIs
**CRITICAL:** Never use deprecated APIs or methods.
- Do not use deprecated functions, classes, or properties in new code.
- Replace deprecated usages with the current, supported API when available.
- If no replacement exists, document the reason, open an issue for a supported alternative, and add tests demonstrating the chosen approach.
- During refactors, remove or replace deprecated usages and run the test suite to ensure behavior is preserved.

### Deep Thinking and Hypothesis Before Coding
**CRITICAL:** Before writing any code, agents must:
1. **Think deeply about the problem:** Analyze requirements, constraints, and possible edge cases.
2. **Formulate hypotheses:** Predict how the code should behave, including possible failure modes and success criteria.
3. **Check existing code to verify hypotheses:** Inspect relevant source files, tests, polyfills, and documentation to confirm assumptions before implementing. Look for related utilities, existing patterns, and any previous fixes that affect your approach.
3. **List out proof steps:** Plan how to simulate or reason about the result in mind before implementation. This includes outlining the logic, expected outcomes, and how each part will be validated.
4. **Write code only after planning:** Only begin coding once the above steps are clear and the approach is well-structured.
5. **Verify by running tests or scripts:** After implementation, always validate the code using relevant tests or scripts to ensure correctness and expected behavior.

**Why this matters:**
- Prevents shallow or rushed solutions that miss critical details
- Reduces bugs and rework by catching issues in the planning phase
- Ensures code is written with clear intent and validation strategy
- Improves reliability and maintainability of the codebase

**Example workflow:**
1. Read and analyze the requirements
2. Brainstorm possible approaches and edge cases
3. Write out hypotheses and expected results
4. Plan proof steps (how to test, what to check)
5. Implement the code
6. Run tests/scripts to confirm behavior
7. Refine as needed based on results

### Code Reuse and Dead Code
- **Refactor repeating code**: When you find the same or similar code in multiple places, extract it into a small, well-named, reusable function or utility module. Reuse reduces bugs, improves readability, and makes testing easier. Prefer composition over duplication.
- **Keep abstractions pragmatic**: Don't over-abstract. If code repeats but has meaningful differences, prefer a focused helper with clear parameters rather than a complex, one-size-fits-all abstraction.
- **Remove unused code**: Always delete dead code, unused functions, and commented-out blocks before committing. Unused code increases maintenance burden, hides real behavior, and can mask broken assumptions. If you must keep something experimental, move it to a clearly labeled experimental file or the `.temp/` area and document why it remains.
- **Verify after removal**: After deleting code, run the build and tests to ensure nothing relied on the removed code. Update documentation and examples that referenced the previous implementation.

### Temporary debug code — remove before committing

**CRITICAL:** Always remove all temporary debug code and artifacts before committing or opening a pull request. This includes but is not limited to:
- ad-hoc print/log statements (e.g., `print`, `console.log`),
- temporary debug flags or switches left enabled,
- throwaway test harness scripts placed outside the proper `tests/` directory,
- helper files placed in `.temp/` that were only intended for local debugging, and
- large commented-out blocks or shortcuts that were added solely to debug an issue.

If durable debugging helpers are necessary, extract them into clearly documented utility modules, gate them behind explicit feature flags, and add a note in the changelist documenting why they remain. Never leave transient debug code in main branches or release builds.

## Temporary Files for Testing
When creating temporary files to test code, place all test scripts under `<project_root>/.temp/` to keep the workspace organized and avoid conflicts with the main codebase.

### Running Test Files in .temp/
**IMPORTANT:** Test files in `.temp/` should be executable demos or scripts, not Jest test files.

#### For TypeScript Files (`.ts`)
TypeScript files in `.temp/` **cannot** be run directly with `ts-node` or `node` due to ESM/CJS module resolution issues with the `src/` directory. Instead:

1. **Build the project first**: Run `yarn rollup` to generate the `dist/` directory
2. **Use CommonJS (`.js`) instead**: Convert your TypeScript demo to a JavaScript file using CommonJS `require()` syntax
3. **Import from dist**: Use `require('../dist/index.js')` to import the built package

**Example of correct .temp/ test file:**
```javascript
// .temp/my-demo.js
const { Template } = require('../dist/index.js');
const Decimal = require('decimal.js');

const template = new Template('{{ a + b }}');
console.log(template.render({ a: new Decimal('0.1'), b: new Decimal('0.2') }));
```

**Run with:**
```bash
yarn rollup  # Build first
node .temp/my-demo.js
```

**DO NOT:**
- Use `.ts` files in `.temp/` with imports from `../src/`
- Try to run TypeScript files directly with `ts-node`
- Use ESM `import` syntax in `.temp/` files (use CommonJS `require` instead)

#### For Jest Tests
Jest test files should be placed in the `tests/` directory, not in `.temp/`. The `tests/` directory is properly configured for TypeScript and has access to Jest globals and proper module resolution.

- **Test Case Verification**: Always examine the actual content of test cases to ensure they're testing what they're supposed to test:
  - Read test files completely to understand test logic and assertions
  - Verify that test descriptions match what the test actually does
  - Check that assertions are testing the correct behavior and edge cases
  - Ensure mocks and test data are appropriate for the scenario being tested
  - Look for missing test cases or gaps in coverage for critical functionality
  - Validate that tests would actually fail if the implementation was broken
  - **NEVER use fallback methods to bypass test cases** - if tests are failing, fix the implementation or the tests, don't circumvent them
  - **No test shortcuts or workarounds** - all tests must pass legitimately through proper implementation

## **Important:** Task Execution Guidelines
When running any command or task as an AI agent:

### Command Execution Best Practices
- **Always wait** for the task to complete before proceeding with any subsequent actions
- **Never use timeouts** to run commands - it's always failure-prone and unreliable
- **Never repeat or re-run** the same command while a task is already running
- **CRITICAL: Never start a new task before the previous one has completely finished**
  - Wait for explicit confirmation that the previous task has completed successfully or failed
  - Do not assume a task is finished just because you don't see output for a while
  - Multiple concurrent tasks can cause conflicts, resource contention, and unpredictable behavior
- **Monitor task status** carefully and don't make assumptions about completion

### Task Status Verification
- If you cannot see the output or the task appears to be still running, you are **required** to ask the user to confirm the task has completed or is stuck
- If the task is stuck or hanging, ask the user to terminate the task and try again
- **Never assume** a task has completed successfully without explicit confirmation
- Always ask the user to confirm task completion or termination if the status is unclear
- **Sequential execution is mandatory:** Do not queue or pipeline tasks - complete one fully before starting the next
- **Never try to get the terminal output using a different approach or alternative method** always wait for the result using the provided tools and instructions. Do not attempt workarounds or alternate output retrieval.

### Test Execution
- **Always use provided tools when available** for running tests instead of terminal commands
- Use the `runTests` tool for unit test execution - it provides better integration and output formatting
- The `runTests` tool supports:
  - Running specific test files by providing absolute file paths
  - Running specific test suites, classes, or cases by name
  - Running all tests when no parameters are provided
- **Prefer tool-based test execution** over manual `yarn test` or `npm test` commands
- Only use terminal commands for test execution when the `runTests` tool is not available or insufficient

### Error Handling
- If a command fails, read the error output completely before suggesting fixes
- Don't retry failed commands without understanding and addressing the root cause
- Ask for user confirmation before attempting alternative approaches
- **Never run alternative commands while a failed task is still running or in an unknown state**

---
## ⚠️ CRITICAL: File Reading After Major Changes

**ALWAYS READ THE WHOLE FILE AGAIN AFTER MASSIVE CHANGES OR IF THE FILE IS BROKEN**

- After making large edits, refactors, or if a file appears corrupted, always re-read the entire file to ensure context is up-to-date and to verify integrity.
- Do not rely on partial reads or previous context after major changes—full file reading is required to avoid missing new errors or inconsistencies.
- This applies to source code, documentation, configuration, and resource files.
- If a file is broken or unreadable, re-read the whole file before attempting further fixes or analysis.
- This practice helps catch parsing errors, incomplete changes, and ensures all tools and agents operate on the latest file state.

## Always Check and Understand the Project Structure

**CRITICAL:** Before writing any code, agents must:
1. **Understand the Project Structure:** Thoroughly review the project structure and understand how it works. This includes analyzing the folder hierarchy, key files, and their purposes.
2. **Avoid Premature Questions:** Do not ask unnecessary questions before completing the job. Use the available tools and context to gather information independently.
3. **Plan Before Work:** Always create a clear plan before starting any task. For complex tasks, consider creating a structured todo list to break down the work into manageable steps.
