//
//  methods.test.ts
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

describe('Method Calls', () => {
  test('calls method with string literal', () => {
    const t = new Template('{{ upper("hello") }}');
    expect(t.render({}, testMethods)).toBe('HELLO');
  });

  test('calls method with variable', () => {
    const t = new Template('{{ upper(text) }}');
    expect(t.render({ text: 'hello' }, testMethods)).toBe('HELLO');
  });

  test('calls method with multiple arguments', () => {
    const t = new Template('{{ add(a, b) }}');
    expect(t.render({ a: 5, b: 3 }, testMethods)).toBe('8');
  });

  test('calls method with array literal', () => {
    const t = new Template('{{ join(["a", "b", "c"], "-") }}');
    expect(t.render({}, testMethods)).toBe('a-b-c');
  });

  test('calls method with mixed arguments', () => {
    const t = new Template('{{ format("Hello {0}, you are {1}", name, age) }}');
    expect(t.render({ name: 'Bob', age: 25 }, testMethods)).toBe('Hello Bob, you are 25');
  });

  test('calls nested method', () => {
    const t = new Template('{{ upper(lower("MIXED")) }}');
    expect(t.render({}, testMethods)).toBe('MIXED');
  });

  test('handles escape sequences in strings', () => {
    const t = new Template('{{ upper("hello\\nworld") }}');
    expect(t.render({}, testMethods)).toBe('HELLO\nWORLD');
  });

  test('handles single quotes with escaped quote', () => {
    const t = new Template("{{ upper('it\\'s') }}");
    expect(t.render({}, testMethods)).toBe("IT'S");
  });

  test('calls method with array containing spaces in separator', () => {
    const t = new Template('{{ join(["A", "B", "C"], " | ") }}');
    expect(t.render({}, testMethods)).toBe('A | B | C');
  });

  test('calls method with escaped backslash in string', () => {
    const t = new Template('{{ join(["a", "b"], "\\\\") }}');
    expect(t.render({}, testMethods)).toBe('a\\b');
  });

  test('calls empty method with array', () => {
    const t = new Template('{% if empty(array)  %}empty{% else %}not empty{% endif %}');
    expect(t.render({ array: [] }, testMethods)).toBe('empty');
    expect(t.render({ array: [1, 2, 3] }, testMethods)).toBe('not empty');
  });

  test('calls empty method with string', () => {
    const t = new Template('{% if empty(str)  %}empty{% else %}not empty{% endif %}');
    expect(t.render({ str: '' }, testMethods)).toBe('empty');
    expect(t.render({ str: 'hello' }, testMethods)).toBe('not empty');
  });

  test('calls empty method with object', () => {
    const t = new Template('{% if empty(obj)  %}empty{% else %}not empty{% endif %}');
    expect(t.render({ obj: {} }, testMethods)).toBe('empty');
    expect(t.render({ obj: { a: 1 } }, testMethods)).toBe('not empty');
  });

  test('complex method calls with expressions', () => {
    const t = new Template('{{ join([upper(a), lower(b), capitalize(c)], " - ") }}');
    const data = { a: 'hello', b: 'WORLD', c: 'test' };
    expect(t.render(data, testMethods)).toBe('HELLO - world - Test');
  });
});

describe('Escape Sequences', () => {
  test('handles \\n (newline) escape sequence', () => {
    const t = new Template('{{ upper("line1\\nline2") }}');
    expect(t.render({}, testMethods)).toBe('LINE1\nLINE2');
  });

  test('handles \\t (tab) escape sequence', () => {
    const t = new Template('{{ upper("col1\\tcol2") }}');
    expect(t.render({}, testMethods)).toBe('COL1\tCOL2');
  });

  test('handles \\r (carriage return) escape sequence', () => {
    const t = new Template('{{ upper("text\\rmore") }}');
    expect(t.render({}, testMethods)).toBe('TEXT\rMORE');
  });

  test('handles \\b (backspace) escape sequence', () => {
    const t = new Template('{{ upper("text\\bmore") }}');
    expect(t.render({}, testMethods)).toBe('TEXT\bMORE');
  });

  test('handles \\f (form feed) escape sequence', () => {
    const t = new Template('{{ upper("page1\\fpage2") }}');
    expect(t.render({}, testMethods)).toBe('PAGE1\fPAGE2');
  });

  test('handles \\v (vertical tab) escape sequence', () => {
    const t = new Template('{{ upper("text\\vmore") }}');
    expect(t.render({}, testMethods)).toBe('TEXT\vMORE');
  });

  test('handles \\\\ (backslash) escape sequence', () => {
    const t = new Template('{{ join(["a", "b"], "\\\\") }}');
    expect(t.render({}, testMethods)).toBe('a\\b');
  });

  test("handles \\' (single quote) escape sequence", () => {
    const t = new Template("{{ upper('it\\'s') }}");
    expect(t.render({}, testMethods)).toBe("IT'S");
  });

  test('handles \\" (double quote) escape sequence', () => {
    const t = new Template('{{ upper("say \\"hello\\"") }}');
    expect(t.render({}, testMethods)).toBe('SAY "HELLO"');
  });

  test('handles \\uXXXX (Unicode) escape sequence', () => {
    const t = new Template('{{ upper("\\u0041\\u0042\\u0043") }}');
    expect(t.render({}, testMethods)).toBe('ABC');
  });

  test('handles \\xXX (hexadecimal) escape sequence', () => {
    const t = new Template('{{ upper("\\x41\\x42\\x43") }}');
    expect(t.render({}, testMethods)).toBe('ABC');
  });

  test('handles multiple escape sequences in one string', () => {
    const t = new Template('{{ upper("line1\\nline2\\ttab\\\\backslash") }}');
    expect(t.render({}, testMethods)).toBe('LINE1\nLINE2\tTAB\\BACKSLASH');
  });

  test('handles escape sequences in single-quoted strings', () => {
    const t = new Template("{{ upper('tab\\there') }}");
    expect(t.render({}, testMethods)).toBe('TAB\tHERE');
  });

  test('handles Unicode emoji with \\uXXXX', () => {
    const t = new Template('{{ upper("\\u2665") }}');
    expect(t.render({}, testMethods)).toBe('♥');
  });
});
