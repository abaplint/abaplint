import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let reg = Combi.regex;

export class Method extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let name = reg(/[\w~]+/);

    let kernel = seq(str("BY KERNEL MODULE"),
                     name,
                     opt(alt(str("FAIL"), str("IGNORE"))));

    return seq(str("METHOD"), name, opt(kernel));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}