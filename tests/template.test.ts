//
//  template.test.ts
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

describe('Basic Template Interpolation', () => {
  test('renders simple variable', () => {
    const t = new Template('Hello, {{ name }}!');
    expect(t.render({ name: 'World' })).toBe('Hello, World!');
  });

  test('renders nested property', () => {
    const t = new Template('{{ user.name }}');
    expect(t.render({ user: { name: 'Alice' } })).toBe('Alice');
  });

  test('renders deeply nested property', () => {
    const t = new Template('{{ user.address.city }}');
    expect(t.render({ user: { address: { city: 'NYC' } } })).toBe('NYC');
  });

  test('renders missing variable as empty', () => {
    const t = new Template('{{ missing }}');
    expect(t.render({})).toBe('');
  });

  test('renders number', () => {
    const t = new Template('Count: {{ count }}');
    expect(t.render({ count: 42 })).toBe('Count: 42');
  });

  test('renders boolean', () => {
    const t = new Template('{{ flag }}');
    expect(t.render({ flag: true })).toBe('true');
  });

  test('renders zero and false values', () => {
    const t = new Template('{{ zero }}-{{ false }}');
    expect(t.render({ zero: 0, false: false })).toBe('0-false');
  });

  test('renders null and undefined as empty', () => {
    const t = new Template('{{ null }}{{ undefined }}');
    expect(t.render({ null: null, undefined: undefined })).toBe('');
  });

  test('renders multiple interpolations in text', () => {
    const t = new Template('Name: {{ name }}, Age: {{ age }}, City: {{ city }}');
    const data = { name: 'Alice', age: 30, city: 'NYC' };
    expect(t.render(data)).toBe('Name: Alice, Age: 30, City: NYC');
  });
});

describe('Edge Cases', () => {
  test('renders empty template', () => {
    const t = new Template('');
    expect(t.render({})).toBe('');
  });

  test('renders template with no interpolations', () => {
    const t = new Template('Just plain text');
    expect(t.render({})).toBe('Just plain text');
  });

  test('handles whitespace in interpolation tags', () => {
    const t = new Template('{{name}}');
    expect(t.render({ name: 'test' })).toBe('test');
  });
});
