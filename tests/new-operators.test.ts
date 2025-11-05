//
//  new-operators.test.ts
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

describe('Modulo Operator', () => {
  test('renders basic modulo', () => {
    const t = new Template('{{ a % b }}');
    expect(t.render({ a: 10, b: 3 })).toBe('1');
  });

  test('modulo with zero remainder', () => {
    const t = new Template('{{ a % b }}');
    expect(t.render({ a: 10, b: 5 })).toBe('0');
  });

  test('modulo with larger divisor', () => {
    const t = new Template('{{ a % b }}');
    expect(t.render({ a: 5, b: 10 })).toBe('5');
  });

  test('modulo in conditional', () => {
    const t = new Template('{% if n % 2 == 0 %}even{% else %}odd{% endif %}');
    expect(t.render({ n: 4 })).toBe('even');
    expect(t.render({ n: 5 })).toBe('odd');
  });

  test('modulo with negative numbers', () => {
    const t = new Template('{{ a % b }}');
    expect(t.render({ a: -10, b: 3 })).toBe('-1');
    expect(t.render({ a: 10, b: -3 })).toBe('1');
  });
});

describe('Exponentiation Operator', () => {
  test('renders basic exponentiation', () => {
    const t = new Template('{{ a ** b }}');
    expect(t.render({ a: 2, b: 3 })).toBe('8');
  });

  test('exponentiation with power of 0', () => {
    const t = new Template('{{ a ** b }}');
    expect(t.render({ a: 5, b: 0 })).toBe('1');
  });

  test('exponentiation with power of 1', () => {
    const t = new Template('{{ a ** b }}');
    expect(t.render({ a: 7, b: 1 })).toBe('7');
  });

  test('exponentiation with negative exponent', () => {
    const t = new Template('{{ a ** b }}');
    expect(t.render({ a: 2, b: -2 })).toBe('0.25');
  });

  test('exponentiation with fractional exponent', () => {
    const t = new Template('{{ a ** b }}');
    expect(t.render({ a: 4, b: 0.5 })).toBe('2');
  });

  test('chained exponentiation (right-associative)', () => {
    const t = new Template('{{ a ** b ** c }}');
    // Should evaluate as a ** (b ** c) = 2 ** (3 ** 2) = 2 ** 9 = 512
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('512');
  });
});

describe('Bitwise AND Operator', () => {
  test('renders basic bitwise AND', () => {
    const t = new Template('{{ a & b }}');
    expect(t.render({ a: 5, b: 3 })).toBe('1'); // 101 & 011 = 001
  });

  test('bitwise AND with all bits set', () => {
    const t = new Template('{{ a & b }}');
    expect(t.render({ a: 15, b: 15 })).toBe('15'); // 1111 & 1111 = 1111
  });

  test('bitwise AND with no common bits', () => {
    const t = new Template('{{ a & b }}');
    expect(t.render({ a: 12, b: 3 })).toBe('0'); // 1100 & 0011 = 0000
  });

  test('bitwise AND in conditional', () => {
    const t = new Template('{% if (flags & mask) != 0 %}has bit{% else %}no bit{% endif %}');
    expect(t.render({ flags: 5, mask: 1 })).toBe('has bit');
    expect(t.render({ flags: 4, mask: 1 })).toBe('no bit');
  });
});

describe('Bitwise OR Operator', () => {
  test('renders basic bitwise OR', () => {
    const t = new Template('{{ a | b }}');
    expect(t.render({ a: 5, b: 3 })).toBe('7'); // 101 | 011 = 111
  });

  test('bitwise OR with zero', () => {
    const t = new Template('{{ a | b }}');
    expect(t.render({ a: 5, b: 0 })).toBe('5');
  });

  test('bitwise OR with same value', () => {
    const t = new Template('{{ a | b }}');
    expect(t.render({ a: 7, b: 7 })).toBe('7');
  });
});

describe('Bitwise XOR Operator', () => {
  test('renders basic bitwise XOR', () => {
    const t = new Template('{{ a ^ b }}');
    expect(t.render({ a: 5, b: 3 })).toBe('6'); // 101 ^ 011 = 110
  });

  test('bitwise XOR with same value gives zero', () => {
    const t = new Template('{{ a ^ b }}');
    expect(t.render({ a: 7, b: 7 })).toBe('0');
  });

  test('bitwise XOR with zero', () => {
    const t = new Template('{{ a ^ b }}');
    expect(t.render({ a: 5, b: 0 })).toBe('5');
  });

  test('bitwise XOR for toggling bits', () => {
    const t = new Template('{{ a ^ b }}');
    expect(t.render({ a: 12, b: 7 })).toBe('11'); // 1100 ^ 0111 = 1011
  });
});

