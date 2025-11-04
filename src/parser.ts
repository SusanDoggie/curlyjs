//
//  parser.ts
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

import type { ASTNode, TextNode, InterpolationNode, ForLoopNode, IfNode, IfBranch } from './ast';

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
  arrayExpr: string,
  body: ASTNode[]
): ForLoopNode {
  return {
    type: 'for',
    itemVar,
    indexVar,
    arrayExpr,
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

export function findMatchingEnd(template: string, startPos: number, startKeyword: string, endKeyword: string): number {
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
      const ifEndPos = findMatchingEnd(template, tagEnd + 2, 'if', 'endif');
      if (ifEndPos !== -1) {
        pos = template.indexOf('%}', ifEndPos) + 2;
        continue;
      }
    } else if (tagContent.startsWith('for ')) {
      // Count nested for blocks
      const forEndPos = findMatchingEnd(template, tagEnd + 2, 'for', 'endfor');
      if (forEndPos !== -1) {
        pos = template.indexOf('%}', forEndPos) + 2;
        continue;
      }
    }

    pos = tagEnd + 2;
  }

  return -1;
}

export function parseIfBlock(template: string, ifTagStart: number, ifTagEnd: number): {
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
        elseBody = parseTemplate(branchBody);
      } else {
        branches.push({
          condition: currentCondition,
          body: parseTemplate(branchBody)
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
          body: parseTemplate(branchBody)
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
          body: parseTemplate(branchBody)
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

export function parseTemplate(template: string): ASTNode[] {
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
      // Parse for loop - allow complex expressions after 'in'
      const forMatch = tagContent.match(/^for\s+(\w+)(?:\s*,\s*(\w+))?\s+in\s+(.+)$/);
      if (!forMatch) {
        throw new Error('Invalid for loop syntax: ' + tagContent);
      }
      
      const [, itemVar, indexVar, arrayExpr] = forMatch;
      
      // Find the matching endfor
      const endForTag = findMatchingEnd(template, tagEnd + 2, 'for', 'endfor');
      if (endForTag === -1) {
        throw new Error('No matching endfor for for loop at position ' + nextTag);
      }

      const loopBody = template.slice(tagEnd + 2, endForTag);
      const bodyNodes = parseTemplate(loopBody);
      
      nodes.push(createForLoopNode(itemVar, indexVar || null, arrayExpr.trim(), bodyNodes));
      
      // Skip past the endfor tag
      pos = template.indexOf('%}', endForTag) + 2;
    } else if (isStatement && tagContent.startsWith('if ')) {
      // Parse if/elif/else block
      const ifMatch = tagContent.match(/^if\s+(.+)$/);
      if (!ifMatch) {
        throw new Error('Invalid if syntax: ' + tagContent);
      }

      const { branches, elseBody, endPos } = parseIfBlock(template, nextTag, tagEnd);
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