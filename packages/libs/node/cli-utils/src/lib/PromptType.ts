import type { EventEmitter } from "events";

export interface BasePromptOptions {
  name: string | (() => string);
  type: string | (() => string);
  message: string | (() => string) | (() => Promise<string>);
  initial?: any;
  required?: boolean;
  format?(value: string): string | Promise<string>;
  result?(value: string): string | Promise<string>;
  skip?: ((state: object) => boolean | Promise<boolean>) | boolean;
  validate?(value: string): boolean | Promise<boolean> | string | Promise<string>;
  onSubmit?(name: string, value: any, prompt: Prompt<any>): boolean | Promise<boolean>;
  onCancel?(name: string, value: any, prompt: Prompt<any>): boolean | Promise<boolean>;
  stdin?: NodeJS.ReadStream;
  stdout?: NodeJS.WriteStream;
}

export interface Choice {
  name: string;
  message?: string;
  value?: string;
  hint?: string;
  disabled?: boolean | string;
}

export interface ArrayPromptOptions extends BasePromptOptions {
  type:
    | "autocomplete"
    | "editable"
    | "form"
    | "multiselect"
    | "select"
    | "survey"
    | "list"
    | "scale";
  choices: string[] | Choice[];
  maxChoices?: number;
  muliple?: boolean;
  initial?: number | string;
  delay?: number;
  separator?: boolean;
  sort?: boolean;
  linebreak?: boolean;
  edgeLength?: number;
  align?: "left" | "right";
  scroll?: boolean;
}

export interface BooleanPromptOptions extends BasePromptOptions {
  type: "confirm";
  initial?: boolean;
}

export interface StringPromptOptions extends BasePromptOptions {
  type: "input" | "invisible" | "list" | "password" | "text";
  initial?: string;
  multiline?: boolean;
}

export interface NumberPromptOptions extends BasePromptOptions {
  type: "numeral";
  min?: number;
  max?: number;
  delay?: number;
  float?: boolean;
  round?: boolean;
  major?: number;
  minor?: number;
  initial?: number;
}

export interface SnippetPromptOptions extends BasePromptOptions {
  type: "snippet";
  newline?: string;
  template?: string;
}

export interface SortPromptOptions extends BasePromptOptions {
  type: "sort";
  hint?: string;
  drag?: boolean;
  numbered?: boolean;
}

export interface TogglePromptOptions extends Omit<BasePromptOptions, "result"> {
  type: "toggle";
  enabled?: string;
  disabled?: string;
  initial?: boolean;
  result?: (value: boolean) => boolean;
}

export type PromptOptions =
  | ArrayPromptOptions
  | BooleanPromptOptions
  | StringPromptOptions
  | NumberPromptOptions
  | SnippetPromptOptions
  | SortPromptOptions
  | TogglePromptOptions;

export declare class BasePrompt<T> extends EventEmitter {
  constructor(options?: PromptOptions);

  render(): void;

  run(): Promise<T>;
}

export declare class Enquirer<T = object> extends EventEmitter {
  constructor(options?: object, answers?: T);

  /**
   * Register a custom prompt type.
   *
   * @param type
   * @param fn `Prompt` class, or a function that returns a `Prompt` class.
   */
  register(type: string, fn: typeof BasePrompt | (() => typeof BasePrompt)): this;

  /**
   * Register a custom prompt type.
   */
  register(type: { [key: string]: typeof BasePrompt | (() => typeof BasePrompt) }): this;

  /**
   * Prompt function that takes a "question" object or array of question objects,
   * and returns an object with responses from the user.
   *
   * @param questions Options objects for one or more prompts to run.
   */
  prompt(
    questions:
      | PromptOptions
      | ((this: Enquirer) => PromptOptions)
      | (PromptOptions | ((this: Enquirer) => PromptOptions))[]
  ): Promise<T>;

  /**
   * Use an enquirer plugin.
   *
   * @param plugin Plugin function that takes an instance of Enquirer.
   */
  use(plugin: (this: this, enquirer: this) => void): this;
}

export declare class Prompt<T> extends BasePrompt<T> {}

declare module "enquirer" {
  namespace Enquirer {
    function prompt<T = object>(
      questions:
        | PromptOptions
        | ((this: Enquirer) => PromptOptions)
        | (PromptOptions | ((this: Enquirer) => PromptOptions))[]
    ): Promise<T>;
  }
  // @ts-ignore
  export = Enquirer;
}
