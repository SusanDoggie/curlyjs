//
//  analyzer.ts
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

import type { ASTNode } from './ast';

function isInString(str: string, pos: number): boolean {
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
}

export function extractFromExpression(expr: string, variables: Set<string>, loopVars: Set<string>): void {
  // First, collect all method names to exclude them from variables
  const methodNames = new Set<string>();
  const methodMatches = expr.matchAll(/\b([a-zA-Z_]\w*)\s*\(/g);
  for (const match of methodMatches) {
    const methodName = match[1];
    const position = match.index!;

    // Skip if inside a string literal
    if (isInString(expr, position)) {
      continue;
    }

    methodNames.add(methodName);
  }

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

    // Get the root variable (before any dots)
    const rootVar = varName.split('.')[0];
    
    // Skip if this is a method name
    if (methodNames.has(rootVar)) {
      continue;
    }

    // Skip loop variables
    if (loopVars.has(rootVar)) {
      continue;
    }
    
    variables.add(rootVar);
  }
}

export function extractMethodsFromExpression(expr: string, methods: Set<string>): void {
  // Find all method calls: methodName(
  const methodMatches = expr.matchAll(/\b([a-zA-Z_]\w*)\s*\(/g);
  for (const match of methodMatches) {
    const methodName = match[1];
    const position = match.index!;

    // Skip if inside a string literal
    if (isInString(expr, position)) {
      continue;
    }

    methods.add(methodName);
  }
}

export function extractVariables(nodes: ASTNode[], variables: Set<string>, loopVars: Set<string> = new Set()): void {
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        // No variables in text nodes
        break;
        
      case 'interpolation':
        extractFromExpression(node.expression, variables, loopVars);
        break;
        
      case 'for':
        // Extract variables from the array expression
        extractFromExpression(node.arrayExpr, variables, loopVars);
        // Create new loop vars set including the item and index vars
        const newLoopVars = new Set([...loopVars, node.itemVar]);
        if (node.indexVar) newLoopVars.add(node.indexVar);
        // Recursively extract from body with updated loop vars
        extractVariables(node.body, variables, newLoopVars);
        break;
        
      case 'if':
        // Extract from all branch conditions
        for (const branch of node.branches) {
          extractFromExpression(branch.condition, variables, loopVars);
          extractVariables(branch.body, variables, loopVars);
        }
        // Extract from else body if exists
        if (node.elseBody) {
          extractVariables(node.elseBody, variables, loopVars);
        }
        break;
    }
  }
}

export function extractMethods(nodes: ASTNode[], methods: Set<string>): void {
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        // No methods in text nodes
        break;

      case 'interpolation':
        extractMethodsFromExpression(node.expression, methods);
        break;

      case 'for':
        // Extract methods from the array expression
        extractMethodsFromExpression(node.arrayExpr, methods);
        // Recursively extract from body
        extractMethods(node.body, methods);
        break;

      case 'if':
        // Extract from all branch conditions
        for (const branch of node.branches) {
          extractMethodsFromExpression(branch.condition, methods);
          extractMethods(branch.body, methods);
        }
        // Extract from else body if exists
        if (node.elseBody) {
          extractMethods(node.elseBody, methods);
        }
        break;
    }
  }
}