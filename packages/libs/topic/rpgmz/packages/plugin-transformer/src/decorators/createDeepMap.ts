export function createDeepMap<Target>() {
  const CommandMap = new Map<Object, Map<string, Target>>();
  return {
    get(target: Object, key: string, defaultValue?: () => Target) {
      const map = CommandMap.get(target) || new Map<string, Target>([[key, defaultValue?.()]]);
      if (!CommandMap.has(target)) {
        CommandMap.set(target, map);
      }
      if (!map.has(key) && defaultValue) {
        map.set(key, defaultValue());
      }
      return map.get(key) as Target;
    },
    set(target: Object, key: string, defaultValue: Target) {
      const map = CommandMap.get(target) || new Map<string, Target>([[key, defaultValue]]);
      if (!CommandMap.has(target)) {
        CommandMap.set(target, map);
      }
      if (!map.has(key) && defaultValue) {
        map.set(key, defaultValue);
      }
      return map.get(key) as Target;
    },
  };
}
