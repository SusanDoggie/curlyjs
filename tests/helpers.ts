//
//  helpers.ts
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

import _ from 'lodash';

/**
 * Helper methods for template tests
 */
export const testMethods = {
  empty: (val: any): boolean => {
    if (val === null || val === undefined) return true;
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'object') return Object.keys(val).length === 0;
    if (typeof val === 'string') return val.length === 0;
    return false;
  },
  
  lower: _.toLower,
  upper: _.toUpper,
  capitalize: _.capitalize,
  
  join: (arr: any[], sep?: string): string => _.join(arr, sep || ''),
  
  trim: (str: string, chars?: string): string => _.trim(str, chars),
  trimStart: (str: string, chars?: string): string => _.trimStart(str, chars),
  trimEnd: (str: string, chars?: string): string => _.trimEnd(str, chars),
  
  add: (a: number, b: number): number => a + b,
  multiply: (a: number, b: number): number => a * b,
  
  format: (str: string, ...args: any[]): string => {
    let result = str;
    args.forEach((arg, i) => {
      result = result.replace(`{${i}}`, arg);
    });
    return result;
  },
  
  getUnreadCount: (userId: number): number => {
    const counts: Record<number, number> = { 1: 5, 2: 3 };
    return counts[userId] || 0;
  },
  
  json: (obj: any): string => JSON.stringify(obj),
};
