/* eslint-disable no-inner-declarations */
import ts from "typescript";
import { x } from ".";
import { readFileSync } from "fs-extra";
import { AstUtils } from "@yuyi919-ts-transformer/ast-utils";
import { getBaseType, TypeDefine } from "./TypeDefine";
import { defaults } from "lodash";

const { getKeyNameStrFromNode, getLeafKeyNameStrFromNode } = AstUtils;

export type Definition = {
  kind: DefinitionType;
  name: string;
  description?: string;
  comments?: string;
  tags?: AstUtils.Comment.TagCollection[];
  members: Record<string, DefinitionMember>;
};
export interface DefinitionMember {
  kind?: DefinitionMemberType;
  name: string;
  label?: string;
  description?: string;
  comments?: string;
  default?: any;
  type?: TypeDefine | TypeDefine[];
  tags: AstUtils.Comment.TagCollection[];
}

export enum DefinitionType {
  Plugin = "plugin",
  Args = "args",
  Struct = "struct",
  Enum = "enum",
}

export enum DefinitionMemberType {
  Param = "param",
  Command = "command",
}

const decoratorMaps = {
  Plugin: nameof.full(x.Plugin),
  Struct: nameof.full(x.Struct),
  Args: nameof.full(x.Args),
  Arg: nameof.full(x.Arg),
  ArgDto: nameof.full(x.ArgDto),
  Property: nameof.full(x.Param),
  Label: nameof.full(x.Text),
  Type: nameof.full(x.Type),
  Method: nameof.full(x.Command),
};

