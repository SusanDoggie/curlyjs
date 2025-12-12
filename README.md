# curlyjs

A lightweight, fast, and feature-rich JavaScript template engine with a familiar Jinja2-like syntax. curlyjs is designed for developers who need powerful templating capabilities without the overhead of larger frameworks.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Lightweight** - Minimal dependencies, small bundle size
- 🎯 **Simple Syntax** - Clean, readable Jinja2-inspired template syntax
- 🔄 **Control Flow** - Full support for conditionals (`if/elif/else`) and loops (`for`)
- � **Array Indexing** - Access array elements with bracket notation using literal or variable indices (`items[0]`, `items[index]`)
- �💬 **Comments** - Template comments with `{# ... #}` syntax
- 📊 **Operators** - Rich operator support including arithmetic (`+`, `-`, `*`, `/`, `%`, `**`), comparison, logical (`&&`, `||`, `!`), and bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`)
- 🔧 **Custom Methods** - Extend templates with custom functions; methods receive standard JavaScript types
- 🌳 **Nested Structures** - Support for deeply nested objects and arrays
- 📝 **Variable & Method Extraction** - Automatically detect variables and methods used in templates
- 💾 **Serialization** - Serialize templates to JSON and reconstruct them for caching and storage
- ⚡ **AST-based** - Efficient parsing and rendering via Abstract Syntax Tree
- 🎯 **High Precision** - Internal support for `BigInt` and `Decimal` for precise calculations

## Installation

```bash
npm install curlyjs
# or
yarn add curlyjs
```

## Quick Start

```typescript
import { Template } from 'curlyjs';

// Create a template
const template = new Template('Hello, {{ name }}!');

// Render with data
const result = template.render({ name: 'World' });
console.log(result); // Output: Hello, World!
```

## Syntax Guide

### Variable Interpolation

Use double curly braces `{{ }}` for variable interpolation:

```typescript
const t = new Template('Hello, {{ name }}!');
t.render({ name: 'Alice' }); // "Hello, Alice!"
```

#### Nested Properties

Access nested object properties using dot notation:

```typescript
const t = new Template('City: {{ user.address.city }}');
t.render({ 
  user: { 
    address: { 
      city: 'NYC' 
    } 
  } 
}); // "City: NYC"
```

#### Array Indexing

Access array elements using bracket notation with literal or variable indices:

```typescript
// Literal numeric index
const t1 = new Template('First: {{ items[0] }}, Second: {{ items[1] }}');
t1.render({ items: ['apple', 'banana', 'cherry'] }); 
// "First: apple, Second: banana"

// Variable index
const t2 = new Template('Item at index: {{ items[idx] }}');
t2.render({ items: ['x', 'y', 'z'], idx: 2 }); 
// "Item at index: z"

// Nested array access
const t3 = new Template('{{ users[0].name }}');
t3.render({ users: [{ name: 'Alice' }, { name: 'Bob' }] }); 
// "Alice"

// Multi-dimensional arrays
const t4 = new Template('{{ matrix[1][2] }}');
t4.render({ matrix: [[1, 2, 3], [4, 5, 6]] }); 
// "6"

// Nested indexing - use array element as index
const t5 = new Template('{{ array[indices[0]] }}');
t5.render({ 
  array: ['a', 'b', 'c', 'd', 'e'],
  indices: [2, 3, 4]
}); 
// "c" (array[2])

// Complex nested indexing
const t6 = new Template('{{ matrix[row[0]][col[1]] }}');
t6.render({ 
  matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  row: [1],
  col: [0, 2]
}); 
// "6" (matrix[1][2])
```

Array indexing works in all contexts:

```typescript
// In conditionals
const t7 = new Template('{% if items[0] == "apple" %}Found apple{% endif %}');
t7.render({ items: ['apple', 'banana'] }); 
// "Found apple"

// In method calls
const t8 = new Template('{{ upper(items[0]) }}');
const methods = { upper: (s) => s.toUpperCase() };
t8.render({ items: ['hello', 'world'] }, methods); 
// "HELLO"

