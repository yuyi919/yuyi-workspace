/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { cloneDeep } from "lodash";
import { Node } from "ohm-js";
import { parseExpression } from "./expression";
import {
  CommentBlock,
  ExpressionKind,
  ExpressionNodeData,
  InternalNodeData,
  InternalNodeKind,
  isStyledContent,
  NodeTypeKind,
  OperatorKeyword,
  TemplateRaw,
  VariableNamePrefix,
} from "./interface";

export function calcExpression(left: any, operator: OperatorKeyword, right: any) {
  switch (operator) {
    case "&&":
      return left && right;
    case "!":
      return !right;
    case "||":
      return left || right;
    case "==":
      return left === right;
    case "??":
      return left ?? right;
    case "!=":
      return left !== right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case "<":
      return left < right;
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
    case "^":
      return Math.pow(left, right);
    case "%":
      return left % right;
    default:
      throw Error(`Unrecognized operator ${operator}`);
  }
}

class Global {}

function calculate(
  exp: string | ExpressionNodeData | TemplateRaw | CommentBlock | InternalNodeData,
  scope: ScopeData
) {
  if (!exp || !(exp instanceof Object)) return exp;
  switch (exp.type) {
    case NodeTypeKind.Expression: {
      switch (exp.kind) {
        case ExpressionKind.Comma: {
          const last = exp.value.length - 1;
          const value = exp.value;
          for (let i = 0; i < last; i++) {
            calculate(value[i], scope);
          }
          return calculate(value[last], scope);
        }
        case ExpressionKind.Assign: {
          const {
            left: { prefix, text: name },
            right,
          } = exp.value;
          return assign(scope, name, prefix, calculate(right, scope), false);
        }
        case ExpressionKind.Comment: {
          return false;
        }
        case ExpressionKind.VariableIdentifier: {
          return calc_variable(exp.text, exp.prefix, scope);
        }
        case ExpressionKind.Template: {
          return calculate(exp.value, scope);
        }
        case ExpressionKind.Literal: {
          return exp.value;
        }
        case ExpressionKind.ArrayLiteral:
          // console.log(exp.value)
          return exp.value.map((data) => calculate(data, scope));
        case ExpressionKind.ArraySpreadLiteral: {
          const r = [];
          const start = calculate(exp.start, scope);
          const end = calculate(exp.end, scope) + 1;
          for (let i = start; i < end; i++) {
            r.push(i);
          }
          return r;
        }
        case ExpressionKind.CallFunction: {
          return exp;
        }
        case ExpressionKind.PrecetLiteral: {
          return exp.value / 100;
        }
        case ExpressionKind.CallMacro: {
          return exp;
        }
      }
      const { left, operator, right } = exp.value;
      return calcExpression(calculate(left, scope), operator, calculate(right, scope));
    }
    case NodeTypeKind.Comment:
      // console.log(exp.value)
      return "";
    case NodeTypeKind.Content:
      if (isStyledContent(exp)) {
        let start = "",
          end = "";
        if (exp.pipe) {
          start = `<span ${exp.pipe.flags.join(" ")}>`;
          end = `</span>`;
        }
        // console.log(exp.value)
        return exp.value instanceof Array
          ? exp.value.length > 0
            ? start +
              exp.value
                .map((value) => calculate(value, scope))
                .filter(Boolean)
                .join("") +
              end
            : false
          : exp.value
          ? exp.value
          : false;
      }
      return calculate(exp.value, scope);
    case NodeTypeKind.Source: {
      if (exp.kind === InternalNodeKind.Content) return exp;
      return "";
    }
    default:
      return exp;
    //   //@ts-ignore
    //   throw Error(`Unrecognized type ${exp.type}`);
  }
}

function calc_variable(name: string | number, prefix: VariableNamePrefix, scope: ScopeData) {
  switch (prefix) {
    case null:
      return findVariableValue(name, scope).value;
    case "$":
      return findVariableValue(name, scope, scope.GLOBAL).value;
    case "%":
      return findVariableValue(name, scope, scope.SAVE).value;
    default:
      throw Error(`Unrecognized prefix ${prefix}`);
  }
}

