import ava from "ava";
import { hook, test, finish, globalReset, getResults } from "../src";

ava.beforeEach(() => globalReset());

ava.serial("basic succeeding test", (t) => {
  test("sample test", () => {
    /* empty */
  });
  finish();

  t.deepEqual(getResults(), {
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

ava.serial("basic failed test", (t) => {
  test("sample test", () => {
    throw new Error();
  });
  finish();

  t.deepEqual(getResults(), {
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
