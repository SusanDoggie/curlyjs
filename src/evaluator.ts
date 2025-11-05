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
import type { TemplateData, TemplateMethods } from './types';
import type { ExprNode } from './ast';

// Evaluate an expression AST node
export function evalExprNode(node: ExprNode, data: TemplateData, methods: TemplateMethods): any {
  switch (node.type) {
    case 'literal':
      // For array literals that contain expression nodes, we need to evaluate them
      if (Array.isArray(node.value)) {
        return node.value.map(item => {
          // Check if item is an expression node
          if (typeof item === 'object' && item !== null && 'type' in item) {
            return evalExprNode(item as ExprNode, data, methods);
          }
          return item;
        });
      }
      return node.value;

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
        case '==':
          return _.isEqual(leftVal, rightVal);
        case '!=':
          return !_.isEqual(leftVal, rightVal);
        case '>':
          return leftVal > rightVal;
        case '<':
          return leftVal < rightVal;
        case '>=':
          return leftVal >= rightVal;
        case '<=':
          return leftVal <= rightVal;
        case '+':
          return leftVal + rightVal;
        case '-':
          return leftVal - rightVal;
        case '*':
          return leftVal * rightVal;
        case '/':
          return leftVal / rightVal;
        case '%':
          return leftVal % rightVal;
        case '**':
          return Math.pow(leftVal, rightVal);
        case '&':
          return leftVal & rightVal;
        case '|':
          return leftVal | rightVal;
        case '^':
          return leftVal ^ rightVal;
        case '<<':
          return leftVal << rightVal;
        case '>>':
          return leftVal >> rightVal;
        case '>>>':
          return leftVal >>> rightVal;
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

      const evalArgs = node.args.map(arg => evalExprNode(arg, data, methods));
      return method(...evalArgs);
  }

  return '';
}

export function findLogicalOperator(expr: string, operator: string): number {
  // Find logical operator outside of strings, parentheses, and brackets
  let depth = 0;
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < expr.length - operator.length + 1; i++) {
    const char = expr[i];
    const prevChar = i > 0 ? expr[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      }
    }
    
    if (!inQuote) {
      if (char === '(' || char === '[') depth++;
      if (char === ')' || char === ']') depth--;
      
      if (depth === 0 && expr.substring(i, i + operator.length) === operator) {
        return i;
      }
    }
  }
  
  return -1;
}

export function splitArgs(argExprs: string): string[] {
  const args: string[] = [];
  let depth = 0, start = 0, inQuote = false, quoteChar = '';
  
  for (let i = 0; i < argExprs.length; i++) {
    const char = argExprs[i];
    if ((char === '"' || char === "'") && (!inQuote || char === quoteChar)) {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else {
        inQuote = false;
        quoteChar = '';
      }
    }
    if (!inQuote) {
      if (char === '(' || char === '[') depth++;
      if (char === ')' || char === ']') depth--;
      if (char === ',' && depth === 0) {
        args.push(argExprs.slice(start, i).trim());
        start = i + 1;
      }
    }
  }
  if (start < argExprs.length) args.push(argExprs.slice(start).trim());
  return args;
}

export function evalArg(arg: string, data: TemplateData, methods: TemplateMethods): any {
  arg = arg.trim();
  
  // String literal: single or double quotes
  if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
    let str = arg.slice(1, -1);
    str = str.replace(/\\([\\'"bfnrtv])/g, (m, c) => {
      switch (c) {
        case 'b': return '\b';
        case 'f': return '\f';
        case 'n': return '\n';
        case 'r': return '\r';
        case 't': return '\t';
        case 'v': return '\v';
        case '"': return '"';
        case "'": return "'";
        case '\\': return '\\';
        default: return c;
      }
    });
    str = str.replace(/\\u([0-9a-fA-F]{4})/g, (m, u) => String.fromCharCode(parseInt(u, 16)));
    str = str.replace(/\\x([0-9a-fA-F]{2})/g, (m, x) => String.fromCharCode(parseInt(x, 16)));
    return str;
  }
  
  // Array literal
  if (arg.startsWith('[') && arg.endsWith(']')) {
    const arrayContent = arg.slice(1, -1);
    if (!arrayContent.trim()) return [];
    
    const items: any[] = [];
    let depth = 0, start = 0, inQuote = false, quoteChar = '';
    
    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];
      const prevChar = i > 0 ? arrayContent[i - 1] : '';
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuote = false;
          quoteChar = '';
        }
      }
      if (!inQuote) {
        if (char === '[') depth++;
        if (char === ']') depth--;
        if (char === ',' && depth === 0) {
          items.push(evalArg(arrayContent.slice(start, i), data, methods));
          start = i + 1;
        }
      }
    }
    if (start < arrayContent.length) {
      items.push(evalArg(arrayContent.slice(start), data, methods));
    }
    return items;
  }
  
  // Boolean
  if (arg === 'true') return true;
  if (arg === 'false') return false;
  
  // Number
  if (!isNaN(Number(arg)) && arg !== '') return Number(arg);
  
  // Nested method call or data path
  return evalExpr(arg, data, methods);
}

