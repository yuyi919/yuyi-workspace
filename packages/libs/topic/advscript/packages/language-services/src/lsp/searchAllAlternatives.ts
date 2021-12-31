import * as langium from "langium/lib/grammar/generated/ast";
import * as ast from "../ast-utils";
import {
  FeatureValue,
  FeatureYieldValue,
  SearchedAlternatives
} from "./follow-element-computation";
import { Item } from "./generateTreeEnum";

export type FILTER = (ruleCall: langium.CrossReference | langium.ParserRule) => boolean;
export function searchAllAlternatives(
  rule: langium.AbstractRule | langium.AbstractElement,
  filter?: FILTER
) {
  const result = new Map<string, SearchedAlternatives>();
  const generator = putAlternatives(
    langium.isParserRule(rule) ? rule.alternatives : rule,
    [],
    [],
    [],
    filter
  );
  let iteratorResult: IteratorYieldResult<FeatureYieldValue> | IteratorReturnResult<any>,
    iteratorYieldResult: IteratorYieldResult<FeatureYieldValue>;
  const parentPaths = [] as number[][];
  const items = [];
  while (!iteratorResult || !iteratorResult.done) {
    iteratorResult = generator.next(() => true);
    if (iteratorResult.done === false) {
      iteratorYieldResult = iteratorResult;
      const { value: data } = iteratorYieldResult;
      if (data.name === "EOL") break;
      items.push(data);
      const path = data.alternatives.join("-");
      // console.log(path, data);
      let stacks = result.get(path);
      if (!stacks) {
        stacks = {
          path,
          elements: [],
          data: null,
          parentPath: null,
          pathInParentPath: null,
          // childrenPath: [],
          allowEmpty: null,
        };
      }
      const nextIndex = [...(stacks.nextIndex || [])];
      const lastPath = parentPaths[parentPaths.length - 1];
      if (lastPath && data.alternatives.length <= lastPath.length) {
        parentPaths.pop();
      }
      const parentPath = stacks.parentPath ?? parentPaths[parentPaths.length - 1]?.join("-");
      const pathInParentPath = (parentPath === "" ? path : path.replace(parentPath + "-", ""))
        .split("-")
        .map(Number);

      const parent = result.get(parentPath)?.elements[pathInParentPath[0]];
      // if (parent) {
      //   !parent.childrenPath.includes(path) && parent.childrenPath.push(path);
      // }
      const NextPoint =
        (data.kind === "Alternatives" || data.kind === "Group" || data.kind === "RuleCall") && data;
      const map = {
        path,
        nextIndex,
        data: parent,
        elements: [...stacks.elements, data],
        parentPath,
        pathInParentPath,
        allowEmpty: parent?.cardinality === "*" || parent?.cardinality === "?",
      };
      result.set(path, map);
      if (NextPoint === data) {
        nextIndex.push(stacks.elements.length);
        parentPaths.push(data.alternatives);
      }
    }
  }
  // for (const data of result.values()) {
  //   if (
  //     data.nextIndex?.length === 0 ||
  //     data.nextIndex.find((index) => data.elements[index].kind === "Group")
  //   ) {
  //     leafPaths.add(data.path);
  //     mapSearchedAlternatives(data, result);
  //   }
  // }
  // console.log("mapSearchedAlternatives2", [...mapSearchedAlternatives2(result.get(""), result)]);
  console.log([...result.values()], iteratorResult.value, items);
  return mapSearchedAlternativesInternal(result);
}

// function mapSearchedAlternatives(
//   item: SearchedAlternatives,
//   map: Map<string, SearchedAlternatives>
// ) {
//   let parent: SearchedAlternatives,
//     current = item,
//     elements: FeatureYieldValue[] = item.elements;
//   const names = [item.elements.find((o) => o.kind === "Action")?.name].filter(Boolean);
//   while (current && (parent = map.get(current.parentPath))) {
//     const [parentIndex, indexInChildren] = current.pathInParentPath;
//     elements = parent.elements.reduce((r, item, index) => {
//       if (parentIndex === index) {
//         return [...r, ...elements];
//       }
//       return [...r, item];
//     }, []);
//     current = parent;
//     const nameNode = current.elements.find((o) => o.kind === "Action");
//     if (nameNode) names.unshift(nameNode.name);
//   }
//   console.log("mapSearchedAlternatives", elements, names);
//   return { names, elements };
// }
function* mapSearchedAlternativesPath(item: SearchedAlternatives, index: number) {
  const data: FeatureYieldValue = item.elements[index];
  // if ((data.feature as ast.Group | ast.Alternatives).cardinality && (data.feature as ast.Group | ast.Alternatives).cardinality !== "+") {
  //   yield [item.path, index, 0].filter((item) => item !== "").join("-");
  // }
  if (data.kind === "Group") {
    yield [item.path, index, 1].filter((item) => item !== "").join("-");
  } else if (data.kind === "RuleCall") {
    yield [item.path, index, 0].filter((item) => item !== "").join("-");
  } else if (data.kind === "Alternatives") {
    const children = (data.feature as langium.Alternatives).elements,
      length = children.length;
    let i = -1;
    while (++i < length) {
      yield [item.path, index, i].filter((item) => item !== "").join("-");
    }
  }
}
type YieldResultElements = {
  elements: (FeatureYieldValue | FeatureYieldValue[])[];
  emptys: (number | string)[];
};

