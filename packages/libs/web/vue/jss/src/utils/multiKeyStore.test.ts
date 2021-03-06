import { multiKeyStore } from "./multiKeyStore";

describe("multiKeyStore", () => {
  it("should work as expected", () => {
    const cache = new Map();
    const key1 = {};
    const key2 = {};
    expect(multiKeyStore.get(cache, key1, key2)).toBe(undefined);
    multiKeyStore.set(cache, key1, key2, "foo");
    expect(multiKeyStore.get(cache, key1, key2)).toBe("foo");
    // @ts-expect-error
    multiKeyStore.delete(cache, key1, key2, "foo");
    expect(multiKeyStore.get(cache, key1, key2)).toBe(undefined);
  });
});
