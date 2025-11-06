//
//  evaluator.ts
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
import Decimal from 'decimal.js';
import type { TemplateData, TemplateMethods } from './types';
import type { ExprNode } from './ast';
import { NumericValue } from './utils';

// Helper to perform arithmetic operations with Decimal support
function performArithmetic(
  left: any,
  right: any,
  op: '+' | '-' | '*' | '/' | '%' | '**'
): any {
  // Special handling for + operator: preserve string concatenation
  if (op === '+') {
    // If either operand is a string, use string concatenation
    if (typeof left === 'string' || typeof right === 'string') {
      return String(left) + String(right);
    }
  }

  // Use NumericValue for precise calculations ONLY when we have BigInt or Decimal
  // This preserves regular JavaScript number behavior for normal numbers
  const hasPreciseType = (val: any) => typeof val === 'bigint' || val instanceof Decimal;

  if (hasPreciseType(left) || hasPreciseType(right)) {
    try {
      const leftNum = new NumericValue(left);
      const rightNum = new NumericValue(right);

      switch (op) {
        case '+':
          return leftNum.add(rightNum);
        case '-':
          return leftNum.subtract(rightNum);
        case '*':
          return leftNum.multiply(rightNum);
        case '/':
          return leftNum.divide(rightNum);
        case '%':
          return leftNum.modulo(rightNum);
        case '**':
          return leftNum.power(rightNum);
      }
    } catch {
      // Fall through to legacy arithmetic if NumericValue fails
    }
  }

  // Regular JavaScript arithmetic for normal numbers
  let result: number;
  switch (op) {
    case '+':
      result = left + right;
      break;
    case '-':
      result = left - right;
      break;
    case '*':
      result = left * right;
      break;
    case '/':
      result = left / right;
      break;
    case '%':
      result = left % right;
      break;
    case '**':
      result = Math.pow(left, right);
      break;
    default:
      result = 0;
  }

  // Check for overflow: if result exceeds safe integer range and both operands are integers,
  // recalculate with BigInt
  if (Number.isInteger(left) && Number.isInteger(right) &&
    (!Number.isFinite(result) || (Number.isInteger(result) &&
      (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER)))) {
    try {
      const leftBigInt = BigInt(left);
      const rightBigInt = BigInt(right);

      switch (op) {
        case '+':
          return leftBigInt + rightBigInt;
        case '-':
          return leftBigInt - rightBigInt;
        case '*':
          return leftBigInt * rightBigInt;
        case '/':
          return leftBigInt / rightBigInt;
        case '%':
          return leftBigInt % rightBigInt;
        case '**':
          return leftBigInt ** rightBigInt;
      }
    } catch {
      // If BigInt conversion fails, return the Number result
      return result;
    }
  }

  return result;
}

// Helper to perform comparison operations with Decimal and BigInt support
function performComparison(
  left: any,
  right: any,
  op: '>' | '<' | '>=' | '<='
): boolean {
  // Use NumericValue for precise comparisons when we have BigInt or Decimal
  const hasPreciseType = (val: any) => typeof val === 'bigint' || val instanceof Decimal;

  if (hasPreciseType(left) || hasPreciseType(right)) {
    try {
      const leftNum = new NumericValue(left);
      const rightNum = new NumericValue(right);
      const leftDecimal = leftNum.toDecimal();
      const rightDecimal = rightNum.toDecimal();

      switch (op) {
        case '>':
          return leftDecimal.greaterThan(rightDecimal);
        case '<':
          return leftDecimal.lessThan(rightDecimal);
        case '>=':
          return leftDecimal.greaterThanOrEqualTo(rightDecimal);
        case '<=':
          return leftDecimal.lessThanOrEqualTo(rightDecimal);
      }
    } catch {
    // Fall through to regular comparison if NumericValue fails
    }
  }

  // Regular JavaScript comparison for normal numbers
  switch (op) {
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
  }
}

