/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ProjectConfig,
  CommandBuilder,
  CommandGroup,
  CommonBuilder,
  ConfigurationsOptions,
} from "./ProjectConfig";
import {
  BuilderOptionsCollection,
  InternalBuilder,
  BuilderName,
  BuilderOptions,
  getBuilderName,
} from "./getBuilder";

const defaultTemplate = {
  builder: "@nrwl/workspace:run-commands",
  options: {},
  configurations: {},
};

/**
 * 修改Configurations结构
 * @param builder 源builder
 * @param updateOptions 更新配置
 */
export function updateConfigurations<
  Source extends CommandBuilder<string> | CommonBuilder<unknown | InternalBuilder>
>(
  builder: Source,
  updateOptions: (configurations: ConfigurationsOptions<any>) => ConfigurationsOptions<any> | void
) {
  const { configurations = {} } = builder;
  builder.configurations = (updateOptions(configurations) || configurations) as any;
  return builder;
}

/**
 * 为项目追加命令行配置
 * @param project
 * @param callback
 */
export function appendCommand<
  Architects extends Record<string, any>,
  SourceCommandKey extends string,
  CommandKey extends string
>(
  project: ProjectConfig<any, Architects, SourceCommandKey>,
  callback: (
    source: Record<SourceCommandKey, CommandBuilder<SourceCommandKey>>
  ) => Record<CommandKey, string | string[]>
): ProjectConfig<any, Architects, SourceCommandKey & CommandKey>;
/**
 * 为项目追加命令行配置
 * @param project
 * @param callback
 */
export function appendCommand<
  Architects extends Record<string, any>,
  SourceCommandKey extends string,
  CommandKey extends string
>(
  project: ProjectConfig<any, Architects, SourceCommandKey>,
  commands: Record<CommandKey, string | string[]>
): ProjectConfig<any, Architects, SourceCommandKey & CommandKey>;
export function appendCommand<
  Architects extends Record<string, any>,
  SourceCommandKey extends string,
  CommandKey extends string
>(
  project: ProjectConfig<any, Architects, SourceCommandKey>,
  commands: Record<CommandKey, string | string[]> | ((...args: any[]) => any)
) {
  const { targets: architect } = project;
  const commandOpts: CommandBuilder<SourceCommandKey> = Object.assign(
    {},
    defaultTemplate,
    (architect || {}).command || defaultTemplate
  ) as any;

  // 收集组装完整参数
  const commandList: Record<CommandKey, string | string[]> =
    commands instanceof Function ? commands(commandOpts) : commands;
  architect.command = updateConfigurations(commandOpts, (configurations) => {
    Object.keys(commandList).forEach((key) => {
      const commandsOptions = commandList[key];
      configurations[key] = {
        commands: (commandsOptions instanceof Array ? commandsOptions : [commandsOptions]).map(
          (command) => {
            return {
              command,
            };
          }
        ),
      } as CommandGroup;
    });
  }) as any;
  project.targets = architect;
  return project as any;
}
