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

import _ from 'lodash';
import type { ASTNode, TextNode, InterpolationNode, ForLoopNode, IfNode, IfBranch } from './ast';

interface TemplateData {
  [key: string]: any;
}

interface TemplateMethods {
  [key: string]: (...args: any[]) => any;
}

function createTextNode(text: string): TextNode {
  return {
    type: 'text',
    text
  };
}

function createInterpolationNode(expression: string): InterpolationNode {
  return {
    type: 'interpolation',
    expression
  };
}

function createForLoopNode(
  itemVar: string,
  indexVar: string | null,
  arrayVar: string,
  body: ASTNode[]
): ForLoopNode {
  return {
    type: 'for',
    itemVar,
    indexVar,
    arrayVar,
    body
  };
}

function createIfNode(branches: IfBranch[], elseBody: ASTNode[] | null): IfNode {
  return {
    type: 'if',
    branches,
    elseBody
  };
}

export class Template {
  #template: string;
  #ast: ASTNode[];

  constructor(template: string) {
    this.#template = template;
    this.#ast = this.#parse(template);
  }

  get template(): string {
    return this.#template;
  }

  #parse(template: string): ASTNode[] {
    const nodes: ASTNode[] = [];
    let pos = 0;

    while (pos < template.length) {
      // Look for next tag (either {{ or {% )
      const nextExprTag = template.indexOf('{{', pos);
      const nextStmtTag = template.indexOf('{%', pos);
      
      let nextTag = -1;
      let isStatement = false;
      let tagEnd = -1;
      
      if (nextExprTag === -1 && nextStmtTag === -1) {
        // No more tags, add remaining text
        if (pos < template.length) {
          nodes.push(createTextNode(template.slice(pos)));
        }
        break;
      } else if (nextExprTag === -1) {
        nextTag = nextStmtTag;
        isStatement = true;
      } else if (nextStmtTag === -1) {
        nextTag = nextExprTag;
        isStatement = false;
      } else {
        nextTag = Math.min(nextExprTag, nextStmtTag);
        isStatement = nextTag === nextStmtTag;
      }

      // Add text before the tag
      if (nextTag > pos) {
        nodes.push(createTextNode(template.slice(pos, nextTag)));
      }

      // Find the closing tag
      const closeTag = isStatement ? '%}' : '}}';
      tagEnd = template.indexOf(closeTag, nextTag);
      if (tagEnd === -1) {
        throw new Error(`Unclosed tag at position ${nextTag}`);
      }

      const tagContent = template.slice(nextTag + 2, tagEnd).trim();

      // Check what type of tag this is
      if (isStatement && tagContent.startsWith('for ')) {
        // Parse for loop
        const forMatch = tagContent.match(/^for\s+(\w+)(?:\s*,\s*(\w+))?\s+in\s+([\w.]+)$/);
        if (!forMatch) {
          throw new Error('Invalid for loop syntax: ' + tagContent);
        }
        
        const [, itemVar, indexVar, arrayVar] = forMatch;
        
        // Find the matching endfor
        const endForTag = this.#findMatchingEnd(template, tagEnd + 2, 'for', 'endfor');
        if (endForTag === -1) {
          throw new Error('No matching endfor for for loop at position ' + nextTag);
        }

        const loopBody = template.slice(tagEnd + 2, endForTag);
        const bodyNodes = this.#parse(loopBody);
        
        nodes.push(createForLoopNode(itemVar, indexVar || null, arrayVar, bodyNodes));
        
        // Skip past the endfor tag
        pos = template.indexOf('%}', endForTag) + 2;
      } else if (isStatement && tagContent.startsWith('if ')) {
        // Parse if/elif/else block
        const ifMatch = tagContent.match(/^if\s+(.+)$/);
        if (!ifMatch) {
          throw new Error('Invalid if syntax: ' + tagContent);
        }

        const { branches, elseBody, endPos } = this.#parseIfBlock(template, nextTag, tagEnd);
        nodes.push(createIfNode(branches, elseBody));
        pos = endPos;
      } else if (isStatement && (tagContent === 'endfor' || tagContent === 'endif' || tagContent === 'else' || tagContent.startsWith('elif '))) {
        // These should be handled by their parent structures
        throw new Error('Unexpected tag: ' + tagContent);
      } else if (!isStatement) {
        // Regular interpolation (only in {{ }} tags)
        nodes.push(createInterpolationNode(tagContent));
        pos = tagEnd + 2;
      } else {
        // Unknown statement tag
        throw new Error('Unknown statement: ' + tagContent);
      }
    }

