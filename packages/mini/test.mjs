import * as fs from "node:fs";
import {zcl_mjs} from "./output/zcl_mjs.clas.mjs";
import {initializeABAP} from "./output/init.mjs";

await initializeABAP();

const bundle = fs.readFileSync("bundle.js", "utf-8");
const result = await zcl_mjs.eval({iv_source: new abap.types.String().set(bundle)});
console.dir(result);

/*
const foo = `console.log(foobar);`;
const result = await zcl_mjs.eval({iv_source: new abap.types.String().set(foo)});
console.dir(result);
*/

/*
const foo = `var FileFile = class {
  constructor(filename) {
    this.filename = filename;
  }
  getFilename() {
    return this.filename;
  }
};

new FileFile("foo.txt");
console.log("Done");`;
const result = await zcl_mjs.eval({iv_source: new abap.types.String().set(foo)});
console.dir(result);
*/