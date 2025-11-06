//
//  template.ts
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

import type { ASTNode, ExprNode, IfBranch, TextNode, InterpolationNode, ForLoopNode, IfNode, CommentNode } from './ast';
import type { TemplateData, TemplateMethods } from './types';
import { parseTemplate } from './parser';
import { extractVariables, extractMethods } from './analyzer';
import { renderNodes } from './renderer';
import { OPERATORS } from './exprParser';

function reconstructExpression(expr: ExprNode): string {
  switch (expr.type) {
    case 'literal': {
      const litNode = expr as any;

      // Handle different data types
      if (litNode.dataType === 'string') {
        // Use JSON.stringify to properly escape all special characters
        return JSON.stringify(litNode.value as string);
      } else if (litNode.dataType === 'bigint' || litNode.dataType === 'decimal') {
        // BigInt and Decimal are stored as strings in AST
        return litNode.value as string;
      } else if (litNode.dataType === 'boolean') {
        return String(litNode.value);
      } else if (litNode.dataType === 'number') {
        return String(litNode.value);
      } else if (litNode.dataType === 'array') {
        // Array elements can be ExprNode objects or primitive values
        const arr = litNode.value as ExprNode[];
        return `[${arr.map(v => {
          if (v && typeof v === 'object' && 'type' in v) {
            // It's an ExprNode
            return reconstructExpression(v as ExprNode);
          } else if (typeof v === 'string') {
            return `"${v}"`;
          } else {
            return String(v);
          }
        }).join(', ')}]`;
      }
      throw new Error(`Invalid literal node: missing or unknown dataType '${litNode.dataType}'`);
    }
    case 'variable':
      return expr.name;
    case 'memberAccess':
      return `${reconstructExpression(expr.object)}[${reconstructExpression(expr.property)}]`;
    case 'binaryOp': {
      // Add parentheses around operands if they are binary operations with lower precedence
      const currentPrecedence = OPERATORS[expr.operator]?.precedence || 0;

      const leftExpr = expr.left;
      const rightExpr = expr.right;

      // Add parentheses to left operand if it has lower precedence
      let leftStr = reconstructExpression(leftExpr);
      if (leftExpr.type === 'binaryOp') {
        const leftPrecedence = OPERATORS[leftExpr.operator]?.precedence || 0;
        if (leftPrecedence < currentPrecedence) {
          leftStr = `(${leftStr})`;
        }
      }

      // Add parentheses to right operand if it has lower or equal precedence
      // (equal precedence on right needs parens for left-associative operators)
      let rightStr = reconstructExpression(rightExpr);
      if (rightExpr.type === 'binaryOp') {
        const rightPrecedence = OPERATORS[rightExpr.operator]?.precedence || 0;
        // For right-associative operators like **, we need different rules
        const isRightAssociative = OPERATORS[expr.operator]?.associativity === 'right';
        if (isRightAssociative) {
          if (rightPrecedence < currentPrecedence) {
            rightStr = `(${rightStr})`;
          }
        } else {
          if (rightPrecedence <= currentPrecedence) {
            rightStr = `(${rightStr})`;
          }
        }
      }

      return `${leftStr} ${expr.operator} ${rightStr}`;
    }
    case 'unaryOp':
      return `${expr.operator}${reconstructExpression(expr.operand)}`;
    case 'methodCall':
      return `${expr.methodName}(${expr.args.map(reconstructExpression).join(', ')})`;
    default:
      throw new Error(`Unknown expression type: ${(expr as any).type}`);
  }
}

function reconstructTemplate(nodes: ASTNode[]): string {
  let result = '';

  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        result += (node as TextNode).text;
        break;
      case 'interpolation':
        result += `{{ ${reconstructExpression((node as InterpolationNode).expression)} }}`;
        break;
      case 'comment':
        result += `{# ${(node as CommentNode).text} #}`;
        break;
      case 'for': {
        const forNode = node as ForLoopNode;
        const vars = forNode.indexVar
          ? `${forNode.itemVar}, ${forNode.indexVar}`
          : forNode.itemVar;
        result += `{% for ${vars} in ${reconstructExpression(forNode.arrayExpr)} %}`;
        result += reconstructTemplate(forNode.body);
        result += `{% endfor %}`;
        break;
      }
      case 'if': {
        const ifNode = node as IfNode;
        for (let i = 0; i < ifNode.branches.length; i++) {
          const branch = ifNode.branches[i];
          const keyword = i === 0 ? 'if' : 'elif';
          result += `{% ${keyword} ${reconstructExpression(branch.condition)} %}`;
          result += reconstructTemplate(branch.body);
        }
        if (ifNode.elseBody) {
          result += `{% else %}`;
          result += reconstructTemplate(ifNode.elseBody);
        }
        result += `{% endif %}`;
        break;
      }
      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }

  return result;
}

export class Template {
  #template: string;
  #ast: ASTNode[];

  constructor(template: string) {
    this.#template = template;
    this.#ast = parseTemplate(template);
  }

  get template(): string {
    return this.#template;
  }

  get variables(): string[] {
    const variables = new Set<string>();
    const loopVars = new Set<string>(); // Track loop variables to exclude them
    extractVariables(this.#ast, variables, loopVars);
    return Array.from(variables);
  }

  get methods(): string[] {
    const methods = new Set<string>();
    extractMethods(this.#ast, methods);
    return Array.from(methods);
  }

  render(data: TemplateData, methods: TemplateMethods = {}): string {
    return renderNodes(this.#ast, data, methods);
  }

  toJSON(): ASTNode[] {
    return this.#ast;
  }

  static fromJSON(ast: ASTNode[]): Template {
    const reconstructed = reconstructTemplate(ast);
    return new Template(reconstructed);
  }
}
