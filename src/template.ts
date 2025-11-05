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

function reconstructExpression(expr: ExprNode): string {
  switch (expr.type) {
    case 'literal':
      if (typeof expr.value === 'string') {
        return `"${expr.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      } else if (Array.isArray(expr.value)) {
        return `[${expr.value.map(v => typeof v === 'string' ? `"${v}"` : String(v)).join(', ')}]`;
      }
      return String(expr.value);
    case 'variable':
      return expr.name;
    case 'memberAccess':
      return `${reconstructExpression(expr.object)}[${reconstructExpression(expr.property)}]`;
    case 'binaryOp':
      return `${reconstructExpression(expr.left)} ${expr.operator} ${reconstructExpression(expr.right)}`;
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
