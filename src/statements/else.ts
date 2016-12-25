import {Statement} from "./statement";
import {If} from "./if";
import * as Combi from "../combi";

export class Else extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("ELSE");
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof If;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}