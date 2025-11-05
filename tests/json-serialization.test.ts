//
//  json-serialization.test.ts
//
//  The MIT License
//  Copyright (c) 2015 - 2025 Susan Cheng. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import { describe, test, expect } from '@jest/globals';
import Decimal from 'decimal.js';
import { Template } from '../src/template';

describe('Template JSON serialization', () => {
  describe('toJSON()', () => {
    test('should return the AST', () => {
      const template = new Template('Hello {{ name }}!');
      const json = template.toJSON();
      
      expect(json).toBeDefined();
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(3); // text, interpolation, text
      expect(json[0].type).toBe('text');
      expect(json[1].type).toBe('interpolation');
      expect(json[2].type).toBe('text');
    });
  });

  describe('fromJSON()', () => {
    test('should reconstruct a simple template', () => {
      const original = new Template('Hello {{ name }}!');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const data = { name: 'World' };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with for loop', () => {
      const original = new Template('{% for item in items %}{{ item }}{% endfor %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const data = { items: ['a', 'b', 'c'] };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with for loop with index', () => {
      const original = new Template('{% for item, i in items %}{{ i }}: {{ item }} {% endfor %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const data = { items: ['a', 'b', 'c'] };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with if/elif/else', () => {
      const original = new Template('{% if x > 10 %}big{% elif x > 5 %}medium{% else %}small{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ x: 15 })).toBe(original.render({ x: 15 }));
      expect(restored.render({ x: 7 })).toBe(original.render({ x: 7 }));
      expect(restored.render({ x: 3 })).toBe(original.render({ x: 3 }));
    });

    test('should reconstruct a template with comments', () => {
      const original = new Template('Hello {# this is a comment #} World');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a complex nested template', () => {
      const original = new Template(`
{% for user in users %}
  {% if user.active %}
    {{ user.name }} is active
  {% else %}
    {{ user.name }} is inactive
  {% endif %}
{% endfor %}
`);
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const data = {
        users: [
          { name: 'Alice', active: true },
          { name: 'Bob', active: false }
        ]
      };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with method calls', () => {
      const original = new Template('{{ upper(name) }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const methods = { upper: (s: string) => s.toUpperCase() };
      expect(restored.render({ name: 'hello' }, methods)).toBe(original.render({ name: 'hello' }, methods));
    });

    test('should reconstruct a template with binary operations', () => {
      const original = new Template('{{ a + b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
    });

    test('should reconstruct a template with unary operations', () => {
      const original = new Template('{{ !active }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ active: false })).toBe(original.render({ active: false }));
    });

    test('should reconstruct a template with comparison operators', () => {
      const original = new Template('{% if count >= 5 %}many{% else %}few{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ count: 10 })).toBe(original.render({ count: 10 }));
      expect(restored.render({ count: 2 })).toBe(original.render({ count: 2 }));
    });

    test('should reconstruct a template with logical operators', () => {
      const original = new Template('{% if a && b %}both{% elif a || b %}one{% else %}none{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ a: true, b: true })).toBe(original.render({ a: true, b: true }));
      expect(restored.render({ a: true, b: false })).toBe(original.render({ a: true, b: false }));
      expect(restored.render({ a: false, b: false })).toBe(original.render({ a: false, b: false }));
    });

    test('should reconstruct a template with string literals', () => {
      const original = new Template('{{ "hello" }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a template with number literals', () => {
      const original = new Template('{{ 42 }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a template with boolean literals', () => {
      const original = new Template('{{ true }} {{ false }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({})).toBe(original.render({}));
    });

    test('should preserve variables extraction', () => {
      const original = new Template('{{ name }} {{ age }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.variables).toEqual(original.variables);
    });

    test('should preserve methods extraction', () => {
      const original = new Template('{{ upper(name) }} {{ lower(title) }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.methods).toEqual(original.methods);
    });

    test('should reconstruct a template with array literals', () => {
      const original = new Template('{{ [1, 2, 3] }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a template with member access (bracket notation)', () => {
      const original = new Template('{{ items[0] }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = { items: ['first', 'second', 'third'] };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with member access (string key)', () => {
      const original = new Template('{{ user["name"] }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = { user: { name: 'Alice' } };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with bitwise AND operator', () => {
      const original = new Template('{{ a & b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
    });

    test('should reconstruct a template with bitwise OR operator', () => {
      const original = new Template('{{ a | b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
    });

    test('should reconstruct a template with bitwise XOR operator', () => {
      const original = new Template('{{ a ^ b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
    });

    test('should reconstruct a template with left shift operator', () => {
      const original = new Template('{{ a << b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5, b: 2 })).toBe(original.render({ a: 5, b: 2 }));
    });

    test('should reconstruct a template with right shift operator', () => {
      const original = new Template('{{ a >> b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 20, b: 2 })).toBe(original.render({ a: 20, b: 2 }));
    });

    test('should reconstruct a template with unsigned right shift operator', () => {
      const original = new Template('{{ a >>> b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: -20, b: 2 })).toBe(original.render({ a: -20, b: 2 }));
    });

    test('should reconstruct a template with bitwise NOT operator', () => {
      const original = new Template('{{ ~a }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5 })).toBe(original.render({ a: 5 }));
    });

    test('should reconstruct a template with exponentiation operator', () => {
      const original = new Template('{{ a ** b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 2, b: 3 })).toBe(original.render({ a: 2, b: 3 }));
    });

    test('should reconstruct a template with subtraction operator', () => {
      const original = new Template('{{ a - b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 10, b: 3 })).toBe(original.render({ a: 10, b: 3 }));
    });

    test('should reconstruct a template with multiplication operator', () => {
      const original = new Template('{{ a * b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
    });

    test('should reconstruct a template with division operator', () => {
      const original = new Template('{{ a / b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 15, b: 3 })).toBe(original.render({ a: 15, b: 3 }));
    });

    test('should reconstruct a template with modulo operator', () => {
      const original = new Template('{{ a % b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 17, b: 5 })).toBe(original.render({ a: 17, b: 5 }));
    });

    test('should reconstruct a template with equality operator', () => {
      const original = new Template('{% if a == b %}equal{% else %}not equal{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5, b: 5 })).toBe(original.render({ a: 5, b: 5 }));
      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
    });

    test('should reconstruct a template with inequality operator', () => {
      const original = new Template('{% if a != b %}not equal{% else %}equal{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
      expect(restored.render({ a: 5, b: 5 })).toBe(original.render({ a: 5, b: 5 }));
    });

    test('should reconstruct a template with less than operator', () => {
      const original = new Template('{% if a < b %}less{% else %}not less{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 3, b: 5 })).toBe(original.render({ a: 3, b: 5 }));
      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
    });

    test('should reconstruct a template with greater than operator', () => {
      const original = new Template('{% if a > b %}greater{% else %}not greater{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
      expect(restored.render({ a: 3, b: 5 })).toBe(original.render({ a: 3, b: 5 }));
    });

    test('should reconstruct a template with less than or equal operator', () => {
      const original = new Template('{% if a <= b %}lte{% else %}gt{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({ a: 3, b: 5 })).toBe(original.render({ a: 3, b: 5 }));
      expect(restored.render({ a: 5, b: 5 })).toBe(original.render({ a: 5, b: 5 }));
      expect(restored.render({ a: 7, b: 5 })).toBe(original.render({ a: 7, b: 5 }));
    });

    test('should reconstruct a template with method calls with multiple arguments', () => {
      const original = new Template('{{ format(template, arg1, arg2) }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const methods = {
        format: (tmpl: string, a: string, b: string) => tmpl.replace('{0}', a).replace('{1}', b)
      };
      const data = { template: 'Hello {0}, welcome to {1}!', arg1: 'Alice', arg2: 'Wonderland' };
      expect(restored.render(data, methods)).toBe(original.render(data, methods));
    });

    test('should reconstruct a template with nested method calls', () => {
      const original = new Template('{{ upper(lower(name)) }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const methods = {
        upper: (s: string) => s.toUpperCase(),
        lower: (s: string) => s.toLowerCase()
      };
      expect(restored.render({ name: 'MiXeD' }, methods)).toBe(original.render({ name: 'MiXeD' }, methods));
    });

    test('should reconstruct a template with method calls with array literal arguments', () => {
      const original = new Template('{{ join([1, 2, 3], ", ") }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const methods = { join: (arr: any[], sep: string) => arr.join(sep) };
      expect(restored.render({}, methods)).toBe(original.render({}, methods));
    });

    test('should reconstruct a template with escape sequences', () => {
      const original = new Template('{{ "Hello\\nWorld\\t!" }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct an empty template', () => {
      const original = new Template('');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a text-only template', () => {
      const original = new Template('Just plain text, no expressions');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a template with complex mixed expressions', () => {
      const original = new Template('{{ (a + b) * c - d / e }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = { a: 5, b: 3, c: 2, d: 20, e: 4 };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with nested array indexing', () => {
      const original = new Template('{{ matrix[0][1] }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with array literal in for loop', () => {
      const original = new Template('{% for item in [1, 2, 3] %}{{ item }}{% endfor %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a template with Decimal arithmetic', () => {
      const original = new Template('{{ a + b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = {
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      };
      expect(restored.render(data)).toBe(original.render(data));
      expect(restored.render(data)).toBe('0.3');
    });

    test('should reconstruct a template with Decimal comparison', () => {
      const original = new Template('{% if price > threshold %}expensive{% else %}affordable{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data1 = {
        price: new Decimal('99.99'),
        threshold: new Decimal('100.00'),
      };
      const data2 = {
        price: new Decimal('100.01'),
        threshold: new Decimal('100.00'),
      };

      expect(restored.render(data1)).toBe(original.render(data1));
      expect(restored.render(data2)).toBe(original.render(data2));
    });

    test('should reconstruct a template with Decimal multiplication', () => {
      const original = new Template('Total: ${{ price * quantity }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = {
        price: new Decimal('19.99'),
        quantity: new Decimal('3'),
      };
      expect(restored.render(data)).toBe(original.render(data));
      expect(restored.render(data)).toBe('Total: $59.97');
    });

    test('should reconstruct a template with BigInt arithmetic', () => {
      const original = new Template('{{ a + b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = {
        a: BigInt(100),
        b: BigInt(200),
      };
      expect(restored.render(data)).toBe(original.render(data));
      expect(restored.render(data)).toBe('300');
    });

    test('should reconstruct a template with BigInt comparison', () => {
      const original = new Template('{% if count > limit %}over{% else %}under{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data1 = {
        count: BigInt(1000),
        limit: BigInt(500),
      };
      const data2 = {
        count: BigInt(100),
        limit: BigInt(500),
      };

      expect(restored.render(data1)).toBe(original.render(data1));
      expect(restored.render(data2)).toBe(original.render(data2));
    });

    test('should reconstruct a template with BigInt exponentiation', () => {
      const original = new Template('2^10 = {{ base ** exp }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = {
        base: BigInt(2),
        exp: BigInt(10),
      };
      expect(restored.render(data)).toBe(original.render(data));
      expect(restored.render(data)).toBe('2^10 = 1024');
    });

    test('should reconstruct a template with Decimal in loops', () => {
      const original = new Template('{% for price in prices %}${{ price }},{% endfor %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = {
        prices: [
          new Decimal('19.99'),
          new Decimal('29.99'),
          new Decimal('39.99'),
        ],
      };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with mixed Decimal and string operations', () => {
      const original = new Template('Price: ${{ price }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data = {
        price: new Decimal('99.99'),
      };
      expect(restored.render(data)).toBe(original.render(data));
      expect(restored.render(data)).toBe('Price: $99.99');
    });

    test('should reconstruct a template with Decimal equality check', () => {
      const original = new Template('{% if a == b %}equal{% else %}not equal{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);

      const data1 = {
        a: new Decimal('0.3'),
        b: new Decimal('0.3'),
      };
      const data2 = {
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      };

      expect(restored.render(data1)).toBe(original.render(data1));
      expect(restored.render(data1)).toBe('equal');
      expect(restored.render(data2)).toBe(original.render(data2));
      expect(restored.render(data2)).toBe('not equal');
    });
  });

  describe('Round-trip serialization', () => {
    test('should handle multiple round trips', () => {
      const original = new Template('{% for i in items %}{{ i }}{% endfor %}');
      const data = { items: [1, 2, 3] };
      
      const json1 = original.toJSON();
      const restored1 = Template.fromJSON(json1);
      
      const json2 = restored1.toJSON();
      const restored2 = Template.fromJSON(json2);
      
      expect(restored2.render(data)).toBe(original.render(data));
      expect(JSON.stringify(json2)).toBe(JSON.stringify(json1));
    });
  });
});
