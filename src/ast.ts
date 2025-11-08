//
//  ast.ts
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

// Expression AST Node types
export interface BaseExprNode {
  type: string;
}

/**
 * LiteralNode represents a literal value in the AST.
 * 
 * The `dataType` field identifies the type of the literal:
 * - 'string': String literal
 * - 'number': Regular JavaScript number (safe integers and floats)
 * - 'boolean': Boolean literal
 * - 'bigint': Large integer stored as string for JSON compatibility
 * - 'decimal': Decimal number stored as string for precision and JSON compatibility
 * - 'array': Array of expression nodes
 * 
 * For JSON compatibility and numerical precision:
 * - BigInt values are stored as strings (e.g., "999999999999999999")
 * - Decimal values are stored as strings (e.g., "0.1")
 * - Regular numbers remain as numbers
 * - Arrays contain ExprNode objects
 */
export interface LiteralNode extends BaseExprNode {
  type: 'literal';
  dataType: 'string' | 'number' | 'boolean' | 'bigint' | 'decimal' | 'array';
  value: string | number | boolean | ExprNode[];
}

export interface VariableNode extends BaseExprNode {
  type: 'variable';
  name: string;
}

export interface BinaryOpNode extends BaseExprNode {
  type: 'binaryOp';
  operator: '||' | '&&' | '==' | '!=' | '>' | '<' | '>=' | '<=' | '+' | '-' | '*' | '/' | '%' | '**' | '&' | '|' | '^' | '<<' | '>>' | '>>>';
  left: ExprNode;
  right: ExprNode;
}

export interface UnaryOpNode extends BaseExprNode {
  type: 'unaryOp';
  operator: '!' | '~' | '+' | '-';
  operand: ExprNode;
}

export interface MethodCallNode extends BaseExprNode {
  type: 'methodCall';
  methodName: string;
  args: ExprNode[];
}

export interface MemberAccessNode extends BaseExprNode {
  type: 'memberAccess';
  object: ExprNode;
  property: ExprNode;
}

export type ExprNode = LiteralNode | VariableNode | BinaryOpNode | UnaryOpNode | MethodCallNode | MemberAccessNode;

// Template AST Node types
export interface BaseNode {
  type: string;
}

export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
}

export interface InterpolationNode extends BaseNode {
  type: 'interpolation';
  expression: ExprNode;
}

export interface ForLoopNode extends BaseNode {
  type: 'for';
  itemVar: string;
  indexVar: string | null;
  arrayExpr: ExprNode;
  body: ASTNode[];
}

export interface IfBranch {
  condition: ExprNode;
  body: ASTNode[];
}

export interface IfNode extends BaseNode {
  type: 'if';
  branches: IfBranch[];
  elseBody: ASTNode[] | null;
}

export interface CommentNode extends BaseNode {
  type: 'comment';
  text: string;
}

export type ASTNode = TextNode | InterpolationNode | ForLoopNode | IfNode | CommentNode;
