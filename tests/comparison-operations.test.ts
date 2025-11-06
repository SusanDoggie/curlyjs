//
//  comparison-operations.test.ts
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

describe('Comparison Operations', () => {
  describe('BigInt comparisons', () => {
    test('should compare two BigInts: BigInt(5) > BigInt(3)', () => {
      const template = new Template('{{ a > b }}');
      expect(template.render({ a: BigInt(5), b: BigInt(3) })).toBe('true');
    });

    test('should compare two BigInts: BigInt(3) < BigInt(5)', () => {
      const template = new Template('{{ a < b }}');
      expect(template.render({ a: BigInt(3), b: BigInt(5) })).toBe('true');
    });

    test('should compare equal BigInts: BigInt(5) >= BigInt(5)', () => {
      const template = new Template('{{ a >= b }}');
      expect(template.render({ a: BigInt(5), b: BigInt(5) })).toBe('true');
    });

    test('should compare equal BigInts: BigInt(5) <= BigInt(5)', () => {
      const template = new Template('{{ a <= b }}');
      expect(template.render({ a: BigInt(5), b: BigInt(5) })).toBe('true');
    });

    test('should handle large BigInt comparisons', () => {
      const template = new Template('{{ a > b }}');
      expect(template.render({ 
        a: BigInt('999999999999999999'), 
        b: BigInt('999999999999999998') 
      })).toBe('true');
    });
  });

  describe('Decimal comparisons', () => {
    test('should compare two Decimals: 0.3 > 0.2', () => {
      const template = new Template('{{ a > b }}');
      expect(template.render({ 
        a: new Decimal('0.3'), 
        b: new Decimal('0.2') 
      })).toBe('true');
    });

    test('should compare two Decimals: 0.1 < 0.2', () => {
      const template = new Template('{{ a < b }}');
      expect(template.render({ 
        a: new Decimal('0.1'), 
        b: new Decimal('0.2') 
      })).toBe('true');
    });

    test('should compare equal Decimals: 0.3 >= 0.3', () => {
      const template = new Template('{{ a >= b }}');
      expect(template.render({ 
        a: new Decimal('0.3'), 
        b: new Decimal('0.3') 
      })).toBe('true');
    });

    test('should handle precise Decimal comparisons: (0.1 + 0.2) == 0.3', () => {
      const template = new Template('{{ (a + b) == c }}');
      expect(template.render({ 
        a: new Decimal('0.1'), 
        b: new Decimal('0.2'),
        c: new Decimal('0.3')
      })).toBe('true');
    });
  });

  describe('Mixed type comparisons', () => {
    test('should compare BigInt with Decimal', () => {
      const template = new Template('{{ a > b }}');
      expect(template.render({ 
        a: BigInt(5), 
        b: new Decimal('3.5') 
      })).toBe('true');
    });

    test('should compare Decimal with BigInt', () => {
      const template = new Template('{{ a < b }}');
      expect(template.render({ 
        a: new Decimal('3.5'), 
        b: BigInt(5) 
      })).toBe('true');
    });

    test('should compare Number with BigInt', () => {
      const template = new Template('{{ a > b }}');
      expect(template.render({ 
        a: 10, 
        b: BigInt(5) 
      })).toBe('true');
    });

    test('should compare Number with Decimal', () => {
      const template = new Template('{{ a < b }}');
      expect(template.render({ 
        a: 3, 
        b: new Decimal('3.5') 
      })).toBe('true');
    });
  });

  describe('Regular number comparisons', () => {
    test('should compare two numbers: 5 > 3', () => {
      const template = new Template('{{ a > b }}');
      expect(template.render({ a: 5, b: 3 })).toBe('true');
    });

    test('should compare two numbers: 3 < 5', () => {
      const template = new Template('{{ a < b }}');
      expect(template.render({ a: 3, b: 5 })).toBe('true');
    });

    test('should compare equal numbers: 5 >= 5', () => {
      const template = new Template('{{ a >= b }}');
      expect(template.render({ a: 5, b: 5 })).toBe('true');
    });

    test('should compare equal numbers: 5 <= 5', () => {
      const template = new Template('{{ a <= b }}');
      expect(template.render({ a: 5, b: 5 })).toBe('true');
    });
  });

  describe('Equality comparisons', () => {
    test('should compare equal BigInts with ==', () => {
      const template = new Template('{{ a == b }}');
      expect(template.render({ a: BigInt(5), b: BigInt(5) })).toBe('true');
    });

    test('should compare unequal BigInts with !=', () => {
      const template = new Template('{{ a != b }}');
      expect(template.render({ a: BigInt(5), b: BigInt(3) })).toBe('true');
    });

    test('should compare equal Decimals with ==', () => {
      const template = new Template('{{ a == b }}');
      expect(template.render({ 
        a: new Decimal('0.3'), 
        b: new Decimal('0.3') 
      })).toBe('true');
    });

    test('should compare unequal Decimals with !=', () => {
      const template = new Template('{{ a != b }}');
      expect(template.render({ 
        a: new Decimal('0.3'), 
        b: new Decimal('0.2') 
      })).toBe('true');
    });
  });
});
