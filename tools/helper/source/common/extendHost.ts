import { SchematicContext } from "@angular-devkit/schematics";
import { Rule, Tree } from "@angular-devkit/schematics";
/**
 * 继承Tree去构建工作流
 * @param rule
 */

export function extendHost(rule: (host: Tree, context: SchematicContext) => Rule | Promise<Rule>) {
  return (host: Tree, context: SchematicContext) => rule(host, context);
}
