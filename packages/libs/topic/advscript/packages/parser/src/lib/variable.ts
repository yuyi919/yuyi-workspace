/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Node } from "ohm-js";
import { VariablePrefixKeyword } from "./interface/arithmetic";
import { ExpressionNodeData } from "./interface/Expression";
import { OperatorKeyword } from "./interface";

export function calcExpression(left: any, operator: OperatorKeyword, right: any) {
  switch (operator) {
    case "&&":
      return left && right;
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
export function createScope() {
  let GLOBAL: Record<string, any> = {},
    SAVE: Record<string, any> = {},
    SCOPES: Record<string, any>[] = [];
  let CURRENTSCOPE: Record<string, any> = {};

  function calculate(exp: ExpressionNodeData, node = 0) {
    if (!exp || !(exp instanceof Object)) return exp;
    switch (exp.type) {
      case "expression": {
        const value = exp.value;
        return calcExpression(calculate(value.left), value.operator, calculate(value.right));
      }
      case "variable":
        return calc_variable(exp.value, exp.prefix, node);
      case "value":
        return exp.value;
      case "array":
        // console.log(exp.value)
        return exp.value.map((data) => calculate(data, node));
      case "ArraySpread":
        const r = [];
        const start = calculate(exp.start);
        const end = calculate(exp.end) + 1;
        for (let i = start; i < end; i++) {
          r.push(i);
        }
        return r;
      default:
        //@ts-ignore
        throw Error(`Unrecognized type ${exp.type}`);
    }
  }

  function calc_variable(name: string | number, prefix: VariablePrefixKeyword, node: number) {
    switch (prefix) {
      case null:
        return findVariableValue(name, node).value;
      case "$":
        return GLOBAL[name];
      case "%":
        return SAVE[name];
      default:
        throw Error(`Unrecognized prefix ${prefix}`);
    }
  }

  function findVariableValue(name: string | number, node = 0) {
    let defined = false;
    let scope = null;
    const _SCOPES = [...SCOPES, CURRENTSCOPE];
    for (let i = _SCOPES.length - 1; i > -1; i--) {
      scope = _SCOPES[i];
      if (Object.prototype.hasOwnProperty.call(scope, name)) {
        defined = true;
        break;
      }
    }
    if (!defined) {
      throw Error(`${name} is not defined`);
    }
    return { scope, value: scope[name] };
  }

  function assign(name: string, prefix: string, value: any, explicit: any) {
    // console.log(GLOBAL, SAVE, SCOPES, CURRENTSCOPE)
    if (prefix) {
      if (prefix === "$") {
        GLOBAL[name] = value;
        // console.log("[global] %s", name, value);
      } else if (prefix === "%") {
        SAVE[name] = value;
        // console.log("[save] %s", name, value);
      }
    } else if (explicit) {
      const scope = CURRENTSCOPE;
      if (scope[name]) {
        throw Error(`Identifier '${name}' has already been declared`);
      } else {
        scope[name] = value;
        // console.log("[current] %s", name, value);
      }
    } else {
      const { scope } = findVariableValue(name, 0);
      scope[name] = value;
      // console.log("[scoped] %s", name, value);
    }
  }

  const ctl = {
    load() {
      GLOBAL = {};
      SAVE = {};
      SCOPES = [];
      CURRENTSCOPE = {};
    },
    get scoped() {
      return {
        GLOBAL,
        SAVE,
        SCOPES,
        CURRENTSCOPE,
      };
    },
    dump() {
      return {
        GLOBAL: GLOBAL,
        SAVE: SAVE,
        SCOPES: SCOPES,
        CURRENTSCOPE: CURRENTSCOPE,
      };
    },
    getGlobalScope() {
      return GLOBAL;
    },
    getSaveScope() {
      return SAVE;
    },
    getScope(node: number) {
      return [...SCOPES, CURRENTSCOPE][SCOPES.length - node];
    },
    setGlobalScope(scope: Record<string, any>) {
      GLOBAL = scope;
    },
    setSaveScope(scope: Record<string, any>) {
      SAVE = scope;
    },
    setScopes(scopes: Record<string, any>[]) {
      // SCOPES = SCOPES;
      ctl.popScope();
    },
    pushScope(scope: Record<string, any> = {}) {
      SCOPES.push(CURRENTSCOPE);
      CURRENTSCOPE = scope;
    },
    popScope() {
      CURRENTSCOPE = SCOPES.pop();
    },
    switchScope(scope: Record<string, any> = {}) {
      ctl.popScope();
      ctl.pushScope(scope);
    },
    calc(exp: any, node?: Node) {
      return calculate(exp);
    },
    assign(name: string, prefix: string, right: ExpressionNodeData, explicit: boolean) {
      const value = calculate(right);
      console.log(`set ${prefix || ""}${name}`, value, [...SCOPES, CURRENTSCOPE], {
        GLOBAL: GLOBAL,
        SAVE: SAVE
      });
      return assign(name, prefix, value, explicit);
    },
  };
  return ctl;
}

export interface Scope extends ReturnType<typeof createScope> {}
