//
//  operators.test.ts
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

describe('Arithmetic Operators', () => {
  test('renders addition', () => {
    const t = new Template('{{ a + b }}');
    expect(t.render({ a: 5, b: 3 })).toBe('8');
  });

  test('renders subtraction', () => {
    const t = new Template('{{ a - b }}');
    expect(t.render({ a: 10, b: 3 })).toBe('7');
  });

  test('renders multiplication', () => {
    const t = new Template('{{ a * b }}');
    expect(t.render({ a: 4, b: 3 })).toBe('12');
  });

  test('renders division', () => {
    const t = new Template('{{ a / b }}');
    expect(t.render({ a: 10, b: 2 })).toBe('5');
  });

  test('renders complex arithmetic (with proper precedence)', () => {
    const t = new Template('{{ a + b * c }}');
    // With proper operator precedence: a + (b * c) = 2 + (3 * 4) = 2 + 12 = 14
    expect(t.render({ a: 2, b: 3, c: 4 })).toBe('14');
  });
});

describe('Logical OR Operator', () => {
  test('logical OR - both false', () => {
    const t = new Template('{% if false || false  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('no');
  });

  test('logical OR - left true', () => {
    const t = new Template('{% if true || false  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('yes');
  });

  test('logical OR - right true', () => {
    const t = new Template('{% if false || true  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('yes');
  });

  test('logical OR - both true', () => {
    const t = new Template('{% if true || true  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('yes');
  });

  test('logical OR with variables', () => {
    const t = new Template('{% if a || b  %}yes{% else %}no{% endif %}');
    expect(t.render({ a: false, b: true })).toBe('yes');
    expect(t.render({ a: false, b: false })).toBe('no');
  });

  test('logical OR with comparisons', () => {
    const t = new Template('{% if x > 5 || y < 3  %}yes{% else %}no{% endif %}');
    expect(t.render({ x: 10, y: 5 })).toBe('yes');
    expect(t.render({ x: 3, y: 1 })).toBe('yes');
    expect(t.render({ x: 3, y: 5 })).toBe('no');
  });
});

describe('Logical AND Operator', () => {
  test('logical AND - both false', () => {
    const t = new Template('{% if false && false  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('no');
  });

  test('logical AND - left true, right false', () => {
    const t = new Template('{% if true && false  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('no');
  });

  test('logical AND - left false, right true', () => {
    const t = new Template('{% if false && true  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('no');
  });

  test('logical AND - both true', () => {
    const t = new Template('{% if true && true  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('yes');
  });

  test('logical AND with variables', () => {
    const t = new Template('{% if a && b  %}yes{% else %}no{% endif %}');
    expect(t.render({ a: true, b: false })).toBe('no');
    expect(t.render({ a: true, b: true })).toBe('yes');
  });

  test('simple AND test', () => {
    const t = new Template('{% if a && b  %}yes{% else %}no{% endif %}');
    expect(t.render({ a: true, b: false })).toBe('no');
  });
});

describe('NOT with Logical Operators', () => {
  test('NOT with OR - both false', () => {
    const t = new Template('{% if !(false || false)  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('yes');
  });

  test('NOT with OR - should be false', () => {
    const t = new Template('{% if !(true || false)  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('no');
  });

  test('NOT with AND', () => {
    const t = new Template('{% if !(false && true)  %}yes{% else %}no{% endif %}');
    expect(t.render({})).toBe('yes');
  });

  test('NOT with method call and OR', () => {
    const t = new Template('{% if !(empty(array) || flag)  %}yes{% else %}no{% endif %}');
    expect(t.render({ array: [1, 2], flag: false }, testMethods)).toBe('yes');
    expect(t.render({ array: [], flag: false }, testMethods)).toBe('no');
    expect(t.render({ array: [1], flag: true }, testMethods)).toBe('no');
  });

  test('NOT with method call and AND', () => {
    const t = new Template('{% if !(empty(array) && flag)  %}yes{% else %}no{% endif %}');
    expect(t.render({ array: [], flag: true }, testMethods)).toBe('no');
    expect(t.render({ array: [1], flag: true }, testMethods)).toBe('yes');
    expect(t.render({ array: [], flag: false }, testMethods)).toBe('yes');
  });

  test('NOT empty with AND', () => {
    const t = new Template('{% if !empty(name) && active  %}yes{% else %}no{% endif %}');
    expect(t.render({ name: 'bob', active: false }, testMethods)).toBe('no');
    expect(t.render({ name: 'bob', active: true }, testMethods)).toBe('yes');
    expect(t.render({ name: '', active: true }, testMethods)).toBe('no');
  });

  test('complex NOT with OR and comparison', () => {
    const t = new Template('{% if !(x > 10 || y < 5)  %}yes{% else %}no{% endif %}');
    expect(t.render({ x: 5, y: 7 })).toBe('yes');
    expect(t.render({ x: 15, y: 7 })).toBe('no');
    expect(t.render({ x: 5, y: 2 })).toBe('no');
  });
});

describe('Operator Precedence', () => {
  test('AND has higher precedence than OR', () => {
    const t = new Template('{% if a || b && c  %}yes{% else %}no{% endif %}');
    // Should evaluate as: a || (b && c)
    expect(t.render({ a: true, b: false, c: false })).toBe('yes');
    expect(t.render({ a: false, b: true, c: true })).toBe('yes');
    expect(t.render({ a: false, b: true, c: false })).toBe('no');
    expect(t.render({ a: false, b: false, c: true })).toBe('no');
  });

  test('parentheses override precedence', () => {
    const t = new Template('{% if (a || b) && c  %}yes{% else %}no{% endif %}');
    expect(t.render({ a: true, b: false, c: true })).toBe('yes');
    expect(t.render({ a: false, b: true, c: true })).toBe('yes');
    expect(t.render({ a: false, b: false, c: true })).toBe('no');
    expect(t.render({ a: true, b: true, c: false })).toBe('no');
  });

  test('multiple logical operators with method calls', () => {
    const t = new Template('{% if !empty(a) || !empty(b) && flag  %}yes{% else %}no{% endif %}');
    expect(t.render({ a: [1], b: [], flag: true }, testMethods)).toBe('yes');
    expect(t.render({ a: [], b: [1], flag: true }, testMethods)).toBe('yes');
    expect(t.render({ a: [], b: [1], flag: false }, testMethods)).toBe('no');
    expect(t.render({ a: [], b: [], flag: true }, testMethods)).toBe('no');
  });
});
