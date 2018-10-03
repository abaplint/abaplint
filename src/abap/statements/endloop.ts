import {Statement} from "./statement";
import {Loop} from "./loop";
import {str, IRunnable} from "../combi";

export class Endloop extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDLOOP");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof Loop;
  }

  public indentationStart() {
    return -2;
  }

}