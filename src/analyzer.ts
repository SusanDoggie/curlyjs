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

import type { ASTNode, ExprNode } from './ast';

export function extractFromExprNode(node: ExprNode, variables: Set<string>, loopVars: Set<string>): void {
  switch (node.type) {
    case 'literal':
      // Check if the literal is an array containing expression nodes
      if (Array.isArray(node.value)) {
        for (const item of node.value) {
          if (typeof item === 'object' && item !== null && 'type' in item) {
            extractFromExprNode(item as ExprNode, variables, loopVars);
          }
        }
      }
      break;

    case 'variable':
      // Get the root variable (before any dots)
      const rootVar = node.name.split('.')[0];
      // Skip loop variables
      if (!loopVars.has(rootVar)) {
        variables.add(rootVar);
      }
      break;

    case 'binaryOp':
      extractFromExprNode(node.left, variables, loopVars);
      extractFromExprNode(node.right, variables, loopVars);
      break;

    case 'unaryOp':
      extractFromExprNode(node.operand, variables, loopVars);
      break;

    case 'methodCall':
      // Extract variables from method arguments
      for (const arg of node.args) {
        extractFromExprNode(arg, variables, loopVars);
      }
      break;
  }
}

export function extractMethodsFromExprNode(node: ExprNode, methods: Set<string>): void {
  switch (node.type) {
    case 'literal':
      // Check if the literal is an array containing expression nodes
      if (Array.isArray(node.value)) {
        for (const item of node.value) {
          if (typeof item === 'object' && item !== null && 'type' in item) {
            extractMethodsFromExprNode(item as ExprNode, methods);
          }
        }
      }
      break;

    case 'variable':
      // No methods in variable nodes
      break;

    case 'binaryOp':
      extractMethodsFromExprNode(node.left, methods);
      extractMethodsFromExprNode(node.right, methods);
      break;

    case 'unaryOp':
      extractMethodsFromExprNode(node.operand, methods);
      break;

    case 'methodCall':
      methods.add(node.methodName);
      // Also extract methods from arguments
      for (const arg of node.args) {
        extractMethodsFromExprNode(arg, methods);
      }
      break;
  }
}

export function extractVariables(nodes: ASTNode[], variables: Set<string>, loopVars: Set<string> = new Set()): void {
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        // No variables in text nodes
        break;
        
      case 'interpolation':
        extractFromExprNode(node.expression, variables, loopVars);
        break;
        
      case 'for':
        // Extract variables from the array expression
        extractFromExprNode(node.arrayExpr, variables, loopVars);
        // Create new loop vars set including the item and index vars
        const newLoopVars = new Set([...loopVars, node.itemVar]);
        if (node.indexVar) newLoopVars.add(node.indexVar);
        // Recursively extract from body with updated loop vars
        extractVariables(node.body, variables, newLoopVars);
        break;
        
      case 'if':
        // Extract from all branch conditions
        for (const branch of node.branches) {
          extractFromExprNode(branch.condition, variables, loopVars);
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
        extractMethodsFromExprNode(node.expression, methods);
        break;

      case 'for':
        // Extract methods from the array expression
        extractMethodsFromExprNode(node.arrayExpr, methods);
        // Recursively extract from body
        extractMethods(node.body, methods);
        break;

      case 'if':
        // Extract from all branch conditions
        for (const branch of node.branches) {
          extractMethodsFromExprNode(branch.condition, methods);
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