enum OperatorType {
  Keep = "keep",
  Resolve = "resolve",
  Delete = "skip",
}
function* mapSearchedAlternativesInternal(
  map: Map<string, SearchedAlternatives>,
  item: SearchedAlternatives = map.get(""),
  parent?: FeatureYieldValue,
  cache = new Map<SearchedAlternatives | string, any>()
): Generator<YieldResultElements, void, unknown> {
  if (item.nextIndex.length === 0) {
    yield { elements: item.elements, emptys: [] };
    console.log("emit:empty2", item.elements);
    return;
  }
  // const nextEmptys = new Set<string>();
  // const innerEmptys = new Set<number>();
  const optionalIndexs = item.nextIndex.filter((index) => isOptionalNode(item.elements[index]));
  const constsIds = item.nextIndex.filter((index) => !optionalIndexs.includes(index));
  // console.log(ruleIds, alterIds);
  const indexConfigs = [...optionalEnum(optionalIndexs, constsIds)]
    .sort((a, b) => a.length - b.length)
    .filter((o) => o.length);
  if (!indexConfigs.length || constsIds.length) {
    indexConfigs.unshift(constsIds);
  }
  if (item.allowEmpty) {
    yield { elements: [], emptys: [] };
  }
  if (!indexConfigs.length) {
    yield { elements: item.elements, emptys: [] };
    return;
  }
  let yieldStacks: (FeatureYieldValue | FeatureYieldValue[])[][];
  const operatorConfigs = indexConfigs.map((indexs) => {
    return item.nextIndex?.map((i) => ({
      i,
      operator: indexs.includes(i)
        ? OperatorType.Resolve
        : constsIds.includes(i)
        ? OperatorType.Keep
        : OperatorType.Delete,
    }));
  });
  const initialYieldStacks: (FeatureYieldValue | FeatureYieldValue[])[][] = [item.elements];
  console.log(
    "mapSearchedAlternatives",
    item,
    parent,
    indexConfigs.map((p) => p.join(", ")),
    operatorConfigs.map((p) => p.map((o) => `${o.i}: ${o.operator}`).join(", "))
  );
  const pathSet = new Set();
  for (const enums of indexConfigs) {
    yieldStacks = [...initialYieldStacks];
    const alternatives = {} as Record<number, boolean>;
    console.groupCollapsed("indexConfigs", item.nextIndex, enums, optionalIndexs, [...yieldStacks]);
    // const emptyCache = new Set<number>();
    for (const index of enums) {
      const paths = [...mapSearchedAlternativesPath(item, index)];
      // const need = paths.some((o) => map.has(o));
      // if (need) {
      console.groupCollapsed(
        "paths",
        paths,
        index,
        yieldStacks,
        yieldStacks.map((s) => s.flat(9))
      );
      // if (paths.length > 1) {
      //   console.log("multiple paths", paths, [...yieldResults]);
      // }
      for (const path of paths) {
        const resolved = map.get(path);
        if (resolved) {
          pathSet.add(path);
          for (const { elements: nextItems } of mapSearchedAlternativesInternal(
            map,
            resolved,
            item.elements[index],
            cache
          )) {
            // console.groupCollapsed(
            //   "resolve",
            //   path,
            //   enums,
            //   index,
            //   { ...alternatives },
            //   item.nextIndex
            // );
            const source = yieldStacks[0];
            let resolvedResult: (FeatureYieldValue | FeatureYieldValue[])[],
              length = yieldStacks.length;
            if (alternatives[index]) {
              resolvedResult = resolves(source, item.nextIndex, enums, index, nextItems);
              // console.log("pre resolve2", resolvedResult);
              length++;
            }
            const nextStack = [];
            for (let i = 0; i < length; i++) {
              let yieldResult = nextStack[i] || yieldStacks[i] || resolvedResult;
              // console.log("resolve", i, { ...alternatives }, [...nextStack], [...yieldStacks]);
              if (!alternatives[index]) {
                alternatives[index] = true;
                yieldResult = resolves(yieldResult, item.nextIndex, enums, index, nextItems);
                // for (let i = 0; i < length; i++) {
                nextStack[i] = yieldResult;
                // }
                // console.log("resolve1", i, { ...alternatives }, [...nextStack], [...yieldStacks]);
              } else {
                nextStack[i] = yieldResult;
                // console.log("resolve2", i, { ...alternatives }, [...nextStack], [...yieldStacks]);
              }
            }
            yieldStacks = nextStack;
            // console.log("resolveEnd", { ...alternatives }, [...yieldStacks]);
            // console.groupEnd();
            // console.log(next)
          }
        }
      }
      // if (paths.length > 1) {
      //   console.log("multiple paths", paths, [...yieldResults]);
      // }
      console.groupEnd();
      // }
    }
    // yield { elements: yieldResult, emptys: [] }; //.flat(1);
    // console.log("emit:elements", yieldResult);
    console.groupEnd();
    console.group("emit:empty elements", yieldStacks);
    for (const yieldResult of yieldStacks) {
      if (yieldResult) {
        // if (
        //   optionalIndexs.length > 0 &&
        //   // emptyCache.size < optionalIndexs.length &&
        //   optionalIndexs.some(
        //     (i) =>
        //       !((yieldResult[i] as FeatureYieldValue | FeatureYieldValue[]) instanceof Array) ||
        //       (yieldResult[i] as FeatureYieldValue[]).length > 0
        //   )
        // ) {
        //   const emptyYieldResult = yieldResult.map((e, index) =>
        //     optionalIndexs.includes(index) ? (emptyCache.add(index), [] as FeatureYieldValue[]) : e
        //   );
        //   console.log("emit:empty elements", yieldResult, optionalIndexs);
        //   // initialYieldStacks = [emptyYieldResult, ...initialYieldStacks];
        //   yield { elements: emptyYieldResult, emptys: optionalIndexs }; //.flat(1);
        // }
        yield { elements: yieldResult, emptys: [] }; //.flat(1);
        console.log("emit:elements", yieldResult);
      }
    }
    console.groupEnd();
  }
  // console.groupEnd();
}

