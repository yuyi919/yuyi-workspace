/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import * as ast from "langium/lib/grammar/generated/ast";
import * as ast2 from "../ast-utils";
import { Cardinality, isArray, isOptional } from "langium/lib/grammar/grammar-util";
import * as fec from "langium/lib/lsp/completion/follow-element-computation";
import { findPropertyId } from "../_utils";
import { last } from "lodash";

/**
 * Calculates any features that can follow the given feature stack.
 * This also includes features following optional features and features from previously called rules that could follow the last feature.
 * @param featureStack A stack of features starting at the entry rule and ending at the feature of the current cursor position.
 * @returns Any `AbstractElement` that could be following the given feature stack.
 */
export function findNextFeatures(featureStack: ast.AbstractElement[]) {
  return findNextFeaturesInternal(featureStack, new Map<ast.AbstractElement, Cardinality>());
}

export function* findNextFeaturesInternal(
  featureStack: ast.AbstractElement[],
  cardinalities: Map<ast.AbstractElement, Cardinality>,
  map?: (e: ast.AbstractElement) => ast.AbstractElement
): Generator<ast.AbstractElement, ast.AbstractElement[]> {
  if (featureStack.length === 0) {
    return [];
  }
  const features: ast.AbstractElement[] = [];
  const feature = featureStack[0];
  let parent: ast.Group | undefined;
  let item = feature;
  while (item.$container) {
    if (ast.isGroup(item.$container)) {
      parent = item.$container;
      break;
    } else if (ast.isAbstractElement(item.$container)) {
      item = item.$container;
    } else {
      break;
    }
  }
  // console.log("feature => item", item, feature);
  // First try to iterate the same element again
  if (isArray(item.cardinality ?? cardinalities.get(item))) {
    for (const e of findFirstFeatures(item, cardinalities)) {
      yield e;
    }
  }
  if (parent) {
    const ownIndex = parent.elements.indexOf(item);
    // Find next elements of the same group
    if (ownIndex !== undefined && ownIndex < parent.elements.length - 1) {
      yield* findGroupFeatures(parent, ownIndex + 1, cardinalities, map);
    }
    if (features.every((e) => isOptional(e.cardinality ?? cardinalities.get(e)))) {
      // secondly, try to find the next elements of the parent
      yield* findNextFeaturesInternal([parent], cardinalities, map);
    }
    if (features.every((e) => isOptional(e.cardinality ?? cardinalities.get(e)))) {
      // lasty, climb the feature stack and calculate completion for previously called rules
      featureStack.shift();
      yield* findNextFeaturesInternal(featureStack, cardinalities, map);
    }
  } else {
    // Climb the feature stack if this feature is the only one in a rule
    featureStack.shift();
    yield* findNextFeaturesInternal(featureStack, cardinalities, map);
  }
  return features;
}

/**
 * Calculates the first child feature of any `AbstractElement`.
 * @param feature The `AbstractElement` whose first child features should be calculated.
 * @returns A list of features that could be the first feature of the given `AbstractElement`.
 * These features contain a modified `cardinality` property. If the given `feature` is optional, the returned features will be optional as well.
 */
export function findFirstFeatures(
  feature: ast.AbstractElement | undefined,
  cardinalities?: Map<ast.AbstractElement, Cardinality>
): ast.AbstractElement[] {
  const card = cardinalities ?? new Map();
  if (feature === undefined) {
    return [];
  } else if (ast.isGroup(feature)) {
    return findGroupFeatures2(feature, 0, card).map((e) =>
      modifyCardinality(e, feature.cardinality, card)
    );
  } else if (ast.isAlternatives(feature)) {
    return feature.elements
      .flatMap((e) => findFirstFeatures(e, card))
      .map((e) => modifyCardinality(e, feature.cardinality, card));
  } else if (ast.isUnorderedGroup(feature)) {
    // TODO: Do we want to continue supporting unordered groups?
    return [];
  } else if (ast.isAssignment(feature)) {
    return findFirstFeatures(feature.terminal, card).map((e) =>
      modifyCardinality(e, feature.cardinality, card)
    );
  } else if (ast.isAction(feature)) {
    return fec
      .findNextFeaturesInternal([feature], card)
      .map((e) => modifyCardinality(e, feature.cardinality, card));
  } else if (ast.isRuleCall(feature) && ast.isParserRule(feature.rule.ref)) {
    return findFirstFeatures(feature.rule.ref.alternatives, card).map((e) =>
      modifyCardinality(e, feature.cardinality, card)
    );
  } else {
    return [feature];
  }
}

