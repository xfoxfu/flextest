const HOOK_STACK: (() => void)[][] = [];

type IHook = {
  (up: () => () => void): void;
  <T>(up: () => T): T;
  <T>(up: () => [T, () => void]): T;
};
export const hook: IHook = <T>(
  up: () => T | (() => void) | [T, () => void],
): T => {
  if (typeof up !== "function") {
    throw new TypeError("hook parameter must be a function");
  }
  const ret = up();
  if (typeof ret === "function") {
    // useHook(up: () => () => void): void;
    HOOK_STACK[HOOK_STACK.length - 1].push(ret as () => void);
    return (undefined as unknown) as T;
  } else if (
    Array.isArray(ret) &&
    ret.length === 2 &&
    typeof ret[ret.length - 1] === "function"
  ) {
    // function useHook<T>(up: () => [T, () => void]): T;
    HOOK_STACK[HOOK_STACK.length - 1].push(ret[1]);
    return ret[0];
  }
  return ret as T;
};

type TestResult = {
  name: string;
  status: "ok" | "failed" | "pending";
  childs: TestResult[];
};

const TEST_ROOT: TestResult = {
  name: "$root",
  status: "ok",
  childs: [],
};
let CURRENT_PARENT: TestResult | null = null;
let CURRENT_NODE: TestResult = TEST_ROOT;

export const test = (name: string, f: () => void): void => {
  CURRENT_NODE.childs.push({
    name,
    status: "pending",
    childs: [],
  });

  // traverse
  const parentRecover = CURRENT_PARENT;
  CURRENT_PARENT = CURRENT_NODE;
  CURRENT_NODE = CURRENT_NODE.childs[CURRENT_NODE.childs.length - 1];
  // setup
  HOOK_STACK.push([]);

  // run tests
  let result: TestResult["status"] = "pending";
  try {
    f();
    result = "ok";
  } catch {
    result = "failed";
  }

  // teardown
  for (const fn of HOOK_STACK[HOOK_STACK.length - 1]) {
    fn();
  }
  HOOK_STACK.pop();

  CURRENT_NODE.status = result;
  // recover
  if (CURRENT_PARENT !== null) CURRENT_NODE = CURRENT_PARENT;
  else CURRENT_NODE = TEST_ROOT;
  CURRENT_PARENT = parentRecover;
};

export const finish = (node?: TestResult, prefix?: string): void => {
  if (node === undefined) {
    node = TEST_ROOT;
  }
  let curPrefix = "";
  if (node !== TEST_ROOT) {
    curPrefix = `${prefix ? `${prefix} > ` : ""}${node.name}`;
    console.log(curPrefix, node.status);
  }
  for (const child of node?.childs) {
    finish(child, curPrefix);
  }
};
