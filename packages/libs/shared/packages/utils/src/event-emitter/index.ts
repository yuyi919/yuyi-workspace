// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-namespace */
// import { sleep } from '@utils/common';
// import { Constant$ } from '@yuyi919/shared-constant';
// import {
//   CompletionObserver,
//   ErrorObserver,
//   NextObserver,
//   PartialObserver,
//   Subscription as Subscription2,
// } from 'rxjs';

// import {
//   BehaviorSubject,
//   OperatorFunction,
//   ReplaySubject,
//   Subject,
//   Observable,
// } from 'rxjs/index';

// // import { endWith } from 'rxjs/operators';
// // import { of } from 'rxjs';

// // console.log(of, endWith);

// export {
//   PartialObserver,
//   NextObserver,
//   ErrorObserver,
//   CompletionObserver,
//   Subscription2,
// };

// export function subscribe$$<T>(
//   source: Observable<T>,
//   observer?: PartialObserver<T>
// ): Subscription2;
// export function subscribe$$<T>(
//   source: Observable<T>,
//   next?: (value: T) => void,
//   error?: (error: any) => void,
//   complete?: () => void
// ): Subscription2;

// export function subscribe$$<T>(source: Observable<T>, ...observer: any[]) {
//   return source.subscribe(...observer);
// }
// export function unsubscribe$$(source: Subscription2) {
//   source.unsubscribe();
// }

// const { CREATE_PROMISE } = Constant$;

// /**
//  * 事件发射器
//  *
//  * 订阅事件 见{@link EventEmitter.(subscribe:1) | EventEmitter.subscribe()}
//  *
//  * 发射事件 见{@link EventEmitter.emit | EventEmitter.emit()}
//  *
//  * 销毁 见{@link EventEmitter.dispose | EventEmitter.dispose()}
//  *
//  * @includeSnippet ~/test/Rx/EventEmitter.test.ts#"EventEmitter 基本使用"
//  *
//  * @typeParam T - 事件类型
//  * @example
//  *```ts
//  * const emitter = new EventEmitter()
//  * emitter.subscribe({ next: console.log })
//  * emitter.subscribe(console.log)
//  * emitter.emit(1)
//  * emitter.emit(2)
//  * ...
//  * emitter.emit(100)
//  * /* 按顺序打印出 1, 1, 2, 2, ..., 100, 100
//  *
//  *```
//  * @public
//  */
// export class EventEmitter<T = any> {
//   /** @internal */
//   protected $: Subject<T> = null;
//   protected sub: Subscription2 | null;
//   protected lastValue: { value?: T } | null = null;

//   /**
//    * 实例化EventEmitter
//    * @param next 订阅事件方法
//    * @param error 订阅错误事件方法
//    * @param complete 订阅completed事件方法
//    */
//   constructor(
//     next?: NextObserver<T>,
//     error?: ErrorObserver<T>,
//     complete?: CompletionObserver<T>
//   ) {
//     // this.unsubscribe()
//     if (next || error || complete) {
//       this.init(next, error, complete);
//     }
//   }
//   /**
//    * 初始化
//    * @param next 订阅事件方法
//    * @param error 订阅错误事件方法
//    * @param complete 订阅completed事件方法
//    */
//   public init(observer?: PartialObserver<T>): Subject<T>;
//   public init(
//     next?: NextObserver<T>,
//     error?: ErrorObserver<T>,
//     complete?: CompletionObserver<T>
//   ): Subject<T>;
//   public init(
//     next?: NextObserver<T>,
//     error?: ErrorObserver<T>,
//     complete?: CompletionObserver<T>
//   ) {
//     if (!this.$) {
//       this.$ = new Subject();
//       // this.emitter.pipe(
//       //   observeOn(queueScheduler),
//       //   share()
//       // );
//       if (next || error || complete) {
//         this.sub = this.$.subscribe({
//           next,
//           error,
//           complete,
//         } as any);
//       }
//     }
//     return this.$;
//   }

