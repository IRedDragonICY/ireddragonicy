// A small, dependency-free scientific calculator engine
// Supports: +, -, *, /, ^, mod, unary minus, factorial, parentheses
// Functions: sin, cos, tan, ln, log, sqrt, abs, exp
// Constants: pi, e

export type AngleMode = 'DEG' | 'RAD';

type TokenType =
  | 'number'
  | 'operator'
  | 'identifier'
  | 'lparen'
  | 'rparen'
  | 'postfix';

interface Token {
  type: TokenType;
  value: string;
}

const operatorPrecedence: Record<string, { prec: number; assoc: 'L' | 'R' }> = {
  '!': { prec: 5, assoc: 'L' },
  '^': { prec: 4, assoc: 'R' },
  'u-': { prec: 3, assoc: 'R' },
  '*': { prec: 2, assoc: 'L' },
  '/': { prec: 2, assoc: 'L' },
  mod: { prec: 2, assoc: 'L' },
  '+': { prec: 1, assoc: 'L' },
  '-': { prec: 1, assoc: 'L' },
};

const functionNames = new Set([
  'sin',
  'cos',
  'tan',
  'ln',
  'log',
  'sqrt',
  'abs',
  'exp',
]);

function isDigit(ch: string) {
  return /[0-9]/.test(ch);
}

function maybeUnaryMinus(tokens: Token[], raw: string): Token {
  const prev = tokens[tokens.length - 1];
  if (!prev || prev.type === 'operator' || prev.type === 'lparen') {
    return { type: 'operator', value: 'u-' };
  }
  return { type: 'operator', value: '-' };
}

export function preprocessExpression(expr: string): string {
  return expr
    .replace(/\s+/g, '')
    .replace(/[×xX]/g, '*')
    .replace(/[÷]/g, '/')
    .replace(/[–—−]/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt');
}

export function tokenize(expression: string): Token[] {
  const expr = preprocessExpression(expression);
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (isDigit(ch) || (ch === '.' && isDigit(expr[i + 1] || ''))) {
      let j = i + 1;
      while (j < expr.length && /[0-9_]/.test(expr[j])) j++;
      if (expr[j] === '.') {
        j++;
        while (j < expr.length && /[0-9_]/.test(expr[j])) j++;
      }
      const num = expr.slice(i, j).replace(/_/g, '');
      tokens.push({ type: 'number', value: num });
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      let j = i + 1;
      while (j < expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
      const id = expr.slice(i, j);
      if (id === 'mod') {
        tokens.push({ type: 'operator', value: 'mod' });
      } else {
        // Treat as identifier; will be resolved as value (constant/variable) or function later
        tokens.push({ type: 'identifier', value: id });
      }
      i = j;
      continue;
    }

    if (ch === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
    if (ch === '!') { tokens.push({ type: 'postfix', value: '!' }); i++; continue; }
    if (ch === '+') { tokens.push({ type: 'operator', value: '+' }); i++; continue; }
    if (ch === '-') { tokens.push(maybeUnaryMinus(tokens, ch)); i++; continue; }
    if (ch === '*') { tokens.push({ type: 'operator', value: '*' }); i++; continue; }
    if (ch === '/') { tokens.push({ type: 'operator', value: '/' }); i++; continue; }
    if (ch === '^') { tokens.push({ type: 'operator', value: '^' }); i++; continue; }

    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
}

export function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'number' || (t.type === 'identifier' && (t.value === 'pi' || t.value === 'e' || t.value === 'Ans'))) {
      output.push(t);
    } else if (t.type === 'identifier') {
      // function
      stack.push(t);
    } else if (t.type === 'operator') {
      const op1 = t.value;
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type === 'operator') {
          const op2 = top.value;
          const p1 = operatorPrecedence[op1];
          const p2 = operatorPrecedence[op2];
          if ((p1.assoc === 'L' && p1.prec <= p2.prec) || (p1.assoc === 'R' && p1.prec < p2.prec)) {
            output.push(stack.pop() as Token);
            continue;
          }
        } else if (top.type === 'postfix') {
          output.push(stack.pop() as Token);
          continue;
        }
        break;
      }
      stack.push(t);
    } else if (t.type === 'postfix') {
      // treat postfix as operator with highest precedence on stack
      stack.push(t);
    } else if (t.type === 'lparen') {
      stack.push(t);
    } else if (t.type === 'rparen') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen') {
        output.push(stack.pop() as Token);
      }
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop(); // pop lparen
      // if the next on stack is a function, pop it
      if (stack.length && stack[stack.length - 1].type === 'identifier') {
        output.push(stack.pop() as Token);
      }
      // also pop any postfix that directly followed the rparen
      while (stack.length && stack[stack.length - 1].type === 'postfix') {
        output.push(stack.pop() as Token);
      }
    }
  }
  while (stack.length) {
    const s = stack.pop() as Token;
    if (s.type === 'lparen' || s.type === 'rparen') throw new Error('Mismatched parentheses');
    output.push(s);
  }
  return output;
}