describe('Bitwise NOT Operator', () => {
  test('renders basic bitwise NOT', () => {
    const t = new Template('{{ ~a }}');
    expect(t.render({ a: 5 })).toBe('-6'); // ~5 = -6 (two's complement)
  });

  test('bitwise NOT of zero', () => {
    const t = new Template('{{ ~a }}');
    expect(t.render({ a: 0 })).toBe('-1');
  });

  test('bitwise NOT of -1', () => {
    const t = new Template('{{ ~a }}');
    expect(t.render({ a: -1 })).toBe('0');
  });

  test('double bitwise NOT', () => {
    const t = new Template('{{ ~~a }}');
    expect(t.render({ a: 5 })).toBe('5');
  });
});

describe('Left Shift Operator', () => {
  test('renders basic left shift', () => {
    const t = new Template('{{ a << b }}');
    expect(t.render({ a: 5, b: 2 })).toBe('20'); // 101 << 2 = 10100
  });

  test('left shift by zero', () => {
    const t = new Template('{{ a << b }}');
    expect(t.render({ a: 5, b: 0 })).toBe('5');
  });

  test('left shift by one (doubling)', () => {
    const t = new Template('{{ a << b }}');
    expect(t.render({ a: 7, b: 1 })).toBe('14');
  });

  test('left shift with large shift amount', () => {
    const t = new Template('{{ a << b }}');
    expect(t.render({ a: 1, b: 10 })).toBe('1024');
  });
});

describe('Right Shift Operator', () => {
  test('renders basic right shift', () => {
    const t = new Template('{{ a >> b }}');
    expect(t.render({ a: 20, b: 2 })).toBe('5'); // 10100 >> 2 = 101
  });

  test('right shift by zero', () => {
    const t = new Template('{{ a >> b }}');
    expect(t.render({ a: 5, b: 0 })).toBe('5');
  });

  test('right shift by one (halving)', () => {
    const t = new Template('{{ a >> b }}');
    expect(t.render({ a: 14, b: 1 })).toBe('7');
  });

  test('right shift with negative number (sign-extending)', () => {
    const t = new Template('{{ a >> b }}');
    expect(t.render({ a: -8, b: 2 })).toBe('-2');
  });
});

describe('Unsigned Right Shift Operator', () => {
  test('renders basic unsigned right shift', () => {
    const t = new Template('{{ a >>> b }}');
    expect(t.render({ a: 20, b: 2 })).toBe('5');
  });

  test('unsigned right shift with negative number (zero-fill)', () => {
    const t = new Template('{{ a >>> b }}');
    const result = t.render({ a: -8, b: 2 });
    // -8 >>> 2 should give a large positive number (zero-filled)
    expect(parseInt(result)).toBe(1073741822);
  });

  test('unsigned right shift by zero', () => {
    const t = new Template('{{ a >>> b }}');
    expect(t.render({ a: 5, b: 0 })).toBe('5');
  });
});