//   /**
//    * 订阅事件
//    * @param observer 事件观察者
//    * @param next 观察到发射值时的回调
//    * @param error 错误的回调
//    * @param complete 完成的回调
//    */
//   //@ts-ignore
//   subscribe(observer?: PartialObserver<T>): Subscription2;
//   /**
//    * {@inheritDoc EventEmitter.(subscribe:1)}
//    */
//   //@ts-ignore
//   subscribe(
//     next?: (value: T) => void,
//     error?: (error: any) => void,
//     complete?: () => void
//   ): Subscription2;
//   // @ts-ignore
//   public subscribe(...args: any[]) {
//     this.init();
//     return this.$.subscribe(...args);
//   }

//   unsubscribe() {
//     this.$ && this.$.unsubscribe();
//   }

//   /**
//    * 管道
//    * @param operators 传入操作符
//    */
//   public pipe(...operators: OperatorFunction<any, any>[]): this {
//     this.init();
//     // @ts-ignore
//     return this.$.pipe(...operators);
//   }

//   /**
//    * 发射值
//    * @param value - 发射值，并记录lastValue
//    * @param timeout - 超时时间，超过指定时间后清理lastValue
//    */
//   public emit(value: T, timeout?: number) {
//     this.init();
//     this.$.next(value);
//     this.lastValue = { value };
//     if (typeof timeout === 'number' && timeout > -1) {
//       setTimeout(this.clearCache, timeout);
//     }
//   }
//   /**
//    * 发射一个事件后立即销毁监听器
//    * @param value
//    */
//   public once(value: T) {
//     this.emit(value);
//     this.dispose();
//     this.lastValue = { value };
//   }

//   /**
//    * 注销
//    */
//   public dispose(force?: boolean) {
//     if (this.sub && !this.sub.closed) {
//       this.sub.unsubscribe();
//       this.sub = null;
//     }
//     if (!this.$.closed) {
//       this.$.complete();
//     }
//     force && this.$.unsubscribe();
//   }
//   /**
//    * 设置条件注销
//    * @param emit - 条件observable，发射任意值即注销
//    */
//   public takeUntil(emit: Observable<any>) {
//     const sub = emit.subscribe(() => {
//       this.dispose(true);
//       sub.unsubscribe();
//     });
//     return this;
//   }

//   /**
//    * 取得最后发射的值
//    */
//   public getLastValue() {
//     return this.lastValue && this.lastValue.value;
//   }
//   public clearCache = () => {
//     this.lastValue = null;
//   };
//   public hasCache() {
//     return this.lastValue !== null;
//   }

//   /**
//    * 转化成标准Promise
//    */
//   public toPromise() {
//     this.init();
//     return CREATE_PROMISE<T>((r) => {
//       const sub = subscribe$$(this.$, (data) => {
//         r(data);
//         unsubscribe$$(sub);
//       });
//     });
//   }

//   /**
//    * 转化成标准Promise，指定超时时间
//    * @param timeout 超时时间
//    * @param timeoutValue 超时时默认返回的值
//    * @param timeoutError 超市时是否返回错误，返回reject(timeoutValue)
//    */
//   public toPromiseUntil<T>(
//     timeout: number,
//     timeoutValue?: T,
//     timeoutError?: boolean
//   ) {
//     return Promise.race([
//       this.toPromise(),
//       sleep(timeout, timeoutValue, timeoutError),
//     ]);
//   }

//   static create() {
//     return new EventEmitter();
//   }
//   static is(target: any): target is EventEmitter {
//     return target instanceof EventEmitter;
//   }
// }

