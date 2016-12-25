import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Module extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("MODULE"),
               new Reuse.FormName(),
               opt(alt(str("INPUT"), str("OUTPUT"))));
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s === undefined;
  }

  public indentationSetStart() {
    return 0;
  }

  public indentationEnd() {
    return 2;
  }

}