// In loops
const t9 = new Template('{% for user in users %}{{ user.tags[0] }}, {% endfor %}');
t9.render({ 
  users: [
    { tags: ['admin', 'user'] }, 
    { tags: ['guest', 'viewer'] }
  ] 
}); 
// "admin, guest, "
```

#### Handling Missing Values

Missing or undefined values are rendered as empty strings:

```typescript
const t = new Template('{{ missing }}');
t.render({}); // ""
```

### Control Flow

#### If Statements

Use `{% if condition %}...{% endif %}` for conditional rendering:

```typescript
const t = new Template('{% if isActive %}Active{% endif %}');
t.render({ isActive: true }); // "Active"
t.render({ isActive: false }); // ""
```

#### If-Else

```typescript
const t = new Template('{% if count > 5 %}High{% else %}Low{% endif %}');
t.render({ count: 10 }); // "High"
t.render({ count: 3 }); // "Low"
```

#### If-Elif-Else

Chain multiple conditions:

```typescript
const t = new Template(`
  {% if score >= 90 %}A
  {% elif score >= 80 %}B
  {% elif score >= 70 %}C
  {% else %}F
  {% endif %}
`);
t.render({ score: 85 }); // "B"
```

### Loops

#### Basic For Loop

```typescript
const t = new Template('{% for item in items %}{{ item }}, {% endfor %}');
t.render({ items: [1, 2, 3] }); // "1, 2, 3, "
```

#### For Loop with Index

```typescript
const t = new Template('{% for item, i in items %}{{ i }}:{{ item }} {% endfor %}');
t.render({ items: ['a', 'b', 'c'] }); // "0:a 1:b 2:c "
```

#### Nested Loops

```typescript
const t = new Template(`
  {% for row in grid %}
    {% for cell in row %}{{ cell }}{% endfor %}
  {% endfor %}
`);
t.render({ grid: [[1, 2], [3, 4]] }); // "1234"
```

#### For Loops with Method Calls

For loops can use method calls to generate arrays dynamically:

```typescript
const t = new Template('{% for item in getItems() %}{{ item }}, {% endfor %}');
const methods = {
  getItems: () => ['x', 'y', 'z']
};
t.render({}, methods); // "x, y, z, "
```

Method calls can accept arguments and be nested:

```typescript
const t = new Template('{% for item in filter(items, condition) %}{{ item }} {% endfor %}');
const methods = {
  filter: (arr, predicate) => arr.filter(x => x > predicate)
};
t.render({ items: [1, 2, 3, 4, 5], condition: 2 }, methods); // "3 4 5 "
```

Complex method expressions are supported:

```typescript
const t = new Template('{% for item in reverse(sort(items)) %}{{ item }} {% endfor %}');
const methods = {
  sort: (arr) => [...arr].sort(),
  reverse: (arr) => [...arr].reverse()
};
t.render({ items: ['c', 'a', 'b'] }, methods); // "c b a "
```

### Operators

#### Comparison Operators

Supported operators: `==`, `!=`, `>`, `<`, `>=`, `<=`

```typescript
const t = new Template('{% if age >= 18 %}Adult{% else %}Minor{% endif %}');
t.render({ age: 21 }); // "Adult"
```

#### Arithmetic Operators

Supported operators: `+`, `-`, `*`, `/`, `%` (modulo), `**` (exponentiation)

```typescript
const t = new Template('{{ a + b }}');
t.render({ a: 5, b: 3 }); // "8"

const t2 = new Template('{{ a % b }}');
t2.render({ a: 10, b: 3 }); // "1"

const t3 = new Template('{{ a ** b }}');
t3.render({ a: 2, b: 3 }); // "8"
```

#### String Concatenation

The `+` operator performs string concatenation when at least one operand is a string:

```typescript
// String + String
const t1 = new Template('{{ firstName + " " + lastName }}');
t1.render({ firstName: 'John', lastName: 'Doe' }); // "John Doe"

// String + Number
const t2 = new Template('{{ prefix + count }}');
t2.render({ prefix: 'Item #', count: 42 }); // "Item #42"

// String + Decimal
const t3 = new Template('{{ prefix + price }}');
t3.render({ prefix: 'Price: $', price: new Decimal('19.99') }); // "Price: $19.99"

// String + BigInt
const t4 = new Template('{{ prefix + count }}');
t4.render({ prefix: 'Count: ', count: BigInt(1000000) }); // "Count: 1000000"
```

**Note on type coercion:**
- When both operands are numbers, `+` performs addition
- When at least one operand is a string, `+` performs concatenation
- String literals (e.g., `'0.1'`) are treated as strings, not numbers

```typescript
// Numeric addition
const t1 = new Template('{{ a + b }}');
t1.render({ a: 5, b: 3 }); // "8"

