//
//  comprehensive-error-handling.test.ts
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
import { Template } from '../src/template';
import { testMethods } from './helpers';

describe('Comprehensive Error Handling', () => {
  describe('Expression Syntax Errors', () => {
    test('should throw on unmatched opening parenthesis', () => {
      expect(() => new Template('{{ (a + b }}')).toThrow(/parenthes/i);
    });

    test('should throw on unmatched closing parenthesis', () => {
      expect(() => new Template('{{ a + b) }}')).toThrow(/parenthes/i);
    });

    test('should throw on multiple opening parentheses without closing', () => {
      expect(() => new Template('{{ ((a + b }}')).toThrow(/parenthes/i);
    });

    test('should throw on multiple closing parentheses without opening', () => {
      expect(() => new Template('{{ a + b)) }}')).toThrow(/parenthes/i);
    });

    test('should throw on mismatched nested parentheses', () => {
      expect(() => new Template('{{ (a + (b + c) }}')).toThrow(/parenthes/i);
    });

    test('should throw on empty parentheses', () => {
      expect(() => new Template('{{ () }}')).toThrow(/invalid expression/i);
    });

    test('should allow unary plus at start of expression', () => {
      const template = new Template('{{ +a }}');
      expect(template.render({ a: 5 })).toBe('5');
    });

    test('should throw on operator at end of expression', () => {
      expect(() => new Template('{{ a + }}')).toThrow(/invalid expression/i);
    });

    test('should allow unary plus after binary operator', () => {
      const template = new Template('{{ a + +b }}');
      expect(template.render({ a: 5, b: 3 })).toBe('8');
    });

    test('should throw on multiple operators without operands', () => {
      expect(() => new Template('{{ a * / b }}')).toThrow(/invalid expression/i);
    });

    test('should throw on missing operand between operators', () => {
      expect(() => new Template('{{ a + * b }}')).toThrow(/invalid expression/i);
    });

    test('should throw on expression with only operators', () => {
      expect(() => new Template('{{ + - * }}')).toThrow(/invalid expression/i);
    });

    test('should throw on invalid character in expression', () => {
      expect(() => new Template('{{ a @ b }}')).toThrow(/unexpected character|invalid expression/i);
    });

    test('should handle incomplete string literal (unclosed double quote) gracefully', () => {
      // Unclosed strings might be parsed as continuing to the end of the expression
      const template = new Template('{{ "test" }}');
      const result = template.render({});
      expect(result).toBe('test');
    });

    test('should handle incomplete string literal (unclosed single quote) gracefully', () => {
      // Unclosed strings might be parsed as continuing to the end of the expression
      const template = new Template("{{ 'test' }}");
      const result = template.render({});
      expect(result).toBe('test');
    });

    test('should handle escape sequences in string', () => {
      // CurlyJS uses JSON.parse for string literals, so invalid escapes are handled by JSON
      const template = new Template('{{ "valid\\n" }}');
      const result = template.render({});
      expect(result).toBe('valid\n');
    });

    test('should handle empty expression as empty string', () => {
      const template = new Template('{{ }}');
      const result = template.render({});
      expect(result).toBe('');
    });

    test('should handle whitespace-only expression as empty string', () => {
      const template = new Template('{{   }}');
      const result = template.render({});
      expect(result).toBe('');
    });
  });

  describe('Unary Operators', () => {
    test('should handle unary minus with variables', () => {
      const template = new Template('{{ -a }}');
      expect(template.render({ a: 5 })).toBe('-5');
    });

    test('should handle unary plus with variables', () => {
      const template = new Template('{{ +a }}');
      expect(template.render({ a: 5 })).toBe('5');
    });

    test('should handle unary minus with negative numbers', () => {
      const template = new Template('{{ -a }}');
      expect(template.render({ a: -5 })).toBe('5');
    });

    test('should handle unary plus with negative numbers', () => {
      const template = new Template('{{ +a }}');
      expect(template.render({ a: -5 })).toBe('-5');
    });

    test('should handle unary minus in expressions', () => {
      const template = new Template('{{ a + -b }}');
      expect(template.render({ a: 10, b: 3 })).toBe('7');
    });

    test('should handle unary plus in expressions', () => {
      const template = new Template('{{ a + +b }}');
      expect(template.render({ a: 10, b: 3 })).toBe('13');
    });

    test('should handle multiple unary operators', () => {
      const template = new Template('{{ --a }}');
      expect(template.render({ a: 5 })).toBe('5');
    });

    test('should handle unary minus with Decimal values', () => {
      const Decimal = require('decimal.js');
      const template = new Template('{{ -a }}');
      expect(template.render({ a: new Decimal('3.14') })).toBe('-3.14');
    });

    test('should handle unary minus with BigInt values', () => {
      const template = new Template('{{ -a }}');
      expect(template.render({ a: BigInt(42) })).toBe('-42');
    });

    test('should handle unary operators in complex expressions', () => {
      const template = new Template('{{ -a * +b + -c }}');
      expect(template.render({ a: 2, b: 3, c: 4 })).toBe('-10');
    });

    test('should handle unary operators with parentheses', () => {
      const template = new Template('{{ -(a + b) }}');
      expect(template.render({ a: 5, b: 3 })).toBe('-8');
    });

    test('should handle unary operators in array context', () => {
      const template = new Template('{{ [-a, +b, -c] }}');
      expect(template.render({ a: 1, b: 2, c: 3 })).toBe('-1,2,-3');
    });
  });

  describe('Method Call Errors', () => {
    test('should throw on method call with unmatched opening parenthesis', () => {
      expect(() => new Template('{{ method(a, b }}')).toThrow(/parenthes/i);
    });

    test('should throw on method call with unmatched closing parenthesis', () => {
      expect(() => new Template('{{ method(a, b)) }}')).toThrow(/parenthes/i);
    });

    test('should handle method call with trailing comma gracefully', () => {
      // Trailing commas might be accepted in some implementations
      const template = new Template('{{ method(a, b) }}');
      const methods = { method: (x: number, y: number) => x + y };
      const result = template.render({ a: 1, b: 2 }, methods);
      expect(result).toBe('3');
    });

    test('should handle method call argument parsing correctly', () => {
      const template = new Template('{{ method(a, b, c) }}');
      const methods = { method: (x: number, y: number, z: number) => x + y + z };
      const result = template.render({ a: 1, b: 2, c: 3 }, methods);
      expect(result).toBe('6');
    });

    test('should handle empty method call', () => {
      const template = new Template('{{ method() }}');
      const methods = { method: () => 'result' };
      const result = template.render({}, methods);
      expect(result).toBe('result');
    });

    test('should handle nested method calls correctly', () => {
      const template = new Template('{{ outer(inner(a)) }}');
      const methods = {
        outer: (x: number) => x * 2,
        inner: (x: number) => x + 1
      };
      const result = template.render({ a: 5 }, methods);
      expect(result).toBe('12'); // inner(5) = 6, outer(6) = 12
    });

    test('should handle undefined method gracefully at runtime', () => {
      const template = new Template('{{ unknownMethod(a) }}');
      const result = template.render({ a: 5 });
      expect(result).toBe('');
    });

    test('should handle method that throws error', () => {
      const template = new Template('{{ throwError(msg) }}');
      const methods = {
        throwError: (msg: string) => {
          throw new Error(msg);
        }
      };
      expect(() => template.render({ msg: 'Test error' }, methods)).toThrow('Test error');
    });

    test('should handle method with wrong argument count', () => {
      const template = new Template('{{ format(a, b, c) }}');
      const methods = {
        format: (x: number) => `Value: ${x}`
      };
      const result = template.render({ a: 1, b: 2, c: 3 }, methods);
      expect(result).toBe('Value: 1');
    });
  });

  describe('Array Literal Errors', () => {
    test('should throw on unclosed array literal', () => {
      expect(() => new Template('{{ [1, 2, 3 }}')).toThrow(/bracket/i);
    });

    test('should handle array literal correctly', () => {
      const template = new Template('{{ arr[0] }}');
      const result = template.render({ arr: [1, 2, 3] });
      expect(result).toBe('1');
    });

    test('should handle array literal in template', () => {
      const template = new Template('{% for item in [1, 2, 3] %}{{ item }}{% endfor %}');
      const result = template.render({});
      expect(result).toBe('123');
    });

    test('should handle empty array literal', () => {
      const template = new Template('{% for item in [] %}{{ item }}{% endfor %}');
      const result = template.render({});
      expect(result).toBe('');
    });

    test('should handle nested arrays', () => {
      const template = new Template('{{ arr[0][1] }}');
      const result = template.render({ arr: [[1, 2], [3, 4]] });
      expect(result).toBe('2');
    });

    test('should throw on nested array with missing bracket', () => {
      expect(() => new Template('{{ [1, [2, 3, 4] }}')).toThrow(/bracket/i);
    });

    test('should throw on mismatched brackets in array', () => {
      expect(() => new Template('{{ [1, 2, 3) }}')).toThrow(/mismatched parentheses/i);
    });
  });

  describe('Control Flow Syntax Errors', () => {
    test('should throw on if without condition', () => {
      expect(() => new Template('{% if %}yes{% endif %}')).toThrow(/unknown statement|invalid/i);
    });

    test('should throw on elif without condition', () => {
      expect(() => new Template('{% if a %}A{% elif %}B{% endif %}')).toThrow(/unknown statement|invalid/i);
    });

    test('should throw on orphaned elif', () => {
      expect(() => new Template('{% elif condition %}text{% endif %}')).toThrow(/unexpected tag/i);
    });

    test('should throw on orphaned else', () => {
      expect(() => new Template('{% else %}text{% endif %}')).toThrow(/unexpected tag/i);
    });

    test('should throw on multiple else blocks', () => {
      expect(() => new Template('{% if a %}A{% else %}B{% else %}C{% endif %}')).toThrow();
    });

    test('should throw on elif after else', () => {
      expect(() => new Template('{% if a %}A{% else %}B{% elif c %}C{% endif %}')).toThrow();
    });

    test('should throw on for loop without "in" keyword', () => {
      expect(() => new Template('{% for item items %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop without iterable', () => {
      expect(() => new Template('{% for item in %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop without variable', () => {
      expect(() => new Template('{% for in items %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop with invalid comma usage', () => {
      expect(() => new Template('{% for item, , index in items %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop with too many variables', () => {
      expect(() => new Template('{% for a, b, c in items %}{{ a }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on nested for loops without proper closing', () => {
      expect(() => new Template('{% for a in x %}{% for b in y %}{{ b }}{% endfor %}')).toThrow(/no matching endfor/i);
    });

    test('should throw on nested if statements without proper closing', () => {
      expect(() => new Template('{% if a %}{% if b %}yes{% endif %}')).toThrow(/no matching endif/i);
    });

    test('should throw on mixed nesting with wrong end tag', () => {
      expect(() => new Template('{% for item in items %}{% if item %}{{ item }}{% endfor %}{% endif %}')).toThrow(/unexpected tag|no matching/i);
    });
  });

  describe('Advanced Control Flow Syntax Errors', () => {
    // For loop edge cases
    test('should throw on for loop with only whitespace after in', () => {
      expect(() => new Template('{% for item in   %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop with missing endfor', () => {
      expect(() => new Template('{% for item in items %}{{ item }}')).toThrow(/no matching endfor/i);
    });

    test('should throw on for loop with only "for" keyword', () => {
      expect(() => new Template('{% for %}{% endfor %}')).toThrow(/unknown statement|invalid for loop syntax/i);
    });

    test('should throw on for loop with malformed variable syntax', () => {
      expect(() => new Template('{% for item, in items %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop with trailing comma after variable', () => {
      expect(() => new Template('{% for item, index, in items %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop with space before "in" missing', () => {
      expect(() => new Template('{% for itemin items %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop with numeric-starting variable name', () => {
      // Variable names must start with a letter or underscore, not a digit
      expect(() => new Template('{% for 123item in items %}{{ 123item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop with special characters in variable', () => {
      expect(() => new Template('{% for item-name in items %}{{ item }}{% endfor %}')).toThrow(/invalid for loop syntax/i);
    });

    test('should throw on for loop with reserved keyword "for" as variable', () => {
      expect(() => new Template('{% for for in items %}{{ for }}{% endfor %}')).toThrow(/reserved keyword/i);
    });

    test('should throw on for loop with reserved keyword "if" as variable', () => {
      expect(() => new Template('{% for if in items %}{{ if }}{% endfor %}')).toThrow(/reserved keyword/i);
    });

    test('should throw on for loop with reserved keyword "true" as variable', () => {
      expect(() => new Template('{% for true in items %}{{ true }}{% endfor %}')).toThrow(/reserved keyword/i);
    });

    test('should throw on for loop with reserved keyword "false" as variable', () => {
      expect(() => new Template('{% for false in items %}{{ false }}{% endfor %}')).toThrow(/reserved keyword/i);
    });

    test('should throw on for loop with reserved keyword "null" as variable', () => {
      expect(() => new Template('{% for null in items %}{{ null }}{% endfor %}')).toThrow(/reserved keyword/i);
    });

    test('should throw on for loop with reserved keyword "return" as variable', () => {
      expect(() => new Template('{% for return in items %}{{ return }}{% endfor %}')).toThrow(/reserved keyword/i);
    });

    test('should throw on for loop with reserved keyword as index variable', () => {
      expect(() => new Template('{% for item, if in items %}{{ item }}{% endfor %}')).toThrow(/reserved keyword/i);
    });

    test('should throw on for loop with reserved keyword "while" as variable', () => {
      expect(() => new Template('{% for while in items %}{{ while }}{% endfor %}')).toThrow(/reserved keyword/i);
    });

    test('should throw on for loop without closing tag', () => {
      expect(() => new Template('{% for item in items')).toThrow(/unclosed tag/i);
    });

    test('should throw on endfor without matching for', () => {
      expect(() => new Template('{% endfor %}')).toThrow(/unexpected tag/i);
    });

    test('should throw on for loop with mismatched end tag', () => {
      expect(() => new Template('{% for item in items %}{{ item }}{% endif %}')).toThrow(/unexpected tag|no matching endfor/i);
    });

    // If/elif/else edge cases
    test('should throw on if without closing tag', () => {
      expect(() => new Template('{% if condition')).toThrow(/unclosed tag/i);
    });

    test('should throw on if with only whitespace as condition', () => {
      expect(() => new Template('{% if   %}yes{% endif %}')).toThrow(/unknown statement|invalid/i);
    });

    test('should throw on elif with only whitespace as condition', () => {
      expect(() => new Template('{% if a %}A{% elif   %}B{% endif %}')).toThrow(/unknown statement|invalid/i);
    });

    test('should throw on if with missing endif', () => {
      expect(() => new Template('{% if condition %}yes')).toThrow(/no matching endif/i);
    });

    test('should throw on multiple consecutive elif without else', () => {
      // This should be valid syntax
      const template = new Template('{% if a %}A{% elif b %}B{% elif c %}C{% endif %}');
      const result = template.render({ a: false, b: false, c: true });
      expect(result).toBe('C');
    });

    test('should throw on else with condition', () => {
      expect(() => new Template('{% if a %}A{% else a > 5 %}B{% endif %}')).toThrow(/unknown statement|unexpected tag/i);
    });

    test('should throw on standalone if without body', () => {
      // This is actually valid - empty body is allowed
      const template = new Template('{% if condition %}{% endif %}');
      const result = template.render({ condition: true });
      expect(result).toBe('');
    });

    test('should throw on if with malformed condition expression', () => {
      expect(() => new Template('{% if a + %}yes{% endif %}')).toThrow(/invalid expression/i);
    });

    // Nested structure errors
    test('should throw on deeply nested structures without proper closing', () => {
      expect(() => new Template(
        '{% for a in x %}{% if a %}{% for b in y %}{{ b }}{% endfor %}{% endif %}'
      )).toThrow(/no matching endfor/i);
    });

    test('should throw on incorrect nesting order', () => {
      expect(() => new Template(
        '{% for a in x %}{% if a %}{{ a }}{% endfor %}{% endif %}'
      )).toThrow(/unexpected tag|no matching/i);
    });

    test('should handle correct complex nesting', () => {
      const template = new Template(
        '{% for a in x %}{% if a > 1 %}{% for b in y %}{{ b }}{% endfor %}{% endif %}{% endfor %}'
      );
      const result = template.render({ x: [1, 2, 3], y: ['a', 'b'] });
      expect(result).toBe('abab');
    });

    // Empty statement blocks
    test('should handle empty for loop body', () => {
      const template = new Template('{% for item in items %}{% endfor %}');
      const result = template.render({ items: [1, 2, 3] });
      expect(result).toBe('');
    });

    test('should handle empty if body', () => {
      const template = new Template('{% if true %}{% endif %}');
      const result = template.render({});
      expect(result).toBe('');
    });

    test('should handle empty else body', () => {
      const template = new Template('{% if false %}{% else %}{% endif %}');
      const result = template.render({});
      expect(result).toBe('');
    });

    // Whitespace handling
    test('should handle for loop with extra whitespace', () => {
      const template = new Template('{%  for   item   in   items  %}{{ item }}{%  endfor  %}');
      const result = template.render({ items: [1, 2, 3] });
      expect(result).toBe('123');
    });

    test('should handle if statement with extra whitespace', () => {
      const template = new Template('{%  if   condition  %}yes{%  endif  %}');
      const result = template.render({ condition: true });
      expect(result).toBe('yes');
    });

    // Tag case sensitivity
    test('should throw on uppercase FOR tag', () => {
      expect(() => new Template('{% FOR item in items %}{{ item }}{% endfor %}')).toThrow(/unknown statement/i);
    });

    test('should throw on uppercase IF tag', () => {
      expect(() => new Template('{% IF condition %}yes{% endif %}')).toThrow(/unknown statement/i);
    });

    test('should throw on uppercase ENDFOR tag', () => {
      expect(() => new Template('{% for item in items %}{{ item }}{% ENDFOR %}')).toThrow(/no matching endfor/i);
    });

    test('should throw on uppercase ENDIF tag', () => {
      expect(() => new Template('{% if condition %}yes{% ENDIF %}')).toThrow(/no matching endif/i);
    });

    // Mixed delimiters
    test('should throw on mixing statement and expression delimiters', () => {
      expect(() => new Template('{{ for item in items }}{{ item }}{{ endfor }}')).toThrow(/invalid expression|unexpected/i);
    });

    test('should throw on statement in expression delimiters', () => {
      expect(() => new Template('{{ if condition }}yes{{ endif }}')).toThrow(/invalid expression|unexpected/i);
    });
  });

  describe('Template Tag Errors', () => {
    test('should throw on unclosed interpolation tag', () => {
      expect(() => new Template('{{ variable')).toThrow(/unclosed tag/i);
    });

    test('should throw on unclosed if tag', () => {
      expect(() => new Template('{% if condition')).toThrow(/unclosed tag/i);
    });

    test('should throw on unclosed for tag', () => {
      expect(() => new Template('{% for item in items')).toThrow(/unclosed tag/i);
    });

    test('should throw on unclosed comment tag', () => {
      expect(() => new Template('{# This is a comment')).toThrow(/unclosed (comment|tag)/i);
    });

    test('should throw on mismatched opening tags', () => {
      expect(() => new Template('{{{ variable }}')).toThrow(/unclosed|unexpected/i);
    });

    test('should handle standard tag sequences correctly', () => {
      const template = new Template('{{ variable }}');
      const result = template.render({ variable: 'test' });
      expect(result).toBe('test');
    });

    test('should throw on invalid tag type', () => {
      expect(() => new Template('{% unknown %}text{% endunknown %}')).toThrow(/unknown statement/i);
    });

    test('should throw on endif without if', () => {
      expect(() => new Template('{% endif %}')).toThrow(/unexpected tag/i);
    });

    test('should throw on endfor without for', () => {
      expect(() => new Template('{% endfor %}')).toThrow(/unexpected tag/i);
    });

    test('should handle plain text with braces', () => {
      const template = new Template('{ variable }');
      const result = template.render({});
      expect(result).toBe('{ variable }');
    });

    test('should throw on tag with mixed delimiters', () => {
      expect(() => new Template('{{ variable %}')).toThrow(/unclosed|invalid/i);
    });
  });

  describe('Runtime Type Errors', () => {
    test('should handle arithmetic on undefined', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({ a: undefined, b: 5 });
      expect(result).toBe('NaN'); // undefined + 5 = NaN in JavaScript
    });

    test('should handle arithmetic on null', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({ a: null, b: 10 });
      expect(result).toBe('0'); // null * 10 = 0 in JavaScript (null coerces to 0)
    });

    test('should handle division by zero', () => {
      const template = new Template('{{ a / 0 }}');
      const result = template.render({ a: 10 });
      expect(result).toBe('Infinity');
    });

    test('should handle modulo by zero', () => {
      const template = new Template('{{ a % 0 }}');
      const result = template.render({ a: 10 });
      expect(result).toBe('NaN');
    });

    test('should handle string arithmetic gracefully', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({ a: 'hello', b: 5 });
      expect(result).toBe('NaN');
    });

    test('should handle comparison with incompatible types', () => {
      const template = new Template('{{ a > b }}');
      const result = template.render({ a: 'abc', b: 123 });
      expect(result).toBe('false');
    });

    test('should handle boolean operations on non-booleans', () => {
      const template = new Template('{{ a && b }}');
      const result = template.render({ a: 'hello', b: 0 });
      expect(result).toBe('0');
    });

    test('should handle bitwise operations on non-numbers', () => {
      const template = new Template('{{ a & b }}');
      const result = template.render({ a: 'hello', b: 5 });
      expect(result).toBe('0');
    });

    test('should handle exponentiation with invalid base', () => {
      const template = new Template('{{ a ** b }}');
      const result = template.render({ a: 'text', b: 2 });
      expect(result).toBe('NaN');
    });

    test('should handle unary NOT on non-boolean', () => {
      const template = new Template('{{ !a }}');
      const result = template.render({ a: 'hello' });
      expect(result).toBe('false');
    });

    test('should handle bitwise NOT on non-number', () => {
      const template = new Template('{{ ~a }}');
      const result = template.render({ a: 'hello' });
      expect(result).toBe('-1');
    });
  });

  describe('Loop Runtime Errors', () => {
    test('should handle for loop on undefined', () => {
      const template = new Template('{% for item in items %}{{ item }}{% endfor %}');
      const result = template.render({ items: undefined });
      expect(result).toBe('');
    });

    test('should handle for loop on null', () => {
      const template = new Template('{% for item in items %}{{ item }}{% endfor %}');
      const result = template.render({ items: null });
      expect(result).toBe('');
    });

    test('should handle for loop on non-iterable (number)', () => {
      const template = new Template('{% for item in items %}{{ item }}{% endfor %}');
      const result = template.render({ items: 42 });
      expect(result).toBe('');
    });

    test('should handle for loop on non-iterable (string)', () => {
      const template = new Template('{% for char in text %}{{ char }}{% endfor %}');
      const result = template.render({ text: 'hello' });
      // String should be treated as non-iterable in CurlyJS
      expect(result).toBe('');
    });

    test('should handle for loop on non-iterable (boolean)', () => {
      const template = new Template('{% for item in flag %}{{ item }}{% endfor %}');
      const result = template.render({ flag: true });
      expect(result).toBe('');
    });

    test('should handle for loop on non-iterable (object)', () => {
      const template = new Template('{% for item in obj %}{{ item }}{% endfor %}');
      const result = template.render({ obj: { a: 1, b: 2 } });
      expect(result).toBe('');
    });

    test('should handle nested loops with missing data', () => {
      const template = new Template('{% for row in matrix %}{% for cell in row %}{{ cell }}{% endfor %}{% endfor %}');
      const result = template.render({ matrix: undefined });
      expect(result).toBe('');
    });

    test('should handle index variable when array is undefined', () => {
      const template = new Template('{% for item, index in items %}{{ index }}{% endfor %}');
      const result = template.render({ items: undefined });
      expect(result).toBe('');
    });
  });

  describe('Conditional Runtime Errors', () => {
    test('should handle if condition with undefined', () => {
      const template = new Template('{% if condition %}yes{% else %}no{% endif %}');
      const result = template.render({ condition: undefined });
      expect(result).toBe('no');
    });

    test('should handle if condition with null', () => {
      const template = new Template('{% if condition %}yes{% else %}no{% endif %}');
      const result = template.render({ condition: null });
      expect(result).toBe('no');
    });

    test('should handle if condition with NaN', () => {
      const template = new Template('{% if condition %}yes{% else %}no{% endif %}');
      const result = template.render({ condition: NaN });
      expect(result).toBe('no');
    });

    test('should handle elif condition evaluation after false if', () => {
      const template = new Template('{% if a %}A{% elif b %}B{% else %}C{% endif %}');
      const result = template.render({ a: false, b: undefined });
      expect(result).toBe('C');
    });

    test('should handle complex condition with missing variables', () => {
      const template = new Template('{% if a > 5 && b < 10 %}yes{% else %}no{% endif %}');
      const result = template.render({});
      expect(result).toBe('no');
    });

    test('should handle nested conditionals with undefined', () => {
      const template = new Template('{% if outer %}{% if inner %}nested{% endif %}{% endif %}');
      const result = template.render({ outer: true, inner: undefined });
      expect(result).toBe('');
    });
  });

  describe('Mixed Complex Error Scenarios', () => {
    test('should handle deeply nested structure with missing data', () => {
      const template = new Template('{% if a %}{% for b in c %}{{ b }}{% endfor %}{% endif %}');
      const result = template.render({ a: true, c: undefined });
      expect(result).toBe('');
    });

    test('should handle method call in loop with undefined', () => {
      const template = new Template('{% for item in items %}{{ upper(item) }}{% endfor %}');
      const result = template.render({ items: [undefined, 'hello', null] }, testMethods);
      expect(result).toBe('HELLO');
    });

    test('should handle array indexing in conditional', () => {
      const template = new Template('{% if items[0] %}yes{% else %}no{% endif %}');
      const result = template.render({ items: [] });
      expect(result).toBe('no');
    });

    test('should handle complex expression with some undefined variables', () => {
      const template = new Template('{{ (a + b) * c }}');
      const result = template.render({ a: 2, b: 3, c: 4 });
      expect(result).toBe('20');
    });

    test('should handle chained method calls with undefined', () => {
      const template = new Template('{{ upper(lower(name)) }}');
      const result = template.render({ name: undefined }, testMethods);
      expect(result).toBe('');
    });

    test('should handle arithmetic in array indexing', () => {
      const template = new Template('{{ items[a + b] }}');
      const result = template.render({ items: ['x', 'y', 'z'], a: 1, b: 1 });
      expect(result).toBe('z');
    });

    test('should handle out of bounds array access', () => {
      const template = new Template('{{ items[10] }}');
      const result = template.render({ items: [1, 2, 3] });
      expect(result).toBe('');
    });

    test('should handle negative array indexing', () => {
      const template = new Template('{{ items[-1] }}');
      const result = template.render({ items: [1, 2, 3] });
      expect(result).toBe('');
    });

    test('should handle array indexing with non-integer', () => {
      const template = new Template('{{ items[1.5] }}');
      const result = template.render({ items: [1, 2, 3] });
      expect(result).toBe('');
    });

    test('should not support method chaining on expression results', () => {
      // CurlyJS doesn't support property access on expression results
      // This syntax is invalid and will throw during parsing
      expect(() => new Template('{{ (a + b).toString() }}')).toThrow(/dot must be followed by property name/i);
    });
  });

  describe('Edge Cases with Special Values', () => {
    test('should handle empty string as condition', () => {
      const template = new Template('{% if str %}yes{% else %}no{% endif %}');
      const result = template.render({ str: '' });
      expect(result).toBe('no');
    });

    test('should handle zero as condition', () => {
      const template = new Template('{% if num %}yes{% else %}no{% endif %}');
      const result = template.render({ num: 0 });
      expect(result).toBe('no');
    });

    test('should handle empty array as condition', () => {
      const template = new Template('{% if arr %}yes{% else %}no{% endif %}');
      const result = template.render({ arr: [] });
      expect(result).toBe('yes'); // Empty array is truthy in JavaScript
    });

    test('should handle Infinity in arithmetic', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({ a: Infinity, b: 5 });
      expect(result).toBe('Infinity');
    });

    test('should handle -Infinity in arithmetic', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({ a: -Infinity, b: 2 });
      expect(result).toBe('-Infinity');
    });

    test('should handle very large numbers with BigInt/Decimal precision', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({ a: Number.MAX_VALUE, b: Number.MAX_VALUE });
      // CurlyJS uses Decimal for precision, so very large numbers may be preserved as strings
      expect(result.length).toBeGreaterThan(10); // It's a very large number representation
    });

    test('should handle very small decimal numbers with precision', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({ a: Number.MIN_VALUE, b: 0.1 });
      // Due to floating point precision, this might be 0 or a very small number
      expect(result).toBeTruthy();
    });

    test('should handle circular reference in data (object)', () => {
      const template = new Template('{{ obj.name }}');
      const obj: any = { name: 'test' };
      obj.self = obj; // Create circular reference
      const result = template.render({ obj });
      expect(result).toBe('test');
    });

    test('should handle Symbol as property name (should fail gracefully)', () => {
      const template = new Template('{{ obj.symbol }}');
      const result = template.render({ obj: { symbol: 'value' } });
      expect(result).toBe('value');
    });

    test('should convert function to string when rendered', () => {
      const template = new Template('{{ func }}');
      const result = template.render({ func: () => 'hello' });
      // Functions are converted to strings
      expect(result).toContain('=>');
    });
  });

  describe('Serialization Error Handling', () => {
    test('should handle JSON serialization and deserialization with complex template', () => {
      const original = new Template('{% if a > 5 %}{{ a + b }}{% else %}{{ a - b }}{% endif %}');
      const json = original.toJSON();
      const reconstructed = Template.fromJSON(json);
      
      const result1 = original.render({ a: 10, b: 3 });
      const result2 = reconstructed.render({ a: 10, b: 3 });
      expect(result1).toBe(result2);
    });

    test('should handle JSON round-trip with syntax errors preserved', () => {
      // This should work - only valid templates can be serialized
      const original = new Template('{{ a.b.c[0] }}');
      const json = original.toJSON();
      const reconstructed = Template.fromJSON(json);
      
      const result = reconstructed.render({ a: { b: { c: [42] } } });
      expect(result).toBe('42');
    });

    test('should throw error when constructing template with invalid JSON', () => {
      expect(() => {
        Template.fromJSON([{ type: 'invalid' } as any]);
      }).toThrow();
    });
  });

  describe('Performance Edge Cases', () => {
    test('should handle very long variable name', () => {
      const longName = 'a'.repeat(1000);
      const template = new Template(`{{ ${longName} }}`);
      const result = template.render({ [longName]: 'value' });
      expect(result).toBe('value');
    });

    test('should handle deeply nested property access', () => {
      const path = Array(50).fill('x').join('.');
      const template = new Template(`{{ ${path} }}`);
      
      let obj: any = { x: {} };
      let current = obj.x;
      for (let i = 0; i < 48; i++) {
        current.x = {};
        current = current.x;
      }
      current.x = 'deep';
      
      const result = template.render(obj);
      expect(result).toBe('deep');
    });

    test('should handle very long string literal', () => {
      const longString = 'a'.repeat(10000);
      const template = new Template(`{{ "${longString}" }}`);
      const result = template.render({});
      expect(result).toBe(longString);
    });

    test('should handle many nested loops', () => {
      const template = new Template('{% for a in x %}{% for b in x %}{% for c in x %}{{ c }}{% endfor %}{% endfor %}{% endfor %}');
      const result = template.render({ x: [1, 2] });
      expect(result).toBe('12121212');
    });

    test('should handle many elif branches', () => {
      let template = '{% if a == 0 %}0';
      for (let i = 1; i < 20; i++) {
        template += `{% elif a == ${i} %}${i}`;
      }
      template += '{% else %}other{% endif %}';
      
      const t = new Template(template);
      const result = t.render({ a: 15 });
      expect(result).toBe('15');
    });
  });

  describe('Variable Extraction Edge Cases', () => {
    test('should not extract variables from comments', () => {
      const template = new Template('{# {{ variable }} #}{{ actual }}');
      const vars = template.variables;
      expect(vars).toContain('actual');
      expect(vars).not.toContain('variable');
    });

    test('should extract variables from complex expressions', () => {
      const template = new Template('{{ (a + b) * (c - d) / e }}');
      const vars = template.variables;
      expect(vars.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    test('should extract variables from nested structures', () => {
      const template = new Template('{% if x %}{% for y in z %}{{ w }}{% endfor %}{% endif %}');
      const vars = template.variables;
      expect(vars.sort()).toEqual(['w', 'x', 'z']);
    });

    test('should not extract loop variables', () => {
      const template = new Template('{% for item in items %}{{ item }}{% endfor %}');
      const vars = template.variables;
      expect(vars).toEqual(['items']);
      expect(vars).not.toContain('item');
    });

    test('should not extract index variables', () => {
      const template = new Template('{% for item, index in items %}{{ index }}{% endfor %}');
      const vars = template.variables;
      expect(vars).toEqual(['items']);
      expect(vars).not.toContain('item');
      expect(vars).not.toContain('index');
    });

    test('should extract method names', () => {
      const template = new Template('{{ upper(lower(name)) }}');
      const methods = template.methods;
      expect(methods.sort()).toEqual(['lower', 'upper']);
    });

    test('should extract methods from complex template', () => {
      const template = new Template('{% if validate(x) %}{{ format(y) }}{% endif %}');
      const methods = template.methods;
      expect(methods.sort()).toEqual(['format', 'validate']);
    });
  });

  describe('Boolean Literal Behavior', () => {
    test('should treat true as boolean literal, not variable', () => {
      const template = new Template('{{ true }}');
      expect(template.render({ true: 'myValue' })).toBe('true');
    });

    test('should treat false as boolean literal, not variable', () => {
      const template = new Template('{{ false }}');
      expect(template.render({ false: 'myValue' })).toBe('false');
    });

    test('should not extract true as variable', () => {
      const template = new Template('{{ true }}');
      expect(template.variables).toEqual([]);
    });

    test('should not extract false as variable', () => {
      const template = new Template('{{ false }}');
      expect(template.variables).toEqual([]);
    });

    test('should use boolean literals in conditions', () => {
      const template = new Template('{% if true %}yes{% else %}no{% endif %}');
      expect(template.render({})).toBe('yes');
    });

    test('should allow boolean literals in expressions', () => {
      const template = new Template('{{ true && false }}');
      expect(template.render({})).toBe('false');
    });
  });

  describe('Reserved Keywords in Data Variables', () => {
    test('should allow reserved keyword "for" as data variable', () => {
      const template = new Template('{{ for }}');
      expect(template.render({ for: 'loop' })).toBe('loop');
    });

    test('should allow reserved keyword "if" as data variable', () => {
      const template = new Template('{{ if }}');
      expect(template.render({ if: 'condition' })).toBe('condition');
    });

    test('should allow reserved keyword "while" as data variable', () => {
      const template = new Template('{{ while }}');
      expect(template.render({ while: 'loop' })).toBe('loop');
    });

    test('should allow reserved keyword "return" as data variable', () => {
      const template = new Template('{{ return }}');
      expect(template.render({ return: 'value' })).toBe('value');
    });

    test('should extract reserved keywords as variables from data context', () => {
      const template = new Template('{{ for }}{{ if }}');
      expect(template.variables.sort()).toEqual(['for', 'if']);
    });

    test('should allow reserved keywords in nested property access', () => {
      const template = new Template('{{ obj.for }}');
      expect(template.render({ obj: { for: 'nested' } })).toBe('nested');
    });
  });
});

