//
//  undefined-null-handling.test.ts
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

import { describe, it, expect, jest } from '@jest/globals';
import { Template } from '../src/index';

describe('Undefined and Null Handling', () => {
  describe('Test 1: {{a}} when a is undefined', () => {
    it('should render as empty string', () => {
      const template = new Template('{{a}}');
      expect(template.render({})).toBe('');
    });

    it('should render as empty string in complex template', () => {
      const template = new Template('Hello {{name}}!');
      expect(template.render({})).toBe('Hello !');
    });
  });

  describe('Test 2: {{a}} when a is null', () => {
    it('should render as empty string', () => {
      const template = new Template('{{a}}');
      expect(template.render({ a: null })).toBe('');
    });

    it('should render as empty string in complex template', () => {
      const template = new Template('Hello {{name}}!');
      expect(template.render({ name: null })).toBe('Hello !');
    });
  });

  describe('Test 3: {{a.b.c}} when a is undefined', () => {
    it('should render as empty string', () => {
      const template = new Template('{{a.b.c}}');
      expect(template.render({})).toBe('');
    });

    it('should render as empty string in complex template', () => {
      const template = new Template('Value: {{data.user.name}}');
      expect(template.render({})).toBe('Value: ');
    });
  });

  describe('Test 4: {{a.b.c}} when a is null', () => {
    it('should render as empty string', () => {
      const template = new Template('{{a.b.c}}');
      expect(template.render({ a: null })).toBe('');
    });

    it('should render as empty string in complex template', () => {
      const template = new Template('Value: {{data.user.name}}');
      expect(template.render({ data: null })).toBe('Value: ');
    });

    it('should render as empty string when intermediate property is null', () => {
      const template = new Template('{{a.b.c}}');
      expect(template.render({ a: { b: null } })).toBe('');
    });
  });

  describe('Test 5: {{method(a)}} when a is undefined', () => {
    it('should pass undefined to method', () => {
      const template = new Template('{{method(a)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({}, { method });
      
      expect(method).toHaveBeenCalledWith(undefined);
      expect(method).toHaveBeenCalledTimes(1);
    });

    it('should allow method to handle undefined', () => {
      const template = new Template('{{method(a)}}');
      const method = (val: any) => {
        if (val === undefined) return 'was undefined';
        return `value: ${val}`;
      };
      
      expect(template.render({}, { method })).toBe('was undefined');
    });

    it('should distinguish undefined from empty string', () => {
      const template = new Template('{{method(a)}}');
      const method = (val: any) => {
        if (val === undefined) return 'undefined';
        if (val === '') return 'empty string';
        return 'other';
      };
      
      expect(template.render({}, { method })).toBe('undefined');
      expect(template.render({ a: '' }, { method })).toBe('empty string');
      expect(template.render({ a: 'hello' }, { method })).toBe('other');
    });
  });

  describe('Test 6: {{method(a)}} when a is null', () => {
    it('should pass null to method', () => {
      const template = new Template('{{method(a)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({ a: null }, { method });
      
      expect(method).toHaveBeenCalledWith(null);
      expect(method).toHaveBeenCalledTimes(1);
    });

    it('should allow method to handle null', () => {
      const template = new Template('{{method(a)}}');
      const method = (val: any) => {
        if (val === null) return 'was null';
        return `value: ${val}`;
      };
      
      expect(template.render({ a: null }, { method })).toBe('was null');
    });

    it('should distinguish null from empty string', () => {
      const template = new Template('{{method(a)}}');
      const method = (val: any) => {
        if (val === null) return 'null';
        if (val === '') return 'empty string';
        return 'other';
      };
      
      expect(template.render({ a: null }, { method })).toBe('null');
      expect(template.render({ a: '' }, { method })).toBe('empty string');
      expect(template.render({ a: 'hello' }, { method })).toBe('other');
    });
  });

  describe('Test 7: {{method(a.b.c)}} when a is undefined', () => {
    it('should pass undefined to method', () => {
      const template = new Template('{{method(a.b.c)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({}, { method });
      
      expect(method).toHaveBeenCalledWith(undefined);
      expect(method).toHaveBeenCalledTimes(1);
    });

    it('should allow method to handle undefined from nested access', () => {
      const template = new Template('{{method(a.b.c)}}');
      const method = (val: any) => {
        if (val === undefined) return 'nested undefined';
        return `value: ${val}`;
      };
      
      expect(template.render({}, { method })).toBe('nested undefined');
    });

    it('should pass undefined when intermediate property missing', () => {
      const template = new Template('{{method(a.b.c)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({ a: {} }, { method });
      
      expect(method).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Test 8: {{method(a.b.c)}} when a is null', () => {
    it('should pass undefined to method when root is null', () => {
      const template = new Template('{{method(a.b.c)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({ a: null }, { method });
      
      expect(method).toHaveBeenCalledWith(undefined);
      expect(method).toHaveBeenCalledTimes(1);
    });

    it('should allow method to handle undefined from null root', () => {
      const template = new Template('{{method(a.b.c)}}');
      const method = (val: any) => {
        if (val === undefined) return 'from null root';
        return `value: ${val}`;
      };
      
      expect(template.render({ a: null }, { method })).toBe('from null root');
    });

    it('should pass undefined when intermediate property is null', () => {
      const template = new Template('{{method(a.b.c)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({ a: { b: null } }, { method });
      
      expect(method).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Additional edge cases', () => {
    it('should handle multiple undefined arguments', () => {
      const template = new Template('{{method(a, b, c)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({}, { method });
      
      expect(method).toHaveBeenCalledWith(undefined, undefined, undefined);
    });

    it('should handle mixed undefined and defined arguments', () => {
      const template = new Template('{{method(a, b, c)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({ b: 'exists' }, { method });
      
      expect(method).toHaveBeenCalledWith(undefined, 'exists', undefined);
    });

    it('should handle mixed null and undefined arguments', () => {
      const template = new Template('{{method(a, b, c)}}');
      const method = jest.fn<(...args: any[]) => string>(() => 'result');
      
      template.render({ a: null, c: null }, { method });
      
      expect(method).toHaveBeenCalledWith(null, undefined, null);
    });

    it('should render method return value as empty string when method returns undefined', () => {
      const template = new Template('{{method(a)}}');
      const method = () => undefined;
      
      expect(template.render({ a: 'test' }, { method })).toBe('');
    });

    it('should render method return value as empty string when method returns null', () => {
      const template = new Template('{{method(a)}}');
      const method = () => null;
      
      expect(template.render({ a: 'test' }, { method })).toBe('');
    });

    it('should render empty string when method does not exist', () => {
      const template = new Template('{{nonExistent(a)}}');
      
      expect(template.render({ a: 'test' }, {})).toBe('');
    });
  });

  describe('Conditionals with undefined/null', () => {
    it('should treat undefined as falsy in if statements', () => {
      const template = new Template('{% if a %}yes{% else %}no{% endif %}');
      expect(template.render({})).toBe('no');
    });

    it('should treat null as falsy in if statements', () => {
      const template = new Template('{% if a %}yes{% else %}no{% endif %}');
      expect(template.render({ a: null })).toBe('no');
    });

    it('should distinguish undefined from false', () => {
      const template = new Template('{% if a == false %}false{% elif a == undefined %}undefined{% else %}other{% endif %}');
      expect(template.render({})).toBe('undefined');
      expect(template.render({ a: false })).toBe('false');
    });
  });
});
