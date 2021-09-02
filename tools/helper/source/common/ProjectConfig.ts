import { ProjectType } from "@nrwl/workspace";
import { InternalBuilder, BuilderOptions } from "./getBuilder";

export interface ProjectConfig<
  Builder extends unknown | InternalBuilder = unknown,
  Architects extends Record<string, any> = Record<string, any>,
  CommandKey extends string = string
> {
  /**
   * 项目根目录
   */
  root: string;
  /**
   * 项目源目录
   */
  sourceRoot?: string;
  /**
   * 项目类型
   */
  projectType?: ProjectType | "application" | "library";
  /**
   * 运行指令集合
   */
  targets: {
    build?: CommonBuilder<Builder>;
  } & Architects &
    CommandArchitect<CommandKey>;
}
export type CommandArchitect<Key extends string> = {
  command?: CommandBuilder<Key>;
};
export type ConfigurationsOptions<Options extends Record<string, any>> = Record<
  string,
  Partial<Options>
>;
export interface CommonBuilder<Builder extends unknown | InternalBuilder> {
  builder: string;
  options: BuilderOptions<Builder>;
  configurations: ConfigurationsOptions<BuilderOptions<Builder>>;
}

export type CommandBuilder<Key extends string> = {
  builder: "@nrwl/workspace:run-commands";
  options: CommandGroup &
    {
      [key in Key]: any;
    };
  configurations: {
    [key in Key]: CommandGroup;
  };
};
export type CommandGroup = {
  commands?: CommandOptions[];
};
type CommandOptions = { command: string };
export interface WorkspaceJson {
  projects: Record<string, ProjectConfig>;
}
