import ava from "ava";
import { hook, test } from "../src";

ava("basic succeeding test", (t) => {
  const results = test("sample test", () => {
    /* empty */
  });

  t.deepEqual(results, {
    childs: [],
    name: "sample test",
    status: "ok",
  });
});

ava("basic failed test", (t) => {
  const results = test("sample test", () => {
    throw new Error();
  });

  t.deepEqual(results, {
    childs: [],
    name: "sample test",
    status: "failed",
  });
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
      {
        childs: [],
        name: "test 1",
        status: "failed",
      },
      {
        childs: [],
        name: "test 2",
        status: "failed",
      },
    ],
    name: "sample test",
    status: "failed",
  });
});
