//
//  parser-ast.test.ts
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

import { describe, test, expect } from '@jest/globals';
import { Template } from '../src/template';
import type { ASTNode, TextNode, InterpolationNode, ForLoopNode, IfNode, CommentNode, ExprNode, LiteralNode, VariableNode, BinaryOpNode, UnaryOpNode, MethodCallNode, MemberAccessNode } from '../src/ast';

// Helper function to get AST from template
function getAST(template: string): ASTNode[] {
  const t = new Template(template);
  return t.toJSON();
}

describe('Parser AST - Text Nodes', () => {
  test('parses empty template', () => {
    const ast = getAST('');
    expect(ast).toEqual([]);
  });

  test('parses plain text', () => {
    const ast = getAST('Hello, World!');
    expect(ast).toHaveLength(1);
    expect(ast[0]).toEqual({
      type: 'text',
      text: 'Hello, World!'
    } as TextNode);
  });

  test('parses text with whitespace', () => {
    const ast = getAST('  \n\t  Hello  \n  ');
    expect(ast).toHaveLength(1);
    expect((ast[0] as TextNode).text).toBe('  \n\t  Hello  \n  ');
  });

  test('parses text with special characters', () => {
    const ast = getAST('Hello! @#$%^&*()_+-=[]{}|;:,.<>?/~`');
    expect(ast).toHaveLength(1);
    expect((ast[0] as TextNode).text).toBe('Hello! @#$%^&*()_+-=[]{}|;:,.<>?/~`');
  });
});

describe('Parser AST - Interpolation Nodes', () => {
  test('parses simple variable interpolation', () => {
    const ast = getAST('{{ name }}');
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('interpolation');
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'variable',
      name: 'name'
    } as VariableNode);
  });

  test('parses interpolation without spaces', () => {
    const ast = getAST('{{name}}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'variable',
      name: 'name'
    } as VariableNode);
  });

  test('parses nested property access', () => {
    const ast = getAST('{{ user.name }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'variable',
      name: 'user.name'
    } as VariableNode);
  });

  test('parses number literal', () => {
    const ast = getAST('{{ 42 }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'literal',
      dataType: 'number',
      value: 42
    } as LiteralNode);
  });

  test('parses decimal literal', () => {
    const ast = getAST('{{ 3.14 }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'literal',
      dataType: 'decimal',
      value: '3.14'
    } as LiteralNode);
  });

  test('parses large integer as bigint', () => {
    const ast = getAST('{{ 9007199254740992 }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'literal',
      dataType: 'bigint',
      value: '9007199254740992'
    } as LiteralNode);
  });

  test('parses string literal with double quotes', () => {
    const ast = getAST('{{ "hello" }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'literal',
      dataType: 'string',
      value: 'hello'
    } as LiteralNode);
  });

  test('parses string literal with single quotes', () => {
    const ast = getAST("{{ 'hello' }}");
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'literal',
      dataType: 'string',
      value: 'hello'
    } as LiteralNode);
  });

  test('parses boolean true', () => {
    const ast = getAST('{{ true }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'literal',
      dataType: 'boolean',
      value: true
    } as LiteralNode);
  });

  test('parses boolean false', () => {
    const ast = getAST('{{ false }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({
      type: 'literal',
      dataType: 'boolean',
      value: false
    } as LiteralNode);
  });

  test('parses array literal', () => {
    const ast = getAST('{{ [1, 2, 3] }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('literal');
    const literal = node.expression as LiteralNode;
    expect(literal.dataType).toBe('array');
    expect(Array.isArray(literal.value)).toBe(true);
    expect((literal.value as ExprNode[]).length).toBe(3);
  });

  test('parses empty array literal', () => {
    const ast = getAST('{{ [] }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.dataType).toBe('array');
    expect((literal.value as ExprNode[]).length).toBe(0);
  });
});

