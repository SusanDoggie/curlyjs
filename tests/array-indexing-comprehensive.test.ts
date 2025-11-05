//
//  array-indexing-comprehensive.test.ts
//
//  Comprehensive test demonstrating all array indexing features
//

import { describe, test, expect } from '@jest/globals';
import { Template } from '../src/template';
import { testMethods } from './helpers';

describe('Array Indexing - Comprehensive Feature Test', () => {
  test('demonstrates all working array indexing features', () => {
    const template = new Template(`
<h1>Array Indexing Features</h1>

<h2>1. Simple interpolation with literal index</h2>
First: {{ items[0] }}
Second: {{ items[1] }}

<h2>2. Nested object array access</h2>
User name: {{ users[0].name }}
User age: {{ users[0].age }}

<h2>3. Variable index (dynamic)</h2>
Item at index: {{ items[idx] }}

<h2>4. Array indexing in conditionals</h2>
{% if items[0] == "apple" %}First item is apple!{% endif %}
{% if numbers[2] > 10 %}Third number is big{% else %}Third number is small{% endif %}

<h2>5. Array indexing in method calls</h2>
Uppercase first: {{ upper(items[0]) }}
Join first list: {{ join(lists[0], ", ") }}

<h2>6. Complex nested access</h2>
Matrix value: {{ matrix[1][2] }}

<h2>7. Array indexing in loops</h2>
{% for user in users %}Name: {{ user.tags[0] }}, {% endfor %}
    `.trim());

    const data = {
      items: ['apple', 'banana', 'cherry'],
      idx: 1,
      numbers: [5, 8, 15],
      lists: [['a', 'b', 'c'], ['x', 'y', 'z']],
      users: [
        { name: 'Alice', age: 30, tags: ['admin', 'user'] },
        { name: 'Bob', age: 25, tags: ['user', 'guest'] }
      ],
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
    };

    const result = template.render(data, testMethods);

    // Verify all features work
    expect(result).toContain('First: apple');
    expect(result).toContain('Second: banana');
    expect(result).toContain('User name: Alice');
    expect(result).toContain('User age: 30');
    expect(result).toContain('Item at index: banana');
    expect(result).toContain('First item is apple!');
    expect(result).toContain('Third number is big');
    expect(result).toContain('Uppercase first: APPLE');
    expect(result).toContain('Join first list: a, b, c');
    expect(result).toContain('Matrix value: 6');
    expect(result).toContain('Name: admin,');
    expect(result).toContain('Name: user,');
  });
});