export function extract(path: string) {
  return extractCode(readFileSync(path).toString());
}
export function extractCode(code: string) {
  const sourceFile = ts.createSourceFile("", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const collectMap: Record<string, Definition> = {};
  ts.transform(sourceFile, [extractor(collectMap)]);
  return collectMap;
}
export function extractor(
  collectMap: Record<string, Definition>
): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile) => {
    function visitor(node: ts.Node) {
      if (ts.isTypeAliasDeclaration(node) && ts.isUnionTypeNode(node.type)) {
        const types = getBaseType(node.type);
        if (
          types instanceof Array &&
          (types.every((o) => o.name === "literal" && o.type === "number") ||
            types.every((o) => o.name === "literal" && o.type === "string"))
        ) {
          const enumName = node.name.text;
          // console.log(enumName, types)
          const enumCollect: Definition = {
            name: enumName,
            kind: DefinitionType.Enum,
            members: {},
          };
          types.forEach((member) => {
            const value = eval(member.text);
            const barTokenNode = AstUtils.Comment.markBarTokenWithTypeNode(member.node);
            const { comments, tags, description } = extractMetaInfo(sourceFile, barTokenNode);
            const name = description?.trim() || value;
            const memberCollection: DefinitionMember = {
              name,
              comments,
              tags,
              description,
              default: value,
            };
            enumCollect.members[name] = memberCollection;
          });
          collectMap[enumName] = enumCollect;
        }
      } else if (ts.isEnumDeclaration(node)) {
        const enumName = node.name.text;
        const enumCollect: Definition = {
          name: enumName,
          kind: DefinitionType.Enum,
          members: {},
        };
        node.members.forEach((member) => {
          const name = member.name.getText();
          const { comments, tags, description } = extractMetaInfo(sourceFile, member);
          const memberCollection: DefinitionMember = {
            name,
            comments,
            tags,
            description,
            default: eval(member.initializer?.getText() || "undefined"),
          };
          enumCollect.members[name] = memberCollection;
        });
        collectMap[enumName] = enumCollect;
      } else if (ts.isClassDeclaration(node)) {
        const classDecorator = node.decorators?.find((o) =>
          [decoratorMaps.Struct, decoratorMaps.Plugin, decoratorMaps.Args].includes(
            getKeyNameStrFromNode(o.expression)
          )
        );
        const classTypeKey = classDecorator && getLeafKeyNameStrFromNode(classDecorator.expression);
        if (classTypeKey && classTypeKey in DefinitionType) {
          const { comments, tags, description } = extractMetaInfo(sourceFile, node);
          const className = getKeyNameStrFromNode(node.name);
          const classCollection: Definition = {
            name: className,
            kind: DefinitionType[classTypeKey],
            members: {},
            comments,
            tags,
            description,
          };
          const collect = (member: ts.Node) => {
            if (
              (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member)) &&
              member.decorators?.length > 0
            ) {
              const name = getKeyNameStrFromNode(member.name as ts.Identifier);
              const { comments, tags, description } = extractMetaInfo(sourceFile, member);
              const memberCollection: DefinitionMember = { name, comments, tags, description };
              for (const decorator of member.decorators) {
                const nameText = getKeyNameStrFromNode(decorator.expression);
                if (nameText === decoratorMaps.Property) {
                  memberCollection.kind = DefinitionMemberType.Param;
                  classCollection.members[name] = memberCollection;
                } else if (nameText === decoratorMaps.Method) {
                  memberCollection.kind = DefinitionMemberType.Command;
                  classCollection.members[name] = memberCollection;
                } else if (
                  nameText === decoratorMaps.Label &&
                  ts.isCallExpression(decorator.expression)
                ) {
                  const labelNode = decorator.expression.arguments[0];
                  if (ts.isStringLiteral(labelNode)) {
                    memberCollection.label = labelNode.text;
                  }
                } else if (
                  nameText === decoratorMaps.Type &&
                  ts.isCallExpression(decorator.expression)
                ) {
                  const labelNode = decorator.expression.arguments[0];
                  if (labelNode && ts.isStringLiteral(labelNode)) {
                    tags.push({ name: "type", value: labelNode.text });
                  }
                }
              }
              if (ts.isPropertyDeclaration(member)) {
                if (member.initializer && AstUtils.isLiteralExpr(member.initializer)) {
                  memberCollection.default = member.initializer.getText();
                } else if (
                  member.initializer &&
                  AstUtils.isObjectOrArrayLiteralExpr(member.initializer)
                ) {
                  memberCollection.default = member.initializer.getText();
                } else {
                  memberCollection.default =
                    tags.find((o) => o.name === "default")?.value ?? member.initializer?.getText();
                }
                if (typeof memberCollection.default === "string")
                  memberCollection.default = memberCollection.default.replace(
                    /^("|')|("|')$/g,
                    ""
                  );

                if (!memberCollection.type && member.type) {
                  const type = getBaseType(member.type);
                  memberCollection.type = type;
                }
                return member;
              } else if (ts.isMethodDeclaration(member)) {
                const tmpArgsCollection: {
                  name: string;
                  param: ts.ParameterDeclaration;
                  type?: string;
                }[] = [];
                for (const param of member.parameters || []) {
                  // 检查参数装饰器
                  const argDecorator = param.decorators?.find(
                    (d) =>
                      [decoratorMaps.Arg, decoratorMaps.ArgDto].includes(
                        getKeyNameStrFromNode(d.expression)
                      ) &&
                      ts.isCallExpression(d.expression) &&
                      d.expression?.arguments?.[0]
                  ) as ts.Decorator & {
                    expression: ts.CallExpression;
                  };
                  if (argDecorator) {
                    const callMessage = argDecorator.expression;
                    const decoratorName = getKeyNameStrFromNode(argDecorator.expression);
                    if (
                      // 取最后一个@x.ArgDto实现类型反射
                      decoratorName === decoratorMaps.ArgDto &&
                      ts.isArrowFunction(callMessage.arguments[0])
                    ) {
                      if (member.parameters?.[0]) {
                        const type = getBaseType(member.parameters[0].type);
                        memberCollection.type = type;
                      }
                    } else if (
                      // @x.Arg，收集字段分散映射
                      decoratorName === decoratorMaps.Arg &&
                      ts.isStringLiteral(callMessage.arguments[0])
                    ) {
                      tmpArgsCollection.push({
                        name: eval(callMessage.arguments[0].getText()),
                        param: param,
                        type:
                          callMessage.arguments[1] &&
                          ts.isStringLiteral(callMessage.arguments[1]) &&
                          eval(callMessage.arguments[1].getText()),
                      });
                    }
                  }
                }
                if (tmpArgsCollection.length > 0) {
                  const argDtoName = memberCollection.name + "_" + "args";
                  const args: Definition = {
                    name: argDtoName,
                    kind: DefinitionType.Args,
                    members: tmpArgsCollection.reduce((r, { name, param, type }) => {
                      const paramTags: AstUtils.Comment.TagCollection[] = [];
                      const paramTag = tags.find((o) => o.name === "param" && o.paramName === name);
                      if (typeof type === "string") {
                        paramTags.push({ name: "type", value: type });
                      }
                      const paramType = !type && getBaseType(param.type);
                      return {
                        ...r,
                        [name]: {
                          name,
                          kind: DefinitionMemberType.Param,
                          label: paramTag?.value,
                          comments: paramTag?.value,
                          type: paramType,
                          tags: paramTags,
                          default:
                            param.initializer &&
                            AstUtils.isLiteralExpr(param.initializer) &&
                            param.initializer.getFullText(),
                        } as DefinitionMember,
                      };
                    }, {}),
                    comments,
                    tags,
                    description,
                  };
                  // console.log(tmpArgsCollection);
                  collectMap[args.name] = args;
                  memberCollection.type = {
                    name: argDtoName,
                    text: argDtoName,
                    type: "reference",
                    defineText: argDtoName,
                  };
                }

                return member;
              }
            }
            return ts.visitEachChild(member, collect, context);
          };
          ts.visitNode(node, collect);
          collectMap[className] = classCollection;
        }
        return node;
      }
      return ts.visitEachChild(node, visitor, context);
    }
    return ts.visitNode(sourceFile, visitor);
  };
}