// String concatenation (not addition)
const t2 = new Template('{{ a + b }}');
t2.render({ a: '0.1', b: '0.2' }); // "0.10.2"
```

#### Bitwise Operators

Supported operators:
- `&` (AND) - Bitwise AND
- `|` (OR) - Bitwise OR
- `^` (XOR) - Bitwise XOR
- `~` (NOT) - Bitwise NOT (unary)
- `<<` (left shift)
- `>>` (signed right shift)
- `>>>` (unsigned right shift)

```typescript
const t1 = new Template('{{ a & b }}');
t1.render({ a: 5, b: 3 }); // "1" (0101 & 0011 = 0001)

const t2 = new Template('{{ a | b }}');
t2.render({ a: 5, b: 3 }); // "7" (0101 | 0011 = 0111)

const t3 = new Template('{{ a ^ b }}');
t3.render({ a: 5, b: 3 }); // "6" (0101 ^ 0011 = 0110)

const t4 = new Template('{{ ~a }}');
t4.render({ a: 5 }); // "-6" (~0101 = 1010 in two's complement)

const t5 = new Template('{{ a << b }}');
t5.render({ a: 5, b: 2 }); // "20" (5 << 2 = 20)

const t6 = new Template('{{ a >> b }}');
t6.render({ a: 20, b: 2 }); // "5" (20 >> 2 = 5)

const t7 = new Template('{{ a >>> b }}');
t7.render({ a: -8, b: 2 }); // "1073741822" (unsigned right shift)
```

#### Logical Operators

- **AND (`&&`)**: Returns true if both operands are true
- **OR (`||`)**: Returns true if at least one operand is true
- **NOT (`!`)**: Negates the operand (logical NOT)

```typescript
// AND
const t1 = new Template('{% if a && b %}Both true{% endif %}');
t1.render({ a: true, b: true }); // "Both true"

// OR
const t2 = new Template('{% if a || b %}At least one true{% endif %}');
t2.render({ a: false, b: true }); // "At least one true"

// NOT
const t3 = new Template('{% if !flag %}Not flagged{% endif %}');
t3.render({ flag: false }); // "Not flagged"
```

#### Operator Precedence

Operators are evaluated according to the following precedence (highest to lowest):

1. **`**`** - Exponentiation (right-associative)
2. **`*` `/` `%`** - Multiplication, division, modulo
3. **`+` `-`** - Addition, subtraction
4. **`<<` `>>` `>>>`** - Bitwise shifts
5. **`&`** - Bitwise AND
6. **`^`** - Bitwise XOR
7. **`|`** - Bitwise OR
8. **`<` `>` `<=` `>=`** - Comparison operators
9. **`==` `!=`** - Equality operators
10. **`&&`** - Logical AND
11. **`||`** - Logical OR
12. **`!` `~`** - Unary operators (highest precedence when used)

Use parentheses to override precedence:

```typescript
const t1 = new Template('{{ 2 + 3 * 4 }}');
t1.render({}); // "14" (multiplication before addition)

const t2 = new Template('{{ (2 + 3) * 4 }}');
t2.render({}); // "20" (parentheses override precedence)

const t3 = new Template('{{ 2 ** 3 ** 2 }}');
t3.render({}); // "512" (2 ** (3 ** 2), right-associative)

