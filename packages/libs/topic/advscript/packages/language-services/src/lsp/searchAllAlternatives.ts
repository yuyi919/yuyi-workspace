import * as langium from "langium/lib/grammar/generated/ast";
import * as ast from "../ast-utils";
import {
  FeatureValue,
  FeatureYieldValue,
  FeatureKeywordTypedValue,
} from "./follow-element-computation";

export type FILTER = (ruleCall: langium.CrossReference | langium.ParserRule) => boolean;
export function searchAllAlternatives(
  rule: langium.AbstractRule | langium.AbstractElement,
  filter?: FILTER
) {
  return putAlternatives(langium.isParserRule(rule) ? rule.alternatives : rule, [], [], [], filter);
}

type StackLength = {
  length: number;
  stackLength: number;
};
function* putAlternatives(
  element: langium.AbstractElement | langium.AbstractRule,
  stack?: FeatureValue[],
  stackIndex?: number[],
  alternatives?: number[],
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
      kind: langium.Assignment,
      name: element.feature,
      cardinality: element.cardinality,
      stack,
      stackIndex,
      alternatives,
      parentIndex: parentIndex,
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
    value = toFeatureData(
      {
        feature: element as langium.Group | langium.Alternatives | langium.UnorderedGroup,
        kind: element.$type as
          | typeof langium.Group
          | typeof langium.Alternatives
          | typeof langium.UnorderedGroup,
        name: "",
      } as any,
      assignment,
      stack,
      alternatives,
      stackIndex,
      parentIndex
    ) as FeatureValue;
    // if (!ast.isGroup(element) || stack.length > 0) {
    // }
    const isGroup = element.$type === langium.Group;
    const isCardinalityContainer = !isGroup || !!element.cardinality;
    const deepSearch: boolean | void = true;
    if (isCardinalityContainer) {
      // deepSearch = (yield value)?.() ?? deepSearch;
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
              ? [...alternatives, parent?.kind === langium.Alternatives ? 0 : parentIndex ?? 0, 1]
              : [
                  ...alternatives,
                  parent?.kind === langium.Alternatives ? 0 : parentIndex ?? 0,
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
      value = toFeatureData(
        {
          feature: element,
          kind: langium.RuleCall,
          name: element.rule.$refText,
        },
        assignment,
        stack,
        stackIndex,
        alternatives,
        parentIndex
      );
      yield value;
      // }
      return {
        length: 1,
        stackLength: 1,
      };
    }
  } else {
    if (langium.isCrossReference(element)) {
      if (!filter || filter(element)) {
        value = toFeatureData(
          {
            feature: element,
            kind: langium.CrossReference,
            name: element.type.ref?.name,
          },
          assignment,
          stack,
          stackIndex,
          alternatives,
          parentIndex
        );
      } else {
        // console.log("skip", element.type.ref);
      }
    } else if (langium.isKeyword(element)) {
      value = toFeatureData(
        {
          feature: element,
          kind: langium.Keyword,
          name: element.value,
        },
        assignment,
        stack,
        stackIndex,
        alternatives,
        parentIndex
      );
    } else if (langium.isTerminalRule(element)) {
      value = toFeatureData(
        {
          feature: element,
          kind: langium.TerminalRule,
          name: element.name,
        },
        assignment,
        stack,
        stackIndex,
        alternatives,
        parentIndex
      );
    } else if (langium.isAction(element)) {
      value = toFeatureData(
        {
          feature: element,
          kind: langium.Action,
          name: [element.type, element.feature].filter(Boolean).join(":"),
        },
        assignment,
        stack,
        stackIndex,
        alternatives,
        parentIndex
      );
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

function toFeatureData(
  data: FeatureKeywordTypedValue & { name: string },
  assignment?: langium.Assignment,
  stack?: FeatureValue[],
  stackIndex?: number[],
  alternatives?: number[],
  parentIndex?: number
): FeatureValue {
  Object.defineProperties(
    Object.assign(data, {
      assignment,
      stack,
      stackIndex,
      alternatives,
      parentIndex: parentIndex,
    }),
    Object.getOwnPropertyDescriptors({
      get cardinality() {
        return (
          ((this as FeatureValue).feature as Exclude<FeatureValue["feature"], langium.AbstractRule>)
            .cardinality || (this as FeatureValue).assignment?.cardinality
        );
      },
    })
  );
  return data as FeatureValue;
}
