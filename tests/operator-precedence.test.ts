//
//  operator-precedence.test.ts
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

/**
 * Comprehensive operator precedence test suite
 * 
 * Precedence levels (highest to lowest):
 * 11. ** (right-associative)
 * 10. * / %
 * 9.  + -
 * 8.  << >> >>>
 * 7.  < > <= >=
 * 6.  == !=
 * 5.  &
 * 4.  ^
 * 3.  |
 * 2.  &&
 * 1.  ||
 * 
 * Unary operators: ! ~ (high precedence, applied before binary ops)
 */

describe('Operator Precedence - Level 11 vs 10 (** vs * / %)', () => {
  test('exponentiation before multiplication', () => {
    const t = new Template('{{ a * b ** c }}');
    // a * (b ** c) = 2 * (3 ** 2) = 2 * 9 = 18
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('18');
  });

  test('exponentiation before division', () => {
    const t = new Template('{{ a / b ** c }}');
    // a / (b ** c) = 100 / (2 ** 3) = 100 / 8 = 12.5
    expect(t.render({ a: 100, b: 2, c: 3 })).toBe('12.5');
  });

  test('exponentiation before modulo', () => {
    const t = new Template('{{ a ** b % c }}');
    // (a ** b) % c = (2 ** 10) % 100 = 1024 % 100 = 24
    expect(t.render({ a: 2, b: 10, c: 100 })).toBe('24');
  });

  test('multiplication before exponentiation with parentheses', () => {
    const t = new Template('{{ (a * b) ** c }}');
    // (2 * 3) ** 2 = 6 ** 2 = 36
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('36');
  });
});

describe('Operator Precedence - Level 10 (*, /, % associativity)', () => {
  test('multiplication and division left-to-right', () => {
    const t = new Template('{{ a * b / c }}');
    // (a * b) / c = (6 * 4) / 2 = 24 / 2 = 12
    expect(t.render({ a: 6, b: 4, c: 2 })).toBe('12');
  });

  test('division and multiplication left-to-right', () => {
    const t = new Template('{{ a / b * c }}');
    // (a / b) * c = (20 / 4) * 3 = 5 * 3 = 15
    expect(t.render({ a: 20, b: 4, c: 3 })).toBe('15');
  });

  test('modulo and multiplication left-to-right', () => {
    const t = new Template('{{ a * b % c }}');
    // (a * b) % c = (3 * 4) % 5 = 12 % 5 = 2
    expect(t.render({ a: 3, b: 4, c: 5 })).toBe('2');
  });

  test('division and modulo left-to-right', () => {
    const t = new Template('{{ a / b % c }}');
    // (a / b) % c = (20 / 4) % 3 = 5 % 3 = 2
    expect(t.render({ a: 20, b: 4, c: 3 })).toBe('2');
  });

  test('modulo and division left-to-right', () => {
    const t = new Template('{{ a % b / c }}');
    // (a % b) / c = (17 % 5) / 2 = 2 / 2 = 1
    expect(t.render({ a: 17, b: 5, c: 2 })).toBe('1');
  });
});

describe('Operator Precedence - Level 10 vs 9 (* / % vs + -)', () => {
  test('multiplication before addition', () => {
    const t = new Template('{{ a + b * c }}');
    // a + (b * c) = 2 + (3 * 4) = 2 + 12 = 14
    expect(t.render({ a: 2, b: 3, c: 4 })).toBe('14');
  });

  test('division before subtraction', () => {
    const t = new Template('{{ a - b / c }}');
    // a - (b / c) = 10 - (20 / 4) = 10 - 5 = 5
    expect(t.render({ a: 10, b: 20, c: 4 })).toBe('5');
  });

  test('modulo before addition', () => {
    const t = new Template('{{ a + b % c }}');
    // a + (b % c) = 10 + (17 % 5) = 10 + 2 = 12
    expect(t.render({ a: 10, b: 17, c: 5 })).toBe('12');
  });

  test('addition before multiplication with parentheses', () => {
    const t = new Template('{{ (a + b) * c }}');
    // (2 + 3) * 4 = 5 * 4 = 20
    expect(t.render({ a: 2, b: 3, c: 4 })).toBe('20');
  });
});

