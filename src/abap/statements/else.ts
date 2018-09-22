import {Statement} from "./statement";
import {If} from "./if";
import {str, IRunnable} from "../combi";

export class Else extends Statement {

  public static get_matcher(): IRunnable {
    return str("ELSE");
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