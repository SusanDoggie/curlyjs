//
//  nested-access-error-handling.test.ts
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

describe('Nested Access Error Handling', () => {
  describe('Undefined/null middle terms in property chains', () => {
    test('root variable is undefined', () => {
      const t = new Template('{{ a.b.c }}');
      expect(t.render({}, testMethods)).toBe('');
    });

    test('root variable is null', () => {
      const t = new Template('{{ a.b.c }}');
      expect(t.render({ a: null }, testMethods)).toBe('');
    });

    test('middle property is undefined', () => {
      const t = new Template('{{ a.b.c.d }}');
      expect(t.render({ a: {} }, testMethods)).toBe('');
    });

    test('middle property is null', () => {
      const t = new Template('{{ a.b.c.d }}');
      expect(t.render({ a: { b: null } }, testMethods)).toBe('');
    });

    test('deep nested property is undefined', () => {
      const t = new Template('{{ a.b.c.d.e.f.g }}');
      expect(t.render({ a: { b: { c: {} } } }, testMethods)).toBe('');
    });

    test('property chain after null', () => {
      const t = new Template('{{ user.profile.name }}');
      expect(t.render({ user: { profile: null } }, testMethods)).toBe('');
    });
  });

  describe('Undefined/null middle terms with array indexing', () => {
    test('array is undefined', () => {
      const t = new Template('{{ a.b[0] }}');
      expect(t.render({ a: {} }, testMethods)).toBe('');
    });

    test('array is null', () => {
      const t = new Template('{{ a.b[0] }}');
      expect(t.render({ a: { b: null } }, testMethods)).toBe('');
    });

    test('array element is undefined (out of bounds)', () => {
      const t = new Template('{{ a.b[10].c }}');
      expect(t.render({ a: { b: [1, 2, 3] } }, testMethods)).toBe('');
    });

    test('nested array access with null middle term', () => {
      const t = new Template('{{ a.b[0][2].c }}');
      expect(t.render({ a: { b: [null] } }, testMethods)).toBe('');
    });

    test('property access after undefined array element', () => {
      const t = new Template('{{ items[5].name }}');
      expect(t.render({ items: ['a', 'b', 'c'] }, testMethods)).toBe('');
    });

    test('complex nested path with undefined middle term', () => {
      const t = new Template('{{ a.b.c[0][2].e.f }}');
      expect(t.render({ a: { b: {} } }, testMethods)).toBe('');
    });

    test('complex nested path with null array', () => {
      const t = new Template('{{ a.b.c[0][2].e.f }}');
      expect(t.render({ a: { b: { c: null } } }, testMethods)).toBe('');
    });

    test('complex nested path with undefined nested array element', () => {
      const t = new Template('{{ a.b.c[0][2].e.f }}');
      expect(t.render({ a: { b: { c: [[]] } } }, testMethods)).toBe('');
    });
  });

  describe('Type mismatches - accessing properties on primitives', () => {
    test('accessing property on string', () => {
      const t = new Template('{{ name.length.value }}');
      // string.length is a number, number.value is undefined
      expect(t.render({ name: 'hello' }, testMethods)).toBe('');
    });

    test('accessing property on number', () => {
      const t = new Template('{{ count.value }}');
      expect(t.render({ count: 42 }, testMethods)).toBe('');
    });

    test('accessing property on boolean', () => {
      const t = new Template('{{ flag.value }}');
      expect(t.render({ flag: true }, testMethods)).toBe('');
    });

    test('accessing nested property on number', () => {
      const t = new Template('{{ user.age.years.value }}');
      expect(t.render({ user: { age: 25 } }, testMethods)).toBe('');
    });
  });

  describe('Type mismatches - array indexing on non-arrays', () => {
    test('indexing into object', () => {
      const t = new Template('{{ obj[0] }}');
      expect(t.render({ obj: { a: 1, b: 2 } }, testMethods)).toBe('');
    });

    test('indexing into string (should work with lodash get)', () => {
      const t = new Template('{{ str[0] }}');
      // Strings are array-like, lodash _.get should handle this
      expect(t.render({ str: 'hello' }, testMethods)).toBe('h');
    });

    test('indexing into number', () => {
      const t = new Template('{{ num[0] }}');
      expect(t.render({ num: 42 }, testMethods)).toBe('');
    });

    test('indexing into boolean', () => {
      const t = new Template('{{ flag[0] }}');
      expect(t.render({ flag: true }, testMethods)).toBe('');
    });

    test('nested indexing on primitive', () => {
      const t = new Template('{{ user.name[0][1] }}');
      // name[0] = 'A' (string), 'A'[1] = undefined
      expect(t.render({ user: { name: 'Alice' } }, testMethods)).toBe('');
    });
  });

  describe('Complex mixed access patterns with errors', () => {
    test('property after failed array access', () => {
      const t = new Template('{{ data[10].name }}');
      expect(t.render({ data: [{ name: 'a' }] }, testMethods)).toBe('');
    });

    test('array access after null property', () => {
      const t = new Template('{{ user.tags[0] }}');
      expect(t.render({ user: { tags: null } }, testMethods)).toBe('');
    });

    test('multiple array access with null', () => {
      const t = new Template('{{ matrix[0][1][2] }}');
      expect(t.render({ matrix: [[null]] }, testMethods)).toBe('');
    });

    test('property chain after primitive array element', () => {
      const t = new Template('{{ items[0].details.name }}');
      expect(t.render({ items: [42] }, testMethods)).toBe('');
    });

    test('very deep nesting with error in middle', () => {
      const t = new Template('{{ a.b.c.d.e.f.g.h.i.j }}');
      expect(t.render({ a: { b: { c: { d: { e: null } } } } }, testMethods)).toBe('');
    });

    test('alternating dot and bracket with null', () => {
      const t = new Template('{{ a[0].b[1].c[2].d }}');
      expect(t.render({ a: [{ b: [null] }] }, testMethods)).toBe('');
    });
  });

  describe('Error handling in conditionals', () => {
    test('undefined property in condition', () => {
      const t = new Template('{% if user.profile.verified %}yes{% else %}no{% endif %}');
      expect(t.render({}, testMethods)).toBe('no');
    });

    test('null middle term in condition', () => {
      const t = new Template('{% if data.items[0].active %}yes{% else %}no{% endif %}');
      expect(t.render({ data: { items: null } }, testMethods)).toBe('no');
    });

    test('type mismatch in condition', () => {
      const t = new Template('{% if num.value %}yes{% else %}no{% endif %}');
      expect(t.render({ num: 42 }, testMethods)).toBe('no');
    });

    test('comparison with undefined property', () => {
      const t = new Template('{% if user.age == 25 %}yes{% else %}no{% endif %}');
      expect(t.render({}, testMethods)).toBe('no');
    });
  });

  describe('Error handling in loops', () => {
    test('iterating over undefined array', () => {
      const t = new Template('{% for item in data.items %}{{ item }}{% endfor %}');
      // Empty string is not iterable, should produce no output
      expect(t.render({}, testMethods)).toBe('');
    });

    test('iterating over null', () => {
      const t = new Template('{% for item in data.items %}{{ item }}{% endfor %}');
      expect(t.render({ data: { items: null } }, testMethods)).toBe('');
    });

    test('accessing undefined property in loop', () => {
      const t = new Template('{% for item in items %}{{ item.name }}{% endfor %}');
      expect(t.render({ items: [{ age: 25 }, { age: 30 }] }, testMethods)).toBe('');
    });

    test('nested loop with undefined', () => {
      const t = new Template('{% for row in matrix %}{% for cell in row.data %}{{ cell }}{% endfor %}{% endfor %}');
      expect(t.render({ matrix: [{ x: 1 }, { x: 2 }] }, testMethods)).toBe('');
    });
  });

  describe('Error handling with method calls', () => {
    test('passing undefined to method', () => {
      const t = new Template('{{ upper(user.name) }}');
      // upper('') should handle empty string
      expect(t.render({}, testMethods)).toBe('');
    });

    test('method call on undefined property', () => {
      const t = new Template('{{ upper(data.items[0]) }}');
      expect(t.render({ data: {} }, testMethods)).toBe('');
    });

    test('nested method calls with undefined', () => {
      const t = new Template('{{ upper(lower(user.profile.name)) }}');
      expect(t.render({}, testMethods)).toBe('');
    });
  });

  describe('Variable indexing edge cases', () => {
    test('undefined index variable', () => {
      const t = new Template('{{ items[idx] }}');
      // idx is undefined/empty string, lodash get will return undefined
      expect(t.render({ items: ['a', 'b', 'c'] }, testMethods)).toBe('');
    });

    test('null index variable', () => {
      const t = new Template('{{ items[idx] }}');
      expect(t.render({ items: ['a', 'b', 'c'], idx: null }, testMethods)).toBe('');
    });

    test('string index on array', () => {
      const t = new Template('{{ items[idx] }}');
      // String '1' should still work as an index
      expect(t.render({ items: ['a', 'b', 'c'], idx: '1' }, testMethods)).toBe('b');
    });

    test('negative index', () => {
      const t = new Template('{{ items[idx] }}');
      expect(t.render({ items: ['a', 'b', 'c'], idx: -1 }, testMethods)).toBe('');
    });

    test('float index', () => {
      const t = new Template('{{ items[idx] }}');
      // lodash will use 1.5 as key literally, won't round
      expect(t.render({ items: ['a', 'b', 'c'], idx: 1.5 }, testMethods)).toBe('');
    });
  });
});

