/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-spread */
/* eslint-disable no-var */
export function inheritsClass(subClass: any, superClass: any) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true,
    },
  });
  if (superClass) Object.setPrototypeOf(subClass, superClass);
}
export function createSuperCls(Derived: any) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = Object.getPrototypeOf(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = Object.getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  //@ts-ignore
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], () => {}));
    return true;
  } catch (e) {
    return false;
  }
}
export function extendFunc(
  self: any,
  _super: any,
  args: any[],
  extend: (self: any, args: any[]) => any
) {
  const _this: any = _super.call.apply(_super, [self].concat(args));
  extend(_this, args as any);
  return _this;
}
