import * as fs from "node:fs";
import {zcl_mjs} from "./output/zcl_mjs.clas.mjs";
import {initializeABAP} from "./output/init.mjs";

await initializeABAP();

const bundle = fs.readFileSync("bundle.js", "utf-8");
const result = await zcl_mjs.eval({iv_source: new abap.types.String().set(bundle)});
/*
const foo = "console.log(2);";
const result = await zcl_mjs.eval({iv_source: new abap.types.String().set(foo)});
*/
console.dir(result);