describe('Operator Precedence - Level 9 (+ - associativity)', () => {
  test('addition and subtraction left-to-right', () => {
    const t = new Template('{{ a + b - c }}');
    // (a + b) - c = (10 + 5) - 3 = 15 - 3 = 12
    expect(t.render({ a: 10, b: 5, c: 3 })).toBe('12');
  });

  test('subtraction and addition left-to-right', () => {
    const t = new Template('{{ a - b + c }}');
    // (a - b) + c = (10 - 7) + 5 = 3 + 5 = 8
    expect(t.render({ a: 10, b: 7, c: 5 })).toBe('8');
  });

  test('multiple additions and subtractions', () => {
    const t = new Template('{{ a + b - c + d }}');
    // ((a + b) - c) + d = ((5 + 3) - 2) + 4 = (8 - 2) + 4 = 6 + 4 = 10
    expect(t.render({ a: 5, b: 3, c: 2, d: 4 })).toBe('10');
  });
});

describe('Operator Precedence - Level 9 vs 8 (+ - vs << >> >>>)', () => {
  test('addition before left shift', () => {
    const t = new Template('{{ a + b << c }}');
    // (a + b) << c = (2 + 3) << 2 = 5 << 2 = 20
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('20');
  });

  test('subtraction before right shift', () => {
    const t = new Template('{{ a - b >> c }}');
    // (a - b) >> c = (20 - 4) >> 2 = 16 >> 2 = 4
    expect(t.render({ a: 20, b: 4, c: 2 })).toBe('4');
  });

  test('addition before unsigned right shift', () => {
    const t = new Template('{{ a + b >>> c }}');
    // (a + b) >>> c = (16 + 8) >>> 2 = 24 >>> 2 = 6
    expect(t.render({ a: 16, b: 8, c: 2 })).toBe('6');
  });

  test('left shift before addition with parentheses', () => {
    const t = new Template('{{ a << (b + c) }}');
    // a << (b + c) = 2 << (1 + 2) = 2 << 3 = 16
    expect(t.render({ a: 2, b: 1, c: 2 })).toBe('16');
  });
});

describe('Operator Precedence - Level 8 (<< >> >>> associativity)', () => {
  test('left shift and right shift left-to-right', () => {
    const t = new Template('{{ a << b >> c }}');
    // (a << b) >> c = (4 << 3) >> 2 = 32 >> 2 = 8
    expect(t.render({ a: 4, b: 3, c: 2 })).toBe('8');
  });

  test('right shift and left shift left-to-right', () => {
    const t = new Template('{{ a >> b << c }}');
    // (a >> b) << c = (32 >> 2) << 1 = 8 << 1 = 16
    expect(t.render({ a: 32, b: 2, c: 1 })).toBe('16');
  });

  test('unsigned right shift and left shift', () => {
    const t = new Template('{{ a >>> b << c }}');
    // (a >>> b) << c = (16 >>> 2) << 1 = 4 << 1 = 8
    expect(t.render({ a: 16, b: 2, c: 1 })).toBe('8');
  });
});

describe('Operator Precedence - Level 8 vs 7 (<< >> >>> vs < > <= >=)', () => {
  test('left shift before comparison', () => {
    const t = new Template('{% if a << b < c %}yes{% else %}no{% endif %}');
    // (a << b) < c = (2 << 3) < 20 = 16 < 20 = true
    expect(t.render({ a: 2, b: 3, c: 20 })).toBe('yes');
  });

  test('right shift before comparison', () => {
    const t = new Template('{% if a >> b > c %}yes{% else %}no{% endif %}');
    // (a >> b) > c = (16 >> 2) > 3 = 4 > 3 = true
    expect(t.render({ a: 16, b: 2, c: 3 })).toBe('yes');
  });

  test('unsigned right shift before less-than-or-equal', () => {
    const t = new Template('{% if a >>> b <= c %}yes{% else %}no{% endif %}');
    // (a >>> b) <= c = (32 >>> 2) <= 8 = 8 <= 8 = true
    expect(t.render({ a: 32, b: 2, c: 8 })).toBe('yes');
  });

  test('comparison before shift with parentheses', () => {
    const t = new Template('{{ a << (b > c) }}');
    // a << (b > c) = 4 << (5 > 3) = 4 << 1 = 8
    expect(t.render({ a: 4, b: 5, c: 3 })).toBe('8');
  });
});

describe('Operator Precedence - Level 7 (< > <= >= associativity)', () => {
  test('multiple comparisons evaluate left-to-right', () => {
    const t = new Template('{% if a < b < c %}yes{% else %}no{% endif %}');
    // (a < b) < c = (2 < 5) < 10 = true < 10 = 1 < 10 = true
    expect(t.render({ a: 2, b: 5, c: 10 })).toBe('yes');
  });

  test('mixed comparison operators', () => {
    const t = new Template('{% if a <= b > c %}yes{% else %}no{% endif %}');
    // (a <= b) > c = (3 <= 5) > 0 = true > 0 = 1 > 0 = true
    expect(t.render({ a: 3, b: 5, c: 0 })).toBe('yes');
  });
});

