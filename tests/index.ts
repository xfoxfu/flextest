import ava from "ava";
import { hook, test } from "../src";

ava("basic succeeding test", (t) => {
  const results = test("sample test", () => {
    /* empty */
  });

  t.deepEqual(results, { childs: [], name: "sample test", status: "ok" });
});

ava("basic failed test", (t) => {
  const results = test("sample test", () => {
    throw new Error();
  });

  t.deepEqual(results, { childs: [], name: "sample test", status: "failed" });
});

ava("multiple tests", (t) => {
  const results = test("sample test", () => {
    test("test 1", () => {
      throw new Error();
    });
    test("test 2", () => {
      throw new Error();
    });
  });

  t.deepEqual(results, {
    childs: [
      { childs: [], name: "test 1", status: "failed" },
      { childs: [], name: "test 2", status: "failed" },
    ],
    name: "sample test",
    status: "failed",
  });
});

ava("simple hook (up: () => () => void): void;", (t) => {
  let [setup, teardown] = [false, false];
  const result = test("root", () => {
    hook(() => {
      setup = true;
      return () => {
        teardown = true;
      };
    });
  });

  t.deepEqual(result, { childs: [], name: "root", status: "ok" });
  t.true(setup);
  t.true(teardown);
});

ava("simple hook <T>(up: () => T): T;", (t) => {
  let [setup, value] = [false, 0];
  const result = test("root", () => {
    const v = hook(() => {
      setup = true;
      return 1;
    });
    value = v;
  });

  t.deepEqual(result, { childs: [], name: "root", status: "ok" });
  t.true(setup);
  t.is(value, 1);
});

ava("simple hook <T>(up: () => [T, () => void]): T;", (t) => {
  let [setup, teardown, value] = [false, false, 0];
  const result = test("root", () => {
    const v = hook(() => {
      setup = true;
      return [
        1,
        () => {
          teardown = true;
        },
      ] as [number, () => void];
    });
    value = v;
  });

  t.deepEqual(result, { childs: [], name: "root", status: "ok" });
  t.true(setup);
  t.true(teardown);
  t.is(value, 1);
});
