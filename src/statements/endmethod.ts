import {Statement} from "./statement";
import {Method} from "./method";
import * as Combi from "../combi";

let str = Combi.str;

export class Endmethod extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDMETHOD");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Method;
  }

  public indentationStart() {
    return -2;
  }

}