function resolves(
  yieldResult: (FeatureYieldValue | FeatureYieldValue[])[],
  indexs: number[],
  include: number[],
  cursor: number,
  value: (FeatureYieldValue | FeatureYieldValue[])[]
) {
  // yieldResult.map((e, elindex) => {
  //   if (indexs.includes(elindex)) {
  //     return elindex === cursor ? value : include.includes(elindex) ? e : [];
  //   }
  //   return e;
  // }) as (FeatureYieldValue | (FeatureYieldValue | FeatureYieldValue[])[])[];
  yieldResult = [...yieldResult];
  // enum为nextIndex的子集
  for (const nextIndex of indexs) {
    // if (!(yieldResult[nextIndex] instanceof Array)) {
    if (nextIndex === cursor) {
      yieldResult[nextIndex] = value as FeatureYieldValue | FeatureYieldValue[];
    } else if (!include.includes(nextIndex)) {
      yieldResult[nextIndex] = [];
    }
  }
  // }
  return yieldResult;
}
type StackLength = {
  length: number;
  stackLength: number;
};
function* putAlternatives(
  element: langium.AbstractElement | langium.AbstractRule,
  stack: FeatureValue[],
  stackIndex: number[],
  alternatives: number[],
  filter?: FILTER,
  cacheMap = new Set<langium.ParserRule | langium.TerminalRule | langium.CrossReference>(),
  parent?: FeatureYieldValue,
  parentIndex?: number,
  assignment?: langium.Assignment
): Generator<FeatureYieldValue, StackLength, () => boolean | void> {
  let value: FeatureValue;
  if (langium.isAssignment(element)) {
    value = {
      feature: element,
      kind: "Assignment",
      name: element.feature,
      stack,
      stackIndex,
      alternatives,
      parentIndex: parentIndex,
      cardinality: element.cardinality,
    };
    // yield value;
    const next = yield* putAlternatives(
      element.terminal,
      stack,
      stackIndex,
      alternatives,
      filter,
      cacheMap,
      parent,
      parentIndex,
      element
    );
    return {
      length: next.length,
      stackLength: 1,
    };
  } else if (
    langium.isAlternatives(element) ||
    langium.isUnorderedGroup(element) ||
    langium.isGroup(element)
  ) {
    value = {
      feature: element,
      kind: element.$type as "Group" | "Alternatives" | "UnorderedGroup",
      name: "",
      stack,
      alternatives,
      stackIndex,
      parentIndex: parentIndex,
      cardinality: element.cardinality || assignment?.cardinality,
      assignment,
    } as FeatureValue;
    // if (!ast.isGroup(element) || stack.length > 0) {
    // }
    const isGroup = element.$type === "Group";
    const isCardinalityContainer = !isGroup || !!element.cardinality;
    let deepSearch: boolean | void = true;
    if (isCardinalityContainer) {
      deepSearch = (yield value)();
      stack = [value, ...stack];
    }
    if (deepSearch) {
      let length = 0,
        stackLength = 0;
      for (const item of element.elements) {
        const next = yield* putAlternatives(
          item,
          stack,
          isCardinalityContainer ? [stackLength, ...stackIndex] : stackIndex,
          isCardinalityContainer
            ? langium.isGroup(element)
              ? [...alternatives, parent?.kind === "Alternatives" ? 0 : parentIndex ?? 0, 1]
              : [
                  ...alternatives,
                  parent?.kind === "Alternatives" ? 0 : parentIndex ?? 0,
                  stackLength,
                ]
            : alternatives,
          filter,
          cacheMap,
          value,
          stackLength
        );
        length += next.length;
        stackLength += next.stackLength;
      }
      return { length: length, stackLength: 1 };
    }
  } else if (langium.isRuleCall(element)) {
    if (
      element.rule.ref &&
      (langium.isParserRule(element.rule.ref) || langium.isTerminalRule(element.rule.ref))
    ) {
      value = {
        feature: element,
        kind: "RuleCall",
        name: element.rule.$refText,
        stack,
        stackIndex,
        alternatives,
        parentIndex: parentIndex,
        cardinality: element.cardinality || assignment?.cardinality,
        assignment,
      };
      yield value;
      if (langium.isParserRule(element.rule.ref)) {
        // if (!cacheMap.has(element.rule.ref)) {
        if ((!filter || filter(element.rule.ref)) && ast.isResolvableRuleCall(element)) {
          const next = yield* putAlternatives(
            element.rule.ref.alternatives,
            [value, ...stack],
            [0, ...stackIndex],
            // 父级索引根据节点判断，如果为Alternatives则取0，反之为group时则取索引
            [...alternatives, parent?.kind === "Alternatives" ? 0 : parentIndex ?? 0, 0],
            filter,
            cacheMap,
            value,
            0
          );
          return {
            length: next.length,
            stackLength: 1,
          };
        }
      }
      // }
      return {
        length: 1,
        stackLength: 1,
      };
    }
  } else {
    if (langium.isCrossReference(element)) {
      if (!filter || filter(element)) {
        value = {
          feature: element,
          kind: "CrossReference",
          name: element.type.ref?.name,
          stack,
          stackIndex,
          alternatives,
          parentIndex: parentIndex,
          assignment,
          cardinality: element.cardinality || assignment?.cardinality,
        };
      } else {
        // console.log("skip", element.type.ref);
      }
    } else if (langium.isKeyword(element)) {
      value = {
        feature: element,
        kind: "Keyword",
        name: element.value,
        stack,
        stackIndex,
        alternatives,
        parentIndex: parentIndex,
        assignment,
        cardinality: element.cardinality || assignment?.cardinality,
      };
    } else if (langium.isTerminalRule(element)) {
      value = {
        feature: element,
        kind: "TerminalRule",
        name: element.name,
        stack,
        stackIndex,
        alternatives,
        parentIndex: parentIndex,
        assignment,
        cardinality: assignment?.cardinality,
      };
    } else if (langium.isAction(element)) {
      value = {
        feature: element,
        kind: "Action",
        name: [element.type, element.feature].filter(Boolean).join(":"),
        stack,
        stackIndex,
        alternatives,
        parentIndex: parentIndex,
        assignment,
        cardinality: element.cardinality || assignment?.cardinality,
      };
    }
    if (value) {
      yield value;
    }
  }
  return {
    length: 1,
    stackLength: 1,
  };
}
function* optionalEnum(numbers: number[], pre?: number[]) {
  const length = numbers.length + 1;
  for (let i = 0; i < length; i++) {
    for (let j = i + 1; j < length; j++) {
      yield pre ? pre.concat(numbers.slice(i, j)).sort() : numbers.slice(i, j);
    }
  }
}
function isOptionalNode(target: FeatureYieldValue): unknown {
  return target.kind !== "RuleCall" || ast.isOptionalFeature(target.feature);
}

// console.log("generateTreeEnum", format([...generateTreeEnum(array, (item) => item.children)]));
function format(i: Item[][]) {
  return i.map((o) =>
    o
      .flat(9)
      .map((o) => o.id)
      .join(",")
  );
}
