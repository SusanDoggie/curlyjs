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

/**
 * Parse a number string intelligently:
 * - Use BigInt for large integers outside safe integer range
 * - Use Number for regular numbers
 * 
 * @param str - The string representation of the number
 * @returns A number or bigint depending on the magnitude
 */
export function parseNumber(str: string): number | bigint {
  // Check if it looks like an integer (no decimal point, no scientific notation)
  if (!str.includes('.') && !str.toLowerCase().includes('e')) {
    // Try to detect if it's a large integer before converting to Number
    // If the string has more than 15 digits, it's likely beyond safe integer range
    const isNegative = str.startsWith('-');
    const absStr = isNegative ? str.slice(1) : str;
    
    // Numbers with more than 15 digits are definitely beyond MAX_SAFE_INTEGER
    // Use BigInt directly to avoid precision loss
    if (absStr.length > 15) {
      try {
        return BigInt(str);
      } catch {
        // If BigInt parsing fails, fall back to Number
        return Number(str);
      }
    }
    
    // For numbers with 15 or fewer digits, it's safe to use Number
    // since they won't lose precision
    return Number(str);
  }
  
  // For decimals and scientific notation, use Number
  return Number(str);
}