/**
 * Modifying the cardinality is necessary to identify which features are coming from an optional feature.
 * Those features should be optional as well.
 * @param feature The next feature that could be made optionally.
 * @param cardinality The cardinality of the calling (parent) object.
 * @returns A new feature that could be now optional (`?` or `*`).
 */
function modifyCardinality(
  feature: ast.AbstractElement,
  cardinality: Cardinality,
  cardinalities: Map<ast.AbstractElement, Cardinality>
): ast.AbstractElement {
  if (isOptional(cardinality)) {
    if (isArray(feature.cardinality)) {
      cardinalities.set(feature, "*");
    } else {
      cardinalities.set(feature, "?");
    }
  }
  return feature;
}

function* findGroupFeatures(
  group: ast.Group,
  index: number,
  cardinalities: Map<ast.AbstractElement, Cardinality>,
  map?: (e: ast.AbstractElement) => ast.AbstractElement
): Generator<ast.AbstractElement, ast.AbstractElement[]> {
  const features: ast.AbstractElement[] = [];
  let firstFeature: ast.AbstractElement;
  do {
    firstFeature = group.elements[index++];
    for (const e of findFirstFeatures(firstFeature, cardinalities)) {
      yield e;
    }
    if (!isOptional(firstFeature?.cardinality ?? cardinalities.get(firstFeature))) {
      break;
    }
  } while (firstFeature);
  return features;
}

function findGroupFeatures2(
  group: ast.Group,
  index: number,
  cardinalities: Map<ast.AbstractElement, Cardinality>,
  map?: (e: ast.AbstractElement) => ast.AbstractElement
) {
  const features: ast.AbstractElement[] = [];
  let firstFeature: ast.AbstractElement;
  do {
    firstFeature = group.elements[index++];
    features.push(...findFirstFeatures(firstFeature, cardinalities));
    if (!isOptional(firstFeature?.cardinality ?? cardinalities.get(firstFeature))) {
      break;
    }
  } while (firstFeature);
  return features;
}

export type FeatureKeywordValue = {
  feature: ast.Keyword;
  kind: "Keyword";
};
export type FeatureRullCallValue = {
  feature: ast.RuleCall;
  kind: "RuleCall";
};
export type FeatureAssignmentValue = {
  feature: ast.Assignment;
  kind: "Assignment";
};

export type FeatureCrossReference = {
  feature: ast.CrossReference;
  kind: "CrossReference";
};
export type FeatureTerminalRule = {
  feature: ast.TerminalRule;
  kind: "TerminalRule";
};
export type FeatureAction = {
  feature: ast.Action;
  kind: "Action";
};

export type FeatureAlternatives = {
  feature: ast.Alternatives;
  kind: "Alternatives";
};
export type FeatureGroup = {
  feature: ast.Group;
  kind: "Group";
};
export type FeatureUnorderedGroup = {
  feature: ast.UnorderedGroup;
  kind: "UnorderedGroup";
};
export type FeatureParserRule = {
  feature: ast.ParserRule;
  kind: "ParserRule";
};
export type FeatureKeywordTypedValue =
  | FeatureKeywordValue
  | FeatureRullCallValue
  | FeatureAssignmentValue
  | FeatureCrossReference
  | FeatureTerminalRule
  | FeatureAction
  | FeatureGroup
  | FeatureAlternatives
  | FeatureUnorderedGroup
  | FeatureParserRule;
export type FeatureValue = {
  name: string;
  stack: FeatureValue[];
  stackIndex: number[];
  parentIndex?: number;
  alternatives?: number[];
  cardinality?: ast.AbstractElement["cardinality"];
  assignment?: ast.Assignment;
} & FeatureKeywordTypedValue;
export type FeatureYieldValue = FeatureValue & {
  stack: FeatureValue[];
};

export function* searchAllFeatures(
  rule: ast.AbstractElement | ast.ParserRule,
  filter?: (ruleCall: ast.CrossReference | ast.ParserRule) => boolean
) {
  const map = new Map<string, FeatureValue>();
  yield* putFeature(rule, map, [], [], filter);
  const newMap = new Map<string, FeatureValue>();
  for (const [key, value] of map.entries()) {
    newMap.set(key.replace(/\^/g, ""), value);
  }
  return newMap;
}

