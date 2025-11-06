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

/**
 * Helper to convert a value to Decimal for calculations
 */
function toDecimal(value: any): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  if (typeof value === 'bigint') {
    return new Decimal(value.toString());
  }
  return new Decimal(value);
}

/**
 * Helper to perform arithmetic operations with BigInt and Decimal support
 * Type promotion: number < BigInt < Decimal
 * - If either operand is Decimal, result is Decimal
 * - Else if either operand is BigInt, result is BigInt (except division, which uses Decimal)
 * - Otherwise, use regular JavaScript number arithmetic
 */
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

  const leftIsDecimal = left instanceof Decimal;
  const rightIsDecimal = right instanceof Decimal;
  const leftIsBigInt = typeof left === 'bigint';
  const rightIsBigInt = typeof right === 'bigint';

  // If either is Decimal, use Decimal arithmetic
  if (leftIsDecimal || rightIsDecimal) {
    const leftDecimal = toDecimal(left);
    const rightDecimal = toDecimal(right);

    switch (op) {
      case '+':
        return leftDecimal.plus(rightDecimal);
      case '-':
        return leftDecimal.minus(rightDecimal);
      case '*':
        return leftDecimal.times(rightDecimal);
      case '/':
        return leftDecimal.dividedBy(rightDecimal);
      case '%':
        return leftDecimal.modulo(rightDecimal);
      case '**':
        return leftDecimal.pow(rightDecimal);
    }
  }

  // Division always uses Decimal for precision, even for BigInt
  if (op === '/') {
    return toDecimal(left).dividedBy(toDecimal(right));
  }

  // If either is BigInt, use BigInt arithmetic (division already handled above)
  if (leftIsBigInt || rightIsBigInt) {
    // Convert to BigInt (this also works if one is already BigInt)
    const leftBigInt = typeof left === 'bigint' ? left : BigInt(left);
    const rightBigInt = typeof right === 'bigint' ? right : BigInt(right);

    switch (op) {
      case '+':
        return leftBigInt + rightBigInt;
      case '-':
        return leftBigInt - rightBigInt;
      case '*':
        return leftBigInt * rightBigInt;
      case '%':
        return leftBigInt % rightBigInt;
      case '**':
        return leftBigInt ** rightBigInt;
    }
  }

  // Regular JavaScript arithmetic for normal numbers (division already handled above)
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
        case '%':
          return leftBigInt % rightBigInt;
        case '**':
          return leftBigInt ** rightBigInt;
      }
    } catch {
      // If BigInt conversion fails, return the Number result
      return result;
    }
  } return result;
}

/**
 * Helper to perform comparison operations with BigInt and Decimal support
 */
function performComparison(
  left: any,
  right: any,
  op: '>' | '<' | '>=' | '<='
): boolean {
  const leftIsDecimal = left instanceof Decimal;
  const rightIsDecimal = right instanceof Decimal;
  const leftIsBigInt = typeof left === 'bigint';
  const rightIsBigInt = typeof right === 'bigint';

  // If either is Decimal or BigInt, use Decimal for comparison (most precise)
  if (leftIsDecimal || rightIsDecimal || leftIsBigInt || rightIsBigInt) {
    const leftDecimal = toDecimal(left);
    const rightDecimal = toDecimal(right);

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
          const leftIsDecimal = leftVal instanceof Decimal;
          const rightIsDecimal = rightVal instanceof Decimal;
          const leftIsBigInt = typeof leftVal === 'bigint';
          const rightIsBigInt = typeof rightVal === 'bigint';

          if (leftIsDecimal || rightIsDecimal || leftIsBigInt || rightIsBigInt) {
            const leftDecimal = toDecimal(leftVal);
            const rightDecimal = toDecimal(rightVal);
            return leftDecimal.equals(rightDecimal);
          }
          return _.isEqual(leftVal, rightVal);
        }
        case '!=': {
          // Special handling for Decimal and BigInt inequality
          const leftIsDecimal = leftVal instanceof Decimal;
          const rightIsDecimal = rightVal instanceof Decimal;
          const leftIsBigInt = typeof leftVal === 'bigint';
          const rightIsBigInt = typeof rightVal === 'bigint';

          if (leftIsDecimal || rightIsDecimal || leftIsBigInt || rightIsBigInt) {
            const leftDecimal = toDecimal(leftVal);
            const rightDecimal = toDecimal(rightVal);
            return !leftDecimal.equals(rightDecimal);
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

        // Convert special types to standard JavaScript types for method arguments.
        // User-provided methods should only receive standard JS types (string, number, boolean, array, object, null).
        // Internal calculations maintain precision with BigInt/Decimal, but method boundaries normalize to JS types.

        if (typeof val === 'bigint') {
          // Convert BigInt to Number
          // Note: May lose precision for values outside safe integer range
          return Number(val);
        }

        if (val instanceof Decimal) {
          // Convert Decimal to Number
          // Note: May lose precision for values with high decimal precision
          return val.toNumber();
        }

        return val;
      });
      return method(...evalArgs);
  }

  return '';
}
