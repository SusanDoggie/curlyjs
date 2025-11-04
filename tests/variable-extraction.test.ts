//
//  variable-extraction.test.ts
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

describe('Variable Extraction', () => {
  test('extracts simple variable', () => {
    const t = new Template('{{ name }}');
    expect(t.variables).toEqual(['name']);
  });

  test('extracts nested property', () => {
    const t = new Template('{{ user.name }}');
    expect(t.variables).toEqual(['user']);
  });

  test('extracts multiple variables', () => {
    const t = new Template('{{ firstName }} {{ lastName }}');
    const vars = t.variables.sort();
    expect(vars).toEqual(['firstName', 'lastName']);
  });

  test('extracts variables from method arguments', () => {
    const t = new Template('{{ upper(name) }}');
    expect(t.variables).toEqual(['name']);
  });

  test('does not extract method names as variables', () => {
    const t = new Template('{{ upper("text") }}');
    expect(t.variables).toEqual([]);
  });

  test('extracts from for loop', () => {
    const t = new Template('{% for item in items  %}{{ item }}{% endfor %}');
    expect(t.variables).toEqual(['items']);
  });

  test('does not extract loop variables', () => {
    const t = new Template('{% for item in items  %}{{ item }}{% endfor %}');
    const vars = t.variables;
    expect(vars.includes('item')).toBe(false);
  });

  test('extracts from if condition', () => {
    const t = new Template('{% if count > 5  %}yes{% endif %}');
    expect(t.variables).toEqual(['count']);
  });

  test('extracts from nested structures', () => {
    const t = new Template(`
      {% for item in items  %}
        {% if item.active  %}{{ item.name }}{% endif %}
      {% endfor %}
    `);
    const vars = t.variables.sort();
    expect(vars).toEqual(['items']);
  });

  test('extracts multiple variables from complex template', () => {
    const t = new Template(`
      Hello, {{ user.name }}!
      {% if count > threshold  %}
        {% for item in items  %}{{ item }}{% endfor %}
      {% endif %}
    `);
    const vars = t.variables.sort();
    expect(vars).toEqual(['count', 'items', 'threshold', 'user'].sort());
  });

  test('extracts top-level variables in nested scopes', () => {
    const t = new Template(`
      {% if count > threshold  %}
        {{ name }}
      {% endif %}
    `);
    const vars = t.variables.sort();
    expect(vars).toEqual(['count', 'name', 'threshold'].sort());
  });

  test('extracts top-level variables in nested for loops with conditionals', () => {
    const t = new Template(`
      {% for item in items  %}
        {% if condition  %}
          {{ title }} - {{ item.value }}
        {% endif %}
      {% endfor %}
    `);
    const vars = t.variables.sort();
    expect(vars).toEqual(['condition', 'items', 'title'].sort());
  });

  test('extracts variables from method calls in for loops', () => {
    const t = new Template('{% for item in getItems(data)  %}{{ item }}{% endfor %}');
    const vars = t.variables.sort();
    expect(vars).toEqual(['data'].sort());
  });

  test('extracts variables from complex expressions in for loops', () => {
    const t = new Template('{% for item in filter(items, condition)  %}{{ item }}{% endfor %}');
    const vars = t.variables.sort();
    expect(vars).toEqual(['condition', 'items'].sort());
  });

  test('extracts variables from nested method calls in for loops', () => {
    const t = new Template('{% for item in reverse(sort(items))  %}{{ item }}{% endfor %}');
    const vars = t.variables.sort();
    expect(vars).toEqual(['items'].sort());
  });
});

describe('Method Extraction', () => {
  test('extracts simple method call', () => {
    const t = new Template('{{ upper(name) }}');
    expect(t.methods).toEqual(['upper']);
  });

  test('extracts multiple method calls', () => {
    const t = new Template('{{ upper(firstName) }} {{ lower(lastName) }}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['lower', 'upper']);
  });

  test('extracts methods with string arguments', () => {
    const t = new Template('{{ upper("hello") }} {{ join(items, ",") }}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['join', 'upper']);
  });

  test('extracts nested method calls', () => {
    const t = new Template('{{ upper(lower(name)) }}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['lower', 'upper']);
  });

  test('extracts methods from conditional expressions', () => {
    const t = new Template('{% if isEmpty(items)  %}Empty{% endif %}');
    expect(t.methods).toEqual(['isEmpty']);
  });

  test('extracts methods from complex conditionals', () => {
    const t = new Template('{% if isValid(user) && hasRole(user, "admin")  %}Admin panel{% endif %}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['hasRole', 'isValid']);
  });

  test('extracts methods from for loops', () => {
    const t = new Template('{% for item in items  %}{{ format(item) }}{% endfor %}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['format']);
  });

  test('extracts methods with complex arguments', () => {
    const t = new Template('{{ format("Hello {0}, you have {1} items", name, count(items)) }}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['count', 'format']);
  });

  test('does not extract method names from string literals', () => {
    const t = new Template('{{ message("call upper() function") }}');
    expect(t.methods).toEqual(['message']);
  });

  test('extracts methods from nested structures', () => {
    const t = new Template(`
      {% if hasPermission(user, "admin")  %}
        {% for item in items  %}
          {{ format(item.name) }} - {{ capitalize(item.type) }}
        {% endfor %}
      {% endif %}
    `);
    const methods = t.methods.sort();
    expect(methods).toEqual(['capitalize', 'format', 'hasPermission']);
  });

  test('extracts methods and variables separately', () => {
    const t = new Template('{{ upper(user.name) }} {% if count > limit  %}{{ format(message) }}{% endif %}');

    const variables = t.variables.sort();
    expect(variables).toEqual(['count', 'limit', 'message', 'user']);

    const methods = t.methods.sort();
    expect(methods).toEqual(['format', 'upper']);
  });

  test('handles methods with whitespace before parentheses', () => {
    const t = new Template('{{ trim (text) }} {{ normalize  ( value ) }}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['normalize', 'trim']);
  });

  test('extracts methods from for loop expressions', () => {
    const t = new Template('{% for item in getItems()  %}{{ item }}{% endfor %}');
    expect(t.methods).toEqual(['getItems']);
  });

  test('extracts methods from complex for loop expressions', () => {
    const t = new Template('{% for item in filter(items, condition)  %}{{ item }}{% endfor %}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['filter']);
  });

  test('extracts methods from nested method calls in for loops', () => {
    const t = new Template('{% for item in reverse(sort(items))  %}{{ item }}{% endfor %}');
    const methods = t.methods.sort();
    expect(methods).toEqual(['reverse', 'sort']);
  });
});