describe('Template Syntax Errors', () => {
  describe('Invalid bracket notation', () => {
    test('unclosed bracket in expression', () => {
      expect(() => new Template('{{ a[0 }}')).toThrow(/bracket/i);
    });

    test('missing opening bracket', () => {
      expect(() => new Template('{{ a0] }}')).toThrow(/bracket/i);
    });

    test('empty brackets in member access', () => {
      expect(() => new Template('{{ a[] }}')).toThrow(/empty bracket/i);
    });

    test('nested unclosed brackets', () => {
      expect(() => new Template('{{ a[b[0] }}')).toThrow(/bracket/i);
    });
  });

  describe('Invalid property access', () => {
    test('multiple consecutive dots', () => {
      expect(() => new Template('{{ a..b }}')).toThrow(/consecutive dots/i);
    });

    test('trailing dot', () => {
      expect(() => new Template('{{ a.b. }}')).toThrow(/end with dot/i);
    });

    test('leading dot', () => {
      expect(() => new Template('{{ .a }}')).toThrow(/start with dot/i);
    });

    test('dot with no identifier', () => {
      expect(() => new Template('{{ a. }}')).toThrow(/end with dot/i);
    });
  });

  describe('Unclosed tags', () => {
    test('unclosed interpolation', () => {
      expect(() => new Template('{{ a.b.c')).toThrow('Unclosed tag');
    });

    test('unclosed if statement', () => {
      expect(() => new Template('{% if a.b %}')).toThrow('No matching endif');
    });

    test('unclosed for loop', () => {
      expect(() => new Template('{% for item in items %}')).toThrow('No matching endfor');
    });
  });

  describe('Invalid expression syntax', () => {
    test('expression with minus operator', () => {
      // a-b is parsed as subtraction expression
      const t = new Template('{{ a-b }}');
      expect(t.render({ a: 10, b: 3 }, testMethods)).toBe('7');
    });

    test('number starting identifier throws error', () => {
      // 123abc starts with number, creates invalid expression
      expect(() => new Template('{{ 123abc }}')).toThrow(/invalid expression/i);
    });

    test('space in property access is parsed as separate tokens', () => {
      // "a. b" is tokenized as: a, ., (whitespace), b
      // But with validation, whitespace after dot makes next token not immediately follow
      const t = new Template('{{ a. b }}');
      // This actually parses as "a" then unexpected ". b"
      // The tokenizer sees: 'a', '.', 'b' as separate tokens
      // So it should work but might not match intuition
      expect(t.render({ a: { b: 'value' } }, testMethods)).toBe('value');
    });

    test('invalid bracket content with spaces throws error', () => {
      // Spaces create invalid expression (multiple identifiers)
      expect(() => new Template('{{ a[b c] }}')).toThrow(/invalid expression/i);
    });
  });

  describe('Mismatched control structures', () => {
    test('endif without if', () => {
      expect(() => new Template('{% endif %}')).toThrow('Unexpected tag');
    });

    test('endfor without for', () => {
      expect(() => new Template('{% endfor %}')).toThrow('Unexpected tag');
    });

    test('else without if', () => {
      expect(() => new Template('{% else %}')).toThrow('Unexpected tag');
    });

    test('elif without if', () => {
      expect(() => new Template('{% elif x %}')).toThrow('Unexpected tag');
    });
  });

  describe('Invalid control flow syntax', () => {
    test('if without condition', () => {
      expect(() => new Template('{% if %}yes{% endif %}')).toThrow();
    });

    test('for without in clause', () => {
      expect(() => new Template('{% for item %}{{ item }}{% endfor %}')).toThrow('Invalid for loop syntax');
    });

    test('elif without condition', () => {
      expect(() => new Template('{% if a %}a{% elif %}b{% endif %}')).toThrow();
    });

    test('empty for loop variable', () => {
      expect(() => new Template('{% for in items %}{% endfor %}')).toThrow('Invalid for loop syntax');
    });
  });
});

