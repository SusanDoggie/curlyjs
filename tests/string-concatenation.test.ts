//
//  string-concatenation.test.ts
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
import Decimal from 'decimal.js';

describe('String Concatenation', () => {
  describe('String literal expressions', () => {
    test("should concatenate string literals with + operator: '0.1' + '0.2' -> '0.10.2'", () => {
      const template = new Template("{{ '0.1' + '0.2' }}");
      expect(template.render({})).toBe('0.10.2');
    });

    test("should concatenate string literals with spaces: 'hello' + ' ' + 'world'", () => {
      const template = new Template("{{ 'hello' + ' ' + 'world' }}");
      expect(template.render({})).toBe('hello world');
    });

    test('should concatenate double-quoted string literals', () => {
      const template = new Template('{{ "foo" + "bar" }}');
      expect(template.render({})).toBe('foobar');
    });

    test('should concatenate mixed quote styles', () => {
      const template = new Template('{{ "foo" + \'bar\' }}');
      expect(template.render({})).toBe('foobar');
    });
  });

  describe('String variable concatenation', () => {
    test('should concatenate string variables', () => {
      const template = new Template('{{ a + b }}');
      expect(template.render({ a: 'hello', b: 'world' })).toBe('helloworld');
    });

    test('should concatenate string variables that look like numbers', () => {
      const template = new Template('{{ a + b }}');
      expect(template.render({ a: '0.1', b: '0.2' })).toBe('0.10.2');
    });

    test('should concatenate string variables with literal strings', () => {
      const template = new Template("{{ a + ' world' }}");
      expect(template.render({ a: 'hello' })).toBe('hello world');
    });
  });

  describe('Mixed type concatenation', () => {
    test('should concatenate string + number', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: 'hello', b: 123 })).toBe('hello123');
    });

    test('should concatenate number + string', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: 123, b: 'hello' })).toBe('123hello');
    });

    test('should concatenate string + boolean', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: 'value:', b: true })).toBe('value:true');
    });

    test('should concatenate string + BigInt', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: 'value:', b: BigInt('999999999999999999') })).toBe('value:999999999999999999');
    });

    test('should concatenate string + Decimal', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: 'value:', b: new Decimal('0.1') })).toBe('value:0.1');
    });

    test('should concatenate string literal + numeric expression', () => {
      const template = new Template("{{ 'result: ' + (5 + 3) }}");
      expect(template.render({})).toBe('result: 8');
    });
  });

  describe('Empty string concatenation', () => {
    test('should concatenate empty string + string', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: '', b: 'hello' })).toBe('hello');
    });

    test('should concatenate string + empty string', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: 'hello', b: '' })).toBe('hello');
    });

    test('should concatenate empty string + empty string', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: '', b: '' })).toBe('');
    });
  });

  describe('Multiple concatenations', () => {
    test('should chain multiple string concatenations', () => {
      const template = new Template("{{ a + b + c + d }}");
      expect(template.render({ a: 'a', b: 'b', c: 'c', d: 'd' })).toBe('abcd');
    });

    test('should chain mixed type concatenations', () => {
      const template = new Template("{{ a + b + c + d }}");
      expect(template.render({ a: 'value:', b: 123, c: ' ', d: true })).toBe('value:123 true');
    });
  });

  describe('Numeric addition should still work when no strings involved', () => {
    test('should add two numbers', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: 0.1, b: 0.2 })).toBe('0.30000000000000004');
    });

    test('should add two BigInts', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: BigInt(5), b: BigInt(3) })).toBe('8');
    });

    test('should add two Decimals precisely', () => {
      const template = new Template("{{ a + b }}");
      expect(template.render({ a: new Decimal('0.1'), b: new Decimal('0.2') })).toBe('0.3');
    });
  });
});
