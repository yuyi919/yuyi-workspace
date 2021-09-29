import { createStaticMetaDataDecorators } from "./factory";

interface TestOption {
  cons: boolean;
  name?: string;
}
interface TestPropertyOption {
  prop: boolean;
  name?: string;
}
const x = createStaticMetaDataDecorators("YARGS", {
  Config: {
    kind: "constructor",
    config: (_, opt: Partial<TestOption> = {}) => opt as TestOption,
  },
  Option: {
    kind: "property",
    config: (_, opt: Partial<TestPropertyOption> = {}) => opt as TestPropertyOption,
  },
});

@x.Config({ cons: true })
class Bot {
  @x.Option({ prop: true })
  qq?: number;

  @x.Option({ prop: false })
  pwd?: string;
}
describe("test", () => {
  it("test", () => {
    expect(x.metaKeys).toMatchInlineSnapshot(`
      Object {
        "Config": Symbol(YARGS_meta:Config),
        "Option": Symbol(YARGS_meta:Option),
      }
    `);
    expect(x.getMeta("Config", Bot)).toMatchInlineSnapshot(`
Object {
  "kind": "constructor",
  "meta": Object {
    "cons": true,
  },
  "name": "Bot",
}
`);
    expect(x.getMeta("Option", Bot)).toMatchInlineSnapshot(`
Array [
  Object {
    "kind": "property",
    "meta": Object {
      "prop": true,
    },
    "name": "qq",
  },
  Object {
    "kind": "property",
    "meta": Object {
      "prop": false,
    },
    "name": "pwd",
  },
]
`);
    expect(x.getMeta("Option", Bot, "qq")).toMatchInlineSnapshot(`
Object {
  "kind": "property",
  "meta": Object {
    "prop": true,
  },
  "name": "qq",
}
`);
    expect(x.getMeta("Option", Bot, "pwd")).toMatchInlineSnapshot(`
Object {
  "kind": "property",
  "meta": Object {
    "prop": false,
  },
  "name": "pwd",
}
`);
  });
});
