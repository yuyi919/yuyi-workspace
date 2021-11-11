/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as zora from "zora";
import { escapeRegExp } from "lodash";
import { IMessage } from "./util";
interface IAssertionResult<T> {
  pass: boolean;
  actual: unknown;
  expected: T;
  description: string;
  operator: string;
  at?: string;
}
const createReplacer = () => {
  const visited = new Set();
  return (key, value) => {
    if (isObject(value)) {
      if (visited.has(value)) {
        return "[__CIRCULAR_REF__]";
      }

      visited.add(value);
    }

    if (typeof value === "symbol") {
      return value.toString();
    }

    return value;
  };
};

const isObject = (candidate) => typeof candidate === "object" && candidate !== null;

const stringify = (value) => JSON.stringify(value, createReplacer());

export interface ErrorAssertionFunction {
  (fn: () => any, expected: RegExp | string, description?: string): IAssertionResult<
    RegExp | string
  >;
}
export interface IAssertWrapper extends SpecFunctionRecord {
  throwError: ErrorAssertionFunction;
}

type TesterFunctionWrapper<TestFunction> = Omit<zora.IAssert, keyof zora.ITester> &
  {
    [K in keyof zora.ITester]: TestFunction;
  };

export type AssertWrapper<T extends SpecFunctionRecord = {}> = IAssertWrapper &
  TesterFunctionWrapper<ITestFunction<T & IAssertWrapper>> &
  T;

export interface ITestFunction<T extends SpecFunctionRecord> {
  (
    description: string,
    spec: (assert: AssertWrapper<T>) => any,
    opts?: zora.ITestOptions
  ): Promise<any> & AsyncIterable<IMessage>;
}

const specFnRegexp = /zora_spec_fn/;
const zoraInternal = /zora\/dist/;
const filterStackLine = (l) =>
  (l && !zoraInternal.test(l) && !l.startsWith("Error")) || specFnRegexp.test(l);
const getAssertionLocation = (offset: number) => {
  offset += 1;
  const err = new Error();
  const stack = (err.stack || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(filterStackLine);
  const userLandIndex = stack.findIndex((l) => specFnRegexp.test(l));
  const stackline =
    userLandIndex >= offset ? stack[userLandIndex - offset] : stack[offset - 1] || "N/A";
  // console.log("location", offset, stack);
  return stackline.replace(/^at|^@/, "");
};
function wrapperResult<T>(result: IAssertionResult<T>, location?: number): IAssertionResult<T> {
  if (!result) return;
  result.at = getAssertionLocation(location);
  // if (operator) result.operator = operator;
  return result;
}

function extendAsserts<T extends SpecFunctionRecord>(
  source: zora.IAssert,
  asserts: T,
  location = 1
): AssertWrapper<T> {
  const { test, skip, only, ...other } = source;
  const wrapperObj = {} as AssertWrapper<T>;
  const before = { ...other, ...asserts };
  for (const key in before) {
    const caller = before[key];
    wrapperObj[key as keyof typeof before] = ((...args: any[]) => {
      return wrapperResult(caller.call(wrapperObj, ...args), location);
    }) as AssertWrapper<T>[keyof typeof before];
  }
  return Object.assign(wrapperObj, {
    test: wrapper(test),
    only: wrapper(only),
    skip: wrapper(skip),
  }) as AssertWrapper<T>;
}

function wrapper(call: zora.ITestFunction) {
  return function callerWrapper(
    description: string,
    spec: zora.ISpecFunction,
    opts?: zora.ITestOptions
  ) {
    return call(
      description,
      (t) => {
        const { same, equals, notEquals } = t;
        try {
          return spec(
            extendAsserts<IAssertWrapper>(t, {
              equals(a, b, desc = "应该严格相等") {
                return equals(JSON.parse(stringify(a)), JSON.parse(stringify(b)), desc);
              },
              notEquals(a, b, desc = "应该不严格相等") {
                return notEquals(JSON.parse(stringify(a)), JSON.parse(stringify(b)), desc);
              },
              same(a, b, desc = "应该一致") {
                return same(JSON.parse(stringify(a)), JSON.parse(stringify(b)), desc);
              },
              throwError(fn, expect, desc = typeof expect === "string" ? expect : void 0) {
                return t.throws(
                  fn,
                  (typeof expect === "string"
                    ? new RegExp(escapeRegExp(expect))
                    : expect) as RegExp & string,
                  desc
                ) as IAssertionResult<string | RegExp>;
              },
            })
          );
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      opts
    );
  } as ITestFunction<IAssertWrapper>;
}

type SpecFunctionRecord = Record<string, (...args: any[]) => any>;

export function extendTest<T extends IAssertWrapper, E extends SpecFunctionRecord>(
  call: ITestFunction<T>,
  extendTests: (assert: AssertWrapper<T>) => E,
  location = 2
) {
  return function callerWrapper(description: string, spec, opts?) {
    return call(
      description,
      (expect) => {
        try {
          return spec(extendWrapper<T, E>(expect, extendTests, location));
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      opts
    );
  } as unknown as ITestFunction<T & E>;
}
let currentContext: string;
export function extendWrapper<T extends SpecFunctionRecord, A extends SpecFunctionRecord>(
  assert: AssertWrapper<T>,
  append: (assert: AssertWrapper<T>) => A,
  location?: number
) {
  const { test, skip, only, ...other } = assert;
  const wrapperObj = {} as AssertWrapper<T & A>;
  const next = append(wrapperObj);
  const before = { ...other, ...next };
  for (const key in before) {
    const caller = before[key];
    // @ts-ignore
    wrapperObj[key] = ((...args: any[]) => {
      if (key in next) {
        // currentContext = getAssertionLocation(location);
        // console.log("callerWrapper", key, getAssertionLocation(location));
      }
      const r = wrapperResult(caller(...args), location);
      if (r) {
        r.at += "\n               " + currentContext;
      }
      return r;
    }) as any;
  }
  return Object.assign(wrapperObj, {
    test: extendTest(test, append, location),
    only: extendTest(only, append, location),
    skip: extendTest(skip, append, location),
  }) as AssertWrapper<T & A>;
}

export const only = wrapper(zora.only);
export const test = wrapper(zora.test);
export const skip = wrapper(zora.skip);

export { createJSONReporter, createHarness, createTAPReporter, hold, report } from "zora";

export type {
  IAssert,
  IHarnessOptions,
  ILogOptions,
  IReportOptions,
  ISpecFunction,
  ITestHarness,
  ITestOptions,
  ITester,
} from "zora";