describe('Operator Precedence - Level 7 vs 6 (< > <= >= vs == !=)', () => {
  test('comparison before equality', () => {
    const t = new Template('{% if a < b == c %}yes{% else %}no{% endif %}');
    // (a < b) == c = (2 < 5) == true = true == true = true
    expect(t.render({ a: 2, b: 5, c: true })).toBe('yes');
  });

  test('less-than-or-equal before inequality', () => {
    const t = new Template('{% if a <= b != c %}yes{% else %}no{% endif %}');
    // (a <= b) != c = (5 <= 5) != false = true != false = true
    expect(t.render({ a: 5, b: 5, c: false })).toBe('yes');
  });

  test('greater-than before equality', () => {
    const t = new Template('{% if a > b == c > d %}yes{% else %}no{% endif %}');
    // (a > b) == (c > d) = (5 > 3) == (7 > 4) = true == true = true
    expect(t.render({ a: 5, b: 3, c: 7, d: 4 })).toBe('yes');
  });
});

describe('Operator Precedence - Level 6 (== != associativity)', () => {
  test('equality and inequality left-to-right', () => {
    const t = new Template('{% if a == b != c %}yes{% else %}no{% endif %}');
    // (a == b) != c = (5 == 5) != false = true != false = true
    expect(t.render({ a: 5, b: 5, c: false })).toBe('yes');
  });

  test('multiple equality checks', () => {
    const t = new Template('{% if a == b == c %}yes{% else %}no{% endif %}');
    // (a == b) == c = (true == true) == true = true == true = true
    expect(t.render({ a: true, b: true, c: true })).toBe('yes');
  });
});

describe('Operator Precedence - Level 6 vs 5 (== != vs &)', () => {
  test('bitwise AND before equality', () => {
    const t = new Template('{% if a & b == c %}yes{% else %}no{% endif %}');
    // a & (b == c) = 7 & (3 == 3) = 7 & true = 7 & 1 = 1
    expect(t.render({ a: 7, b: 3, c: 3 })).toBe('yes');
  });

  test('equality before bitwise AND with parentheses', () => {
    const t = new Template('{% if (a == b) & c %}yes{% else %}no{% endif %}');
    // (a == b) & c = (5 == 5) & 3 = true & 3 = 1 & 3 = 1
    expect(t.render({ a: 5, b: 5, c: 3 })).toBe('yes');
  });

  test('bitwise AND before inequality', () => {
    const t = new Template('{{ a & b != c }}');
    // a & (b != c) = 5 & (3 != 1) = 5 & true = 5 & 1 = 1
    expect(t.render({ a: 5, b: 3, c: 1 })).toBe('1');
  });
});

describe('Operator Precedence - Level 5 vs 4 (& vs ^)', () => {
  test('bitwise AND before XOR', () => {
    const t = new Template('{{ a & b ^ c }}');
    // (a & b) ^ c = (5 & 3) ^ 2 = 1 ^ 2 = 3
    expect(t.render({ a: 5, b: 3, c: 2 })).toBe('3');
  });

  test('XOR before AND with parentheses', () => {
    const t = new Template('{{ a & (b ^ c) }}');
    // a & (b ^ c) = 7 & (3 ^ 5) = 7 & 6 = 6
    expect(t.render({ a: 7, b: 3, c: 5 })).toBe('6');
  });

  test('multiple AND and XOR operations', () => {
    const t = new Template('{{ a & b ^ c & d }}');
    // (a & b) ^ (c & d) = (12 & 10) ^ (6 & 7) = 8 ^ 6 = 14
    expect(t.render({ a: 12, b: 10, c: 6, d: 7 })).toBe('14');
  });
});

