//
//  comments.test.ts
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

describe('Comment Support', () => {
  test('renders simple comment as empty', () => {
    const t = new Template('{# This is a comment #}');
    expect(t.render({})).toBe('');
  });

  test('renders text with comment removed', () => {
    const t = new Template('Hello {# comment #} World');
    expect(t.render({})).toBe('Hello  World');
  });

  test('renders comment between interpolations', () => {
    const t = new Template('{{ name }}{# comment #}{{ age }}');
    expect(t.render({ name: 'Alice', age: 30 })).toBe('Alice30');
  });

  test('renders multiple comments', () => {
    const t = new Template('{# first #}Hello{# second #} World{# third #}');
    expect(t.render({})).toBe('Hello World');
  });

  test('handles comment with special characters', () => {
    const t = new Template('{# TODO: Fix this later! @#$%^&*() #}text');
    expect(t.render({})).toBe('text');
  });

  test('handles multiline comment', () => {
    const t = new Template(`Before
{# This is a
   multiline
   comment #}
After`);
    expect(t.render({})).toBe('Before\n\nAfter');
  });

  test('handles comment in for loop', () => {
    const t = new Template(`{% for item in items %}{# comment #}{{ item }}{% endfor %}`);
    expect(t.render({ items: [1, 2, 3] })).toBe('123');
  });

  test('handles comment before for loop', () => {
    const t = new Template(`{# Loop through items #}{% for item in items %}{{ item }}{% endfor %}`);
    expect(t.render({ items: ['a', 'b'] })).toBe('ab');
  });

  test('handles comment in if block', () => {
    const t = new Template(`{% if flag %}{# true branch #}yes{% else %}{# false branch #}no{% endif %}`);
    expect(t.render({ flag: true })).toBe('yes');
    expect(t.render({ flag: false })).toBe('no');
  });

  test('handles empty comment', () => {
    const t = new Template('Hello{##}World');
    expect(t.render({})).toBe('HelloWorld');
  });

  test('handles whitespace in comment', () => {
    const t = new Template('{#   whitespace   #}text');
    expect(t.render({})).toBe('text');
  });

  test('handles comment with interpolation-like syntax inside', () => {
    const t = new Template('{# This {{ should }} not be evaluated #}text');
    expect(t.render({ should: 'test' })).toBe('text');
  });

  test('handles comment with statement-like syntax inside', () => {
    const t = new Template('{# {% for item in items %} #}text');
    expect(t.render({})).toBe('text');
  });

  test('handles adjacent comments', () => {
    const t = new Template('{# first #}{# second #}{# third #}text');
    expect(t.render({})).toBe('text');
  });

  test('complex template with comments', () => {
    const template = `
{# Header comment #}
<div>
  {# User info section #}
  <h1>{{ user.name }}</h1>
  {# Loop through posts #}
  {% for post in posts %}
    {# Each post #}
    <article>
      <h2>{{ post.title }}</h2>
      {# Post content #}
      <p>{{ post.content }}</p>
    </article>
  {% endfor %}
  {# Footer #}
</div>`;
    
    const data = {
      user: { name: 'Alice' },
      posts: [
        { title: 'Post 1', content: 'Content 1' },
        { title: 'Post 2', content: 'Content 2' }
      ]
    };
    
    const result = new Template(template).render(data);
    expect(result).toContain('<h1>Alice</h1>');
    expect(result).toContain('<h2>Post 1</h2>');
    expect(result).toContain('<p>Content 1</p>');
    expect(result).toContain('<h2>Post 2</h2>');
    expect(result).toContain('<p>Content 2</p>');
    expect(result).not.toContain('{#');
    expect(result).not.toContain('#}');
  });

  test('handles comment at start of template', () => {
    const t = new Template('{# Start #}Hello');
    expect(t.render({})).toBe('Hello');
  });

  test('handles comment at end of template', () => {
    const t = new Template('Hello{# End #}');
    expect(t.render({})).toBe('Hello');
  });

  test('handles only comment in template', () => {
    const t = new Template('{# Only this #}');
    expect(t.render({})).toBe('');
  });
});

describe('Comment Edge Cases', () => {
  test('throws error for unclosed comment', () => {
    expect(() => {
      new Template('{# unclosed comment');
    }).toThrow('Unclosed tag');
  });

  test('handles comment with nested braces', () => {
    const t = new Template('{# { nested } braces #}text');
    expect(t.render({})).toBe('text');
  });

  test('comment does not interfere with adjacent tags', () => {
    const t = new Template('{{name}}{#comment#}{{age}}');
    expect(t.render({ name: 'Bob', age: 25 })).toBe('Bob25');
  });
});
