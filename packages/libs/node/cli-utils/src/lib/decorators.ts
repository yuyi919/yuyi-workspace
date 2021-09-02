import type { Types } from "@yuyi919/shared-types";
import Enquirer from "enquirer";
import { defaultsDeep, groupBy, merge, omit, get } from "lodash";
import yargs, { Options } from "yargs";
import { __decorate, __metadata } from "tslib";
import { createStaticMetaDataDecorators, MetaArrayItem } from "./factory";
import { loadConfig, saveConfig } from "./loadConfig";
import { PromptOptions, TogglePromptOptions } from "./PromptType";

export declare function MetaDataDecorators<T>(options: T, metadata?: unknown): PropertyDecorator;

const FROM_CONFIG = "$_fromConfig_";
export const x = createStaticMetaDataDecorators("YARGS", {
  Group: {
    kind: "property",
    config: (target, name: string) => {
      return { name };
    },
  },
  /**
   * 配置项参照enquirer，部分配置可以自动继承x.Option
   */
  Prompt: {
    kind: "property",
    config: ({ target, propertyKey }, promptOpt?: Partial<PromptOptions>) => {
      const { meta = {} } = (x.getMeta("Option", target, propertyKey) ||
        {}) as MetaArrayItem<yargs.Options>;
      const {
        required = meta.requiresArg,
        message = meta.description,
        initial = meta.default,
        type: $type,
        ...other
      } = promptOpt || {};
      let type: PromptOptions["type"] | "toggle" = $type;
      if (type === void 0) {
        type =
          meta.type === "string"
            ? "text"
            : meta.type === "number"
            ? "numeral"
            : meta.type === "boolean"
            ? "toggle"
            : "input";
        if (type === "toggle") {
          Object.assign(other, {
            enabled: "是",
            disabled: "否",
            initial: initial ? "是" : "否",
          });
        }
      }
      return {
        required,
        message,
        type,
        initial,
        ...other,
      };
    },
  },
  Option: {
    kind: "property",
    config: (target, options: Options) => {
      const { config, configParser = loadConfig, ...other } = options;
      return {
        ...other,
        config,
        configParser: config
          ? (configPath) => {
              try {
                return { [FROM_CONFIG]: configParser(configPath) };
              } catch (error) {
                return {};
              }
            }
          : void 0,
      } as Options;
    },
  },
  Namespace: {
    kind: "constructor",
    config: (target, key: string, promptOpt?: Omit<PromptOptions, "name">) => {
      return { ["x-prompt"]: promptOpt, key };
    },
  },
  Ref: {
    kind: "property",
    config: (target, Type: () => Types.ConstructorType<any>) => {
      return Type;
    },
  },
});

export function collectPrompt<T>(
  Target: Types.ConstructorType<T>,
  patchInitial: Partial<T>,
  namespace?: string
) {
  const options: PromptOptions[] = [];
  const metas = x.getMeta("Prompt", Target);
  if (metas) {
    for (const { name, meta } of metas) {
      const { meta: { name: groupName } = {} as any } = x.getMeta("Group", Target, name) || {};
      const namepath = [namespace, name].filter(Boolean).join(".");
      options.push({
        name: namepath,
        ...meta,
        result: (value: any) => {
          value = meta.result?.(value as never) ?? value;
          if (typeof value === "string" && value.length === 0) {
            return void 0;
          }
          return value;
        },
        message: [groupName ? `[${groupName}]` : void 0, meta.message].filter(Boolean).join(" "),
        initial: get(patchInitial, namepath, meta.initial),
      } as PromptOptions);
    }
  }
  const references = x.getMeta("Ref", Target);
  if (references) {
    for (const { name, meta } of references) {
      options.push(...collectPrompt(meta(), patchInitial, name));
    }
  }
  return options;
}
/**
 *
 * @param Target
 * @param patchInitial
 * @returns
 */
export function setupPrompt<T>(
  Target: Types.ConstructorType<T>,
  patchInitial?: Partial<T>
): Promise<T> {
  const options: PromptOptions[] = collectPrompt(Target, patchInitial);
  if (options.length > 0) return Enquirer.prompt<T>(options);
}
/**
 *
 * @param yargs
 * @param Target
 * @param namespace
 * @returns
 */
export function setupYargsWith<T, O extends {}>(
  yargs: yargs.Argv<O>,
  Target: Types.ConstructorType<T>,
  namespace?: string
): yargs.Argv<O & T> {
  const named = (name: string) => (namespace ? namespace + "." + name : name);
  const metas = x.getMeta("Option", Target);
  if (metas) {
    for (const { name, meta } of metas) {
      yargs = yargs.options(named(name), meta);
    }
  }
  for (const [groupName, propertys] of Object.entries(
    groupBy(x.getMeta("Group", Target), ({ meta }) => meta.name)
  )) {
    if (propertys.length > 0)
      yargs = yargs.group(
        propertys.map((propertys) => named(propertys.name)),
        groupName
      );
  }
  const references = x.getMeta("Ref", Target);
  if (references) {
    for (const { name, meta } of references) {
      const Namespace = x.getMeta("Namespace", Target);
      yargs = setupYargsWith(yargs, meta(), Namespace?.meta.key ?? name);
    }
  }
  return yargs as yargs.Argv<O & T>;
}

export class YargsStore<T extends { config?: string }, O extends {}> {
  public parser: yargs.Argv<O & T & { [FROM_CONFIG]: Partial<T> }>;
  public configObj: T;
  public fromConfig: Partial<T>;
  constructor(yargs: yargs.Argv<O>, public Target: Types.ConstructorType<T>) {
    this.parser = setupYargsWith<T, O>(yargs, Target).parserConfiguration({
      "strip-aliased": true,
    }) as yargs.Argv<O & T & { [FROM_CONFIG]: Partial<T> }>;
    let { $0, _, [FROM_CONFIG]: $fromConfig, ...other } = this.parser.parse() as any;
    this.configObj = x.transform(other, Target);
    this.fromConfig = $fromConfig;
    this.append = this.append.bind(this);
    this.setupPrompt = this.setupPrompt.bind(this);
    defaultsDeep(this.configObj, this.fromConfig);
  }

  append<Namespaces extends Record<string, any>>(
    namespaces = {} as { [K in keyof Namespaces]: Types.ConstructorType<Namespaces[K]> }
  ) {
    for (const key in namespaces) {
      this.parser = setupYargsWith(this.parser, namespaces[key], key);
      __decorate(
        [x.Ref(() => namespaces[key]), __metadata("design:type", namespaces[key])],
        this.Target.prototype,
        key
      );
    }
    return this as unknown as YargsStore<T & Namespaces, O>;
  }

  async setupPrompt() {
    const { configObj, Target } = this;
    let { config } = this.configObj;
    if (config && this.fromConfig === void 0) {
      const { create } = await Enquirer.prompt<{ create: boolean }>({
        type: "toggle",
        name: "create",
        message: `未找到配置文件，是否自动生成(${config})？`,
        initial: false,
        enabled: "否",
        disabled: "是",
        result: (v) => !v,
      } as TogglePromptOptions);
      if (create) {
        this.fromConfig = await setupPrompt(Target, configObj as T);
      }
      this.fromConfig = merge(configObj, this.fromConfig);
      if (create) saveConfig(config, omit(configObj, "config"));
    }
    return configObj;
  }
}

export function setupYargs<T extends { config?: string }, O extends {}>(
  yargs: yargs.Argv<O>,
  Target: Types.ConstructorType<T>
) {
  const store = new YargsStore(yargs, Target);
  return [store.configObj, store] as const;
}
