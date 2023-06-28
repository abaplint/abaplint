import * as abaplint from "@abaplint/core";
import * as abapMonaco from "@abaplint/monaco";

export function foo() {
  console.dir("foo");
  const config = {};
  const reg = new abaplint.Registry(new abaplint.Config(JSON.stringify(config)));
  abapMonaco.registerABAP(reg);
}