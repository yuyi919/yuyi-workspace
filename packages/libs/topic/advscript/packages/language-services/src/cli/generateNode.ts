import { compile, Machine, parse } from "jssm";
import {
  JssmCompileSe,
  JssmCompileSeStart,
  JssmGenericConfig,
  JssmParseTree,
} from "jssm/jssm_types";
import { camelCase, upperFirst } from "lodash";
import type {
  IndentNode,
  CompositeGeneratorNode,
  NewLineNode,
} from "langium/lib/generator/generator-node";
import { generateWith } from "./generateWith";
import type { GeneratorContext } from "./generator";

export function generateNode(text: string, fileName: string, opts: GenerateOptions) {
  const LightAction = {} as Record<string, number>;
  const LightState = {} as Record<string, number>;
  const LightData = generate(text, {
    actions: LightAction,
    states: LightState,
  }) as JssmGenericConfig<any>;
  const ctx = generateWith(LightData, fileName, opts.destination, (ctx) => {
    const { fileNode, NL } = ctx;
    fileNode.append(`import type { JssmGenericConfig } from "jssm/jssm_types"`, NL);
    fileNode.append(`import { Machine } from "jssm"`, NL, NL);
    const name = toIdentifierName(LightData.machine_name);
    const stateEnumName = newEnum(ctx, LightState, "export const enum", name + "State");
    fileNode.append(NL);
    const actionEnumName = newEnum(ctx, LightAction, "export const enum", name + "Action");
    fileNode.append(NL);
    newClass(
      ctx,
      {
        "static create<T>()": (node) => {
          node.append(`return new ${name}<T>((${JSON.stringify(LightData)}) as any);`, NL);
        },
        "fsm!: Machine<T>": false,
        "constructor(config: JssmGenericConfig<T>)": (node) => {
          node.append(`this.fsm = new Machine<T>(config);`, NL);
        },
        "checkState()"(node) {
          node.append(`const state = this.fsm.state() as unknown as ${stateEnumName};`, NL);
          const inputName = "state";
          appendEnumSwitch(node, inputName, NL, LightState, stateEnumName, "未知状态！");
        },
        [`static checkAction(action: ${actionEnumName})`](node) {
          appendEnumSwitch(node, "action", NL, LightAction, actionEnumName, "未设定的动作！");
        },
        ...Object.fromEntries(
          Object.keys(LightAction).map((key) => [
            `${camelCase(key)}()`,
            node => node.append(`return this.fsm.action(${LightAction[key]} as unknown as string); // ${actionEnumName}.${key}`, NL),
          ])
        ),
        ...Object.fromEntries(
          Object.getOwnPropertyNames(Machine.prototype)
            .filter((key) => key !== "constructor" && !/_/.test(key))
            .map((key) => [`${key}: Machine<T>['${key}']`, `(...args) => this.fsm.${key}(...args)`])
        ),
      },
      "export class",
      name + "<T>"
    );
  });
  return ctx;
}

export type GenerateOptions = {
  destination?: string;
};

function appendEnumSwitch(
  node: IndentNode,
  inputName: string,
  NL: NewLineNode,
  enumDto: Record<string, number>,
  enumDtoName: string,
  errorMsg: string
) {
  node.append(`switch (${inputName}) {`, NL);
  node.indent((node) => {
    for (const [key, value] of Object.entries(enumDto)) {
      node.append(`case ${value}: return "${key}"; // ${value} = ${enumDtoName}.${key}`, NL);
    }
    node.append(`default: throw Error("${errorMsg}")`, NL);
  });
  node.append("}", NL);
}

function toIdentifierName(str: string) {
  return upperFirst(camelCase(str));
}
function newClass(
  { NL, fileNode }: GeneratorContext<any>,
  data: Record<string, string | false | ((indentNode: IndentNode) => void)>,
  type: string,
  name: string
) {
  fileNode.append(`${type} ${name} {`, NL);
  fileNode.indent((body) => {
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Function) {
        body.append(key + " {", NL);
        body.indent(value);
        body.append("}", NL, NL);
      } else if (value !== false) {
        body.append(`${key} = ${value}`, NL, NL);
      } else {
        body.append(`${key}`, NL, NL);
      }
    }
  });
  fileNode.append(`}`, NL);
}
function newEnum(
  { NL, fileNode }: GeneratorContext<any>,
  data: Record<string, number>,
  type: string,
  name: string
) {
  fileNode.append(`${type} ${name} {`, NL);
  fileNode.indent((body) => {
    let has = false;
    for (const [key, value] of Object.entries(data).sort((a, b) => a[1] - b[1])) {
      if (!has && value > 0) {
        body.append(`${key} = ${value},`, NL);
      } else {
        body.append(`${key},`, NL);
      }
      has = true;
    }
  });
  fileNode.append(`}`, NL);
  return name;
}

export function generate(str: string, context: Context = { actions: {}, states: {} }) {
  const data = parse(str) as JssmParseTree;
  const tree = data.map((o: JssmCompileSeStart<any>) => {
    if (o.key === "transition") {
      return {
        ...o,
        from: wrap(o.from, context.states), // instanceof Array ? o.from.map((o) => parseInt(o)) : parseInt(o.from),
        se: wrapSe(o.se, context),
      };
    }
    return o;
  }) as JssmParseTree;
  // for (const key in context.actions) {
  //   const v = context.actions[key];
  //   context.actions[v] = key as any;
  // }
  // for (const key in context.states) {
  //   const v = context.states[key];
  //   context.states[v] = key as any;
  // }
  return compile(tree);
}

type Context = {
  actions: Record<string, number>;
  states: Record<string, number>;
};

function wrapSe(a: JssmCompileSe, context: Context) {
  const r = {
    ...a,
    to: wrap(a.to, context.states),
  } as JssmCompileSe;
  if (a.l_action) {
    r.l_action = wrap(a.l_action, context.actions, 1);
  }
  if (a.r_action) {
    r.r_action = wrap(a.r_action, context.actions, 1);
  }
  if (a.se) {
    r.se = wrapSe(a.se, context);
  }
  return r;
}

function wrap(a: any, map: Record<string, number>, start = 0) {
  if (a instanceof Array) {
    return a.map((a) => wrap(a, map));
  }
  if (a in map) {
    return map[a];
  }
  const mas = Object.values(map);
  const r = (map[a] = Math.max(start - 1, ...mas) + 1);
  return r;
}
