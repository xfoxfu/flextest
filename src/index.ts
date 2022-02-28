import { AsyncLocalStorage } from "async_hooks";

type TestResult = {
  name: string;
  status: "ok" | "failed" | "pending";
  childs: TestResult[];
};

interface TestContext {
  TEST_ROOT: TestResult;
  CURRENT_PARENT: TestResult | null;
  CURRENT_NODE: TestResult;
  HOOK_STACK: (() => void)[][];
}

const createNewContext = (): TestContext => {
  const test_root: TestResult = {
    name: "$root",
    status: "ok",
    childs: [],
  };
  return {
    TEST_ROOT: test_root,
    CURRENT_PARENT: null,
    CURRENT_NODE: test_root,
    HOOK_STACK: [],
  };
};

const TEST_CTX_STORAGE = new AsyncLocalStorage<TestContext>();

type IHook = {
  (up: () => () => void): void;
  <T>(up: () => T): T;
  <T>(up: () => [T, () => void]): T;
};
export const hook: IHook = <T>(
  up: () => T | (() => void) | [T, () => void]
): T => {
  const ctx = TEST_CTX_STORAGE.getStore();
  if (ctx === undefined) {
    throw new Error("please use hook inside a test definition");
  }

  if (typeof up !== "function") {
    throw new TypeError("hook parameter must be a function");
  }
  const ret = up();
  if (typeof ret === "function") {
    // useHook(up: () => () => void): void;
    ctx.HOOK_STACK[ctx.HOOK_STACK.length - 1].push(ret as () => void);
    return undefined as unknown as T;
  } else if (
    Array.isArray(ret) &&
    ret.length === 2 &&
    typeof ret[ret.length - 1] === "function"
  ) {
    // function useHook<T>(up: () => [T, () => void]): T;
    ctx.HOOK_STACK[ctx.HOOK_STACK.length - 1].push(ret[1]);
    return ret[0];
  }
  return ret as T;
};

export const test = (name: string, f: () => void): TestResult => {
  const ctx = TEST_CTX_STORAGE.getStore();
  if (ctx === undefined) {
    return TEST_CTX_STORAGE.run(createNewContext(), () => test(name, f));
  }

  ctx.CURRENT_NODE.childs.push({
    name,
    status: "pending",
    childs: [],
  });

  // traverse
  const parentRecover = ctx.CURRENT_PARENT;
  ctx.CURRENT_PARENT = ctx.CURRENT_NODE;
  ctx.CURRENT_NODE =
    ctx.CURRENT_NODE.childs[ctx.CURRENT_NODE.childs.length - 1];
  // setup
  ctx.HOOK_STACK.push([]);

  // run tests
  let result: TestResult["status"] = "pending";
  try {
    f();
    result = "ok";
  } catch {
    result = "failed";
  }

  // teardown
  for (const fn of ctx.HOOK_STACK[ctx.HOOK_STACK.length - 1]) {
    fn();
  }
  ctx.HOOK_STACK.pop();

  if (ctx.CURRENT_NODE.childs.some((c) => c.status === "failed")) {
    result = "failed";
  }
  ctx.CURRENT_NODE.status = result;
  const self = ctx.CURRENT_NODE;
  // recover
  if (ctx.CURRENT_PARENT !== null) ctx.CURRENT_NODE = ctx.CURRENT_PARENT;
  else ctx.CURRENT_NODE = ctx.TEST_ROOT;
  ctx.CURRENT_PARENT = parentRecover;

  return self;
};
