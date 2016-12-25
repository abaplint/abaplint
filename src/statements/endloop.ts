import {Statement} from "./statement";
import {Loop} from "./loop";
import * as Combi from "../combi";

let str = Combi.str;

export class Endloop extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDLOOP");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Loop;
  }

  public indentationStart() {
    return -2;
  }

}