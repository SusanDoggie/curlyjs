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
});
