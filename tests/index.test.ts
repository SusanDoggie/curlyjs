//
//  index.test.ts
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

describe('Integration Tests', () => {
  test('comprehensive template with all features', () => {
    const template = new Template(`
Hello, {{ user.name }}!
You have {{ getUnreadCount(user.id) }} unread messages.

{{ lower("THIS WILL BE LOWERCASE") }}
{{ upper("this will be uppercase") }}
{{ join(["Join", "these", "words"], " ") }}

{% for item in array  %}
 - Item: {{ item }}
{% endfor %}

{% for item, idx in array  %}
 - Item: {{ item }} at index {{ idx }}
{% endfor %}

{% for obj in arrayOfObjects  %}
 - Object Value: {{ obj.val }}
{% endfor %}

{% if number > 10  %}
Number {{ number }} is greater than 10.
{% else %}
Number {{ number }} is not greater than 10.
{% endif %}

{% if number2 < 3 + 2  %}
Number2 {{ number2 }} is less than 5.
{% elif number2 == 7  %}
Number2 {{ number2 }} is equal to 7.
{% else %}
Number2 {{ number2 }} is greater than or equal to 5 and not equal to 7.
{% endif %}

{% if obj1 == obj2  %}
obj1 is equal to obj2.
{% else %}
obj1 is not equal to obj2.
{% endif %}

{% if !empty(array)  %}
Array is not empty:
{% for item in array  %}
 - {{ item }}
{% endfor %}
{% else %}
Array is empty
{% endif %}
    `.trim());

    const result = template.render({
      user: { id: 1, name: 'Alice' },
      array: [10, 20, 30],
      arrayOfObjects: [{ val: 'A' }, { val: 'B' }, { val: 'C' }],
      number: 42,
      number2: 7,
      obj1: { a: 1, b: 2 },
      obj2: { a: 1, b: 2 },
    }, testMethods);

    // Verify key parts of the output
    expect(result).toContain('Hello, Alice!');
    expect(result).toContain('You have 5 unread messages');
    expect(result).toContain('this will be lowercase');
    expect(result).toContain('THIS WILL BE UPPERCASE');
    expect(result).toContain('Join these words');
    expect(result).toContain('- Item: 10');
    expect(result).toContain('- Item: 20 at index 1');
    expect(result).toContain('- Object Value: A');
    expect(result).toContain('Number 42 is greater than 10');
    expect(result).toContain('Number2 7 is equal to 7');
    expect(result).toContain('obj1 is equal to obj2');
    expect(result).toContain('Array is not empty');
  });

  test('extracts all variables from comprehensive template', () => {
    const template = new Template(`
      Hello, {{ user.name }}!
      You have {{ getUnreadCount(user.id) }} unread messages.
      
      {% for item in array  %}
        {{ item }}
      {% endfor %}
      
      {% if number > 10  %}
        {{ status }}
      {% endif %}
    `);

    const vars = template.veriables.sort();
    expect(vars).toEqual(['array', 'number', 'status', 'user'].sort());
  });
});
