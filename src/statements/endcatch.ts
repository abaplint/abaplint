import {Statement} from "./statement";
import {CatchSystemExceptions} from "./catch_system_exceptions";
import {str, IRunnable} from "../combi";

export class EndCatch extends Statement {

  public static get_matcher(): IRunnable {
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