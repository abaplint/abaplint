import {Statement} from "./statement";
import {Method} from "./method";
import {str, IRunnable} from "../combi";

export class Endmethod extends Statement {

  public static get_matcher(): IRunnable {
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