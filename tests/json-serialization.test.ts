//
//  json-serialization.test.ts
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

describe('Template JSON serialization', () => {
  describe('toJSON()', () => {
    test('should return the AST', () => {
      const template = new Template('Hello {{ name }}!');
      const json = template.toJSON();
      
      expect(json).toBeDefined();
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(3); // text, interpolation, text
      expect(json[0].type).toBe('text');
      expect(json[1].type).toBe('interpolation');
      expect(json[2].type).toBe('text');
    });
  });

  describe('fromJSON()', () => {
    test('should reconstruct a simple template', () => {
      const original = new Template('Hello {{ name }}!');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const data = { name: 'World' };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with for loop', () => {
      const original = new Template('{% for item in items %}{{ item }}{% endfor %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const data = { items: ['a', 'b', 'c'] };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with for loop with index', () => {
      const original = new Template('{% for item, i in items %}{{ i }}: {{ item }} {% endfor %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const data = { items: ['a', 'b', 'c'] };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with if/elif/else', () => {
      const original = new Template('{% if x > 10 %}big{% elif x > 5 %}medium{% else %}small{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ x: 15 })).toBe(original.render({ x: 15 }));
      expect(restored.render({ x: 7 })).toBe(original.render({ x: 7 }));
      expect(restored.render({ x: 3 })).toBe(original.render({ x: 3 }));
    });

    test('should reconstruct a template with comments', () => {
      const original = new Template('Hello {# this is a comment #} World');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a complex nested template', () => {
      const original = new Template(`
{% for user in users %}
  {% if user.active %}
    {{ user.name }} is active
  {% else %}
    {{ user.name }} is inactive
  {% endif %}
{% endfor %}
`);
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const data = {
        users: [
          { name: 'Alice', active: true },
          { name: 'Bob', active: false }
        ]
      };
      expect(restored.render(data)).toBe(original.render(data));
    });

    test('should reconstruct a template with method calls', () => {
      const original = new Template('{{ upper(name) }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      const methods = { upper: (s: string) => s.toUpperCase() };
      expect(restored.render({ name: 'hello' }, methods)).toBe(original.render({ name: 'hello' }, methods));
    });

    test('should reconstruct a template with binary operations', () => {
      const original = new Template('{{ a + b }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ a: 5, b: 3 })).toBe(original.render({ a: 5, b: 3 }));
    });

    test('should reconstruct a template with unary operations', () => {
      const original = new Template('{{ !active }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ active: false })).toBe(original.render({ active: false }));
    });

    test('should reconstruct a template with comparison operators', () => {
      const original = new Template('{% if count >= 5 %}many{% else %}few{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ count: 10 })).toBe(original.render({ count: 10 }));
      expect(restored.render({ count: 2 })).toBe(original.render({ count: 2 }));
    });

    test('should reconstruct a template with logical operators', () => {
      const original = new Template('{% if a && b %}both{% elif a || b %}one{% else %}none{% endif %}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({ a: true, b: true })).toBe(original.render({ a: true, b: true }));
      expect(restored.render({ a: true, b: false })).toBe(original.render({ a: true, b: false }));
      expect(restored.render({ a: false, b: false })).toBe(original.render({ a: false, b: false }));
    });

    test('should reconstruct a template with string literals', () => {
      const original = new Template('{{ "hello" }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a template with number literals', () => {
      const original = new Template('{{ 42 }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({})).toBe(original.render({}));
    });

    test('should reconstruct a template with boolean literals', () => {
      const original = new Template('{{ true }} {{ false }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.render({})).toBe(original.render({}));
    });

    test('should preserve variables extraction', () => {
      const original = new Template('{{ name }} {{ age }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.variables).toEqual(original.variables);
    });

    test('should preserve methods extraction', () => {
      const original = new Template('{{ upper(name) }} {{ lower(title) }}');
      const json = original.toJSON();
      const restored = Template.fromJSON(json);
      
      expect(restored.methods).toEqual(original.methods);
    });
  });

  describe('Round-trip serialization', () => {
    test('should handle multiple round trips', () => {
      const original = new Template('{% for i in items %}{{ i }}{% endfor %}');
      const data = { items: [1, 2, 3] };
      
      const json1 = original.toJSON();
      const restored1 = Template.fromJSON(json1);
      
      const json2 = restored1.toJSON();
      const restored2 = Template.fromJSON(json2);
      
      expect(restored2.render(data)).toBe(original.render(data));
      expect(JSON.stringify(json2)).toBe(JSON.stringify(json1));
    });
  });
});
