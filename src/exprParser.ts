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

import type { ExprNode, LiteralNode, VariableNode, BinaryOpNode, UnaryOpNode, MethodCallNode, MemberAccessNode } from './ast';
import Decimal from 'decimal.js';

/**
 * Parse a number string intelligently:
 * - Use BigInt for large integers outside safe integer range
 * - Use Decimal for numbers with decimal points (for precision)
 * - Use Number for safe integers
 * 
 * @param str - The string representation of the number
 * @returns A number, bigint, or Decimal depending on the value
 */
function parseNumber(str: string): number | bigint | Decimal {
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

// Operator precedence and associativity table
// Higher precedence = evaluated first
// Left associative: operators of same precedence evaluate left-to-right
// Right associative: operators of same precedence evaluate right-to-left
export const OPERATORS: Record<string, { precedence: number; associativity: 'left' | 'right' }> = {
  '||': { precedence: 1, associativity: 'left' },
  '&&': { precedence: 2, associativity: 'left' },
  '|': { precedence: 3, associativity: 'left' },
  '^': { precedence: 4, associativity: 'left' },
  '&': { precedence: 5, associativity: 'left' },
  '==': { precedence: 6, associativity: 'left' },
  '!=': { precedence: 6, associativity: 'left' },
  '<': { precedence: 7, associativity: 'left' },
  '>': { precedence: 7, associativity: 'left' },
  '<=': { precedence: 7, associativity: 'left' },
  '>=': { precedence: 7, associativity: 'left' },
  '<<': { precedence: 8, associativity: 'left' },
  '>>': { precedence: 8, associativity: 'left' },
  '>>>': { precedence: 8, associativity: 'left' },
  '+': { precedence: 9, associativity: 'left' },
  '-': { precedence: 9, associativity: 'left' },
  '*': { precedence: 10, associativity: 'left' },
  '/': { precedence: 10, associativity: 'left' },
  '%': { precedence: 10, associativity: 'left' },
  '**': { precedence: 11, associativity: 'right' }, // Exponentiation is right-associative
};

type Token =
  | { type: 'number'; value: number | bigint | Decimal }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'variable'; name: string }
  | { type: 'operator'; operator: string }
  | { type: 'unary'; operator: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'lbracket' }
  | { type: 'rbracket' }
  | { type: 'comma' }
  | { type: 'method'; name: string };

function createLiteralNode(value: string | number | boolean | bigint | Decimal | ExprNode[]): LiteralNode {
  if (typeof value === 'string') {
    return {
      type: 'literal',
      dataType: 'string',
      value
    };
  } else if (typeof value === 'boolean') {
    return {
      type: 'literal',
      dataType: 'boolean',
      value
    };
  } else if (typeof value === 'bigint') {
    return {
      type: 'literal',
      dataType: 'bigint',
      value: value.toString() // Store as string for JSON compatibility
    };
  } else if (value instanceof Decimal) {
    return {
      type: 'literal',
      dataType: 'decimal',
      value: value.toString() // Store as string for JSON compatibility and precision
    };
  } else if (Array.isArray(value)) {
    return {
      type: 'literal',
      dataType: 'array',
      value
    };
  } else {
    return {
      type: 'literal',
      dataType: 'number',
      value
    };
  }
}

function createVariableNode(name: string): VariableNode {
  return {
    type: 'variable',
    name
  };
}