export function evalExpr(expr: string, data: TemplateData, methods: TemplateMethods): any {
  expr = expr.trim();
  
  // Handle logical OR operator (||) - lowest precedence, evaluate first
  let orPos = findLogicalOperator(expr, '||');
  if (orPos !== -1) {
    const left = expr.substring(0, orPos).trim();
    const right = expr.substring(orPos + 2).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);
    return leftVal || rightVal;
  }
  
  // Handle logical AND operator (&&) - higher precedence than OR
  let andPos = findLogicalOperator(expr, '&&');
  if (andPos !== -1) {
    const left = expr.substring(0, andPos).trim();
    const right = expr.substring(andPos + 2).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);
    return leftVal && rightVal;
  }
  
  // Handle bitwise OR operator (|)
  let bitwiseOrPos = findLogicalOperator(expr, '|');
  if (bitwiseOrPos !== -1 && expr.substring(bitwiseOrPos, bitwiseOrPos + 2) !== '||') {
    const left = expr.substring(0, bitwiseOrPos).trim();
    const right = expr.substring(bitwiseOrPos + 1).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);
    return leftVal | rightVal;
  }

  // Handle bitwise XOR operator (^)
  let bitwiseXorPos = findLogicalOperator(expr, '^');
  if (bitwiseXorPos !== -1) {
    const left = expr.substring(0, bitwiseXorPos).trim();
    const right = expr.substring(bitwiseXorPos + 1).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);
    return leftVal ^ rightVal;
  }

  // Handle bitwise AND operator (&)
  let bitwiseAndPos = findLogicalOperator(expr, '&');
  if (bitwiseAndPos !== -1 && expr.substring(bitwiseAndPos, bitwiseAndPos + 2) !== '&&') {
    const left = expr.substring(0, bitwiseAndPos).trim();
    const right = expr.substring(bitwiseAndPos + 1).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);
    return leftVal & rightVal;
  }

  // Handle logical NOT operator (highest precedence for unary operator)
  if (expr.startsWith('!')) {
    const innerExpr = expr.substring(1).trim();
    // Remove parentheses if present
    let exprToEval = innerExpr;
    if (innerExpr.startsWith('(') && innerExpr.endsWith(')')) {
      exprToEval = innerExpr.substring(1, innerExpr.length - 1);
    }
    const innerVal = evalExpr(exprToEval, data, methods);
    return !innerVal;
  }

  // Handle bitwise NOT operator (~)
  if (expr.startsWith('~')) {
    const innerExpr = expr.substring(1).trim();
    // Remove parentheses if present
    let exprToEval = innerExpr;
    if (innerExpr.startsWith('(') && innerExpr.endsWith(')')) {
      exprToEval = innerExpr.substring(1, innerExpr.length - 1);
    }
    const innerVal = evalExpr(exprToEval, data, methods);
    return ~innerVal;
  }

  // Handle parentheses for grouping
  if (expr.startsWith('(') && expr.endsWith(')')) {
    // Remove outer parentheses and evaluate
    return evalExpr(expr.substring(1, expr.length - 1), data, methods);
  }
  
  // Handle bitwise shift operators (>>>, >>, <<) - MUST BE BEFORE comparison operators
  const shiftOps = ['>>>', '>>', '<<'];
  let foundOp: string | null = null;
  let opPos = -1;
  let depth = 0;
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = expr.length - 1; i >= 0; i--) { // Search from right for left-associativity
    const char = expr[i];
    const prevChar = i > 0 ? expr[i - 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      }
    }

    if (!inQuote) {
      if (char === ')' || char === ']') depth++;
      if (char === '(' || char === '[') depth--;

      if (depth === 0) {
        // Check for >>> first (longest operator)
        if (expr.substring(i, i + 3) === '>>>') {
          foundOp = '>>>';
          opPos = i;
          break;
        }
        // Then check for >> and <<
        if (expr.substring(i, i + 2) === '>>') {
          foundOp = '>>';
          opPos = i;
          break;
        }
        if (expr.substring(i, i + 2) === '<<') {
          foundOp = '<<';
          opPos = i;
          break;
        }
      }
    }
  }

  if (foundOp) {
    const left = expr.substring(0, opPos).trim();
    const right = expr.substring(opPos + foundOp.length).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);

    switch (foundOp) {
      case '<<':
        return leftVal << rightVal;
      case '>>':
        return leftVal >> rightVal;
      case '>>>':
        return leftVal >>> rightVal;
    }
  }  // Handle comparison operators (find operator not inside quotes or parentheses) - MUST BE AFTER shift operators
  const comparisonOps = ['==', '!=', '>=', '<=', '>', '<'];
  foundOp = null;
  opPos = -1;

  // Find comparison operator outside of strings and parentheses
  depth = 0;
  inQuote = false;
  quoteChar = '';

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    const prevChar = i > 0 ? expr[i - 1] : '';
    const nextChar = i < expr.length - 1 ? expr[i + 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      }
    }
    
    if (!inQuote) {
      if (char === '(' || char === '[') depth++;
      if (char === ')' || char === ']') depth--;
      
      if (depth === 0) {
        // Check for two-character operators first
        for (const op of comparisonOps) {
          if (expr.substring(i, i + op.length) === op) {
            // Skip if it's part of a shift operator (<<, >>, >>>)
            const next2Chars = expr.substring(i + 1, i + 3);
            const nextChar = expr[i + 1];

            if (op === '<' && nextChar === '<') {
              continue; // It's <<
            }
            if (op === '>' && (nextChar === '>' || next2Chars === '>>')) {
              continue; // It's >> or >>>
            }
            if (op === '>=' && nextChar === '>') {
              continue; // Part of >>> after the first >
            }

            foundOp = op;
            opPos = i;
            break;
          }
        }
        if (foundOp) break;
      }
    }
  }
  
  if (foundOp) {
    const left = expr.substring(0, opPos).trim();
    const right = expr.substring(opPos + foundOp.length).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);
    
    switch (foundOp) {
      case '==':
        return _.isEqual(leftVal, rightVal);
      case '!=':
        return !_.isEqual(leftVal, rightVal);
      case '>':
        return leftVal > rightVal;
      case '<':
        return leftVal < rightVal;
      case '>=':
        return leftVal >= rightVal;
      case '<=':
        return leftVal <= rightVal;
    }
  }

  // Handle addition and subtraction operators (lower precedence than multiplication/division)
  const addSubOps = ['+', '-'];
  foundOp = null;
  opPos = -1;
  depth = 0;
  inQuote = false;
  quoteChar = '';
  
  for (let i = expr.length - 1; i >= 0; i--) { // Search from right for left-associativity
    const char = expr[i];
    const prevChar = i > 0 ? expr[i - 1] : '';
    
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      }
    }
    
    if (!inQuote) {
      if (char === ')' || char === ']') depth++;
      if (char === '(' || char === '[') depth--;
      
      if (depth === 0 && addSubOps.includes(char)) {
        foundOp = char;
        opPos = i;
        break;
      }
    }
  }
  
  if (foundOp) {
    const left = expr.substring(0, opPos).trim();
    const right = expr.substring(opPos + 1).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);
    
    switch (foundOp) {
      case '+':
        return leftVal + rightVal;
      case '-':
        return leftVal - rightVal;
    }
  }

  // Handle multiplication, division, and modulo operators (higher precedence than addition/subtraction)
  const mulDivModOps = ['*', '/', '%'];
  foundOp = null;
  opPos = -1;
  depth = 0;
  inQuote = false;
  quoteChar = '';

  for (let i = expr.length - 1; i >= 0; i--) { // Search from right for left-associativity
    const char = expr[i];
    const prevChar = i > 0 ? expr[i - 1] : '';
    const nextChar = i < expr.length - 1 ? expr[i + 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      }
    }

    if (!inQuote) {
      if (char === ')' || char === ']') depth++;
      if (char === '(' || char === '[') depth--;

      if (depth === 0) {
        // Skip if it's part of ** operator
        if (char === '*' && (prevChar === '*' || nextChar === '*')) {
          continue;
        }

        if (mulDivModOps.includes(char)) {
          foundOp = char;
          opPos = i;
          break;
        }
      }
    }
  }

  if (foundOp) {
    const left = expr.substring(0, opPos).trim();
    const right = expr.substring(opPos + 1).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);

    switch (foundOp) {
      case '*':
        return leftVal * rightVal;
      case '/':
        return leftVal / rightVal;
      case '%':
        return leftVal % rightVal;
    }
  }

  // Handle exponentiation operator (** - highest precedence, right-associative)
  let expPos = findLogicalOperator(expr, '**');
  if (expPos !== -1) {
    const left = expr.substring(0, expPos).trim();
    const right = expr.substring(expPos + 2).trim();
    const leftVal = evalExpr(left, data, methods);
    const rightVal = evalExpr(right, data, methods);
    return Math.pow(leftVal, rightVal);
  }

  // Check for method call: methodName(args)
  const methodCall = expr.match(/^(\w+)\((.*)\)$/);
  if (!methodCall) {
    // Check for string literal
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return evalArg(expr, data, methods);
    }
    // Check for number literal
    if (!isNaN(Number(expr)) && expr !== '') {
      return Number(expr);
    }
    // Check for boolean literal
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    // Use _.get for nested property access
    const value = _.get(data, expr);
    return !_.isNil(value) ? value : '';
  }
  
  const [, methodName, argExprs] = methodCall;
  const method = methods[methodName];
  if (!method) return '';
  
  // Split args by comma, handling nested parentheses and quoted strings
  const args = splitArgs(argExprs);
  
  // Recursively evaluate each argument
  const evalArgs = args.map(arg => evalArg(arg, data, methods));
  return method(...evalArgs);
}