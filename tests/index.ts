import ava from "ava";
import { hook, test } from "../src";

ava("basic succeeding test", (t) => {
  const results = test("sample test", () => {
    /* empty */
  });

  t.deepEqual(results, {
    name: "$root",
    status: "ok",
    childs: [
      {
        childs: [],
        name: "sample test",
        status: "ok",
      },
    ],
  });
});

ava("basic failed test", (t) => {
  const results = test("sample test", () => {
    throw new Error();
  });

  t.deepEqual(results, {
    name: "$root",
    status: "ok",
    childs: [
      {
        childs: [],
        name: "sample test",
        status: "failed",
      },
    ],
  });
});