function findVariableValue(
  name: string | number,
  { GLOBAL, SAVE, SCOPES, CURRENTSCOPE }: ScopeData,
  _SCOPES: Record<string, any> | Record<string, any>[] = [...SCOPES, CURRENTSCOPE]
) {
  // console.log("find", name)
  let defined = false;
  let scope = null;
  if (_SCOPES instanceof Array) {
    for (let i = _SCOPES.length - 1; i > -1; i--) {
      scope = _SCOPES[i];
      if (Object.prototype.hasOwnProperty.call(scope, name)) {
        defined = true;
        break;
      }
    }
  } else {
    scope = _SCOPES;
    if (Object.prototype.hasOwnProperty.call(scope, name)) {
      defined = true;
    }
  }
  if (!defined) {
    const scopeName = scope === GLOBAL ? "GLOBAL" : scope === SAVE ? "SAVE" : "scope";
    throw Error(`[${scopeName}] ${name} is not defined`);
  }
  return { scope, value: scope[name] };
}

function assign(_$scope: ScopeData, name: string, prefix: string, value: any, explicit?: boolean) {
  // console.log(GLOBAL, SAVE, SCOPES, CURRENTSCOPE)
  if (prefix) {
    if (prefix === "$") {
      _$scope.GLOBAL[name] = value;
      // console.log("[global] %s", name, value);
    } else if (prefix === "%") {
      _$scope.SAVE[name] = value;
      // console.log("[save] %s", name, value);
    }
  } else if (explicit) {
    const scope = _$scope.CURRENTSCOPE;
    if (scope[name]) {
      throw Error(`Identifier '${name}' has already been declared`);
    } else {
      scope[name] = value;
      // console.log("[current] %s", name, value);
    }
  } else {
    const { scope } = findVariableValue(name, _$scope);
    scope[name] = value;
    // console.log("[scoped] %s", name, value);
  }
  return value;
}

interface ScopeData {
  GLOBAL: Record<string, any>;
  SAVE: Record<string, any>;
  SCOPES: Record<string, any>[];
  CURRENTSCOPE: Record<string, any>;
}

class Scope implements ScopeData {
  GLOBAL: Record<string, any> = new Global();
  SAVE: Record<string, any> = {};
  SCOPES: Record<string, any>[] = [];
  CURRENTSCOPE: Record<string, any> = { SAVE: this.SAVE, GLOBAL: this.GLOBAL };

  load() {
    this.GLOBAL = {};
    this.SAVE = {};
    this.SCOPES = [];
    this.CURRENTSCOPE = {};
  }
  get scoped() {
    const { GLOBAL, SAVE, SCOPES, CURRENTSCOPE } = this;
    return {
      GLOBAL,
      SAVE,
      SCOPES,
      CURRENTSCOPE,
    };
  }
  dump() {
    return cloneDeep({
      GLOBAL: this.GLOBAL,
      SAVE: this.SAVE,
      SCOPES: this.SCOPES,
      CURRENTSCOPE: this.CURRENTSCOPE,
    });
  }
  getGlobalScope() {
    return this.GLOBAL;
  }
  getSaveScope() {
    return this.SAVE;
  }
  getScope(node: number) {
    return [...this.SCOPES, this.CURRENTSCOPE][this.SCOPES.length - node];
  }
  setGlobalScope(scope: Record<string, any>) {
    this.GLOBAL = scope;
  }
  setSaveScope(scope: Record<string, any>) {
    this.SAVE = scope;
  }
  setScopes(scopes: Record<string, any>[]) {
    // SCOPES = SCOPES;
    this.popScope();
  }
  pushScope(scope: Record<string, any> = {}) {
    this.SCOPES.push(this.CURRENTSCOPE);
    this.CURRENTSCOPE = scope;
  }
  popScope() {
    this.CURRENTSCOPE = this.SCOPES.pop();
  }
  switchScope(scope: Record<string, any> = {}) {
    this.popScope();
    this.pushScope(scope);
  }
  calculate(exp: ExpressionNodeData, node?: Node) {
    // console.log(exp)
    return calculate(exp, this);
  }

  assign(name: string, prefix: string, right: ExpressionNodeData, explicit: boolean) {
    const value = calculate(right, this);
    // console.log(`set ${prefix || ""}${name}`, value, [...SCOPES, CURRENTSCOPE]);
    return assign(this, name, prefix, value, explicit);
  }

  eval<T>(expr: string): T {
    return this.calculate(parseExpression(expr));
  }
}

export function createScope() {
  return new Scope();
}

export type { Scope };