function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial of negative');
  const rounded = Math.round(n);
  if (Math.abs(rounded - n) > 1e-10) throw new Error('Factorial requires integer');
  let r = 1;
  for (let i = 2; i <= rounded; i++) r *= i;
  return r;
}

function toRadians(v: number, mode: AngleMode): number {
  return mode === 'DEG' ? (v * Math.PI) / 180 : v;
}

export function evaluateRpn(rpn: Token[], options?: { angleMode?: AngleMode; constants?: Record<string, number> }): number {
  const angleMode = options?.angleMode ?? 'DEG';
  const constants: Record<string, number> = { pi: Math.PI, e: Math.E, Ans: 0, ...(options?.constants || {}) };
  const stack: number[] = [];
  for (const t of rpn) {
    if (t.type === 'number') {
      stack.push(parseFloat(t.value));
    } else if (t.type === 'identifier') {
      if (t.value in constants) {
        stack.push(constants[t.value]);
      } else {
        // function
        const a = stack.pop();
        if (a === undefined) throw new Error('Insufficient values');
        switch (t.value) {
          case 'sin': stack.push(Math.sin(toRadians(a, angleMode))); break;
          case 'cos': stack.push(Math.cos(toRadians(a, angleMode))); break;
          case 'tan': stack.push(Math.tan(toRadians(a, angleMode))); break;
          case 'ln': stack.push(Math.log(a)); break;
          case 'log': stack.push(Math.log10(a)); break;
          case 'sqrt': stack.push(Math.sqrt(a)); break;
          case 'abs': stack.push(Math.abs(a)); break;
          case 'exp': stack.push(Math.exp(a)); break;
          default: throw new Error(`Unknown function: ${t.value}`);
        }
      }
    } else if (t.type === 'operator') {
      if (t.value === 'u-') {
        const a = stack.pop();
        if (a === undefined) throw new Error('Insufficient values');
        stack.push(-a);
        continue;
      }
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new Error('Insufficient values');
      switch (t.value) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/': stack.push(a / b); break;
        case '^': stack.push(Math.pow(a, b)); break;
        case 'mod': stack.push(a % b); break;
        default: throw new Error(`Unknown operator: ${t.value}`);
      }
    } else if (t.type === 'postfix') {
      const a = stack.pop();
      if (a === undefined) throw new Error('Insufficient values');
      if (t.value === '!') stack.push(factorial(a));
      else throw new Error(`Unknown postfix operator: ${t.value}`);
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  const result = stack[0];
  if (!Number.isFinite(result)) throw new Error('Invalid math operation');
  return result;
}

export function evaluate(expression: string, options?: { angleMode?: AngleMode; constants?: Record<string, number> }): number {
  const tokens = tokenize(expression);
  const rpn = toRpn(tokens);
  return evaluateRpn(rpn, options);
}

export function formatNumberForDisplay(value: number): string {
  if (!Number.isFinite(value)) return '∞';
  const abs = Math.abs(value);
  if ((abs !== 0 && (abs >= 1e12 || abs < 1e-6))) {
    return value.toExponential(10).replace(/\.?0+e/, 'e');
  }
  // 12 significant digits
  const s = Number(value.toPrecision(12)).toString();
  return s;
}


