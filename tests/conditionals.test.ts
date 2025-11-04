//
//  conditionals.test.ts
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

describe('If Statements', () => {
  test('renders simple if true', () => {
    const t = new Template('{% if flag  %}yes{% endif %}');
    expect(t.render({ flag: true })).toBe('yes');
  });

  test('renders simple if false', () => {
    const t = new Template('{% if flag  %}yes{% endif %}');
    expect(t.render({ flag: false })).toBe('');
  });

  test('renders if else - true case', () => {
    const t = new Template('{% if flag  %}yes{% else %}no{% endif %}');
    expect(t.render({ flag: true })).toBe('yes');
  });

  test('renders if else - false case', () => {
    const t = new Template('{% if flag  %}yes{% else %}no{% endif %}');
    expect(t.render({ flag: false })).toBe('no');
  });
});

describe('Comparisons', () => {
  test('renders if with comparison > (true)', () => {
    const t = new Template('{% if count > 5  %}high{% endif %}');
    expect(t.render({ count: 10 })).toBe('high');
  });

  test('renders if with comparison > (false)', () => {
    const t = new Template('{% if count > 5  %}high{% endif %}');
    expect(t.render({ count: 3 })).toBe('');
  });

  test('renders if with comparison < (true)', () => {
    const t = new Template('{% if count < 5  %}low{% endif %}');
    expect(t.render({ count: 3 })).toBe('low');
  });

  test('renders if with comparison < (false)', () => {
    const t = new Template('{% if count < 5  %}low{% endif %}');
    expect(t.render({ count: 10 })).toBe('');
  });

  test('renders if with comparison ==', () => {
    const t = new Template('{% if status == "active"  %}OK{% endif %}');
    expect(t.render({ status: 'active' })).toBe('OK');
    expect(t.render({ status: 'inactive' })).toBe('');
  });

  test('renders if with comparison !=', () => {
    const t = new Template('{% if status != "inactive"  %}OK{% endif %}');
    expect(t.render({ status: 'active' })).toBe('OK');
    expect(t.render({ status: 'inactive' })).toBe('');
  });

  test('renders if with comparison >=', () => {
    const t = new Template('{% if count >= 5  %}OK{% endif %}');
    expect(t.render({ count: 5 })).toBe('OK');
    expect(t.render({ count: 6 })).toBe('OK');
    expect(t.render({ count: 4 })).toBe('');
  });

  test('renders if with comparison <=', () => {
    const t = new Template('{% if count <= 5  %}OK{% endif %}');
    expect(t.render({ count: 5 })).toBe('OK');
    expect(t.render({ count: 4 })).toBe('OK');
    expect(t.render({ count: 6 })).toBe('');
  });

  test('renders if with object equality', () => {
    const t = new Template('{% if obj1 == obj2  %}equal{% endif %}');
    const data = { obj1: { a: 1 }, obj2: { a: 1 } };
    expect(t.render(data)).toBe('equal');
  });
});

describe('Elif and Else', () => {
  test('renders if elif else - first branch', () => {
    const t = new Template('{% if x > 10  %}high{% elif x > 5  %}medium{% else %}low{% endif %}');
    expect(t.render({ x: 15 })).toBe('high');
  });

  test('renders if elif else - second branch', () => {
    const t = new Template('{% if x > 10  %}high{% elif x > 5  %}medium{% else %}low{% endif %}');
    expect(t.render({ x: 7 })).toBe('medium');
  });

  test('renders if elif else - else branch', () => {
    const t = new Template('{% if x > 10  %}high{% elif x > 5  %}medium{% else %}low{% endif %}');
    expect(t.render({ x: 3 })).toBe('low');
  });

  test('renders multiple elif branches', () => {
    const t = new Template('{% if x == 1  %}one{% elif x == 2  %}two{% elif x == 3  %}three{% else %}other{% endif %}');
    expect(t.render({ x: 1 })).toBe('one');
    expect(t.render({ x: 2 })).toBe('two');
    expect(t.render({ x: 3 })).toBe('three');
    expect(t.render({ x: 4 })).toBe('other');
  });

  test('renders elif with nested for loops', () => {
    const t = new Template('{% if x > 10  %}{% for i in a  %}{{ i }}{% endfor %}{% elif x > 5  %}{% for i in b  %}{{ i }}{% endfor %}{% else %}none{% endif %}');
    expect(t.render({ x: 15, a: [1, 2], b: [3, 4] })).toBe('12');
    expect(t.render({ x: 7, a: [1, 2], b: [3, 4] })).toBe('34');
    expect(t.render({ x: 3, a: [1, 2], b: [3, 4] })).toBe('none');
  });
});

describe('NOT Operator', () => {
  test('renders if with NOT operator', () => {
    const t = new Template('{% if !flag  %}not true{% endif %}');
    expect(t.render({ flag: false })).toBe('not true');
    expect(t.render({ flag: true })).toBe('');
  });

  test('renders if with NOT and comparison', () => {
    const t = new Template('{% if !(x > 5)  %}small{% endif %}');
    expect(t.render({ x: 3 })).toBe('small');
    expect(t.render({ x: 10 })).toBe('');
  });

  test('renders if with NOT and method call', () => {
    const t = new Template('{% if !empty(array)  %}has items{% endif %}');
    expect(t.render({ array: [1, 2, 3] }, testMethods)).toBe('has items');
    expect(t.render({ array: [] }, testMethods)).toBe('');
  });

  test('renders NOT with string empty check', () => {
    const t = new Template('{% if !empty(name)  %}Hello {{ name }}{% endif %}');
    expect(t.render({ name: 'Alice' }, testMethods)).toBe('Hello Alice');
    expect(t.render({ name: '' }, testMethods)).toBe('');
  });
});

describe('Arithmetic in Conditionals', () => {
  test('renders if with arithmetic expression', () => {
    const t = new Template('{% if a + b > 10  %}high{% endif %}');
    expect(t.render({ a: 5, b: 7 })).toBe('high');
    expect(t.render({ a: 3, b: 4 })).toBe('');
  });

  test('renders if with subtraction', () => {
    const t = new Template('{% if a - b > 0  %}positive{% endif %}');
    expect(t.render({ a: 10, b: 3 })).toBe('positive');
    expect(t.render({ a: 3, b: 10 })).toBe('');
  });

  test('renders if with multiplication', () => {
    const t = new Template('{% if a * b == 12  %}correct{% endif %}');
    expect(t.render({ a: 3, b: 4 })).toBe('correct');
    expect(t.render({ a: 2, b: 5 })).toBe('');
  });
});

describe('Nested Conditionals', () => {
  test('renders nested if statements', () => {
    const t = new Template('{% if a  %}{% if b  %}both{% else %}a only{% endif %}{% else %}none{% endif %}');
    expect(t.render({ a: true, b: true })).toBe('both');
    expect(t.render({ a: true, b: false })).toBe('a only');
    expect(t.render({ a: false, b: true })).toBe('none');
  });

  test('renders if inside for loop', () => {
    const t = new Template('{% for item in items  %}{% if item > 5  %}{{ item }}{% endif %}{% endfor %}');
    expect(t.render({ items: [3, 7, 2, 9] })).toBe('79');
  });

  test('renders for loop inside if', () => {
    const t = new Template('{% if show  %}{% for item in items  %}{{ item }}{% endfor %}{% endif %}');
    expect(t.render({ show: true, items: [1, 2, 3] })).toBe('123');
    expect(t.render({ show: false, items: [1, 2, 3] })).toBe('');
  });
});
