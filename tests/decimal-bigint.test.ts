//
//  decimal-bigint.test.ts
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
import Decimal from 'decimal.js';
import { Template } from '../src';

describe('Decimal and BigInt Support', () => {
  describe('Decimal arithmetic', () => {
    test('should handle Decimal addition correctly', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      });
      expect(result).toBe('0.3');
    });

    test('should handle Decimal subtraction correctly', () => {
      const template = new Template('{{ a - b }}');
      const result = template.render({
        a: new Decimal('1.5'),
        b: new Decimal('0.3'),
      });
      expect(result).toBe('1.2');
    });

    test('should handle Decimal multiplication correctly', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      });
      expect(result).toBe('0.02');
    });

    test('should handle Decimal division correctly', () => {
      const template = new Template('{{ a / b }}');
      const result = template.render({
        a: new Decimal('1'),
        b: new Decimal('3'),
      });
      // Decimal division with default precision
      expect(result).toMatch(/^0\.3+$/);
    });

    test('should handle Decimal modulo correctly', () => {
      const template = new Template('{{ a % b }}');
      const result = template.render({
        a: new Decimal('10'),
        b: new Decimal('3'),
      });
      expect(result).toBe('1');
    });

    test('should handle Decimal exponentiation correctly', () => {
      const template = new Template('{{ a ** b }}');
      const result = template.render({
        a: new Decimal('2'),
        b: new Decimal('3'),
      });
      expect(result).toBe('8');
    });

    test('should handle mixed Decimal and number arithmetic', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: new Decimal('0.1'),
        b: 0.2,
      });
      expect(result).toBe('0.3');
    });

    test('should preserve precision with Decimal values', () => {
      const template = new Template('{{ price * quantity }}');
      const result = template.render({
        price: new Decimal('19.99'),
        quantity: new Decimal('3'),
      });
      expect(result).toBe('59.97');
    });
  });

  describe('Decimal comparison', () => {
    test('should handle Decimal equality correctly', () => {
      const template = new Template('{% if a == b %}equal{% else %}not equal{% endif %}');
      
      const result1 = template.render({
        a: new Decimal('0.3'),
        b: new Decimal('0.3'),
      });
      expect(result1).toBe('equal');

      const result2 = template.render({
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      });
      expect(result2).toBe('not equal');
    });

    test('should handle Decimal inequality correctly', () => {
      const template = new Template('{% if a != b %}different{% else %}same{% endif %}');
      
      const result1 = template.render({
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      });
      expect(result1).toBe('different');

      const result2 = template.render({
        a: new Decimal('0.3'),
        b: new Decimal('0.3'),
      });
      expect(result2).toBe('same');
    });

    test('should handle Decimal greater than comparison', () => {
      const template = new Template('{% if a > b %}greater{% else %}not greater{% endif %}');
      
      const result1 = template.render({
        a: new Decimal('0.3'),
        b: new Decimal('0.2'),
      });
      expect(result1).toBe('greater');

      const result2 = template.render({
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      });
      expect(result2).toBe('not greater');
    });

    test('should handle Decimal less than comparison', () => {
      const template = new Template('{% if a < b %}less{% else %}not less{% endif %}');
      
      const result1 = template.render({
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      });
      expect(result1).toBe('less');

      const result2 = template.render({
        a: new Decimal('0.3'),
        b: new Decimal('0.2'),
      });
      expect(result2).toBe('not less');
    });

    test('should handle Decimal greater than or equal comparison', () => {
      const template = new Template('{% if a >= b %}gte{% else %}not gte{% endif %}');
      
      const result1 = template.render({
        a: new Decimal('0.3'),
        b: new Decimal('0.3'),
      });
      expect(result1).toBe('gte');

      const result2 = template.render({
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
      });
      expect(result2).toBe('not gte');
    });

    test('should handle Decimal less than or equal comparison', () => {
      const template = new Template('{% if a <= b %}lte{% else %}not lte{% endif %}');
      
      const result1 = template.render({
        a: new Decimal('0.2'),
        b: new Decimal('0.2'),
      });
      expect(result1).toBe('lte');

      const result2 = template.render({
        a: new Decimal('0.3'),
        b: new Decimal('0.2'),
      });
      expect(result2).toBe('not lte');
    });
  });

  describe('BigInt arithmetic', () => {
    test('should handle BigInt addition correctly', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: BigInt(100),
        b: BigInt(200),
      });
      expect(result).toBe('300');
    });

    test('should handle BigInt subtraction correctly', () => {
      const template = new Template('{{ a - b }}');
      const result = template.render({
        a: BigInt(500),
        b: BigInt(200),
      });
      expect(result).toBe('300');
    });

    test('should handle BigInt multiplication correctly', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({
        a: BigInt(12),
        b: BigInt(34),
      });
      expect(result).toBe('408');
    });

    test('should handle BigInt division correctly', () => {
      const template = new Template('{{ a / b }}');
      const result = template.render({
        a: BigInt(100),
        b: BigInt(3),
      });
      // Division should produce exact results with decimals, not truncate
      expect(result).toMatch(/^33\.3+$/);
    });

    test('should handle BigInt modulo correctly', () => {
      const template = new Template('{{ a % b }}');
      const result = template.render({
        a: BigInt(100),
        b: BigInt(3),
      });
      expect(result).toBe('1');
    });

    test('should handle BigInt exponentiation correctly', () => {
      const template = new Template('{{ a ** b }}');
      const result = template.render({
        a: BigInt(2),
        b: BigInt(10),
      });
      expect(result).toBe('1024');
    });

    test('should handle very large BigInt values', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: BigInt('999999999999999999999999'),
        b: BigInt('1'),
      });
      expect(result).toBe('1000000000000000000000000');
    });
  });

  describe('BigInt comparison', () => {
    test('should handle BigInt equality correctly', () => {
      const template = new Template('{% if a == b %}equal{% else %}not equal{% endif %}');
      
      const result1 = template.render({
        a: BigInt(100),
        b: BigInt(100),
      });
      expect(result1).toBe('equal');

      const result2 = template.render({
        a: BigInt(100),
        b: BigInt(200),
      });
      expect(result2).toBe('not equal');
    });

    test('should handle BigInt inequality correctly', () => {
      const template = new Template('{% if a != b %}different{% else %}same{% endif %}');
      
      const result1 = template.render({
        a: BigInt(100),
        b: BigInt(200),
      });
      expect(result1).toBe('different');

      const result2 = template.render({
        a: BigInt(100),
        b: BigInt(100),
      });
      expect(result2).toBe('same');
    });

    test('should handle BigInt greater than comparison', () => {
      const template = new Template('{% if a > b %}greater{% else %}not greater{% endif %}');
      
      const result1 = template.render({
        a: BigInt(200),
        b: BigInt(100),
      });
      expect(result1).toBe('greater');

      const result2 = template.render({
        a: BigInt(100),
        b: BigInt(200),
      });
      expect(result2).toBe('not greater');
    });

    test('should handle BigInt less than comparison', () => {
      const template = new Template('{% if a < b %}less{% else %}not less{% endif %}');
      
      const result1 = template.render({
        a: BigInt(100),
        b: BigInt(200),
      });
      expect(result1).toBe('less');

      const result2 = template.render({
        a: BigInt(200),
        b: BigInt(100),
      });
      expect(result2).toBe('not less');
    });
  });

  describe('String concatenation preservation', () => {
    test('should concatenate strings with + operator', () => {
      const template = new Template('{{ firstName + " " + lastName }}');
      const result = template.render({
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result).toBe('John Doe');
    });

    test('should concatenate string with number', () => {
      const template = new Template('{{ prefix + count }}');
      const result = template.render({
        prefix: 'Item #',
        count: 42,
      });
      expect(result).toBe('Item #42');
    });

    test('should concatenate string with Decimal', () => {
      const template = new Template('{{ prefix + price }}');
      const result = template.render({
        prefix: 'Price: $',
        price: new Decimal('19.99'),
      });
      expect(result).toBe('Price: $19.99');
    });

    test('should concatenate string with BigInt', () => {
      const template = new Template('{{ prefix + count }}');
      const result = template.render({
        prefix: 'Count: ',
        count: BigInt(1000000),
      });
      expect(result).toBe('Count: 1000000');
    });

    test('should not treat string numbers as Decimal in concatenation', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: '0.1',
        b: '0.2',
      });
      expect(result).toBe('0.10.2'); // String concatenation
    });
  });

  describe('Decimal in loops', () => {
    test('should handle Decimal values in for loops', () => {
      const template = new Template('{% for price in prices %}{{ price * 1.1 }},{% endfor %}');
      const result = template.render({
        prices: [
          new Decimal('10.00'),
          new Decimal('20.00'),
          new Decimal('30.00'),
        ],
      });
      expect(result).toBe('11,22,33,');
    });

    test('should handle Decimal accumulation in loops', () => {
      const template = new Template('{% for item in items %}{{ item.price * item.quantity }},{% endfor %}');
      const result = template.render({
        items: [
          { price: new Decimal('19.99'), quantity: new Decimal('2') },
          { price: new Decimal('9.99'), quantity: new Decimal('3') },
        ],
      });
      expect(result).toBe('39.98,29.97,');
    });
  });

  describe('Decimal in conditionals', () => {
    test('should use Decimal in if conditions', () => {
      const template = new Template('{% if total > threshold %}Over{% else %}Under{% endif %}');
      
      const result1 = template.render({
        total: new Decimal('100.50'),
        threshold: new Decimal('100.00'),
      });
      expect(result1).toBe('Over');

      const result2 = template.render({
        total: new Decimal('99.50'),
        threshold: new Decimal('100.00'),
      });
      expect(result2).toBe('Under');
    });
  });

  describe('Decimal with methods', () => {
    test('should pass Decimal values to methods', () => {
      const template = new Template('{{ formatCurrency(price) }}');
      const result = template.render(
        {
          price: new Decimal('19.99'),
        },
        {
          formatCurrency: (val: any) => {
            if (val instanceof Decimal) {
              return `$${val.toFixed(2)}`;
            }
            return `$${val}`;
          },
        }
      );
      expect(result).toBe('$19.99');
    });

    test('should return Decimal from methods', () => {
      const template = new Template('{{ calculate(a, b) + c }}');
      const result = template.render(
        {
          a: new Decimal('10'),
          b: new Decimal('20'),
          c: new Decimal('5'),
        },
        {
          calculate: (a: Decimal, b: Decimal) => a.plus(b),
        }
      );
      expect(result).toBe('35');
    });
  });

  describe('Edge cases', () => {
    test('should handle Decimal with very high precision', () => {
      const template = new Template('{{ a }}');
      const result = template.render({
        a: new Decimal('3.141592653589793238462643383279'),
      });
      expect(result).toBe('3.141592653589793238462643383279');
    });

    test('should handle negative Decimal values', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: new Decimal('-10.5'),
        b: new Decimal('5.3'),
      });
      expect(result).toBe('-5.2');
    });

    test('should handle negative BigInt values', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: BigInt(-100),
        b: BigInt(50),
      });
      expect(result).toBe('-50');
    });

    test('should handle Decimal zero', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({
        a: new Decimal('0'),
        b: new Decimal('100'),
      });
      expect(result).toBe('0');
    });

    test('should handle BigInt zero', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({
        a: BigInt(0),
        b: BigInt(100),
      });
      expect(result).toBe('0');
    });
  });

  describe('BigInt literals in templates', () => {
    test('should automatically use BigInt for large integer literals (>15 digits)', () => {
      const template = new Template('{{ 999999999999999999 }}');
      const result = template.render({});
      expect(result).toBe('999999999999999999');
    });

    test('should preserve precision with very large integer literals', () => {
      const template = new Template('{{ 99999999999999999999999999 }}');
      const result = template.render({});
      expect(result).toBe('99999999999999999999999999');
    });

    test('should handle addition with large integer literals', () => {
      const template = new Template('{{ 999999999999999999 + 1 }}');
      const result = template.render({});
      expect(result).toBe('1000000000000000000');
    });

    test('should handle subtraction with large integer literals', () => {
      const template = new Template('{{ 1000000000000000000 - 1 }}');
      const result = template.render({});
      expect(result).toBe('999999999999999999');
    });

    test('should handle multiplication with large results', () => {
      const template = new Template('{{ 999999999999999999 * 2 }}');
      const result = template.render({});
      expect(result).toBe('1999999999999999998');
    });

    test('should handle mixed BigInt literal and variable', () => {
      const template = new Template('{{ 999999999999999999 + a }}');
      const result = template.render({ a: BigInt(1) });
      expect(result).toBe('1000000000000000000');
    });

    test('should handle mixed variable and BigInt literal', () => {
      const template = new Template('{{ a + 999999999999999999 }}');
      const result = template.render({ a: BigInt(1) });
      expect(result).toBe('1000000000000000000');
    });

    test('should handle complex expressions with large integer literals', () => {
      const template = new Template('{{ (999999999999999999 + 1) * 2 }}');
      const result = template.render({});
      expect(result).toBe('2000000000000000000');
    });

    test('should handle negative large integer literals', () => {
      const template = new Template('{{ -999999999999999999 }}');
      const result = template.render({});
      expect(result).toBe('-999999999999999999');
    });

    test('should handle large integer literal in conditionals', () => {
      const template = new Template('{% if 999999999999999999 > 999999999999999998 %}yes{% else %}no{% endif %}');
      const result = template.render({});
      expect(result).toBe('yes');
    });

    test('should handle large integer literal equality', () => {
      const template = new Template('{% if 999999999999999999 == 999999999999999999 %}equal{% else %}not equal{% endif %}');
      const result = template.render({});
      expect(result).toBe('equal');
    });

    test('should handle large integer literals in loops', () => {
      const template = new Template('{% for i in items %}{{ i + 1000000000000000000 }},{% endfor %}');
      const result = template.render({
        items: [BigInt('999999999999999999'), BigInt('999999999999999998')],
      });
      expect(result).toBe('1999999999999999999,1999999999999999998,');
    });

    test('should use regular Number for small integers (<= 15 digits)', () => {
      const template = new Template('{{ 123456789012345 }}');
      const result = template.render({});
      expect(result).toBe('123456789012345');
    });

    test('should handle 16-digit threshold correctly', () => {
      // 16 digits should use BigInt
      const template1 = new Template('{{ 1234567890123456 }}');
      const result1 = template1.render({});
      expect(result1).toBe('1234567890123456');

      // 15 digits should use Number
      const template2 = new Template('{{ 123456789012345 }}');
      const result2 = template2.render({});
      expect(result2).toBe('123456789012345');
    });

    test('should handle BigInt division (integer division)', () => {
      const template = new Template('{{ 999999999999999999 / 2 }}');
      const result = template.render({});
      expect(result).toBe('499999999999999999.5');
    });

    test('should handle BigInt modulo', () => {
      const template = new Template('{{ 999999999999999999 % 100 }}');
      const result = template.render({});
      expect(result).toBe('99');
    });

    test('should handle BigInt exponentiation with literals', () => {
      const template = new Template('{{ 9999999999999999 ** 2 }}');
      const result = template.render({});
      expect(result).toBe('99999999999999980000000000000001');
    });

    test('should handle comparison between BigInt literals', () => {
      const template = new Template('{% if 999999999999999999 < 1000000000000000000 %}less{% else %}not less{% endif %}');
      const result = template.render({});
      expect(result).toBe('less');
    });
  });

  describe('Overflow detection and automatic BigInt conversion', () => {
    test('should detect overflow in multiplication and use BigInt', () => {
      const template = new Template('{{ 1000000000000 * 1000000000000 }}');
      const result = template.render({});
      expect(result).toBe('1000000000000000000000000');
    });

    test('should detect overflow in addition and use BigInt', () => {
      const template = new Template('{{ 9007199254740991 + 9007199254740991 }}');
      const result = template.render({});
      expect(result).toBe('18014398509481982');
    });

    test('should detect overflow in exponentiation and use BigInt', () => {
      const template = new Template('{{ 10 ** 20 }}');
      const result = template.render({});
      expect(result).toBe('100000000000000000000');
    });

    test('should handle overflow in subtraction', () => {
      // Note: Using 0 - x - y instead of -x - y to avoid parser ambiguity with unary minus
      const template = new Template('{{ 0 - 9007199254740991 - 9007199254740991 }}');
      const result = template.render({});
      expect(result).toBe('-18014398509481982');
    });

    test('should not convert to BigInt for non-integer operations', () => {
      const template = new Template('{{ 1.5 * 1000000000000000 }}');
      const result = template.render({});
      // This will be a regular floating point result
      expect(result).toBe('1500000000000000');
    });
  });

  describe('Unary minus operator', () => {
    test('should handle unary minus before binary minus', () => {
      const template = new Template('{{ -1 - 2 }}');
      const result = template.render({});
      expect(result).toBe('-3');
    });

    test('should handle unary minus before subtraction with large numbers', () => {
      const template = new Template('{{ -9007199254740991 - 9007199254740991 }}');
      const result = template.render({});
      expect(result).toBe('-18014398509481982');
    });

    test('should handle parentheses with unary minus before binary minus', () => {
      const template = new Template('{{ (-1) - 2 }}');
      const result = template.render({});
      expect(result).toBe('-3');
    });

    test('should handle 0 - x - y pattern', () => {
      const template = new Template('{{ 0 - 1 - 2 }}');
      const result = template.render({});
      expect(result).toBe('-3');
    });

    test('should handle variables with negative values', () => {
      const template = new Template('{{ x - 2 }}');
      const result = template.render({ x: -1 });
      expect(result).toBe('-3');
    });

    test('should handle unary minus alone', () => {
      const template = new Template('{{ -5 }}');
      const result = template.render({});
      expect(result).toBe('-5');
    });

    test('should handle binary minus alone', () => {
      const template = new Template('{{ 3 - 5 }}');
      const result = template.render({});
      expect(result).toBe('-2');
    });
  });

  describe('Mixed type arithmetic (BigInt + Decimal)', () => {
    test('should convert BigInt to Decimal when mixed with Decimal', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: BigInt(100),
        b: new Decimal('0.5'),
      });
      expect(result).toBe('100.5');
    });

    test('should handle Decimal + BigInt', () => {
      const template = new Template('{{ a + b }}');
      const result = template.render({
        a: new Decimal('0.1'),
        b: BigInt('999999999999999999'),
      });
      expect(result).toBe('999999999999999999.1');
    });

    test('should handle BigInt * Decimal', () => {
      const template = new Template('{{ a * b }}');
      const result = template.render({
        a: BigInt(100),
        b: new Decimal('1.5'),
      });
      expect(result).toBe('150');
    });

    test('should handle Decimal / BigInt', () => {
      const template = new Template('{{ a / b }}');
      const result = template.render({
        a: new Decimal('100'),
        b: BigInt(3),
      });
      // Should use Decimal division for precision
      expect(result).toMatch(/^33\.3+$/);
    });

    test('should handle BigInt - Decimal', () => {
      const template = new Template('{{ a - b }}');
      const result = template.render({
        a: BigInt(100),
        b: new Decimal('0.5'),
      });
      expect(result).toBe('99.5');
    });

    test('should handle complex mixed arithmetic', () => {
      const template = new Template('{{ a + b * c }}');
      const result = template.render({
        a: new Decimal('0.1'),
        b: BigInt(10),
        c: new Decimal('0.5'),
      });
      expect(result).toBe('5.1');
    });

    test('should handle BigInt exponentiation with Decimal', () => {
      const template = new Template('{{ a ** b }}');
      const result = template.render({
        a: BigInt(2),
        b: new Decimal('10'),
      });
      expect(result).toBe('1024');
    });

    test('should preserve precision in mixed operations', () => {
      const template = new Template('{{ a + b + c }}');
      const result = template.render({
        a: new Decimal('0.1'),
        b: new Decimal('0.2'),
        c: BigInt(1),
      });
      expect(result).toBe('1.3');
    });
  });
});
