import { IReportOptions } from "zora";
interface IAssertionResult<T> {
  pass: boolean;
  actual: unknown;
  expected: T;
  description: string;
  operator: string;
  at?: string;
}
interface INewTestMessageInput {
  description: string;
  skip: boolean;
}

interface ITestEndMessageInput {
  description: string;
  executionTime: number;
}

export type IReporter = IReportOptions["reporter"];
export type IReporterMessage = AsyncIterable<IMessage>;

interface ITypedMessage<T> {
  type: string;
  data: T;
}

interface INewTestMessage extends ITypedMessage<INewTestMessageInput> {
  type: "TEST_START";
}

interface IAssertionMessage extends ITypedMessage<IAssertionResult<unknown>> {
  type: "ASSERTION";
}

interface ITestEndMessage extends ITypedMessage<ITestEndMessageInput> {
  type: "TEST_END";
}

interface IErrorMessage extends ITypedMessage<{ error: unknown }> {
  type: "ERROR";
}
export type IMessage = IAssertionMessage | IErrorMessage | ITestEndMessage | INewTestMessage;

export const map = (mapFn: (message: IMessage) => any) =>
  async function* (stream: IReporterMessage) {
    for await (const element of stream) {
      yield mapFn(element);
    }
  } as ((message: IReporterMessage) => Promise<void> & AsyncGenerator) &
    AsyncGenerator<any, void, unknown>;

export const compose = (fns) => (arg) => fns.reduceRight((y, fn) => fn(y), arg);