// Evaluate an expression AST node
export function evalExprNode(node: ExprNode, data: TemplateData, methods: TemplateMethods): any {
  switch (node.type) {
    case 'literal': {
      const litNode = node as any;

      // Deserialize based on dataType
      if (litNode.dataType === 'bigint') {
        return BigInt(litNode.value as string);
      } else if (litNode.dataType === 'decimal') {
        return new Decimal(litNode.value as string);
      } else if (litNode.dataType === 'array') {
        // For array literals that contain expression nodes, we need to evaluate them
        if (Array.isArray(litNode.value)) {
          return litNode.value.map((item: any) => {
            // Check if item is an expression node
            if (typeof item === 'object' && item !== null && 'type' in item) {
              return evalExprNode(item as ExprNode, data, methods);
            }
            return item;
          });
        }
        return litNode.value;
      }

      // For string, number, boolean - return as-is
      return litNode.value;
    }

    case 'variable':
      const value = _.get(data, node.name);
      return !_.isNil(value) ? value : '';

    case 'memberAccess':
      const obj = evalExprNode(node.object, data, methods);
      const prop = evalExprNode(node.property, data, methods);

      // Handle array/object access
      if (_.isNil(obj)) return '';

      // Use lodash get for safe access
      const result = _.get(obj, prop);
      return !_.isNil(result) ? result : '';

    case 'binaryOp':
      const leftVal = evalExprNode(node.left, data, methods);
      const rightVal = evalExprNode(node.right, data, methods);

      switch (node.operator) {
        case '||':
          return leftVal || rightVal;
        case '&&':
          return leftVal && rightVal;
        case '==': {
          // Special handling for Decimal and BigInt equality
          const hasPreciseType = (val: any) => typeof val === 'bigint' || val instanceof Decimal;
          if (hasPreciseType(leftVal) || hasPreciseType(rightVal)) {
            try {
              const leftNum = new NumericValue(leftVal);
              const rightNum = new NumericValue(rightVal);
              return leftNum.toDecimal().equals(rightNum.toDecimal());
            } catch {
              // Fall through to regular equality
            }
          }
          return _.isEqual(leftVal, rightVal);
        }
        case '!=': {
          // Special handling for Decimal and BigInt inequality
          const hasPreciseType = (val: any) => typeof val === 'bigint' || val instanceof Decimal;
          if (hasPreciseType(leftVal) || hasPreciseType(rightVal)) {
            try {
              const leftNum = new NumericValue(leftVal);
              const rightNum = new NumericValue(rightVal);
              return !leftNum.toDecimal().equals(rightNum.toDecimal());
            } catch {
              // Fall through to regular inequality
            }
          }
          return !_.isEqual(leftVal, rightVal);
        }
        case '>':
        case '<':
        case '>=':
        case '<=':
          return performComparison(leftVal, rightVal, node.operator);
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case '**':
          return performArithmetic(leftVal, rightVal, node.operator);
        case '&':
        case '|':
        case '^':
        case '<<':
        case '>>':
        case '>>>':
          // Bitwise operators require Number type, convert BigInt to Number
          const leftNum = typeof leftVal === 'bigint' ? Number(leftVal) : leftVal;
          const rightNum = typeof rightVal === 'bigint' ? Number(rightVal) : rightVal;
          switch (node.operator) {
            case '&':
              return leftNum & rightNum;
            case '|':
              return leftNum | rightNum;
            case '^':
              return leftNum ^ rightNum;
            case '<<':
              return leftNum << rightNum;
            case '>>':
              return leftNum >> rightNum;
            case '>>>':
              return leftNum >>> rightNum;
          }
      }
      break;

    case 'unaryOp':
      const operandVal = evalExprNode(node.operand, data, methods);
      switch (node.operator) {
        case '!':
          return !operandVal;
        case '~':
          return ~operandVal;
      }
      break;

    case 'methodCall':
      const method = methods[node.methodName];
      if (!method) return '';

      const evalArgs = node.args.map(arg => {
        const val = evalExprNode(arg, data, methods);
        // Convert BigInt to Number for method arguments to avoid "Cannot convert BigInt" errors
        // Most JavaScript methods expect Number, not BigInt
        if (typeof val === 'bigint') {
          // Only convert if the value fits in a safe integer range
          const num = Number(val);
          if (Number.isSafeInteger(num)) {
            return num;
          }
        }
        return val;
      });
      return method(...evalArgs);
  }

  return '';
}