const t4 = new Template('{% if (a || b) && c %}Result{% endif %}');
// Logical OR evaluated before AND due to parentheses
```

### Comments

Add comments to your templates using `{# ... #}` syntax. Comments are completely ignored during rendering:

```typescript
const t = new Template('Hello {# this is a comment #} World!');
t.render({}); // "Hello  World!"
```

#### Multiline Comments

Comments can span multiple lines:

```typescript
const t = new Template(`
  {# 
    This is a multiline comment
    that will be completely ignored
  #}
  Content here
`);
t.render({}); // "\n  \n  Content here\n"
```

#### Comments in Templates

Use comments to document your templates or temporarily disable sections:

```typescript
const t = new Template(`
  {# User information section #}
  <h1>{{ user.name }}</h1>
  
  {# Loop through posts #}
  {% for post in posts %}
    {# Each post item #}
    <article>{{ post.title }}</article>
  {% endfor %}
`);
```

**Note:** Comments can contain any text, including template-like syntax, and will not be processed:

```typescript
const t = new Template('{# {{ this.wont.be.evaluated }} #}text');
t.render({}); // "text"
```

### Custom Methods

Define custom methods to extend template functionality:

```typescript
const template = new Template('{{ upper(name) }}');

const methods = {
  upper: (str) => str.toUpperCase(),
  join: (arr, sep) => arr.join(sep),
  format: (str, ...args) => {
    return str.replace(/{(\d+)}/g, (match, num) => args[num] || match);
  }
};

template.render({ name: 'hello' }, methods); // "HELLO"
```

#### Method Arguments

Methods support various argument types:

- **Variables**: `{{ upper(name) }}`
- **String literals**: `{{ upper("hello") }}`
- **Array literals**: `{{ join(["a", "b"], "-") }}`
- **Nested calls**: `{{ upper(lower("MIXED")) }}`

#### Method Argument Type Normalization

**Important:** User-provided methods receive only standard JavaScript types. All special types are automatically converted at the method boundary:

- **`BigInt` → `Number`**: Converted to standard number (may lose precision for very large values)
- **`Decimal` → `Number`**: Converted to standard number (may lose precision for high-precision decimals)
- **Other types**: Passed as-is (string, number, boolean, array, object, null)

This ensures you don't need to handle special types in your method implementations:

```typescript
import Decimal from 'decimal.js';

const template = new Template('{{ formatPrice(price) }}');

const methods = {
  // Method receives a standard Number, not a Decimal instance
  formatPrice: (val) => {
    // val is always a number, never a BigInt or Decimal
    return `$${val.toFixed(2)}`;
  }
};

// Even though we pass a Decimal, the method receives a Number
template.render(
  { price: new Decimal('19.99') }, 
  methods
); // "$19.99"
```

**Note:** Methods can still *return* `BigInt` or `Decimal` values, which will maintain precision in subsequent template calculations:

```typescript
const template = new Template('{{ calculate(a, b) + c }}');

const methods = {
  // Receives standard Numbers, returns Decimal for precise calculation
  calculate: (a, b) => new Decimal(a).plus(new Decimal(b))
};

template.render({
  a: new Decimal('10.1'),
  b: new Decimal('20.2'), 
  c: new Decimal('5.3')
}, methods); // "35.6" (precise calculation maintained)

### Escape Sequences

String literals support common escape sequences:

- `\n` - Newline
- `\t` - Tab
- `\r` - Carriage return
- `\\` - Backslash
- `\"` - Double quote
- `\'` - Single quote
- `\uXXXX` - Unicode character
- `\xXX` - Hex character

```typescript
const t = new Template('{{ text }}');
t.render({ text: 'Line 1\nLine 2' }); // "Line 1
                                       // Line 2"
```

## Advanced Features

### Variable Extraction

Automatically extract all variables used in a template:

```typescript
const t = new Template(`
  Hello, {{ user.name }}!
  {% if count > threshold %}
    {% for item in items %}{{ item }}{% endfor %}
  {% endif %}
`);

console.log(t.variables); 
// ["user", "count", "threshold", "items"]
```

**Note:** Loop variables (like `item` in a `for` loop) are excluded from extraction.

### Method Extraction

Extract all method calls used in a template:

```typescript
const t = new Template(`
  {{ upper(user.name) }}
  {% if isValid(data) %}
    {% for item in filter(items, condition) %}
      {{ format(item) }}
    {% endfor %}
  {% endif %}
`);

console.log(t.methods);
// ["upper", "isValid", "filter", "format"]
```

This is useful for:
- Validating that all required methods are provided
- Understanding template dependencies
- Documentation and analysis

### Combined Variable and Method Extraction

Variables and methods are extracted separately:

```typescript
const t = new Template('{{ upper(user.name) }} {% for item in getItems(data) %}{{ format(item) }}{% endfor %}');

console.log(t.variables); // ["user", "data"]
console.log(t.methods);   // ["upper", "getItems", "format"]
```

### Template Serialization

Templates can be serialized to JSON and reconstructed, which is useful for:
- Caching pre-parsed templates
- Storing templates in databases
- Transmitting templates over networks
- Template version control and management

#### Serializing Templates

Use `toJSON()` to get the AST representation:

```typescript
const template = new Template('{% if user.active %}{{ user.name }}{% endif %}');
const ast = template.toJSON();

// Save to file
const fs = require('fs');
fs.writeFileSync('template.json', JSON.stringify(ast));

// Or send over network
await fetch('/api/templates', {
  method: 'POST',
  body: JSON.stringify(ast)
});
```

#### Deserializing Templates

Use `Template.fromJSON()` to reconstruct templates:

```typescript
// Load from file
const fs = require('fs');
const ast = JSON.parse(fs.readFileSync('template.json', 'utf8'));
const template = Template.fromJSON(ast);

// Use the template normally
template.render({ user: { active: true, name: 'Alice' } });
// "Alice"
```

#### Round-Trip Serialization

Templates maintain their functionality through serialization:

```typescript
const original = new Template('{% for item in items %}{{ item }}{% endfor %}');

// Serialize
const ast = original.toJSON();
const json = JSON.stringify(ast);

// Deserialize
const loaded = JSON.parse(json);
const restored = Template.fromJSON(loaded);

// Both produce the same output
const data = { items: [1, 2, 3] };
console.log(original.render(data));  // "123"
console.log(restored.render(data));  // "123"

// Variables and methods are preserved
console.log(restored.variables);  // Same as original.variables
console.log(restored.methods);    // Same as original.methods
```

#### Caching Example

Pre-parse templates for better performance:

```typescript
const templateCache = new Map();

function getTemplate(templateString) {
  // Check cache first
  if (templateCache.has(templateString)) {
    const ast = templateCache.get(templateString);
    return Template.fromJSON(ast);
  }
  
  // Parse and cache
  const template = new Template(templateString);
  templateCache.set(templateString, template.toJSON());
  return template;
}

// Usage
const t1 = getTemplate('Hello {{ name }}');  // Parse + cache
const t2 = getTemplate('Hello {{ name }}');  // From cache
```

### Nested Structures

curlyjs handles complex nested structures seamlessly:

```typescript
const t = new Template(`
  {% for category in categories %}
    <h2>{{ category.name }}</h2>
    {% for product in category.products %}
      {% if product.inStock %}
        <div>{{ product.name }}: ${{ product.price }}</div>
      {% endif %}
    {% endfor %}
  {% endfor %}
`);

const data = {
  categories: [
    {
      name: 'Electronics',
      products: [
        { name: 'Laptop', price: 999, inStock: true },
        { name: 'Mouse', price: 25, inStock: false }
      ]
    }
  ]
};

t.render(data);
```

## API Reference

### `Template`

#### Constructor

```typescript
new Template(template: string)
```

Creates a new Template instance from a template string.

#### Properties

- `template: string` - The original template string (read-only)
- `variables: string[]` - Array of variable names used in the template (read-only)
- `methods: string[]` - Array of method names used in the template (read-only)

#### Methods

##### `render(data: object, methods?: object): string`

Renders the template with the provided data and optional custom methods.

**Parameters:**
- `data` - Object containing template variables
- `methods` - Optional object containing custom functions

**Returns:** Rendered string

**Example:**
```typescript
const t = new Template('{{ greeting }}, {{ name }}!');
const result = t.render({ greeting: 'Hello', name: 'World' });
```

##### `toJSON(): ASTNode[]`

Returns the internal Abstract Syntax Tree (AST) representation of the template. This allows you to serialize the parsed template structure.

**Returns:** Array of AST nodes

**Example:**
```typescript
const t = new Template('Hello {{ name }}!');
const ast = t.toJSON();
console.log(JSON.stringify(ast));
// Can be saved to file or transmitted over network
```

##### `static fromJSON(ast: ASTNode[]): Template`

Reconstructs a Template instance from an AST. The method converts the AST back into the original template string and creates a new Template instance.

**Parameters:**
- `ast` - Array of AST nodes (from `toJSON()`)

**Returns:** New Template instance

**Example:**
```typescript
// Serialize
const original = new Template('{% for item in items %}{{ item }}{% endfor %}');
const ast = original.toJSON();
const serialized = JSON.stringify(ast);

// Store or transmit serialized...

// Deserialize
const loaded = JSON.parse(serialized);
const restored = Template.fromJSON(loaded);

// Use restored template
restored.render({ items: [1, 2, 3] }); // "123"
```

## Complete Example

```typescript
import { Template } from 'curlyjs';

// Define custom methods
const methods = {
  upper: (str) => str.toUpperCase(),
  formatPrice: (price) => `$${price.toFixed(2)}`,
  isEmpty: (arr) => arr.length === 0
};

// Create a complex template
const template = new Template(`
  <div class="user-profile">
    <h1>{{ upper(user.name) }}</h1>
    <p>Email: {{ user.email }}</p>
    
    {% if user.isPremium %}
      <span class="badge">Premium Member</span>
    {% endif %}
    
    <h2>Recent Order</h2>
    {% if !isEmpty(user.orders) %}
      {# Show the most recent order (first in array) #}
      <div class="recent-order">
        <strong>{{ user.orders[0].product }}</strong>
        - {{ formatPrice(user.orders[0].price) }}
        {% if user.orders[0].shipped %}
          <span class="status">✓ Shipped</span>
        {% else %}
          <span class="status">⏳ Processing</span>
        {% endif %}
      </div>
    {% endif %}
    
    <h2>All Orders</h2>
    {% if !isEmpty(user.orders) %}
      <ul>
        {% for order, index in user.orders %}
          <li>
            Order #{{ index }}: {{ order.product }}
            - {{ formatPrice(order.price) }}
            {% if order.shipped %}(Shipped){% endif %}
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <p>No orders yet.</p>
    {% endif %}
  </div>
`);

// Render with data
const data = {
  user: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    isPremium: true,
    orders: [
      { product: 'Laptop', price: 1299.99, shipped: true },
      { product: 'Mouse', price: 29.99, shipped: false }
    ]
  }
};

const html = template.render(data, methods);
console.log(html);

// Extract template dependencies
console.log('Variables:', template.variables);
// ["user"]

console.log('Methods:', template.methods);
// ["upper", "formatPrice", "isEmpty"]
```

## AST Structure

curlyjs parses templates into an Abstract Syntax Tree (AST) for efficient rendering. The AST consists of the following node types:

### Template Node Types

#### `TextNode`
```typescript
{
  type: 'text',
  text: string
}
```

#### `InterpolationNode`
```typescript
{
  type: 'interpolation',
  expression: ExprNode
}
```

#### `ForLoopNode`
```typescript
{
  type: 'for',
  itemVar: string,
  indexVar: string | null,
  arrayExpr: ExprNode,
  body: ASTNode[]
}
```

#### `IfNode`
```typescript
{
  type: 'if',
  branches: IfBranch[],
  elseBody: ASTNode[] | null
}

interface IfBranch {
  condition: ExprNode,
  body: ASTNode[]
}
```

#### `CommentNode`
```typescript
{
  type: 'comment',
  text: string
}
```

### Expression Node Types

Expressions within templates are parsed into their own AST structure:

#### `LiteralNode`
```typescript
{
  type: 'literal',
  value: string | number | boolean | any[]
}
```

#### `VariableNode`
```typescript
{
  type: 'variable',
  name: string
}
```

#### `MemberAccessNode`
```typescript
{
  type: 'memberAccess',
  object: ExprNode,
  property: ExprNode
}
```
Represents array/object member access using bracket notation (e.g., `items[0]`, `users[index]`).

#### `BinaryOpNode`
```typescript
{
  type: 'binaryOp',
  operator: '||' | '&&' | '==' | '!=' | '>' | '<' | '>=' | '<=' | 
            '+' | '-' | '*' | '/' | '%' | '**' | 
            '&' | '|' | '^' | '<<' | '>>' | '>>>',
  left: ExprNode,
  right: ExprNode
}
```

#### `UnaryOpNode`
```typescript
{
  type: 'unaryOp',
  operator: '!' | '~',
  operand: ExprNode
}
```

#### `MethodCallNode`
```typescript
{
  type: 'methodCall',
  methodName: string,
  args: ExprNode[]
}
```

## Error Handling

curlyjs throws descriptive errors for common issues:

```typescript
// Unclosed tag
try {
  new Template('{{ name');
} catch (e) {
  console.error(e); // Error: Unclosed tag at position 0
}

// Invalid syntax
try {
  new Template('{% for item %}{{ item }}{% endfor %}');
} catch (e) {
  console.error(e); // Error: Invalid for loop syntax
}

// Unmatched control structures
try {
  new Template('{% if flag %}text');
} catch (e) {
  console.error(e); // Error: No matching endif for if block
}
```

## Performance Tips

1. **Reuse Template instances**: Parse once, render multiple times
   ```typescript
   const template = new Template('Hello, {{ name }}!');
   const result1 = template.render({ name: 'Alice' });
   const result2 = template.render({ name: 'Bob' });
   ```

2. **Use variable and method extraction**: Validate data and methods before rendering
   ```typescript
   const requiredVars = template.variables;
   const requiredMethods = template.methods;
   const hasAllVars = requiredVars.every(v => v in data);
   const hasAllMethods = requiredMethods.every(m => m in methods);
   ```

3. **Pre-define methods**: Avoid creating method objects in hot paths
   ```typescript
   const methods = { upper: (s) => s.toUpperCase() };
   // Reuse methods object across renders
   ```

## License

MIT License - Copyright (c) 2015 - 2025 Susan Cheng

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

[https://github.com/SusanDoggie/curlyjs](https://github.com/SusanDoggie/curlyjs)