// /**
//  * {@link EventEmitter}的变体，它保存了发送给观察者的最新事件。并且当有新的观察者订阅时，会立即接收到最新事件。
//  *
//  * > [!当创建 ReplaySubject 时，你可以指定回放多少个值，还可以指定 window time (以毫秒为单位)来确定多久之前的值可以记录。]
//  * @example
//  * 在下面的示例中，BehaviorEventEmitter 使用值0进行初始化。
//  * 当第一个观察者订阅时会得到0。第二个观察者订阅时会得到值2，尽管它是在值2发送之后订阅的。
//  *```ts
//  * const emitter = new BehaviorEventEmitter(0); // 0是初始值
//  * const result = []
//  * emitter.subscribe({
//  *   next: (v) => result.push('observerA: ' + v)
//  * });
//  * emitter.emit(1);
//  * emitter.emit(2);
//  *
//  * emitter.subscribe({
//  *   next: (v) => result.push('observerB: ' + v)
//  * });
//  *
//  * emitter.emit(3);
//  * expect(result).toEqual([
//  *   'observerA: 0',
//  *   'observerA: 1',
//  *   'observerA: 2',
//  *   'observerB: 2',
//  *   'observerA: 3',
//  *   'observerB: 3'
//  * ]) // => 通过
//  *```
//  * @public
//  */
// export class BehaviorEventEmitter<T = any> extends EventEmitter<T> {
//   /** @internal @override */
//   protected $: BehaviorSubject<T> = null;
//   constructor(public initialEvent?: T) {
//     super();
//   }
//   /**
//    * @override
//    */
//   public init(): BehaviorSubject<T> {
//     if (!this.$) {
//       this.$ = new BehaviorSubject<T>(this.initialEvent);
//     }
//     return this.$;
//   }
// }

// /**
//  *
//  * 类似于{@link BehaviorEventEmitter}，允许记录 **多个** 自己发送过的事件并将其回放给新的订阅者。
//  *
//  * 当创建 ReplaySubject 时，你可以指定回放多少个值，还可以指定 window time (以毫秒为单位)来确定多久之前的值可以记录。
//  * @example
//  *```ts
//  * const emitter = new ReplayEventEmitter(3); // 为新的订阅者缓冲3个值
//  * const result = []
//  * emitter.subscribe({
//  *   next: (v) => result.push('observerA: ' + v)
//  * });
//  *
//  * emitter.emit(1);
//  * emitter.emit(2);
//  * emitter.emit(3);
//  * emitter.emit(4);
//  *
//  * emitter.subscribe({
//  *   next: (v) => result.push('observerB: ' + v)
//  * });
//  *
//  * emitter.emit(5);
//  * expect(result).toEqual([
//  *   'observerA: 1',
//  *   'observerA: 2',
//  *   'observerA: 3',
//  *   'observerA: 4',
//  *   'observerB: 2',
//  *   'observerB: 3',
//  *   'observerB: 4',
//  *   'observerA: 5',
//  *   'observerB: 5',
//  * ])
//  *```
//  * @example
//  *```ts
//  * const emitter = new ReplayEventEmitter(100, 600);
//  * const result = [];
//  * emitter.subscribe({
//  *   next: (v) => result.push('observerA: ' + v)
//  * });
//  * var i = 1;
//  * emitter.emit(i);
//  * setInterval(() => emitter.emit(++i), 200);
//  * setTimeout(() => {
//  *   emitter.subscribe({
//  *     next: (v) => result.push('observerB: ' + v)
//  *   });
//  * }, 1000);
//  * await sleep(1200);
//  * expect(result).toEqual([
//  *   'observerA: 1', // 0ms
//  *   'observerA: 2', // 200ms
//  *   'observerA: 3', // 400ms
//  *   'observerA: 4', // 600ms
//  *   'observerA: 5', // 800ms
//  *   'observerB: 3', // 1000ms - 400 = 600
//  *   'observerB: 4', // 1000ms - 600 = 400
//  *   'observerB: 5', // 1000ms - 800 = 200
//  *   'observerA: 6', // 1000ms
//  *   'observerB: 6', // 1000ms
//  * ]);
//  *```
//  * @public
//  */
// export class ReplayEventEmitter<T = any> extends EventEmitter<T> {
//   /** @internal @override */
//   protected $: ReplaySubject<T> = null;
//   constructor(public bufferSize: number = 1, public windowTime?: number) {
//     super();
//   }
//   /**
//    * @override
//    */
//   public init(): ReplaySubject<T> {
//     if (!this.$) {
//       // 本来windowTime的判断是小于（不等于），做了些修正让参数更容易理解
//       this.$ = new ReplaySubject<T>(
//         this.bufferSize,
//         (this.windowTime && this.windowTime + 1) || undefined
//       );
//     }
//     return this.$;
//   }
// }

export const a = 1;
