import * as fs from "node:fs";
import {zcl_mjs} from "./output/zcl_mjs.clas.mjs";
import {initializeABAP} from "./output/init.mjs";

await initializeABAP();

let bundle = fs.readFileSync("bundle.js", "utf-8");

bundle = bundle.replace(`export {
  main
};`, "");

const result = await zcl_mjs.eval({iv_source: new abap.types.String().set(bundle)});
console.dir(result);