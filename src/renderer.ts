//
//  renderer.ts
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

import Decimal from 'decimal.js';
import type { ASTNode } from './ast';
import type { TemplateData, TemplateMethods } from './types';
import { evalExprNode } from './evaluator';

// Helper to convert values to string with proper Decimal and BigInt handling
function valueToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle Decimal instances
  if (value instanceof Decimal) {
    // Use toFixed() for integer-like Decimals to avoid scientific notation
    // For non-integers, use toString() which respects Decimal.js precision settings
    if (value.isInt()) {
      return value.toFixed(0);
    }
    // For decimals, check if we need toFixed to avoid scientific notation
    const str = value.toString();
    if (str.includes('e')) {
      // Has scientific notation, use toFixed with appropriate decimal places
      const decimalPlaces = value.decimalPlaces();
      return value.toFixed(decimalPlaces);
    }
    return str;
  }

  // Handle BigInt
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // For everything else, use standard String conversion
  return String(value);
}

export function renderNode(node: ASTNode, data: TemplateData, methods: TemplateMethods): string {
  switch (node.type) {
    case 'text':
      return node.text;
      
    case 'interpolation':
      const value = evalExprNode(node.expression, data, methods);
      return valueToString(value);
      
    case 'for':
      const array = evalExprNode(node.arrayExpr, data, methods);
      if (!Array.isArray(array)) return '';
      
      return array.map((item, idx) => {
        const loopData: TemplateData = { ...data, [node.itemVar]: item };
        if (node.indexVar) loopData[node.indexVar] = idx;
        return renderNodes(node.body, loopData, methods);
      }).join('');
      
    case 'if':
      // Evaluate each branch condition
      for (const branch of node.branches) {
        const conditionResult = evalExprNode(branch.condition, data, methods);
        if (conditionResult) {
          return renderNodes(branch.body, data, methods);
        }
      }
      // If no condition matched, render else body
      if (node.elseBody) {
        return renderNodes(node.elseBody, data, methods);
      }
      return '';
      
    case 'comment':
      // Comments should not be rendered
      return '';

    default:
      return '';
  }
}

export function renderNodes(nodes: ASTNode[], data: TemplateData, methods: TemplateMethods): string {
  return nodes.map(node => renderNode(node, data, methods)).join('');
}