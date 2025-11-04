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

  test('renders for loop with method call returning array', () => {
    const t = new Template('{% for item in getItems()  %}{{ item }},{% endfor %}');
    const methods = {
      getItems: () => ['x', 'y', 'z']
    };
    expect(t.render({}, methods)).toBe('x,y,z,');
  });

  test('renders for loop with method call with arguments', () => {
    const t = new Template('{% for item in slice(items, 1)  %}{{ item }},{% endfor %}');
    const methods = {
      slice: (arr: any[], start: number) => arr.slice(start)
    };
    const data = { items: ['a', 'b', 'c', 'd'] };
    expect(t.render(data, methods)).toBe('b,c,d,');
  });

  test('renders for loop with nested method call', () => {
    const t = new Template('{% for item in reverse(sort(items))  %}{{ item }},{% endfor %}');
    const methods = {
      sort: (arr: any[]) => [...arr].sort(),
      reverse: (arr: any[]) => [...arr].reverse()
    };
    const data = { items: ['c', 'a', 'b'] };
    expect(t.render(data, methods)).toBe('c,b,a,');
  });

  test('renders for loop with method call using variable', () => {
    const t = new Template('{% for item in filter(items, condition)  %}{{ item }},{% endfor %}');
    const methods = {
      filter: (arr: any[], predicate: string) => {
        if (predicate === 'even') {
          return arr.filter((n: number) => n % 2 === 0);
        }
        return arr;
      }
    };
    const data = { items: [1, 2, 3, 4, 5], condition: 'even' };
    expect(t.render(data, methods)).toBe('2,4,');
  });

  test('renders for loop with complex expression', () => {
    const t = new Template('{% for item in concat(items1, items2)  %}{{ item }},{% endfor %}');
    const methods = {
      concat: (arr1: any[], arr2: any[]) => [...arr1, ...arr2]
    };
    const data = { items1: ['a', 'b'], items2: ['c', 'd'] };
    expect(t.render(data, methods)).toBe('a,b,c,d,');
  });

  test('renders for loop with arithmetic in method arguments', () => {
    const t = new Template('{% for item in slice(items, start + 1, end - 1)  %}{{ item }},{% endfor %}');
    const methods = {
      slice: (arr: any[], start: number, end: number) => arr.slice(start, end)
    };
    const data = { items: ['a', 'b', 'c', 'd', 'e'], start: 0, end: 4 };
    expect(t.render(data, methods)).toBe('b,c,');
  });

  test('renders for loop with property access in method arguments', () => {
    const t = new Template('{% for item in filter(data.items, config.filter)  %}{{ item }},{% endfor %}');
    const methods = {
      filter: (arr: any[], filterType: string) => {
        if (filterType === 'odd') {
          return arr.filter((n: number) => n % 2 === 1);
        }
        return arr;
      }
    };
    const data = {
      data: { items: [1, 2, 3, 4, 5] },
      config: { filter: 'odd' }
    };
    expect(t.render(data, methods)).toBe('1,3,5,');
  });
});
