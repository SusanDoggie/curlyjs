//
//  loops.test.ts
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

describe('For Loops', () => {
  test('renders simple for loop', () => {
    const t = new Template('{% for item in items  %}{{ item }},{% endfor %}');
    expect(t.render({ items: [1, 2, 3] })).toBe('1,2,3,');
  });

  test('renders for loop with index', () => {
    const t = new Template('{% for item, i in items  %}{{ i }}:{{ item }},{% endfor %}');
    expect(t.render({ items: ['a', 'b', 'c'] })).toBe('0:a,1:b,2:c,');
  });

  test('renders for loop with object properties', () => {
    const t = new Template('{% for item in items  %}{{ item.name }},{% endfor %}');
    const data = { items: [{ name: 'A' }, { name: 'B' }] };
    expect(t.render(data)).toBe('A,B,');
  });

  test('renders nested for loops', () => {
    const t = new Template('{% for row in grid  %}{% for cell in row  %}{{ cell }}{% endfor %};{% endfor %}');
    const data = { grid: [[1, 2], [3, 4]] };
    expect(t.render(data)).toBe('12;34;');
  });

  test('renders for loop with method call', () => {
    const t = new Template('{% for item in items  %}{{ upper(item) }}{% endfor %}');
    expect(t.render({ items: ['a', 'b'] }, testMethods)).toBe('AB');
  });

  test('renders empty array for loop', () => {
    const t = new Template('{% for item in items  %}X{% endfor %}');
    expect(t.render({ items: [] })).toBe('');
  });

  test('renders triple nested for loops', () => {
    const t = new Template('{% for a in data  %}{% for b in a  %}{% for c in b  %}{{ c }}{% endfor %}|{% endfor %};{% endfor %}');
    const data = { data: [[[1, 2], [3]], [[4, 5]]] };
    expect(t.render(data)).toBe('12|3|;45|;');
  });

  test('renders for loop with nested object access', () => {
    const t = new Template('{% for user in users  %}{{ user.name }}: {{ user.age }}, {% endfor %}');
    const data = {
      users: [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 }
      ]
    };
    expect(t.render(data)).toBe('Alice: 25, Bob: 30, ');
  });

  test('renders for loop with array of arrays', () => {
    const t = new Template('{% for row in matrix  %}[{% for val in row  %}{{ val }}{% endfor %}]{% endfor %}');
    const data = { matrix: [[1, 2, 3], [4, 5, 6]] };
    expect(t.render(data)).toBe('[123][456]');
  });
});