describe('Parser AST - Binary Operations', () => {
  test('parses addition', () => {
    const ast = getAST('{{ a + b }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('binaryOp');
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('+');
    expect(binOp.left).toEqual({ type: 'variable', name: 'a' });
    expect(binOp.right).toEqual({ type: 'variable', name: 'b' });
  });

  test('parses subtraction', () => {
    const ast = getAST('{{ a - b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('-');
  });

  test('parses multiplication', () => {
    const ast = getAST('{{ a * b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('*');
  });

  test('parses division', () => {
    const ast = getAST('{{ a / b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('/');
  });

  test('parses modulo', () => {
    const ast = getAST('{{ a % b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('%');
  });

  test('parses exponentiation', () => {
    const ast = getAST('{{ a ** b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('**');
  });

  test('parses logical AND', () => {
    const ast = getAST('{{ a && b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('&&');
  });

  test('parses logical OR', () => {
    const ast = getAST('{{ a || b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('||');
  });

  test('parses bitwise AND', () => {
    const ast = getAST('{{ a & b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('&');
  });

  test('parses bitwise OR', () => {
    const ast = getAST('{{ a | b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('|');
  });

  test('parses bitwise XOR', () => {
    const ast = getAST('{{ a ^ b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('^');
  });

  test('parses left shift', () => {
    const ast = getAST('{{ a << b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('<<');
  });

  test('parses right shift', () => {
    const ast = getAST('{{ a >> b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('>>');
  });

  test('parses unsigned right shift', () => {
    const ast = getAST('{{ a >>> b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('>>>');
  });
});

describe('Parser AST - Comparison Operations', () => {
  test('parses equality', () => {
    const ast = getAST('{{ a == b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('==');
  });

  test('parses inequality', () => {
    const ast = getAST('{{ a != b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('!=');
  });

  test('parses greater than', () => {
    const ast = getAST('{{ a > b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('>');
  });

  test('parses less than', () => {
    const ast = getAST('{{ a < b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('<');
  });

  test('parses greater than or equal', () => {
    const ast = getAST('{{ a >= b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('>=');
  });

  test('parses less than or equal', () => {
    const ast = getAST('{{ a <= b }}');
    const node = ast[0] as InterpolationNode;
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('<=');
  });
});

describe('Parser AST - Unary Operations', () => {
  test('parses logical NOT', () => {
    const ast = getAST('{{ !flag }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('unaryOp');
    const unaryOp = node.expression as UnaryOpNode;
    expect(unaryOp.operator).toBe('!');
    expect(unaryOp.operand).toEqual({ type: 'variable', name: 'flag' });
  });

  test('parses bitwise NOT', () => {
    const ast = getAST('{{ ~value }}');
    const node = ast[0] as InterpolationNode;
    const unaryOp = node.expression as UnaryOpNode;
    expect(unaryOp.operator).toBe('~');
  });

  test('parses double negation', () => {
    const ast = getAST('{{ !!value }}');
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('unaryOp');
    const outer = node.expression as UnaryOpNode;
    expect(outer.operator).toBe('!');
    expect(outer.operand.type).toBe('unaryOp');
    const inner = outer.operand as UnaryOpNode;
    expect(inner.operator).toBe('!');
  });
});

describe('Parser AST - Method Calls', () => {
  test('parses method call with no arguments', () => {
    const ast = getAST('{{ upper() }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('methodCall');
    const methodCall = node.expression as MethodCallNode;
    expect(methodCall.methodName).toBe('upper');
    expect(methodCall.args).toEqual([]);
  });

  test('parses method call with one argument', () => {
    const ast = getAST('{{ upper(name) }}');
    const node = ast[0] as InterpolationNode;
    const methodCall = node.expression as MethodCallNode;
    expect(methodCall.methodName).toBe('upper');
    expect(methodCall.args).toHaveLength(1);
    expect(methodCall.args[0]).toEqual({ type: 'variable', name: 'name' });
  });

  test('parses method call with multiple arguments', () => {
    const ast = getAST('{{ format(str, arg1, arg2) }}');
    const node = ast[0] as InterpolationNode;
    const methodCall = node.expression as MethodCallNode;
    expect(methodCall.methodName).toBe('format');
    expect(methodCall.args).toHaveLength(3);
  });

  test('parses method call with literal arguments', () => {
    const ast = getAST('{{ format("Hello", 42, true) }}');
    const node = ast[0] as InterpolationNode;
    const methodCall = node.expression as MethodCallNode;
    expect(methodCall.args).toHaveLength(3);
    expect((methodCall.args[0] as LiteralNode).value).toBe('Hello');
    expect((methodCall.args[1] as LiteralNode).value).toBe(42);
    expect((methodCall.args[2] as LiteralNode).value).toBe(true);
  });

  test('parses nested method calls', () => {
    const ast = getAST('{{ upper(lower(name)) }}');
    const node = ast[0] as InterpolationNode;
    const outerCall = node.expression as MethodCallNode;
    expect(outerCall.methodName).toBe('upper');
    expect(outerCall.args).toHaveLength(1);
    const innerCall = outerCall.args[0] as MethodCallNode;
    expect(innerCall.type).toBe('methodCall');
    expect(innerCall.methodName).toBe('lower');
  });
});

describe('Parser AST - Member Access', () => {
  test('parses array indexing with literal', () => {
    const ast = getAST('{{ items[0] }}');
    expect(ast).toHaveLength(1);
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('memberAccess');
    const memberAccess = node.expression as MemberAccessNode;
    expect(memberAccess.object).toEqual({ type: 'variable', name: 'items' });
    expect(memberAccess.property).toEqual({ type: 'literal', dataType: 'number', value: 0 });
  });

  test('parses array indexing with variable', () => {
    const ast = getAST('{{ items[index] }}');
    const node = ast[0] as InterpolationNode;
    const memberAccess = node.expression as MemberAccessNode;
    expect(memberAccess.object).toEqual({ type: 'variable', name: 'items' });
    expect(memberAccess.property).toEqual({ type: 'variable', name: 'index' });
  });

  test('parses nested array indexing', () => {
    const ast = getAST('{{ matrix[i][j] }}');
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('memberAccess');
    const outer = node.expression as MemberAccessNode;
    expect(outer.object.type).toBe('memberAccess');
    const inner = outer.object as MemberAccessNode;
    expect(inner.object).toEqual({ type: 'variable', name: 'matrix' });
  });

  test('parses array indexing with expression', () => {
    const ast = getAST('{{ items[i + 1] }}');
    const node = ast[0] as InterpolationNode;
    const memberAccess = node.expression as MemberAccessNode;
    expect(memberAccess.property.type).toBe('binaryOp');
  });
});

describe('Parser AST - Operator Precedence', () => {
  test('parses multiplication before addition', () => {
    const ast = getAST('{{ a + b * c }}');
    const node = ast[0] as InterpolationNode;
    const expr = node.expression as BinaryOpNode;
    expect(expr.operator).toBe('+');
    expect((expr.right as BinaryOpNode).operator).toBe('*');
  });

  test('parses parentheses override precedence', () => {
    const ast = getAST('{{ (a + b) * c }}');
    const node = ast[0] as InterpolationNode;
    const expr = node.expression as BinaryOpNode;
    expect(expr.operator).toBe('*');
    expect((expr.left as BinaryOpNode).operator).toBe('+');
  });

  test('parses exponentiation right-associative', () => {
    const ast = getAST('{{ a ** b ** c }}');
    const node = ast[0] as InterpolationNode;
    const expr = node.expression as BinaryOpNode;
    expect(expr.operator).toBe('**');
    expect(expr.left.type).toBe('variable');
    expect((expr.right as BinaryOpNode).operator).toBe('**');
  });

  test('parses complex expression with mixed operators', () => {
    const ast = getAST('{{ a + b * c - d / e }}');
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('binaryOp');
  });
});

describe('Parser AST - Comment Nodes', () => {
  test('parses comment', () => {
    const ast = getAST('{# This is a comment #}');
    expect(ast).toHaveLength(1);
    expect(ast[0]).toEqual({
      type: 'comment',
      text: 'This is a comment'
    } as CommentNode);
  });

  test('parses comment with special characters', () => {
    const ast = getAST('{# Comment with {{ }} and {% %} #}');
    expect(ast).toHaveLength(1);
    expect((ast[0] as CommentNode).text).toBe('Comment with {{ }} and {% %}');
  });

  test('parses multiple comments', () => {
    const ast = getAST('{# First #} Text {# Second #}');
    expect(ast).toHaveLength(3);
    expect(ast[0].type).toBe('comment');
    expect(ast[1].type).toBe('text');
    expect(ast[2].type).toBe('comment');
  });
});

describe('Parser AST - For Loop Nodes', () => {
  test('parses simple for loop', () => {
    const ast = getAST('{% for item in items %}{{ item }}{% endfor %}');
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('for');
    const forLoop = ast[0] as ForLoopNode;
    expect(forLoop.itemVar).toBe('item');
    expect(forLoop.indexVar).toBeNull();
    expect(forLoop.arrayExpr).toEqual({ type: 'variable', name: 'items' });
    expect(forLoop.body).toHaveLength(1);
  });

  test('parses for loop with index', () => {
    const ast = getAST('{% for item, index in items %}{{ index }}: {{ item }}{% endfor %}');
    expect(ast).toHaveLength(1);
    const forLoop = ast[0] as ForLoopNode;
    expect(forLoop.itemVar).toBe('item');
    expect(forLoop.indexVar).toBe('index');
  });

  test('parses for loop with complex array expression', () => {
    const ast = getAST('{% for item in user.items %}{{ item }}{% endfor %}');
    const forLoop = ast[0] as ForLoopNode;
    expect(forLoop.arrayExpr).toEqual({ type: 'variable', name: 'user.items' });
  });

  test('parses for loop with array literal', () => {
    const ast = getAST('{% for item in [1, 2, 3] %}{{ item }}{% endfor %}');
    const forLoop = ast[0] as ForLoopNode;
    expect(forLoop.arrayExpr.type).toBe('literal');
    expect((forLoop.arrayExpr as LiteralNode).dataType).toBe('array');
  });

  test('parses nested for loops', () => {
    const ast = getAST('{% for row in matrix %}{% for cell in row %}{{ cell }}{% endfor %}{% endfor %}');
    expect(ast).toHaveLength(1);
    const outerLoop = ast[0] as ForLoopNode;
    expect(outerLoop.body).toHaveLength(1);
    expect(outerLoop.body[0].type).toBe('for');
  });

  test('parses for loop with empty body', () => {
    const ast = getAST('{% for item in items %}{% endfor %}');
    const forLoop = ast[0] as ForLoopNode;
    expect(forLoop.body).toEqual([]);
  });

  test('parses for loop with multiple body nodes', () => {
    const ast = getAST('{% for item in items %}Before{{ item }}After{% endfor %}');
    const forLoop = ast[0] as ForLoopNode;
    expect(forLoop.body).toHaveLength(3);
    expect(forLoop.body[0].type).toBe('text');
    expect(forLoop.body[1].type).toBe('interpolation');
    expect(forLoop.body[2].type).toBe('text');
  });
});

describe('Parser AST - If Nodes', () => {
  test('parses simple if statement', () => {
    const ast = getAST('{% if condition %}yes{% endif %}');
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('if');
    const ifNode = ast[0] as IfNode;
    expect(ifNode.branches).toHaveLength(1);
    expect(ifNode.branches[0].condition).toEqual({ type: 'variable', name: 'condition' });
    expect(ifNode.branches[0].body).toHaveLength(1);
    expect(ifNode.elseBody).toBeNull();
  });

  test('parses if-else statement', () => {
    const ast = getAST('{% if condition %}yes{% else %}no{% endif %}');
    const ifNode = ast[0] as IfNode;
    expect(ifNode.branches).toHaveLength(1);
    expect(ifNode.elseBody).toHaveLength(1);
    expect((ifNode.elseBody![0] as TextNode).text).toBe('no');
  });

  test('parses if-elif statement', () => {
    const ast = getAST('{% if a %}A{% elif b %}B{% endif %}');
    const ifNode = ast[0] as IfNode;
    expect(ifNode.branches).toHaveLength(2);
    expect(ifNode.branches[0].condition).toEqual({ type: 'variable', name: 'a' });
    expect(ifNode.branches[1].condition).toEqual({ type: 'variable', name: 'b' });
    expect(ifNode.elseBody).toBeNull();
  });

  test('parses if-elif-else statement', () => {
    const ast = getAST('{% if a %}A{% elif b %}B{% else %}C{% endif %}');
    const ifNode = ast[0] as IfNode;
    expect(ifNode.branches).toHaveLength(2);
    expect(ifNode.elseBody).toHaveLength(1);
  });

  test('parses multiple elif branches', () => {
    const ast = getAST('{% if a %}A{% elif b %}B{% elif c %}C{% elif d %}D{% endif %}');
    const ifNode = ast[0] as IfNode;
    expect(ifNode.branches).toHaveLength(4);
    expect(ifNode.elseBody).toBeNull();
  });

  test('parses if with complex condition', () => {
    const ast = getAST('{% if a > b && c < d %}yes{% endif %}');
    const ifNode = ast[0] as IfNode;
    expect(ifNode.branches[0].condition.type).toBe('binaryOp');
  });

  test('parses nested if statements', () => {
    const ast = getAST('{% if outer %}{% if inner %}nested{% endif %}{% endif %}');
    expect(ast).toHaveLength(1);
    const outerIf = ast[0] as IfNode;
    expect(outerIf.branches[0].body).toHaveLength(1);
    expect(outerIf.branches[0].body[0].type).toBe('if');
  });

  test('parses if with empty body', () => {
    const ast = getAST('{% if condition %}{% endif %}');
    const ifNode = ast[0] as IfNode;
    expect(ifNode.branches[0].body).toEqual([]);
  });
});

describe('Parser AST - Complex Mixed Structures', () => {
  test('parses text with multiple interpolations', () => {
    const ast = getAST('Hello {{ name }}, you are {{ age }} years old!');
    expect(ast).toHaveLength(5);
    expect(ast[0].type).toBe('text');
    expect(ast[1].type).toBe('interpolation');
    expect(ast[2].type).toBe('text');
    expect(ast[3].type).toBe('interpolation');
    expect(ast[4].type).toBe('text');
  });

  test('parses for loop inside if statement', () => {
    const ast = getAST('{% if items %}{% for item in items %}{{ item }}{% endfor %}{% endif %}');
    expect(ast).toHaveLength(1);
    const ifNode = ast[0] as IfNode;
    expect(ifNode.branches[0].body).toHaveLength(1);
    expect(ifNode.branches[0].body[0].type).toBe('for');
  });

  test('parses if statement inside for loop', () => {
    const ast = getAST('{% for item in items %}{% if item %}{{ item }}{% endif %}{% endfor %}');
    expect(ast).toHaveLength(1);
    const forLoop = ast[0] as ForLoopNode;
    expect(forLoop.body).toHaveLength(1);
    expect(forLoop.body[0].type).toBe('if');
  });

  test('parses comments mixed with other nodes', () => {
    const ast = getAST('{# Comment #}Text{{ var }}{% if x %}Y{% endif %}');
    expect(ast).toHaveLength(4);
    expect(ast[0].type).toBe('comment');
    expect(ast[1].type).toBe('text');
    expect(ast[2].type).toBe('interpolation');
    expect(ast[3].type).toBe('if');
  });

  test('parses template with all node types', () => {
    const template = `
      {# Header comment #}
      Hello {{ name }}!
      {% if active %}
        Status: Active
        {% for item in items %}
          - {{ item }}
        {% endfor %}
      {% else %}
        Status: Inactive
      {% endif %}
    `;
    const ast = getAST(template);
    expect(ast.length).toBeGreaterThan(0);
    // Verify we have all types
    const types = ast.map(node => node.type);
    expect(types).toContain('comment');
    expect(types).toContain('text');
    expect(types).toContain('interpolation');
    expect(types).toContain('if');
  });
});

describe('Parser AST - Edge Cases and Error Handling', () => {
  test('throws error on unclosed interpolation', () => {
    expect(() => new Template('{{ name')).toThrow('Unclosed tag');
  });

  test('throws error on unclosed tag', () => {
    expect(() => new Template('{% if condition')).toThrow('Unclosed tag');
  });

  test('throws error on unmatched endfor', () => {
    expect(() => new Template('{% endfor %}')).toThrow('Unexpected tag');
  });

  test('throws error on unmatched endif', () => {
    expect(() => new Template('{% endif %}')).toThrow('Unexpected tag');
  });

  test('throws error on unmatched else', () => {
    expect(() => new Template('{% else %}')).toThrow('Unexpected tag');
  });

  test('throws error on unmatched elif', () => {
    expect(() => new Template('{% elif condition %}')).toThrow('Unexpected tag');
  });

  test('throws error on missing endfor', () => {
    expect(() => new Template('{% for item in items %}{{ item }}')).toThrow('No matching endfor');
  });

  test('throws error on missing endif', () => {
    expect(() => new Template('{% if condition %}yes')).toThrow('No matching endif');
  });

  test('throws error on invalid for loop syntax', () => {
    expect(() => new Template('{% for item %}{{ item }}{% endfor %}')).toThrow('Invalid for loop syntax');
  });

  test('throws error on invalid if syntax', () => {
    expect(() => new Template('{% if %}yes{% endif %}')).toThrow('Unknown statement');
  });

  test('parses adjacent tags without text', () => {
    const ast = getAST('{{ a }}{{ b }}{{ c }}');
    expect(ast).toHaveLength(3);
    expect(ast.every(node => node.type === 'interpolation')).toBe(true);
  });

  test('parses tags at start and end', () => {
    const ast = getAST('{{ start }} middle {{ end }}');
    expect(ast).toHaveLength(3);
    expect(ast[0].type).toBe('interpolation');
    expect(ast[1].type).toBe('text');
    expect(ast[2].type).toBe('interpolation');
  });

  test('handles escaped characters in strings', () => {
    const ast = getAST('{{ "Hello\\nWorld" }}');
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.value).toBe('Hello\nWorld');
  });

  test('handles empty string literal', () => {
    const ast = getAST('{{ "" }}');
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.value).toBe('');
  });

  test('handles whitespace-only template', () => {
    const ast = getAST('   \n\t  ');
    expect(ast).toHaveLength(1);
    expect(ast[0].type).toBe('text');
  });

  test('handles deeply nested structures', () => {
    const template = '{% if a %}{% if b %}{% if c %}{% if d %}deep{% endif %}{% endif %}{% endif %}{% endif %}';
    const ast = getAST(template);
    expect(ast).toHaveLength(1);
    let current: IfNode = ast[0] as IfNode;
    let depth = 0;
    while (current && current.type === 'if') {
      depth++;
      if (current.branches[0].body.length > 0 && current.branches[0].body[0].type === 'if') {
        current = current.branches[0].body[0] as IfNode;
      } else {
        break;
      }
    }
    expect(depth).toBe(4);
  });
});

describe('Parser AST - String Escaping', () => {
  test('parses escaped quotes in string', () => {
    const ast = getAST('{{ "He said \\"hello\\"" }}');
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.value).toBe('He said "hello"');
  });

  test('parses escaped backslash', () => {
    const ast = getAST('{{ "path\\\\to\\\\file" }}');
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.value).toBe('path\\to\\file');
  });

  test('parses unicode escape sequences', () => {
    const ast = getAST('{{ "\\u0048\\u0069" }}');
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.value).toBe('Hi');
  });

  test('parses hex escape sequences', () => {
    const ast = getAST('{{ "\\x48\\x69" }}');
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.value).toBe('Hi');
  });
});

describe('Parser AST - Negative Numbers', () => {
  test('parses negative number literal', () => {
    const ast = getAST('{{ -42 }}');
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.value).toBe(-42);
  });

  test('parses negative decimal', () => {
    const ast = getAST('{{ -3.14 }}');
    const node = ast[0] as InterpolationNode;
    const literal = node.expression as LiteralNode;
    expect(literal.dataType).toBe('decimal');
    expect(literal.value).toBe('-3.14');
  });

  test('distinguishes subtraction from negative number', () => {
    const ast = getAST('{{ a - 5 }}');
    const node = ast[0] as InterpolationNode;
    expect(node.expression.type).toBe('binaryOp');
    const binOp = node.expression as BinaryOpNode;
    expect(binOp.operator).toBe('-');
  });
});

describe('Parser AST - Whitespace Handling', () => {
  test('preserves whitespace in text nodes', () => {
    const ast = getAST('  spaces  ');
    expect((ast[0] as TextNode).text).toBe('  spaces  ');
  });

  test('trims whitespace in expressions', () => {
    const ast = getAST('{{   name   }}');
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({ type: 'variable', name: 'name' });
  });

  test('trims whitespace in control tags', () => {
    const ast = getAST('{%   for item in items   %}{{ item }}{% endfor %}');
    expect(ast).toHaveLength(1);
    const forLoop = ast[0] as ForLoopNode;
    expect(forLoop.itemVar).toBe('item');
  });

  test('handles mixed whitespace types', () => {
    const ast = getAST('{{ \n\t name \r\n }}');
    const node = ast[0] as InterpolationNode;
    expect(node.expression).toEqual({ type: 'variable', name: 'name' });
  });
});
