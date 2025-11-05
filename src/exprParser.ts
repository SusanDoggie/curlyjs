//
//  exprParser.ts
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

import type { ExprNode, LiteralNode, VariableNode, BinaryOpNode, UnaryOpNode, MethodCallNode } from './ast';

function createLiteralNode(value: string | number | boolean | any[]): LiteralNode {
  return {
    type: 'literal',
    value
  };
}

function createVariableNode(name: string): VariableNode {
  return {
    type: 'variable',
    name
  };
}

function createBinaryOpNode(
  operator: '||' | '&&' | '==' | '!=' | '>' | '<' | '>=' | '<=' | '+' | '-' | '*' | '/',
  left: ExprNode,
  right: ExprNode
): BinaryOpNode {
  return {
    type: 'binaryOp',
    operator,
    left,
    right
  };
}

function createUnaryOpNode(operator: '!', operand: ExprNode): UnaryOpNode {
  return {
    type: 'unaryOp',
    operator,
    operand
  };
}

function createMethodCallNode(methodName: string, args: ExprNode[]): MethodCallNode {
  return {
    type: 'methodCall',
    methodName,
    args
  };
}

function findOperatorPosition(expr: string, operator: string): number {
  // Find operator outside of strings, parentheses, and brackets
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

function splitArguments(argExprs: string): string[] {
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

function parseStringLiteral(str: string): string {
  // Remove quotes
  let result = str.slice(1, -1);
  
  // Handle escape sequences
  result = result.replace(/\\([\\'"bfnrtv])/g, (m, c) => {
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
  result = result.replace(/\\u([0-9a-fA-F]{4})/g, (m, u) => String.fromCharCode(parseInt(u, 16)));
  result = result.replace(/\\x([0-9a-fA-F]{2})/g, (m, x) => String.fromCharCode(parseInt(x, 16)));
  
  return result;
}

function parseArrayLiteral(expr: string): any[] {
  const arrayContent = expr.slice(1, -1);
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
        const itemExpr = arrayContent.slice(start, i);
        const itemNode = parseExpression(itemExpr);
        // For array literals, we need to evaluate to get the actual value
        // This is a simplification - in reality we'd need to evaluate the node
        // For now, we'll store the parsed expression node
        items.push(itemNode);
        start = i + 1;
      }
    }
  }
  if (start < arrayContent.length) {
    const itemExpr = arrayContent.slice(start);
    const itemNode = parseExpression(itemExpr);
    items.push(itemNode);
  }
  
  // For array literals, we need to return the expression nodes
  // But the LiteralNode expects actual values
  // We'll handle this by evaluating simple literals during parsing
  const evaluatedItems = items.map(item => {
    if (item.type === 'literal') {
      return item.value;
    }
    // For non-literal items, we can't evaluate them at parse time
    // We'll need to handle this differently - return the node itself
    return item;
  });
  
  return evaluatedItems;
}

export function parseExpression(expr: string): ExprNode {
  expr = expr.trim();
  
  // Handle logical OR operator (||) - lowest precedence
  const orPos = findOperatorPosition(expr, '||');
  if (orPos !== -1) {
    const left = expr.substring(0, orPos).trim();
    const right = expr.substring(orPos + 2).trim();
    return createBinaryOpNode('||', parseExpression(left), parseExpression(right));
  }
  
  // Handle logical AND operator (&&)
  const andPos = findOperatorPosition(expr, '&&');
  if (andPos !== -1) {
    const left = expr.substring(0, andPos).trim();
    const right = expr.substring(andPos + 2).trim();
    return createBinaryOpNode('&&', parseExpression(left), parseExpression(right));
  }
  
  // Handle logical NOT operator (!)
  if (expr.startsWith('!')) {
    const innerExpr = expr.substring(1).trim();
    // Remove parentheses if present
    let exprToEval = innerExpr;
    if (innerExpr.startsWith('(') && innerExpr.endsWith(')')) {
      exprToEval = innerExpr.substring(1, innerExpr.length - 1);
    }
    return createUnaryOpNode('!', parseExpression(exprToEval));
  }
  
  // Handle parentheses for grouping
  if (expr.startsWith('(') && expr.endsWith(')')) {
    return parseExpression(expr.substring(1, expr.length - 1));
  }
  
  // Handle comparison operators
  const comparisonOps: Array<'==' | '!=' | '>=' | '<=' | '>' | '<'> = ['==', '!=', '>=', '<=', '>', '<'];
  let foundOp: typeof comparisonOps[number] | null = null;
  let opPos = -1;
  
  let depth = 0;
  let inQuote = false;
  let quoteChar = '';
  
  for (let i = 0; i < expr.length; i++) {
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
      
      if (depth === 0) {
        for (const op of comparisonOps) {
          if (expr.substring(i, i + op.length) === op) {
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
    return createBinaryOpNode(foundOp, parseExpression(left), parseExpression(right));
  }
  
  // Handle arithmetic operators (search from right for left-associativity)
  const arithmeticOps: Array<'+' | '-' | '*' | '/'> = ['+', '-', '*', '/'];
  let foundArithOp: '+' | '-' | '*' | '/' | null = null;
  let arithOpPos = -1;
  depth = 0;
  inQuote = false;
  quoteChar = '';
  
  for (let i = expr.length - 1; i >= 0; i--) {
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
      
      if (depth === 0 && arithmeticOps.includes(char as any)) {
        foundArithOp = char as '+' | '-' | '*' | '/';
        arithOpPos = i;
        break;
      }
    }
  }
  
  if (foundArithOp) {
    const left = expr.substring(0, arithOpPos).trim();
    const right = expr.substring(arithOpPos + 1).trim();
    return createBinaryOpNode(foundArithOp, parseExpression(left), parseExpression(right));
  }
  
  // Check for method call: methodName(args) or methodName (args)
  const methodCall = expr.match(/^(\w+)\s*\((.*)\)$/);
  if (methodCall) {
    const [, methodName, argExprs] = methodCall;
    const argStrings = splitArguments(argExprs);
    const argNodes = argStrings.map(arg => parseExpression(arg));
    return createMethodCallNode(methodName, argNodes);
  }
  
  // Check for string literal
  if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
    return createLiteralNode(parseStringLiteral(expr));
  }
  
  // Check for array literal
  if (expr.startsWith('[') && expr.endsWith(']')) {
    return createLiteralNode(parseArrayLiteral(expr));
  }
  
  // Check for boolean literal
  if (expr === 'true') return createLiteralNode(true);
  if (expr === 'false') return createLiteralNode(false);
  
  // Check for number literal
  if (!isNaN(Number(expr)) && expr !== '') {
    return createLiteralNode(Number(expr));
  }
  
  // Otherwise, it's a variable/property access
  return createVariableNode(expr);
}
