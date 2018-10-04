import {Statement} from "./statement";
import {If} from "./if";
import {str, IRunnable} from "../combi";

export class Endif extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDIF");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof If;
  }

  public indentationStart() {
    return -2;
  }

}