function createBinaryOpNode(
  operator: '||' | '&&' | '==' | '!=' | '>' | '<' | '>=' | '<=' | '+' | '-' | '*' | '/' | '%' | '**' | '&' | '|' | '^' | '<<' | '>>' | '>>>',
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

function createUnaryOpNode(operator: '!' | '~', operand: ExprNode): UnaryOpNode {
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

function createMemberAccessNode(object: ExprNode, property: ExprNode): MemberAccessNode {
  return {
    type: 'memberAccess',
    object,
    property
  };
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

// Tokenize the expression
function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < expr.length) {
    const char = expr[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // String literals
    if (char === '"' || char === "'") {
      const quote = char;
      let str = char;
      i++;
      while (i < expr.length) {
        str += expr[i];
        if (expr[i] === quote) {
          // Count consecutive backslashes before the quote
          let backslashCount = 0;
          for (let j = i - 1; j >= 0 && expr[j] === '\\'; j--) {
            backslashCount++;
          }
          // If even number of backslashes (including 0), the quote is not escaped
          if (backslashCount % 2 === 0) {
            i++;
            break;
          }
        }
        i++;
      }
      tokens.push({ type: 'string', value: parseStringLiteral(str) });
      continue;
    }

    // Numbers (including negative numbers in unary position)
    if (/\d/.test(char) || (char === '.' && i + 1 < expr.length && /\d/.test(expr[i + 1])) ||
      (char === '-' && i + 1 < expr.length && /\d/.test(expr[i + 1]))) {

      // Check if minus is in unary position
      if (char === '-') {
        const prevToken = tokens[tokens.length - 1];
        const isUnary = !prevToken ||
          prevToken.type === 'operator' ||
          prevToken.type === 'unary' ||
          prevToken.type === 'lparen' ||
          prevToken.type === 'lbracket' ||
          prevToken.type === 'comma';

        // Only treat as negative number if in unary position
        if (isUnary) {
          let num = '-';
          i++; // Skip the minus
          while (i < expr.length && /[\d.]/.test(expr[i])) {
            num += expr[i];
            i++;
          }
          tokens.push({ type: 'number', value: parseNumber(num) });
          continue;
        }
      }

    // Regular positive number
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseNumber(num) });
      continue;
    }

    // Multi-character operators (check longest first)
    if (i + 2 < expr.length && expr.substring(i, i + 3) === '>>>') {
      tokens.push({ type: 'operator', operator: '>>>' });
      i += 3;
      continue;
    }

    if (i + 1 < expr.length) {
      const twoChar = expr.substring(i, i + 2);
      if (twoChar === '||' || twoChar === '&&' || twoChar === '==' || twoChar === '!=' ||
        twoChar === '<=' || twoChar === '>=' || twoChar === '<<' || twoChar === '>>' ||
        twoChar === '**') {
        tokens.push({ type: 'operator', operator: twoChar });
        i += 2;
        continue;
      }
    }

    // Single-character operators
    if ('+-*/%&|^<>'.includes(char)) {
      tokens.push({ type: 'operator', operator: char });
      i++;
      continue;
    }

    // Unary operators
    if (char === '!' || char === '~') {
      tokens.push({ type: 'unary', operator: char });
      i++;
      continue;
    }

    // Parentheses and brackets
    if (char === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (char === '[') {
      tokens.push({ type: 'lbracket' });
      i++;
      continue;
    }
    if (char === ']') {
      tokens.push({ type: 'rbracket' });
      i++;
      continue;
    }
    if (char === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }

    // Identifiers (variables, booleans, method names)
    if (/[a-zA-Z_]/.test(char)) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z0-9_.]/.test(expr[i])) {
        ident += expr[i];
        i++;
      }

      // Check if next non-whitespace is '(' for method call
      let j = i;
      while (j < expr.length && /\s/.test(expr[j])) j++;
      if (j < expr.length && expr[j] === '(') {
        tokens.push({ type: 'method', name: ident });
      } else if (ident === 'true') {
        tokens.push({ type: 'boolean', value: true });
      } else if (ident === 'false') {
        tokens.push({ type: 'boolean', value: false });
      } else {
        tokens.push({ type: 'variable', name: ident });
      }
      continue;
    }

    throw new Error(`Unexpected character: ${char} at position ${i}`);
  }
  
  return tokens;
}

