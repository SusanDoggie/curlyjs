//
//  array-indexing.test.ts
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

describe('Array Indexing', () => {
  describe('Literal numeric indices', () => {
    test('accesses array element with literal index', () => {
      const t = new Template('{{ items[0] }}');
      const data = { items: ['first', 'second', 'third'] };
      expect(t.render(data, testMethods)).toBe('first');
    });

    test('accesses array element with different indices', () => {
      const t = new Template('{{ items[1] }}, {{ items[2] }}');
      const data = { items: ['a', 'b', 'c'] };
      expect(t.render(data, testMethods)).toBe('b, c');
    });

    test('accesses nested object array with literal index', () => {
      const t = new Template('{{ user.items[1] }}');
      const data = { user: { items: ['x', 'y', 'z'] } };
      expect(t.render(data, testMethods)).toBe('y');
    });

    test('accesses deeply nested array elements', () => {
      const t = new Template('{{ data.users[0].name }}');
      const data = {
        data: {
          users: [
            { name: 'Alice' },
            { name: 'Bob' }
          ]
        }
      };
      expect(t.render(data, testMethods)).toBe('Alice');
    });

    test('returns empty string for out of bounds index', () => {
      const t = new Template('{{ items[10] }}');
      const data = { items: ['a', 'b'] };
      expect(t.render(data, testMethods)).toBe('');
    });

    test('extracts variable name with bracket notation', () => {
      const t = new Template('{{ items[0] }}');
      // With the new parser, it extracts 'items' (the root variable)
      expect(t.variables).toEqual(['items']);
    });
  });

  describe('Variable indices (now SUPPORTED!)', () => {
    test('supports variable as index', () => {
      const t = new Template('{{ items[index] }}');
      const data = { items: ['x', 'y', 'z'], index: 2 };
      // Now properly evaluates with variable index!
      expect(t.render(data, testMethods)).toBe('z');
    });

    test('extracts both array and index variables', () => {
      const t = new Template('{{ items[index] }}');
      // Parser extracts both variables separately
      expect(t.variables).toEqual(['items', 'index']);
    });
  });

  describe('Use in conditionals', () => {
    test('uses array indexing in if condition', () => {
      const t = new Template('{% if items[0] == "first" %}yes{% else %}no{% endif %}');
      const data = { items: ['first', 'second'] };
      expect(t.render(data, testMethods)).toBe('yes');
    });

    test('uses array indexing in comparison', () => {
      const t = new Template('{% if nums[1] > 10 %}big{% else %}small{% endif %}');
      const data = { nums: [5, 15, 25] };
      expect(t.render(data, testMethods)).toBe('big');
    });
  });

  describe('Use in loops', () => {
    test('accesses array element in loop body', () => {
      const t = new Template('{% for item in list %}{{ item.tags[0] }},{% endfor %}');
      const data = {
        list: [
          { tags: ['a', 'b'] },
          { tags: ['c', 'd'] },
          { tags: ['e', 'f'] }
        ]
      };
      expect(t.render(data, testMethods)).toBe('a,c,e,');
    });
  });

  describe('Use with methods', () => {
    test('passes indexed array element to method', () => {
      const t = new Template('{{ upper(items[0]) }}');
      const data = { items: ['hello', 'world'] };
      expect(t.render(data, testMethods)).toBe('HELLO');
    });

    test('uses indexed element in method call chain', () => {
      const t = new Template('{{ join(items[0], ", ") }}');
      const data = { items: [['a', 'b', 'c'], ['x', 'y', 'z']] };
      expect(t.render(data, testMethods)).toBe('a, b, c');
    });
  });
});