describe('Edge Cases with Working Syntax', () => {
  describe('Mixed dot and bracket notation', () => {
    test('bracket after dot', () => {
      const t = new Template('{{ a.b[0] }}');
      expect(t.render({ a: { b: ['x', 'y'] } }, testMethods)).toBe('x');
    });

    test('dot after bracket', () => {
      const t = new Template('{{ a[0].b }}');
      expect(t.render({ a: [{ b: 'value' }] }, testMethods)).toBe('value');
    });

    test('alternating dot and bracket', () => {
      const t = new Template('{{ a.b[0].c[1].d }}');
      expect(t.render({
        a: { b: [{ c: [null, { d: 'result' }] }] }
      }, testMethods)).toBe('result');
    });

    test('multiple brackets in sequence', () => {
      const t = new Template('{{ a[0][1] }}');
      expect(t.render({ a: [[null, 'found']] }, testMethods)).toBe('found');
    });

    test('property access on array element', () => {
      const t = new Template('{{ users[0].name }}');
      expect(t.render({ users: [{ name: 'Alice' }] }, testMethods)).toBe('Alice');
    });
  });

  describe('Valid complex paths', () => {
    test('deeply nested with all terms present', () => {
      const t = new Template('{{ a.b.c[0][2].e.f }}');
      expect(t.render({
        a: {
          b: {
            c: [
              [null, null, { e: { f: 'success' } }]
            ]
          }
        }
      }, testMethods)).toBe('success');
    });

    test('very deep nesting all present', () => {
      const t = new Template('{{ a.b.c.d.e.f.g.h }}');
      expect(t.render({
        a: { b: { c: { d: { e: { f: { g: { h: 'deep' } } } } } } }
      }, testMethods)).toBe('deep');
    });

    test('array of arrays of arrays', () => {
      const t = new Template('{{ data[0][1][2] }}');
      expect(t.render({
        data: [[[null, null], [null, null, 'value']]]
      }, testMethods)).toBe('value');
    });
  });
});