function* putFeature(
  element: ast.AbstractElement | ast.AbstractRule,
  byName: Map<string, FeatureValue>,
  stack: FeatureValue[],
  stackIndex: number[],
  filter?: (ruleCall: ast.CrossReference | ast.ParserRule) => boolean,
  cacheMap = new Set<ast.ParserRule | ast.TerminalRule | ast.CrossReference>()
): Generator<FeatureYieldValue, FeatureYieldValue | void, boolean | void> {
  let value: FeatureValue;
  if (ast.isAssignment(element)) {
    value = { feature: element, kind: "Assignment", name: element.feature, stack, stackIndex };
    // yield { ...value, stack: stack };
    // byName.set(
    //   stack
    //     .map((o) => `(${o.kind})${o.name}`)
    //     .reverse()
    //     .join("."),
    //   value
    // );
    yield* putFeature(
      element.terminal,
      byName,
      [value, ...stack],
      [-1, ...stackIndex],
      filter,
      cacheMap
    );
  } else if (ast.isAlternatives(element) || ast.isUnorderedGroup(element) || ast.isGroup(element)) {
    value = {
      feature: element,
      kind: element.$type as typeof ast.Group | typeof ast.Alternatives | typeof ast.UnorderedGroup,
      name: "",
      stack,
      stackIndex,
    } as FeatureValue;
    let i = -1;
    for (const subFeature of element.elements) {
      const push = yield* putFeature(
        subFeature,
        byName,
        [value, ...stack],
        [++i, ...stackIndex],
        filter,
        cacheMap
      );
      if (push) {
        // console.log(push);
        stack = [push, ...stack];
        stackIndex = [-1, ...stackIndex];
      }
    }
  } else if (ast.isParserRule(element)) {
    value = {
      feature: element,
      kind: "ParserRule",
      name: element.name,
      stack,
      stackIndex,
    };
    const deep = yield value;
    if (!cacheMap.has(element)) {
      cacheMap.add(element);
      if (deep === true || !filter || filter(element)) {
        if (ast2.reflection.isSubtype(element.name, ast2.Expression)) {
          return;
        }
        yield* putFeature(
          element.alternatives,
          byName,
          [value, ...stack],
          [-1, ...stackIndex],
          filter,
          cacheMap
        );
      } else {
        // console.log("skip", element.rule.ref);
      }
    }
  } else if (ast.isRuleCall(element)) {
    value = { feature: element, kind: "RuleCall", name: element.rule.$refText, stack, stackIndex };
    // console.log("RuleCall", findPropertyId(element))
    if (
      element.rule.ref &&
      (ast.isParserRule(element.rule.ref) || ast.isTerminalRule(element.rule.ref))
    ) {
      yield value;
      yield* putFeature(element.rule.ref, byName, stack, stackIndex, filter, cacheMap);
    }
  } else {
    if (ast.isCrossReference(element)) {
      if (!filter || filter(element)) {
        value = {
          feature: element,
          kind: "CrossReference",
          name: element.type.ref?.name,
          stack,
          stackIndex,
        };
      } else {
        // console.log("skip", element.type.ref);
      }
    } else if (ast.isKeyword(element)) {
      value = { feature: element, kind: "Keyword", name: element.value, stack, stackIndex };
    } else if (ast.isTerminalRule(element)) {
      value = {
        feature: element,
        kind: "TerminalRule",
        name: element.name,
        stack,
        stackIndex,
      };
    } else if (ast.isAction(element)) {
      value = {
        feature: element,
        kind: "Action",
        name: [element.type, element.feature].filter(Boolean).join(":"),
        stack,
        stackIndex,
      };
    }
    if (value) {
      yield value;
      const key = [value, ...stack]
        .filter((o) => o.name)
        .map((o) => `(${o.kind})${o.name}`)
        .reverse()
        .join(".");
      byName.set(key, value);
      // console.log("append", key, value);
      if (ast.isAction(element)) {
        return value;
      }
    }
  }
}

export type SearchedAlternatives = {
  elements: FeatureYieldValue[];
  nextIndex?: number[];
  path: string;
  pathInParentPath: number[];
  parentPath: string;
  allowEmpty?: boolean;
  // childrenPath: string[];
  data: FeatureYieldValue;
};