describe('Operator Precedence - Level 4 vs 3 (^ vs |)', () => {
  test('bitwise XOR before OR', () => {
    const t = new Template('{{ a ^ b | c }}');
    // (a ^ b) | c = (5 ^ 3) | 2 = 6 | 2 = 6
    expect(t.render({ a: 5, b: 3, c: 2 })).toBe('6');
  });

  test('bitwise OR before XOR with parentheses', () => {
    const t = new Template('{{ a ^ (b | c) }}');
    // a ^ (b | c) = 5 ^ (3 | 1) = 5 ^ 3 = 6
    expect(t.render({ a: 5, b: 3, c: 1 })).toBe('6');
  });

  test('multiple XOR and OR operations', () => {
    const t = new Template('{{ a ^ b | c ^ d }}');
    // ((a ^ b) | c) ^ d = ((6 ^ 4) | 3) ^ 1 = (2 | 3) ^ 1 = 3 ^ 1 = 2
    expect(t.render({ a: 6, b: 4, c: 3, d: 1 })).toBe('2');
  });
});

describe('Operator Precedence - Level 3 vs 2 (| vs &&)', () => {
  test('bitwise OR before logical AND', () => {
    const t = new Template('{% if a | b && c %}yes{% else %}no{% endif %}');
    // (a | b) && c = (4 | 2) && true = 6 && true = true
    expect(t.render({ a: 4, b: 2, c: true })).toBe('yes');
  });

  test('logical AND before bitwise OR with parentheses', () => {
    const t = new Template('{{ a | (b && c) }}');
    // a | (b && c) = 4 | (true && true) = 4 | 1 = 5
    expect(t.render({ a: 4, b: true, c: true })).toBe('5');
  });

  test('bitwise OR result used in logical AND', () => {
    const t = new Template('{% if a | b && c | d %}yes{% else %}no{% endif %}');
    // (a | b) && (c | d) = (0 | 0) && (4 | 2) = 0 && 6 = false
    expect(t.render({ a: 0, b: 0, c: 4, d: 2 })).toBe('no');
  });
});

describe('Operator Precedence - Level 2 vs 1 (&& vs ||)', () => {
  test('logical AND before OR', () => {
    const t = new Template('{% if a || b && c %}yes{% else %}no{% endif %}');
    // a || (b && c) = false || (true && true) = false || true = true
    expect(t.render({ a: false, b: true, c: true })).toBe('yes');
  });

  test('logical OR before AND with parentheses', () => {
    const t = new Template('{% if (a || b) && c %}yes{% else %}no{% endif %}');
    // (a || b) && c = (false || true) && true = true && true = true
    expect(t.render({ a: false, b: true, c: true })).toBe('yes');
  });

  test('multiple AND and OR operations', () => {
    const t = new Template('{% if a && b || c && d %}yes{% else %}no{% endif %}');
    // (a && b) || (c && d) = (false && true) || (true && true) = false || true = true
    expect(t.render({ a: false, b: true, c: true, d: true })).toBe('yes');
  });

  test('complex logical expression', () => {
    const t = new Template('{% if a || b && c || d %}yes{% else %}no{% endif %}');
    // a || (b && c) || d = false || (false && true) || true = false || false || true = true
    expect(t.render({ a: false, b: false, c: true, d: true })).toBe('yes');
  });
});

describe('Unary Operators with Binary Operators', () => {
  test('logical NOT with AND', () => {
    const t = new Template('{% if !a && b %}yes{% else %}no{% endif %}');
    // (!a) && b = (!false) && true = true && true = true
    expect(t.render({ a: false, b: true })).toBe('yes');
  });

  test('logical NOT with OR', () => {
    const t = new Template('{% if !a || b %}yes{% else %}no{% endif %}');
    // (!a) || b = (!true) || false = false || false = false
    expect(t.render({ a: true, b: false })).toBe('no');
  });

  test('bitwise NOT with AND', () => {
    const t = new Template('{{ ~a & b }}');
    // (~a) & b = (~5) & 3 = -6 & 3 = 2
    expect(t.render({ a: 5, b: 3 })).toBe('2');
  });

  test('bitwise NOT with OR', () => {
    const t = new Template('{{ ~a | b }}');
    // (~a) | b = (~0) | 5 = -1 | 5 = -1
    expect(t.render({ a: 0, b: 5 })).toBe('-1');
  });

  test('bitwise NOT with XOR', () => {
    const t = new Template('{{ ~a ^ b }}');
    // (~a) ^ b = (~5) ^ 3 = -6 ^ 3 = -7
    expect(t.render({ a: 5, b: 3 })).toBe('-7');
  });

  test('logical NOT with comparison', () => {
    const t = new Template('{% if !(a > b) %}yes{% else %}no{% endif %}');
    // !(a > b) = !(5 > 3) = !true = false
    expect(t.render({ a: 5, b: 3 })).toBe('no');
  });

  test('bitwise NOT with shift', () => {
    const t = new Template('{{ ~a << b }}');
    // (~a) << b = (~2) << 2 = -3 << 2 = -12
    expect(t.render({ a: 2, b: 2 })).toBe('-12');
  });

  test('bitwise NOT with arithmetic', () => {
    const t = new Template('{{ ~a + b }}');
    // (~a) + b = (~5) + 10 = -6 + 10 = 4
    expect(t.render({ a: 5, b: 10 })).toBe('4');
  });

  test('multiple unary operators', () => {
    const t = new Template('{{ ~~a }}');
    // ~~a = ~~5 = 5
    expect(t.render({ a: 5 })).toBe('5');
  });

  test('logical NOT with bitwise NOT', () => {
    const t = new Template('{% if !~a %}yes{% else %}no{% endif %}');
    // !~a = !~(-1) = !0 = true
    expect(t.render({ a: -1 })).toBe('yes');
  });
});

