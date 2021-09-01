const expectedMatcher = "toErrorDev";

expect.extend({
  toThrowMinified(received, floor) {
    return expect(() => received()).toThrowError(floor)
  },
  [expectedMatcher](received, floor, ceiling) {
    const error = console.error;
    let matched = "";
    console.error = (...messages) => {
      matched += messages.map((o) => o.toString()).join(" ");
    };

    try {
      received();
    } catch (error) {
      const msg = (error && error.message) || error;
      if (typeof msg === "string") {
        matched += msg;
      }
    } finally {
      console.error = error;
    }
    if (matched.indexOf(floor) > -1) {
      return {
        message: () => `expected ${floor} to call console.${"error"}()`,
        pass: true,
      };
    } else {
      return {
        message: () => {
          const message =
            `Expected test not to call console.${"error"}() but instead received ${
              matched.length
            } calls.\n\n` +
            "If the warning is expected, test for it explicitly by " +
            // Don't add any punctuation after the location.
            // Otherwise it's not clickable in IDEs
            `using the ${expectedMatcher}() matcher.\nTest location:\n  ${this.testPath} `;
          return message;
        },
        pass: false,
      };
    }
  },
});