export function extractMetaInfo(sourceFile: ts.SourceFile, member: ts.Node) {
  const { tags, comments } = AstUtils.Comment.extractComment(member, sourceFile);
  const description = tags.find((o) => o.name === "description")?.value || comments;
  return { comments, tags, description };
}

export function getTypeTag(
  member: DefinitionMember
): AstUtils.Comment.TagCollection & { defineTypeText: string } {
  const typeTag = member.tags.find(({ name }) => name === "type");
  const [typeDefine] = member.type instanceof Array ? member.type : [member.type];
  if (typeTag) {
    return { ...typeTag, defineTypeText: typeDefine?.defineText };
  }
  let value: string;
  if (typeDefine) {
    if (typeDefine.type === "keyword") {
      value = typeDefine.name;
    } else if (typeDefine.type === "reference") {
      const elm = typeDefine.element?.[0];
      value = elm ? `struct<${elm.text}>[]` : `struct<${typeDefine.text}>`;
    } else {
      value = typeDefine.type;
    }
  }
  return {
    name: "type",
    value: value || "string",
    defineTypeText:
      typeDefine &&
      (typeDefine.name === "array"
        ? typeDefine.element?.find((o) => o.defineText)?.defineText
        : typeDefine?.defineText),
  };
}

export function getDefaultTag(
  member: DefinitionMember,
  typeTag: AstUtils.Comment.TagCollection,
  typeReference?: Definition
): AstUtils.Comment.TagCollection {
  const target = member.tags.find(({ name }) => name === "default");
  if (target && target.value !== void 0) {
    return {
      ...target,
      value: target.value?.replace(/^("|')|("|')$/g, ""),
    }; // 使用手动注释的 @default
  }
  let value: string;
  if (member.default !== void 0) {
    value = member.default; // 使用class定义的initializer
  } else if (/^(.+)\[\]$/.test(typeTag.value)) {
    // 取巧，判断类型描述字符串是否为数组
    value = "[]";
    // 后面根据类型自动推导
  } else if (typeReference && typeReference.kind !== DefinitionType.Enum) {
    // 如果有类型引用，默认为是空对象
    value = "{}";
  }
  // else if (typeTag.value === "string") {
  //   value = "";
  // } else if (typeTag.value === "number") {
  //   value = "0";
  // } else if (typeTag.value === "boolean") {
  //   value = "false";
  // }
  return value !== void 0 ? { name: "default", value } : void 0;
}

export function transform(path: string, options?: { cache?: Cache; lang?: string }) {
  const collectMap = extract(path);
  const { cache, lang } = options || {};
  const codes: Record<string, string> = extractCollectMap(
    cache ? Object.assign(cache.collect, collectMap) : collectMap,
    lang || "zh"
  );
  return {
    result: Object.values(codes).join("\r\n"),
    collect: collectMap,
  };
}
export type Cache = {
  collect: Record<string, Definition>;
  file_collect: Record<string, Record<string, Definition>>;
};

export function transformToComment(
  collect: Record<string, Definition>,
  options?: { cache: Cache; lang?: string }
) {
  const { lang } = options || {};
  const codes: Record<string, string> = extractCollectMap(collect, lang || "zh");
  return {
    result: codes,
    collect,
  };
}
function extractCollectMap(collectMap: Cache["collect"], lang: string) {
  const codes: Record<string, string> = {};
  for (const data of Object.values(collectMap)) {
    // console.log(data.name, data.kind, data.members);
    if (data.kind === DefinitionType.Struct || data.kind === DefinitionType.Plugin) {
      const head = (data.kind === DefinitionType.Struct && `~${data.kind}~${data.name}`) || "";
      const members = Object.values(data.members);
      const info = `
  /*${head}:${lang}
  ${formatLines([
    ...(data.kind === DefinitionType.Plugin
      ? formatTags({
          target: "MZ",
          plugindesc: data.description,
          author: "",
          ...data.tags
            .filter(({ name }) => {
              return name !== "description";
            })
            .map(({ name, value }) => [name, value] as [string, string])
            .reduce((r, ent) => defaults(r, Object.fromEntries([ent])), {}),
        })
      : [""]),
  ])}
  ${join(collectMembers(members, collectMap).map((lines) => formatLines([""].concat(lines))))}
   * 
   */
      `;
      codes[data.name] = info.replace(/ +\*/g, " *").replace(/ +\//g, "/");
    }
  }
  return codes;
}
function transformValueToMZStr(value: any) {
  if (value == null) return "undefined";
  if (value instanceof Array) {
    value.forEach((v, i) => {
      value[i] = transformValueToMZStr(v);
    });
  } else if (value instanceof Object) {
    for (const i in value) {
      value[i] = transformValueToMZStr(value[i]);
    }
  } else if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}
function collectMembers(
  members: DefinitionMember[],
  collectMap: Record<string, Definition>,
  parent?: DefinitionMember
) {
  return members.reduce((result, member) => {
    const typeTag = getTypeTag(member);
    const typeReference = collectMap[typeTag.defineTypeText];
    const defaultTag = getDefaultTag(member, typeTag, typeReference);
    const optionsTag = [] as [string, string][];
    if (typeTag.value === "select" && typeReference) {
      let i: number = 0;
      for (const key in typeReference.members) {
        const option = typeReference.members[key];
        optionsTag.push(["option", `${option.name}`]);
        // optionsTag.push(["optionDesc", option.description]);
        const initilize = option.default ?? i;
        const isNumberInit = parseInt(initilize);
        if (Number.isFinite(isNumberInit) && !Number.isNaN(isNumberInit)) {
          i = initilize;
        }
        optionsTag.push(["value", (option.default = `${initilize}`)]);
        i++;
      }
    }
    if (defaultTag && typeReference) {
      if (typeReference.kind === DefinitionType.Enum) {
        const [enumName, proterty] = defaultTag.value.split(".");
        if (typeReference.name === enumName) {
          // console.log(typeReference, proterty, typeReference.members[proterty].default);
          defaultTag.value = typeReference.members[proterty].default;
        }
      } else {
        defaultTag.value = transformValueToMZStr(eval(`(${defaultTag.value})`));
      }
    }
    const cleanedTags: [string, string][] = member.tags
      .filter(({ name }) => {
        return name !== "description" && name !== "param";
      })
      .concat(member.kind === DefinitionMemberType.Param ? [defaultTag, typeTag].filter(Boolean) : [])
      .map(({ name, value }) => [name, value]);
    console.log(cleanedTags);
    const children = [];
    if (member.kind === DefinitionMemberType.Command) {
      const child = collectMap[typeTag.defineTypeText];
      if (child) {
        children.push(...collectMembers(Object.values(child.members), collectMap, member));
        member.name === "callLuckyDice" && console.log("push children", children, cleanedTags);
      }
    }
    return [
      ...result,
      formatTags({
        [parent?.kind === DefinitionMemberType.Command ? "arg" : member.kind]: member.name,
        text: member.label || member.name,
        desc: member.description,
        ...cleanedTags.reduce((r, ent) => ({ ...r, ...Object.fromEntries([ent]) }), {}),
      }),
      formatTags(optionsTag),
      ...children,
    ];
  }, []);
}

function formatTags(tags: [string, string][] | Record<string, string>): string[] {
  const entries = tags instanceof Array ? tags : Object.entries(tags);
  const result = entries.reduce((result, [name, value]) => {
    if (typeof value === "string") {
      const lines = value?.split("\r\n");
      return [...result, ...(lines?.length > 1 ? [`@${name}`, ...lines] : [`@${name} ${value}`])];
    }
    return [...result, `@${name}`];
  }, []);
  return result;
}
const formatLines = (lines: string[]) => join(lines.map((line) => ` * ${line}`));
const join = (lines: string[]) => lines.join("\r\n");