describe('Complex Multi-Level Precedence', () => {
  test('spanning 5 precedence levels', () => {
    const t = new Template('{{ a + b * c << d | e }}');
    // (((a + (b * c)) << d) | e) = (((2 + (3 * 4)) << 1) | 1) = (((2 + 12) << 1) | 1) = ((14 << 1) | 1) = (28 | 1) = 29
    expect(t.render({ a: 2, b: 3, c: 4, d: 1, e: 1 })).toBe('29');
  });

  test('all arithmetic operators together', () => {
    const t = new Template('{{ a + b - c * d / e % f }}');
    // a + b - (((c * d) / e) % f) = 10 + 5 - (((4 * 6) / 2) % 7) = 15 - ((24 / 2) % 7) = 15 - (12 % 7) = 15 - 5 = 10
    expect(t.render({ a: 10, b: 5, c: 4, d: 6, e: 2, f: 7 })).toBe('10');
  });

  test('all shift operators together', () => {
    const t = new Template('{{ a << b >> c >>> d }}');
    // (((a << b) >> c) >>> d) = (((2 << 4) >> 2) >>> 1) = ((32 >> 2) >>> 1) = (8 >>> 1) = 4
    expect(t.render({ a: 2, b: 4, c: 2, d: 1 })).toBe('4');
  });

  test('all bitwise operators together', () => {
    const t = new Template('{{ a & b ^ c | d }}');
    // ((a & b) ^ c) | d = ((12 & 10) ^ 6) | 1 = (8 ^ 6) | 1 = 14 | 1 = 15
    expect(t.render({ a: 12, b: 10, c: 6, d: 1 })).toBe('15');
  });

  test('all comparison operators together', () => {
    const t = new Template('{% if a < b == c > d != e >= f %}yes{% else %}no{% endif %}');
    // ((((a < b) == (c > d)) != e) >= f)
    // = ((((2 < 5) == (7 > 3)) != false) >= true)
    // = (((true == true) != false) >= true)
    // = ((true != false) >= true)
    // = (true >= true)
    // = true
    expect(t.render({ a: 2, b: 5, c: 7, d: 3, e: false, f: true })).toBe('yes');
  });

  test('mixing arithmetic, bitwise, and logical', () => {
    const t = new Template('{% if a + b & c ^ d | e && f || g %}yes{% else %}no{% endif %}');
    // (((((a + b) & c) ^ d) | e) && f) || g
    // = (((((2 + 3) & 7) ^ 2) | 1) && true) || false
    // = ((((5 & 7) ^ 2) | 1) && true) || false
    // = (((5 ^ 2) | 1) && true) || false
    // = ((7 | 1) && true) || false
    // = (7 && true) || false
    // = true || false
    // = true
    expect(t.render({ a: 2, b: 3, c: 7, d: 2, e: 1, f: true, g: false })).toBe('yes');
  });

  test('exponentiation in complex expression', () => {
    const t = new Template('{{ a ** b + c * d - e / f }}');
    // (a ** b) + (c * d) - (e / f) = (2 ** 3) + (4 * 5) - (20 / 4) = 8 + 20 - 5 = 23
    expect(t.render({ a: 2, b: 3, c: 4, d: 5, e: 20, f: 4 })).toBe('23');
  });

  test('parentheses overriding 4 precedence levels', () => {
    const t = new Template('{{ (a + b) ** (c * d) }}');
    // (a + b) ** (c * d) = (1 + 1) ** (2 * 2) = 2 ** 4 = 16
    expect(t.render({ a: 1, b: 1, c: 2, d: 2 })).toBe('16');
  });

  test('nested parentheses with mixed operators', () => {
    const t = new Template('{{ ((a + b) * (c - d)) / ((e | f) & g) }}');
    // ((a + b) * (c - d)) / ((e | f) & g)
    // = ((2 + 3) * (10 - 4)) / ((1 | 2) & 7)
    // = (5 * 6) / (3 & 7)
    // = 30 / 3
    // = 10
    expect(t.render({ a: 2, b: 3, c: 10, d: 4, e: 1, f: 2, g: 7 })).toBe('10');
  });

  test('unary operators in complex expression', () => {
    const t = new Template('{% if !a && ~b < c || d > e %}yes{% else %}no{% endif %}');
    // (!a && (~b < c)) || (d > e)
    // = ((!false) && (~2 < 0)) || (10 > 5)
    // = ((true) && (-3 < 0)) || true
    // = (true && true) || true
    // = true || true
    // = true
    expect(t.render({ a: false, b: 2, c: 0, d: 10, e: 5 })).toBe('yes');
  });
});

