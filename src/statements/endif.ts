import {Statement} from "./statement";
import {If} from "./if";
import * as Combi from "../combi";

export class Endif extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("ENDIF");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof If;
  }

  public indentationStart() {
    return -2;
  }

}