import {Statement} from "./statement";
import {CatchSystemExceptions} from "./catch_system_exceptions";
import * as Combi from "../combi";

let str = Combi.str;

export class EndCatch extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDCATCH");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof CatchSystemExceptions;
  }

  public indentationStart() {
    return -4;
  }

}