    return nodes;
  }

  #findMatchingEnd(template: string, startPos: number, startKeyword: string, endKeyword: string): number {
    let depth = 1;
    let pos = startPos;

    while (pos < template.length && depth > 0) {
      const nextTag = template.indexOf('{%', pos);
      if (nextTag === -1) break;

      const tagEnd = template.indexOf('%}', nextTag);
      if (tagEnd === -1) break;

      const tagContent = template.slice(nextTag + 2, tagEnd).trim();

      if (tagContent.startsWith(startKeyword + ' ')) {
        depth++;
      } else if (tagContent === endKeyword) {
        depth--;
        if (depth === 0) {
          return nextTag;
        }
      }
      // Also track other control structures to avoid confusion
      else if (tagContent.startsWith('if ')) {
        // Count nested if blocks
        const ifEndPos = this.#findMatchingEnd(template, tagEnd + 2, 'if', 'endif');
        if (ifEndPos !== -1) {
          pos = template.indexOf('%}', ifEndPos) + 2;
          continue;
        }
      } else if (tagContent.startsWith('for ')) {
        // Count nested for blocks
        const forEndPos = this.#findMatchingEnd(template, tagEnd + 2, 'for', 'endfor');
        if (forEndPos !== -1) {
          pos = template.indexOf('%}', forEndPos) + 2;
          continue;
        }
      }

      pos = tagEnd + 2;
    }

    return -1;
  }

  #parseIfBlock(template: string, ifTagStart: number, ifTagEnd: number): {
    branches: IfBranch[];
    elseBody: ASTNode[] | null;
    endPos: number;
  } {
    const branches: IfBranch[] = [];
    let elseBody: ASTNode[] | null = null;
    let pos = ifTagEnd + 2;

    // Get the first if condition
    const ifTagContent = template.slice(ifTagStart + 2, ifTagEnd).trim();
    const ifConditionMatch = ifTagContent.match(/^if\s+(.+)$/);
    if (!ifConditionMatch) {
      throw new Error('Invalid if syntax');
    }
    const ifCondition = ifConditionMatch[1];

    // Find the next control tag (elif, else, or endif)
    let currentCondition: string | null = ifCondition;
    let branchStart = pos;
    let depth = 0; // Track nested if statements

    while (pos < template.length) {
      const nextTag = template.indexOf('{%', pos);
      if (nextTag === -1) {
        throw new Error('No matching endif for if block');
      }

      const tagEnd = template.indexOf('%}', nextTag);
      const tagContent = template.slice(nextTag + 2, tagEnd).trim();

      // Track nested if/endif pairs
      if (tagContent.startsWith('if ')) {
        depth++;
        pos = tagEnd + 2;
        continue;
      } else if (tagContent === 'endif') {
        if (depth > 0) {
          // This endif belongs to a nested if
          depth--;
          pos = tagEnd + 2;
          continue;
        }
        
        // This is our matching endif
        const branchBody = template.slice(branchStart, nextTag);
        if (currentCondition === null) {
          // This was the else body
          elseBody = this.#parse(branchBody);
        } else {
          branches.push({
            condition: currentCondition,
            body: this.#parse(branchBody)
          });
        }

        return {
          branches,
          elseBody,
          endPos: tagEnd + 2
        };
      } else if (depth === 0) {
        // Only process elif/else at our level
        if (tagContent.startsWith('elif ')) {
          // Save the current branch
          const branchBody = template.slice(branchStart, nextTag);
          branches.push({
            condition: currentCondition!,
            body: this.#parse(branchBody)
          });

          // Start new elif branch
          const elifMatch = tagContent.match(/^elif\s+(.+)$/);
          if (!elifMatch) {
            throw new Error('Invalid elif syntax');
          }
          currentCondition = elifMatch[1];
          branchStart = tagEnd + 2;
        } else if (tagContent === 'else') {
          // Save the current branch
          const branchBody = template.slice(branchStart, nextTag);
          branches.push({
            condition: currentCondition!,
            body: this.#parse(branchBody)
          });

          // Start else branch
          branchStart = tagEnd + 2;
          currentCondition = null;
        }
      }
      
      pos = tagEnd + 2;
    }

    throw new Error('No matching endif for if block');
  }

  get veriables(): string[] {
    const variables = new Set<string>();
    const loopVars = new Set<string>(); // Track loop variables to exclude them
    this.#extractVariables(this.#ast, variables, loopVars);
    return Array.from(variables);
  }

  #extractVariables(nodes: ASTNode[], variables: Set<string>, loopVars: Set<string> = new Set()): void {
    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          // No variables in text nodes
          break;
          
        case 'interpolation':
          this.#extractFromExpression(node.expression, variables, loopVars);
          break;
          
        case 'for':
          // Add the array variable
          if (!loopVars.has(node.arrayVar)) {
            variables.add(node.arrayVar);
          }
          // Create new loop vars set including the item and index vars
          const newLoopVars = new Set([...loopVars, node.itemVar]);
          if (node.indexVar) newLoopVars.add(node.indexVar);
          // Recursively extract from body with updated loop vars
          this.#extractVariables(node.body, variables, newLoopVars);
          break;
          
        case 'if':
          // Extract from all branch conditions
          for (const branch of node.branches) {
            this.#extractFromExpression(branch.condition, variables, loopVars);
            this.#extractVariables(branch.body, variables, loopVars);
          }
          // Extract from else body if exists
          if (node.elseBody) {
            this.#extractVariables(node.elseBody, variables, loopVars);
          }
          break;
      }
    }
  }

  #extractFromExpression(expr: string, variables: Set<string>, loopVars: Set<string>): void {
    // Helper to check if a position is inside a string literal
    const isInString = (str: string, pos: number): boolean => {
      let inString = false;
      let quoteChar = '';
      for (let i = 0; i < pos; i++) {
        const char = str[i];
        if ((char === '"' || char === "'") && (i === 0 || str[i-1] !== '\\')) {
          if (!inString) {
            inString = true;
            quoteChar = char;
          } else if (char === quoteChar) {
            inString = false;
            quoteChar = '';
          }
        }
      }
      return inString;
    };

    // Check if this is a method call
    const methodCall = expr.match(/^(\w+)\(/);
    
    // Find all potential variable references
    const varMatches = expr.matchAll(/\b([a-zA-Z_][\w.]*)\b/g);
    for (const match of varMatches) {
      const varName = match[1];
      const position = match.index!;
      
      // Skip if inside a string literal
      if (isInString(expr, position)) {
        continue;
      }
      
      // Skip keywords and literals
      if (varName === 'true' || varName === 'false' || !isNaN(Number(varName))) {
        continue;
      }
      
      // Skip if this is the method name itself (not an argument)
      if (methodCall && position === 0 && varName === methodCall[1]) {
        continue;
      }
      
      // Get the root variable (before any dots)
      const rootVar = varName.split('.')[0];
      
      // Skip loop variables
      if (loopVars.has(rootVar)) {
        continue;
      }
      
      variables.add(rootVar);
    }
  }

  #findLogicalOperator(expr: string, operator: string): number {
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

  render(data: TemplateData, methods: TemplateMethods = {}): string {
    return this.#renderNodes(this.#ast, data, methods);
  }

  #renderNodes(nodes: ASTNode[], data: TemplateData, methods: TemplateMethods): string {
    return nodes.map(node => this.#renderNode(node, data, methods)).join('');
  }

  #renderNode(node: ASTNode, data: TemplateData, methods: TemplateMethods): string {
    switch (node.type) {
      case 'text':
        return node.text;
        
      case 'interpolation':
        const value = this.#evalExpr(node.expression, data, methods);
        return value !== null && value !== undefined ? String(value) : '';
        
      case 'for':
        const array = _.get(data, node.arrayVar);
        if (!Array.isArray(array)) return '';
        
        return array.map((item, idx) => {
          const loopData: TemplateData = { ...data, [node.itemVar]: item };
          if (node.indexVar) loopData[node.indexVar] = idx;
          return this.#renderNodes(node.body, loopData, methods);
        }).join('');
        
      case 'if':
        // Evaluate each branch condition
        for (const branch of node.branches) {
          const conditionResult = this.#evalExpr(branch.condition, data, methods);
          if (conditionResult) {
            return this.#renderNodes(branch.body, data, methods);
          }
        }
        // If no condition matched, render else body
        if (node.elseBody) {
          return this.#renderNodes(node.elseBody, data, methods);
        }
        return '';
        
      default:
        return '';
    }
  }

  #evalExpr(expr: string, data: TemplateData, methods: TemplateMethods): any {
    expr = expr.trim();
    
    // Handle logical OR operator (||) - lowest precedence, evaluate first
    let orPos = this.#findLogicalOperator(expr, '||');
    if (orPos !== -1) {
      const left = expr.substring(0, orPos).trim();
      const right = expr.substring(orPos + 2).trim();
      const leftVal = this.#evalExpr(left, data, methods);
      const rightVal = this.#evalExpr(right, data, methods);
      return leftVal || rightVal;
    }
    
    // Handle logical AND operator (&&) - higher precedence than OR
    let andPos = this.#findLogicalOperator(expr, '&&');
    if (andPos !== -1) {
      const left = expr.substring(0, andPos).trim();
      const right = expr.substring(andPos + 2).trim();
      const leftVal = this.#evalExpr(left, data, methods);
      const rightVal = this.#evalExpr(right, data, methods);
      return leftVal && rightVal;
    }
    
    // Handle logical NOT operator (highest precedence for unary operator)
    if (expr.startsWith('!')) {
      const innerExpr = expr.substring(1).trim();
      // Remove parentheses if present
      let exprToEval = innerExpr;
      if (innerExpr.startsWith('(') && innerExpr.endsWith(')')) {
        exprToEval = innerExpr.substring(1, innerExpr.length - 1);
      }
      const innerVal = this.#evalExpr(exprToEval, data, methods);
      return !innerVal;
    }

    // Handle parentheses for grouping
    if (expr.startsWith('(') && expr.endsWith(')')) {
      // Remove outer parentheses and evaluate
      return this.#evalExpr(expr.substring(1, expr.length - 1), data, methods);
    }
    
    // Handle comparison operators (find operator not inside quotes or parentheses)
    const comparisonOps = ['==', '!=', '>=', '<=', '>', '<'];
    let foundOp: string | null = null;
    let opPos = -1;
    
    // Find comparison operator outside of strings and parentheses
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
          // Check for two-character operators first
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
      const leftVal = this.#evalExpr(left, data, methods);
      const rightVal = this.#evalExpr(right, data, methods);
      
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

    // Handle arithmetic operators (same approach)
    const arithmeticOps = ['+', '-', '*', '/'];
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
        
        if (depth === 0 && arithmeticOps.includes(char)) {
          foundOp = char;
          opPos = i;
          break;
        }
      }
    }
    
    if (foundOp) {
      const left = expr.substring(0, opPos).trim();
      const right = expr.substring(opPos + 1).trim();
      const leftVal = this.#evalExpr(left, data, methods);
      const rightVal = this.#evalExpr(right, data, methods);
      
      switch (foundOp) {
        case '+':
          return leftVal + rightVal;
        case '-':
          return leftVal - rightVal;
        case '*':
          return leftVal * rightVal;
        case '/':
          return leftVal / rightVal;
      }
    }

    // Check for method call: methodName(args)
    const methodCall = expr.match(/^(\w+)\((.*)\)$/);
    if (!methodCall) {
      // Check for string literal
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        return this.#evalArg(expr, data, methods);
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
    const args = this.#splitArgs(argExprs);
    
    // Recursively evaluate each argument
    const evalArgs = args.map(arg => this.#evalArg(arg, data, methods));
    return method(...evalArgs);
  }

  #splitArgs(argExprs: string): string[] {
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

  #evalArg(arg: string, data: TemplateData, methods: TemplateMethods): any {
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
            items.push(this.#evalArg(arrayContent.slice(start, i), data, methods));
            start = i + 1;
          }
        }
      }
      if (start < arrayContent.length) {
        items.push(this.#evalArg(arrayContent.slice(start), data, methods));
      }
      return items;
    }
    
    // Boolean
    if (arg === 'true') return true;
    if (arg === 'false') return false;
    
    // Number
    if (!isNaN(Number(arg)) && arg !== '') return Number(arg);
    
    // Nested method call or data path
    return this.#evalExpr(arg, data, methods);
  }
}
