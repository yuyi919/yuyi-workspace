import type { Types } from "@yuyi919/shared-types";
import Enquirer from "enquirer";
import { defaultsDeep, groupBy, merge, omit, get } from "lodash";
import yargs, { Options } from "yargs";
import { __decorate, __metadata } from "tslib";
import { createStaticMetaDataDecorators, MetaConfig } from "@yuyi919/shared-decorator";
import { loadConfig, saveConfig } from "./loadConfig";
import { BasePromptOptions, PromptOptions, TogglePromptOptions } from "./PromptType";

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
      return () => {
        const { meta = {} } = (x.getMeta("Option", target, propertyKey) ||
          {}) as MetaConfig<yargs.Options>;
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
        } as PromptOptions;
      };
    },
  },
  Option: {
    kind: "property",
    config: (target, options: Options) => {
      const { config, configParser, ...other } = options;
      return {
        ...other,
        config,
        configParser: config
          ? (configPath) => {
              try {
                return { [FROM_CONFIG]: (configParser || loadConfig)(configPath) };
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

/**
 * 反射配置Prompt
 * @param Target 配置的class
 * @param initialWithCommandLine 来自命令行的参数
 * @param namespace 配置项命名空间
 */
export function collectPrompt<T>(
  Target: Types.ConstructorType<T>,
  initialWithCommandLine: Partial<T>,
  namespace?: string
) {
  const options: PromptOptions[] = [];
  const metas = x.getMeta("Prompt", Target);
  if (metas) {
    for (const { name, meta: metaFactory } of metas) {
      const meta = metaFactory();
      const { meta: { name: groupName } = {} as any } = x.getMeta("Group", Target, name) || {};
      const namepath = [namespace, name].filter(Boolean).join(".");
      options.push({
        name: namepath,
        ...meta,
        result: async (value: string) => {
          value = await ((meta as BasePromptOptions).result?.(value) ?? value);
          if (typeof value === "string" && value.length === 0) {
            return void 0;
          }
          return value;
        },
        message: [groupName ? `[${groupName}]` : void 0, meta.message].filter(Boolean).join(" "),
        // 命令行参数优先于配置
        initial: get(initialWithCommandLine, namepath, meta.initial),
      } as PromptOptions);
    }
  }
  const references = x.getMeta("Ref", Target);
  if (references) {
    for (const { name, meta } of references) {
      options.push(...collectPrompt(meta(), initialWithCommandLine, name));
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
  namespace?: string,
  defaultCollection = {} as Partial<T & O>
): yargs.Argv<O & T> {
  const named = (name: string) => (namespace ? namespace + "." + name : name);
  const metas = x.getMeta("Option", Target);
  if (metas) {
    for (const { name, meta } of metas) {
      const { default: initial } = meta;
      /**
       * 为什么要这么做？
       * 因为配置项来源有两种，命令行或配置文件
       * 由于命令行的传递配置的优先级最高，如果给yargs提供默认值，则对于解析得到的配置项
       * 无法判断是未输入提供的默认值还是命令行输入
       * 因此需要分离默认值步骤，在默认匹配配置文件之后再进行默认值的匹配
       */
      // 判断是否配置了默认值，且该配置项不被作为配置文件地址
      if (initial !== void 0 && !meta.config) {
        yargs = yargs.options(named(name), {
          ...meta,
          // 不将默认值传递给yargs，后续自行处理
          default: void 0,
          // 但是还是得展示默认值
          defaultDescription: initial,
        });
        defaultCollection[name] = initial;
      } else {
        yargs = yargs.options(named(name), meta);
      }
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
    // console.log(Target.name, references);
    for (const { name, meta } of references) {
      const refTarget = meta();
      const namespace = x.getMeta("Namespace", refTarget);
      const namespaceKey = namespace?.meta.key;
      const childCollection = (defaultCollection[name as keyof (T & O)] = {} as any);
      // console.log("Namespace", name, RefTarget.name)
      yargs = setupYargsWith(yargs, meta(), namespaceKey || name, childCollection);
    }
  }
  return yargs as yargs.Argv<O & T>;
}

export class Cli<T extends { config?: string }, O extends {}> {
  private _parser: yargs.Argv<O & T & { [FROM_CONFIG]?: Partial<T> }>;
  public get parser(): yargs.Argv<O & T> {
    return this._parser;
  }
  public configObj: T & O;
  public fromConfig: Partial<T & O>;
  /**
   *
   * @param yargs
   * @param Target 反射类
   * @param defaultOptions 默认配置项
   */
  constructor(
    yargs: yargs.Argv<O>,
    public Target: Types.ConstructorType<T>,
    private defaultOptions: Partial<T & O> = {}
  ) {
    this._parser = setupYargsWith<T, O>(
      yargs,
      Target,
      void 0,
      this.defaultOptions
    ).parserConfiguration({
      "strip-aliased": true,
    }) as yargs.Argv<O & T & { [FROM_CONFIG]: Partial<T> }>;
    let { $0, _, [FROM_CONFIG]: $fromConfig, ...other } = this._parser.help(false).parse() as any;
    this.configObj = x.transform(other, Target) as any;
    this.fromConfig = $fromConfig;
    this.append = this.append.bind(this);
    this.setupPrompt = this.setupPrompt.bind(this);
    // 读取命令行参数，匹配配置文件，最后再匹配默认值
    defaultsDeep(this.configObj, this.fromConfig, this.defaultOptions);
  }

  append<Namespaces extends Record<string, any>>(
    namespaces = {} as { [K in keyof Namespaces]: Types.ConstructorType<Namespaces[K]> }
  ) {
    for (const key in namespaces) {
      __decorate(
        [x.Ref(() => namespaces[key]), __metadata("design:type", namespaces[key])],
        this.Target.prototype,
        key
      );
      this._parser = setupYargsWith(this._parser, this.Target, void 0, this.defaultOptions);
    }
    // 读取命令行参数，匹配配置文件，最后再匹配默认值
    defaultsDeep(this.configObj, this.fromConfig, this.defaultOptions);
    return this as unknown as Cli<T & Namespaces, O>;
  }

  /**
   * cli收集配置项Prompt
   * 如果命令行参数中提供了对应参数，会取代配置的默认值（反应在Prompt展示的初始值）
   */
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
        this.fromConfig = (await setupPrompt(Target, configObj)) as T & O;
      }
      // 整合配置文件内容
      this.fromConfig = defaultsDeep(configObj, this.fromConfig, this.defaultOptions);
      if (create) saveConfig(config, omit(configObj, "config"));
    }
    return configObj;
  }
}

export function setupYargs<T extends { config?: string }, O extends {}>(
  yargs: yargs.Argv<O>,
  Target: Types.ConstructorType<T>
) {
  const store = new Cli<T, O & { help?: boolean }>(yargs, Target);
  return [store.configObj, store] as const;
}
