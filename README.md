# curlyjs

A lightweight, fast, and feature-rich JavaScript template engine with a familiar Jinja2-like syntax. curlyjs is designed for developers who need powerful templating capabilities without the overhead of larger frameworks.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Lightweight** - Minimal dependencies, small bundle size
- 🎯 **Simple Syntax** - Clean, readable Jinja2-inspired template syntax
- 🔄 **Control Flow** - Full support for conditionals (`if/elif/else`) and loops (`for`)
- 📊 **Operators** - Comparison, logical, and arithmetic operators
- 🔧 **Custom Methods** - Extend templates with custom functions
- 🌳 **Nested Structures** - Support for deeply nested objects and arrays
- 📝 **Variable Extraction** - Automatically detect variables used in templates
- ⚡ **AST-based** - Efficient parsing and rendering via Abstract Syntax Tree

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

### Operators

#### Comparison Operators

Supported operators: `==`, `!=`, `>`, `<`, `>=`, `<=`

```typescript
const t = new Template('{% if age >= 18 %}Adult{% else %}Minor{% endif %}');
t.render({ age: 21 }); // "Adult"
```

#### Arithmetic Operators

Supported operators: `+`, `-`, `*`, `/`

```typescript
const t = new Template('{{ a + b }}');
t.render({ a: 5, b: 3 }); // "8"
```

**Note:** Arithmetic operations are evaluated left-to-right without standard operator precedence.

#### Logical Operators

- **AND (`&&`)**: Returns true if both operands are true
- **OR (`||`)**: Returns true if at least one operand is true
- **NOT (`!`)**: Negates the operand

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

1. NOT (`!`) - highest
2. Comparison operators (`==`, `!=`, `>`, `<`, `>=`, `<=`)
3. AND (`&&`)
4. OR (`||`) - lowest

Use parentheses to override precedence:

```typescript
const t = new Template('{% if (a || b) && c %}Result{% endif %}');
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

console.log(t.veriables); 
// ["user", "count", "threshold", "items"]
```

**Note:** Loop variables (like `item` in a `for` loop) are excluded from extraction.

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
- `veriables: string[]` - Array of variable names used in the template (read-only)

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
    
    <h2>Orders</h2>
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
```

## AST Structure

curlyjs parses templates into an Abstract Syntax Tree (AST) for efficient rendering. The AST consists of the following node types:

### Node Types

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
  expression: string
}
```

#### `ForLoopNode`
```typescript
{
  type: 'for',
  itemVar: string,
  indexVar: string | null,
  arrayVar: string,
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
  condition: string,
  body: ASTNode[]
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

2. **Use variable extraction**: Validate data before rendering
   ```typescript
   const requiredVars = template.veriables;
   const hasAllVars = requiredVars.every(v => v in data);
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