describe('Exponentiation Right-Associativity', () => {
  test('chained exponentiation evaluates right-to-left', () => {
    const t = new Template('{{ a ** b ** c }}');
    // a ** (b ** c) = 2 ** (3 ** 2) = 2 ** 9 = 512
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('512');
  });

  test('triple exponentiation', () => {
    const t = new Template('{{ a ** b ** c ** d }}');
    // a ** (b ** (c ** d)) = 2 ** (2 ** (2 ** 1)) = 2 ** (2 ** 2) = 2 ** 4 = 16
    expect(t.render({ a: 2, b: 2, c: 2, d: 1 })).toBe('16');
  });

  test('left-associativity with parentheses', () => {
    const t = new Template('{{ (a ** b) ** c }}');
    // (a ** b) ** c = (2 ** 3) ** 2 = 8 ** 2 = 64
    expect(t.render({ a: 2, b: 3, c: 2 })).toBe('64');
  });
});

describe('Edge Cases and Boundary Conditions', () => {
  test('precedence with zero values', () => {
    const t = new Template('{{ a + b * c }}');
    // a + (b * c) = 5 + (0 * 10) = 5 + 0 = 5
    expect(t.render({ a: 5, b: 0, c: 10 })).toBe('5');
  });

  test('precedence with negative numbers', () => {
    const t = new Template('{{ a * b + c }}');
    // (a * b) + c = (-2 * 3) + 10 = -6 + 10 = 4
    expect(t.render({ a: -2, b: 3, c: 10 })).toBe('4');
  });

  test('precedence with fractional numbers', () => {
    const t = new Template('{{ a / b * c }}');
    // (a / b) * c = (10 / 4) * 2 = 2.5 * 2 = 5
    expect(t.render({ a: 10, b: 4, c: 2 })).toBe('5');
  });

  test('logical operators with falsy values', () => {
    const t = new Template('{% if a || b && c %}yes{% else %}no{% endif %}');
    // a || (b && c) = 0 || (false && true) = 0 || false = false
    expect(t.render({ a: 0, b: false, c: true })).toBe('no');
  });

  test('bitwise operators with negative numbers', () => {
    const t = new Template('{{ a & b }}');
    // -1 & 5 = 5 (in two's complement)
    expect(t.render({ a: -1, b: 5 })).toBe('5');
  });

  test('deeply nested parentheses', () => {
    const t = new Template('{{ ((((a + b) * c) - d) / e) % f }}');
    // ((((2 + 3) * 4) - 5) / 3) % 7 = (((5 * 4) - 5) / 3) % 7 = ((20 - 5) / 3) % 7 = (15 / 3) % 7 = 5 % 7 = 5
    expect(t.render({ a: 2, b: 3, c: 4, d: 5, e: 3, f: 7 })).toBe('5');
  });

  test('operators at same precedence level', () => {
    const t = new Template('{{ a * b / c * d }}');
    // (((a * b) / c) * d) = (((8 * 6) / 4) * 2) = ((48 / 4) * 2) = (12 * 2) = 24
    expect(t.render({ a: 8, b: 6, c: 4, d: 2 })).toBe('24');
  });

  test('empty subexpressions with parentheses', () => {
    const t = new Template('{{ (a) + (b) * (c) }}');
    // a + (b * c) = 2 + (3 * 4) = 2 + 12 = 14
    expect(t.render({ a: 2, b: 3, c: 4 })).toBe('14');
  });
});
