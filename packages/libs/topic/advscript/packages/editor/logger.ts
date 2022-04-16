import {
  defineMacro,
  defineMacroProvider,
  MacroHandler,
  MacroContext,
  Babel,
  MacroHelper
} from "vite-plugin-macro";
import { basename, join } from "path";
import { upperFirst } from "lodash";
import fs from "fs-extra";

class MacroLogger {
  callLog = (ctx: MacroContext, babel: Babel, helper: MacroHelper) => {
    const { path, args } = ctx;
    const { template, types } = babel;
    helper.prependImports({ moduleName: "@logger-helper", exportName: "render" });
    const { names, callArgs } = getNameAndArgs(args, ctx, path, types);
    if (!names.length) {
      names.push(basename(ctx.filepath));
    }
    const result = template.statement.ast(
      `console.log(...render("[${names.join(".")}]"), ${[...callArgs].join(",")})`
    );
    // path.replaceWith(types.callExpression())
    return result;
  };
  callTime = (ctx: MacroContext, babel: Babel, helper: MacroHelper) => {
    const { path, args } = ctx;
    const { template, types } = babel;
    helper.prependImports({ moduleName: "@logger-helper", exportName: "render" });
    const { names, callArgs } = getNameAndArgs(args, ctx, path, types);
    if (!names.length) {
      names.push(basename(ctx.filepath));
    }
    const [label, ...other] = callArgs;
    // eslint-disable-next-line no-eval
    const labelText = eval(label);
    const result = template.statement.ast(
      `console.info(...render("## ${labelText}: time ##")),
      console.time("cost"),
      console.log(${other.join(",")}),
      console.timeEnd("cost"),
      console.log(...render("## ${labelText}: timeEnd ##"));`
    );
    // path.replaceWith(types.callExpression())
    return [template.statement.ast("let temp = []"), result];
  };
}

const logger = new MacroLogger();

const log = defineMacro(`log`)
  .withCustomType(`export type Message = string | any`)
  .withSignature(`(message?: any, ...args: any[]): void`, `coloize console.log()`)
  .withHandler((ctx, babel, helper) => {
    if (!ctx.dev) {
      ctx.path.remove();
      return;
    }
    // @ts-ignore
    // ctx.modules?.setTag(ctx.filepath, "some_xyz");
    ctx.path.replaceWith(logger.callLog(ctx, babel, helper));
  });

const time = defineMacro(`time`)
  .withSignature(`(label: string, ...args: any[]): void`, `coloize console.time()`)
  .withHandler((ctx, babel, helper) => {
    if (!ctx.dev) {
      ctx.path.remove();
      return;
    }
    // @ts-ignore
    // ctx.modules?.setTag(ctx.filepath, "some_xyz");
    ctx.path.replaceWithMultiple(logger.callTime(ctx, babel, helper));
  });
const configPath = join(__dirname, "./app.json");

export default defineMacroProvider({
  id: "logger",
  exports: {
    "@logger": {
      macros: [log, time]
    },
    "@logger-helper": {
      code: fs
        .readFileSync(join(__dirname, "./helper.ts"))
        .toString()
        .replace(/:\s*\w+/g, "")
    }
  },
  hooks: {
    onStart: () => {
      // env.watcher?.add(configPath);
      // env.watcher?.on("change", (path) => {
      //   env.modules?.invalidateByTag(/^some/);
      // });
    }
  }
  // options: {
  //   parserPlugins: ["typescript"]
  // }
});
function getNameAndArgs(args, ctx: MacroContext, path, types) {
  let callArgs: string[];
  const names = [];
  if (args.length === 0) callArgs.push(JSON.stringify("World"));
  else {
    // const firstArg = args[0];
    // if (!firstArg.isStringLiteral()) throw new Error("please use literal string as message");
    // msg = firstArg.node.value;
    // args.map(o => o.getSource())
    callArgs = args.map((o) => ctx.code.slice(o.node.start, o.node.end));
  }
  let p = path.parentPath;
  do {
    if (types.isClass(p.node)) {
      const name = p.node.id?.name;
      names.unshift(`(class)${upperFirst(name || "anonymous")}`);
    }
    if (types.isFunctionDeclaration(p.node) || types.isFunctionExpression(p.node)) {
      const name = p.node.id?.name;
      names.unshift(`${upperFirst(name || "anonymous")}()`);
    }
    if (types.isClassMethod(p.node) || types.isObjectMethod(p.node)) {
      if (types.isIdentifier(p.node.key)) names.push(`${p.node.key?.name || "anonymous"}()`);
    }
    p = p.parentPath;
  } while (p);
  return { names, callArgs };
}