describe('Operator Precedence with New Operators', () => {
  test('exponentiation has higher precedence than multiplication', () => {
    const t = new Template('{{ a * b ** c }}');
    // Should evaluate as a * (b ** c) = 2 * (3 ** 2) = 2 * 9 = 18
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('18');
  });

  test('multiplication has higher precedence than addition', () => {
    const t = new Template('{{ a + b * c }}');
    // Should evaluate as a + (b * c) = 2 + (3 * 4) = 2 + 12 = 14
    expect(t.render({ a: 2, b: 3, c: 4 })).toBe('14');
  });

  test('modulo has same precedence as multiplication', () => {
    const t = new Template('{{ a * b % c }}');
    // Should evaluate left-to-right: (a * b) % c = (3 * 4) % 5 = 12 % 5 = 2
    expect(t.render({ a: 3, b: 4, c: 5 })).toBe('2');
  });

  test('shift operators have lower precedence than addition', () => {
    const t = new Template('{{ a + b << c }}');
    // Should evaluate as (a + b) << c = (2 + 3) << 2 = 5 << 2 = 20
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('20');
  });

  test('bitwise AND has lower precedence than shift', () => {
    const t = new Template('{{ a << b & c }}');
    // Should evaluate as (a << b) & c = (2 << 2) & 7 = 8 & 7 = 0
    expect(t.render({ a: 2, b: 2, c: 7 })).toBe('0');
  });

  test('bitwise XOR has lower precedence than AND', () => {
    const t = new Template('{{ a & b ^ c }}');
    // Should evaluate as (a & b) ^ c = (5 & 3) ^ 2 = 1 ^ 2 = 3
    expect(t.render({ a: 5, b: 3, c: 2 })).toBe('3');
  });

  test('bitwise OR has lower precedence than XOR', () => {
    const t = new Template('{{ a ^ b | c }}');
    // Should evaluate as (a ^ b) | c = (5 ^ 3) | 2 = 6 | 2 = 6
    expect(t.render({ a: 5, b: 3, c: 2 })).toBe('6');
  });

  test('comparison has lower precedence than bitwise OR', () => {
    const t = new Template('{% if a | b == c %}yes{% else %}no{% endif %}');
    // Should evaluate as (a | b) == c = (5 | 2) == 7
    expect(t.render({ a: 5, b: 2, c: 7 })).toBe('yes');
  });

  test('logical AND has lower precedence than comparison', () => {
    const t = new Template('{% if a > b && c < d %}yes{% else %}no{% endif %}');
    // Should evaluate as (a > b) && (c < d)
    expect(t.render({ a: 5, b: 3, c: 2, d: 4 })).toBe('yes');
  });

  test('logical OR has lowest precedence', () => {
    const t = new Template('{% if a && b || c %}yes{% else %}no{% endif %}');
    // Should evaluate as (a && b) || c
    expect(t.render({ a: false, b: true, c: true })).toBe('yes');
  });
});

describe('Complex Expressions with New Operators', () => {
  test('mixing arithmetic and bitwise operators', () => {
    const t = new Template('{{ (a + b) & (c * d) }}');
    // (2 + 3) & (4 * 2) = 5 & 8 = 0
    expect(t.render({ a: 2, b: 3, c: 4, d: 2 })).toBe('0');
  });

  test('using modulo with exponentiation', () => {
    const t = new Template('{{ a ** b % c }}');
    // Should evaluate as (a ** b) % c = (2 ** 10) % 100 = 1024 % 100 = 24
    expect(t.render({ a: 2, b: 10, c: 100 })).toBe('24');
  });

  test('bitwise NOT with other operators', () => {
    const t = new Template('{{ ~a & b }}');
    // Should evaluate as (~a) & b = (~5) & 3 = -6 & 3 = 2
    expect(t.render({ a: 5, b: 3 })).toBe('2');
  });

  test('shift operators in calculations', () => {
    const t = new Template('{{ (a << b) + (c >> d) }}');
    // (2 << 3) + (16 >> 2) = 16 + 4 = 20
    expect(t.render({ a: 2, b: 3, c: 16, d: 2 })).toBe('20');
  });

  test('complex bitwise expression', () => {
    const t = new Template('{{ (a | b) & (c ^ d) }}');
    // (5 | 3) & (6 ^ 2) = 7 & 4 = 4
    expect(t.render({ a: 5, b: 3, c: 6, d: 2 })).toBe('4');
  });
});

describe('Parentheses Override Precedence', () => {
  test('parentheses with exponentiation', () => {
    const t = new Template('{{ (a * b) ** c }}');
    // (2 * 3) ** 2 = 6 ** 2 = 36
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('36');
  });

  test('parentheses with modulo', () => {
    const t = new Template('{{ a % (b + c) }}');
    // 10 % (3 + 2) = 10 % 5 = 0
    expect(t.render({ a: 10, b: 3, c: 2 })).toBe('0');
  });

  test('parentheses with bitwise operators', () => {
    const t = new Template('{{ a & (b | c) }}');
    // 5 & (3 | 2) = 5 & 3 = 1
    expect(t.render({ a: 5, b: 3, c: 2 })).toBe('1');
  });

  test('nested parentheses with shifts', () => {
    const t = new Template('{{ ((a + b) << c) >> d }}');
    // ((2 + 3) << 2) >> 1 = (5 << 2) >> 1 = 20 >> 1 = 10
    expect(t.render({ a: 2, b: 3, c: 2, d: 1 })).toBe('10');
  });
});
