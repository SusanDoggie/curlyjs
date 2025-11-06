//
//  utils.ts
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

import Decimal from 'decimal.js';

/**
 * NumericValue is a helper class for storing and manipulating numeric values
 * with high precision. It splits numbers into integer and decimal parts to
 * maintain precision during calculations.
 */
export class NumericValue {
  private intPart: bigint = BigInt(0);
  private decimalPart: string = '0'; // Store as string to maintain precision
  private isNegative: boolean = false;
  private wasDecimal: boolean = false; // Track if the original value was a Decimal

  constructor(value: number | bigint | Decimal | string) {
    if (value instanceof Decimal) {
      // Convert Decimal to string and parse
      const str = value.toString();
      this.parseFromString(str);
      this.wasDecimal = true; // Mark that this was originally a Decimal
    } else if (typeof value === 'bigint') {
      this.intPart = value < 0 ? -value : value;
      this.decimalPart = '0';
      this.isNegative = value < 0;
    } else if (typeof value === 'number') {
      this.parseFromString(value.toString());
    } else {
      this.parseFromString(value);
    }
  }

  private parseFromString(str: string) {
    this.isNegative = str.startsWith('-');
    const absStr = this.isNegative ? str.slice(1) : str;

    const parts = absStr.split('.');
    this.intPart = parts[0] ? BigInt(parts[0]) : BigInt(0);
    this.decimalPart = parts[1] || '0';
  }

  /**
   * Get the integer part as BigInt
   */
  getIntPart(): bigint {
    return this.isNegative ? -this.intPart : this.intPart;
  }

  /**
   * Get the decimal part as string (without leading '0.')
   */
  getDecimalPart(): string {
    return this.decimalPart;
  }

  /**
   * Check if the value has a decimal part
   */
  hasDecimalPart(): boolean {
    return this.decimalPart !== '0' && this.decimalPart !== '';
  }

  /**
   * Convert to Decimal for precise calculations
   */
  toDecimal(): Decimal {
    const sign = this.isNegative ? '-' : '';
    const dec = this.decimalPart !== '0' && this.decimalPart !== ''
      ? `.${this.decimalPart}`
      : '';
    return new Decimal(`${sign}${this.intPart}${dec}`);
  }

  /**
   * Convert to number (may lose precision)
   */
  toNumber(): number {
    return Number(this.toString());
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    const sign = this.isNegative ? '-' : '';
    const dec = this.decimalPart !== '0' && this.decimalPart !== ''
      ? `.${this.decimalPart}`
      : '';
    return `${sign}${this.intPart}${dec}`;
  }

  /**
   * Check if this is an integer (no decimal part)
   */
  isInteger(): boolean {
    return !this.hasDecimalPart();
  }

  /**
   * Perform arithmetic operations with another NumericValue
   * Returns the appropriate type: BigInt for integer results, Decimal for non-integer results
   */
  add(other: NumericValue): bigint | Decimal {
    // If either was originally a Decimal, use Decimal arithmetic
    if (this.wasDecimal || other.wasDecimal || this.hasDecimalPart() || other.hasDecimalPart()) {
      return this.toDecimal().plus(other.toDecimal());
    }
    return this.getIntPart() + other.getIntPart();
  }

  subtract(other: NumericValue): bigint | Decimal {
    // If either was originally a Decimal, use Decimal arithmetic
    if (this.wasDecimal || other.wasDecimal || this.hasDecimalPart() || other.hasDecimalPart()) {
      return this.toDecimal().minus(other.toDecimal());
    }
    return this.getIntPart() - other.getIntPart();
  }

  multiply(other: NumericValue): bigint | Decimal {
    // If either was originally a Decimal, use Decimal arithmetic
    if (this.wasDecimal || other.wasDecimal || this.hasDecimalPart() || other.hasDecimalPart()) {
      return this.toDecimal().times(other.toDecimal());
    }
    return this.getIntPart() * other.getIntPart();
  }

  divide(other: NumericValue): bigint | Decimal {
    // If either was originally a Decimal, use Decimal arithmetic
    if (this.wasDecimal || other.wasDecimal || this.hasDecimalPart() || other.hasDecimalPart()) {
      return this.toDecimal().dividedBy(other.toDecimal());
    }

    // For BigInt integer division, use JavaScript's default integer division behavior
    return this.getIntPart() / other.getIntPart();
  }

  modulo(other: NumericValue): bigint | Decimal {
    // If either was originally a Decimal, use Decimal arithmetic
    if (this.wasDecimal || other.wasDecimal || this.hasDecimalPart() || other.hasDecimalPart()) {
      return this.toDecimal().modulo(other.toDecimal());
    }
    return this.getIntPart() % other.getIntPart();
  }

  power(other: NumericValue): bigint | Decimal {
    // If either was originally a Decimal, use Decimal arithmetic
    if (this.wasDecimal || other.wasDecimal || this.hasDecimalPart() || other.hasDecimalPart()) {
      return this.toDecimal().pow(other.toDecimal());
    }
    return this.getIntPart() ** other.getIntPart();
  }
}

/**
 * Parse a number string intelligently:
 * - Use BigInt for large integers outside safe integer range
 * - Use Decimal for numbers with decimal points (for precision)
 * - Use Number for safe integers
 * 
 * @param str - The string representation of the number
 * @returns A number, bigint, or Decimal depending on the value
 */
export function parseNumber(str: string): number | bigint | Decimal {
  // Check if it has a decimal point or scientific notation
  if (str.includes('.') || str.toLowerCase().includes('e')) {
    // Use Decimal for precision with decimal numbers
    return new Decimal(str);
  }

  // Integer: detect if it's a large integer
  const isNegative = str.startsWith('-');
  const absStr = isNegative ? str.slice(1) : str;

  // Numbers with more than 15 digits use BigInt to avoid precision loss
  if (absStr.length > 15) {
    try {
      return BigInt(str);
    } catch {
      // If BigInt parsing fails, fall back to Number
      return Number(str);
    }
  }

  // For numbers with 15 or fewer digits, use regular Number
  return Number(str);
}