// Shunting-yard algorithm to convert infix to postfix (RPN)
function infixToPostfix(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const operatorStack: Token[] = [];
  
  // Track argument counts for method calls and array elements
  // Each entry: { commaCount: number, hasArgs: boolean, isArray: boolean }
  const argCountStack: Array<{ commaCount: number; hasArgs: boolean; isArray: boolean }> = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'number' || token.type === 'string' ||
      token.type === 'boolean' || token.type === 'variable') {
      output.push(token);
      // Mark that we've seen an argument if we're inside a method call
      if (argCountStack.length > 0) {
        argCountStack[argCountStack.length - 1].hasArgs = true;
      }
    }
    else if (token.type === 'method') {
      operatorStack.push(token);
      // Push lparen implicitly - we'll track args starting now
    }
    else if (token.type === 'comma') {
      // Pop operators until we find a left parenthesis or bracket
      while (operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type !== 'lparen' &&
        operatorStack[operatorStack.length - 1].type !== 'lbracket') {
        output.push(operatorStack.pop()!);
      }
      // Increment comma count for the current method call or array
      if (argCountStack.length > 0) {
        argCountStack[argCountStack.length - 1].commaCount++;
      }
    }
    else if (token.type === 'operator') {
      const op1 = OPERATORS[token.operator];
      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'operator') {
          const op2 = OPERATORS[top.operator];
          if ((op1.associativity === 'left' && op1.precedence <= op2.precedence) ||
            (op1.associativity === 'right' && op1.precedence < op2.precedence)) {
            output.push(operatorStack.pop()!);
          } else {
            break;
          }
        } else if (top.type === 'unary') {
          output.push(operatorStack.pop()!);
        } else {
          break;
        }
      }
      operatorStack.push(token);
      // If we pushed an operator and we're inside a method call, mark that we have args
      if (argCountStack.length > 0) {
        argCountStack[argCountStack.length - 1].hasArgs = true;
      }
    }
    else if (token.type === 'unary') {
      operatorStack.push(token);
      // If we pushed a unary operator and we're inside a method call, mark that we have args
      if (argCountStack.length > 0) {
        argCountStack[argCountStack.length - 1].hasArgs = true;
      }
    }
    else if (token.type === 'lparen') {
      // Check if this lparen is for a method call
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'method') {
        // Start tracking arguments for this method
        argCountStack.push({ commaCount: 0, hasArgs: false, isArray: false });
      }
      operatorStack.push(token);
    }
    else if (token.type === 'rparen') {
      // Pop operators until we find a left parenthesis
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'lparen') {
        output.push(operatorStack.pop()!);
      }
      if (operatorStack.length === 0) {
        throw new Error('Mismatched parentheses');
      }
      operatorStack.pop(); // Remove the left parenthesis

      // Check if there's a method call
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'method') {
        const methodToken = operatorStack.pop()!;
        const argInfo = argCountStack.pop();
        // Argument count = commas + 1 (if there are any args at all)
        const argCount = argInfo && argInfo.hasArgs ? argInfo.commaCount + 1 : 0;
        (methodToken as any).argCount = argCount;
        output.push(methodToken);

        // If we just completed a method and we're still inside another method or array, mark hasArgs
        if (argCountStack.length > 0) {
          argCountStack[argCountStack.length - 1].hasArgs = true;
        }
      }
    }
    else if (token.type === 'lbracket') {
      // Check if this is member access (bracket after an expression) or array literal
      // Member access: output has something that `[` could be indexing
      // Array literal: `[` appears at the start of an expression context

      // Check if we just pushed something to output that could be indexed
      const hasValueInOutput = output.length > 0;
      const lastStackToken = operatorStack.length > 0 ? operatorStack[operatorStack.length - 1] : null;

      // Member access if there's a value in output and we're not right after comma or opening bracket
      const isMemberAccess = hasValueInOutput && !(
        lastStackToken?.type === 'comma' ||
        (lastStackToken?.type === 'lbracket' && argCountStack.length > 0 && !argCountStack[argCountStack.length - 1].hasArgs)
      );

      if (isMemberAccess) {
        // This is member access like items[0]
        // Push a special marker to track this
        operatorStack.push({ type: 'lbracket', isMemberAccess: true } as any);
        argCountStack.push({ commaCount: 0, hasArgs: false, isArray: false });
      } else {
      // This is an array literal like [1, 2, 3]
        operatorStack.push(token);
        argCountStack.push({ commaCount: 0, hasArgs: false, isArray: true });
      }
    }
    else if (token.type === 'rbracket') {
      // Pop operators until we find a left bracket
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'lbracket') {
        output.push(operatorStack.pop()!);
      }
      if (operatorStack.length === 0) {
        throw new Error('Mismatched brackets');
      }

      const lbracket = operatorStack.pop()!;
      const argInfo = argCountStack.pop();

      // Check if this was member access or array literal
      if ((lbracket as any).isMemberAccess) {
        // Member access: push a special operator for member access
        // The index should be a single expression
        output.push({ type: 'operator', operator: '[]access' } as any);

        if (argCountStack.length > 0) {
          argCountStack[argCountStack.length - 1].hasArgs = true;
        }
      } else {
      // Array literal
        const elementCount = argInfo && argInfo.hasArgs ? argInfo.commaCount + 1 : 0;
        output.push({ type: 'operator', operator: '[]', argCount: elementCount } as any);

        if (argCountStack.length > 0) {
          argCountStack[argCountStack.length - 1].hasArgs = true;
        }
      }
    }
  }
  
  // Pop remaining operators
  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'lparen' || top.type === 'rparen') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }
  
  return output;
}// Build AST from postfix notation (RPN)
function buildASTFromPostfix(postfix: Token[]): ExprNode {
  const stack: ExprNode[] = [];

  for (const token of postfix) {
    if (token.type === 'number') {
      stack.push(createLiteralNode(token.value));
    }
    else if (token.type === 'string') {
      stack.push(createLiteralNode(token.value));
    }
    else if (token.type === 'boolean') {
      stack.push(createLiteralNode(token.value));
    }
    else if (token.type === 'variable') {
      stack.push(createVariableNode(token.name));
    }
    else if (token.type === 'unary') {
      const operand = stack.pop();
      if (!operand) throw new Error('Invalid expression: missing operand for unary operator');
      stack.push(createUnaryOpNode(token.operator as '!' | '~', operand));
    }
    else if (token.type === 'operator') {
      if (token.operator === '[]') {
        // Build array from stack - elementCount is stored in token.argCount
        const elementCount = (token as any).argCount || 0;
        const items: ExprNode[] = [];

        for (let i = 0; i < elementCount; i++) {
          if (stack.length > 0) {
            items.unshift(stack.pop()!);
          }
        }

        stack.push(createLiteralNode(items));
        continue;
      }
      
      if (token.operator === '[]access') {
        // Member access: pop index and object
        const property = stack.pop();
        const object = stack.pop();
        if (!object || !property) throw new Error('Invalid expression: missing operands for member access');
        stack.push(createMemberAccessNode(object, property));
        continue;
      }

      const right = stack.pop();
      const left = stack.pop();
      if (!left || !right) throw new Error('Invalid expression: missing operands');
      stack.push(createBinaryOpNode(
        token.operator as any,
        left,
        right
      ));
    }
    else if (token.type === 'method') {
      // Method calls need special handling - we need to track argument count
      // For now, collect all arguments that were pushed since the method was encountered
      // This is stored in the token during parsing
      const argCount = (token as any).argCount || 0;
      const args: ExprNode[] = [];

      for (let i = 0; i < argCount; i++) {
        if (stack.length > 0) {
          args.unshift(stack.pop()!);
        }
      }

      stack.push(createMethodCallNode(token.name, args));
    }
  }
  
  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }
  
  return stack[0];
}

export function parseExpression(expr: string): ExprNode {
  expr = expr.trim();
  
  // Handle empty expression
  if (!expr) {
    return createLiteralNode('');
  }
  
  // Quick path for simple literals (only for cases that can't contain operators)
  if (expr === 'true') return createLiteralNode(true);
  if (expr === 'false') return createLiteralNode(false);
  // Removed greedy string literal check - let tokenizer handle all string cases
  if (!isNaN(Number(expr)) && expr !== '' && !/[+\-*/%&|^<>!~()[\],]/.test(expr)) {
  // Only use quick path if there are no operators or special characters
    return createLiteralNode(parseNumber(expr));
  }
  if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(expr)) {
    return createVariableNode(expr);
  }
  
  // Parse complex expressions using Shunting-yard algorithm
  try {
    const tokens = tokenize(expr);
    const postfix = infixToPostfix(tokens);
    return buildASTFromPostfix(postfix);
  } catch (error) {
    // Fallback: treat as variable
    return createVariableNode(expr);
  }
}
