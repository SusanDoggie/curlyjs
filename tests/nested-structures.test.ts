//
//  nested-structures.test.ts
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

describe('Nested Control Structures', () => {
  test('if inside for loop', () => {
    const t = new Template('{% for item in items  %}{% if item > 5  %}{{ item }}{% endif %}{% endfor %}');
    expect(t.render({ items: [3, 7, 2, 9, 1] })).toBe('79');
  });

  test('for loop inside if', () => {
    const t = new Template('{% if show  %}{% for item in items  %}{{ item }}{% endfor %}{% endif %}');
    expect(t.render({ show: true, items: [1, 2, 3] })).toBe('123');
    expect(t.render({ show: false, items: [1, 2, 3] })).toBe('');
  });

  test('nested if statements', () => {
    const t = new Template('{% if a  %}{% if b  %}both{% else %}a only{% endif %}{% else %}none{% endif %}');
    expect(t.render({ a: true, b: true })).toBe('both');
    expect(t.render({ a: true, b: false })).toBe('a only');
    expect(t.render({ a: false, b: true })).toBe('none');
  });

  test('nested for loops', () => {
    const t = new Template('{% for row in grid  %}{% for cell in row  %}{{ cell }}{% endfor %};{% endfor %}');
    expect(t.render({ grid: [[1, 2], [3, 4]] })).toBe('12;34;');
  });

  test('for in if in for', () => {
    const t = new Template(`{% for group in groups  %}{% if group.active  %}{% for item in group.items  %}{{ item }}{% endfor %}{% endif %}{% endfor %}`);
    const data = {
      groups: [
        { active: true, items: [1, 2] },
        { active: false, items: [3, 4] },
        { active: true, items: [5] }
      ]
    };
    expect(t.render(data)).toBe('125');
  });

  test('if in for in if', () => {
    const t = new Template(`{% if enabled  %}{% for item in items  %}{% if item > 3  %}{{ item }}{% endif %}{% endfor %}{% endif %}`);
    expect(t.render({ enabled: true, items: [1, 5, 2, 7] })).toBe('57');
    expect(t.render({ enabled: false, items: [1, 5, 2, 7] })).toBe('');
  });

  test('triple nested for loops', () => {
    const t = new Template('{% for a in data  %}{% for b in a  %}{% for c in b  %}{{ c }}{% endfor %}|{% endfor %};{% endfor %}');
    const data = { data: [[[1, 2], [3]], [[4, 5]]] };
    expect(t.render(data)).toBe('12|3|;45|;');
  });
});

describe('Complex Nested with Logical Operators', () => {
  test('NOT empty with for loop', () => {
    const t = new Template('{% if !empty(array)  %}{% for item in array  %}{{ item }}{% endfor %}{% endif %}');
    expect(t.render({ array: [1, 2, 3] }, testMethods)).toBe('123');
    expect(t.render({ array: [] }, testMethods)).toBe('');
  });

  test('logical OR with nested if/for', () => {
    const t = new Template('{% if flag || !empty(items)  %}{% for item in items  %}{{ item }}{% endfor %}{% endif %}');
    expect(t.render({ flag: false, items: [1, 2] }, testMethods)).toBe('12');
    expect(t.render({ flag: true, items: [] }, testMethods)).toBe('');
    expect(t.render({ flag: false, items: [] }, testMethods)).toBe('');
  });

  test('logical AND with nested structures', () => {
    const t = new Template('{% if enabled && !empty(items)  %}{% for item in items  %}{% if item > 5  %}{{ item }}{% endif %}{% endfor %}{% endif %}');
    expect(t.render({ enabled: true, items: [3, 7, 9] }, testMethods)).toBe('79');
    expect(t.render({ enabled: false, items: [3, 7, 9] }, testMethods)).toBe('');
    expect(t.render({ enabled: true, items: [] }, testMethods)).toBe('');
  });

  test('method calls with logical operators in nested for', () => {
    const t = new Template('{% for item in items  %}{% if !empty(item.name) && item.active  %}{{ upper(item.name) }}{% endif %}{% endfor %}');
    const data = {
      items: [
        { name: 'alice', active: true },
        { name: '', active: true },
        { name: 'bob', active: false },
        { name: 'charlie', active: true }
      ]
    };
    expect(t.render(data, testMethods)).toBe('ALICECHARLIE');
  });
});

describe('Deeply Nested Structures', () => {
  test('empty nested structures', () => {
    const t = new Template('{% if true  %}{% for item in items  %}{% endfor %}{% endif %}');
    expect(t.render({ items: [] })).toBe('');
  });

  test('deeply nested with all control types', () => {
    const t = new Template(`
{% if outer  %}
  {% for group in groups  %}
    {% if group.show  %}
      {% for item in group.items  %}
        {% if item > threshold  %}
          {{ item }}
        {% endif %}
      {% endfor %}
    {% endif %}
  {% endfor %}
{% endif %}
    `.trim());
    
    const data = {
      outer: true,
      threshold: 5,
      groups: [
        { show: true, items: [3, 7, 2] },
        { show: false, items: [9, 10] },
        { show: true, items: [6, 4, 8] }
      ]
    };
    
    const result = t.render(data).replace(/\s+/g, '');
    expect(result).toBe('768');
  });

  test('complex nested structure with methods', () => {
    const t = new Template(`
{% for user in users  %}
  {% if user.active  %}
    {{ user.name }}: {{ upper(user.role) }}
  {% endif %}
{% endfor %}
    `.trim());
    
    const data = {
      users: [
        { name: 'Alice', role: 'admin', active: true },
        { name: 'Bob', role: 'user', active: false },
        { name: 'Charlie', role: 'moderator', active: true }
      ]
    };
    
    const result = t.render(data, testMethods).replace(/\s+/g, ' ').trim();
    expect(result).toBe('Alice: ADMIN Charlie: MODERATOR');
  });
});
