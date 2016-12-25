import {Statement} from "./statement";
import {Interface} from "./interface";
import * as Combi from "../combi";

export class Endinterface extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("ENDINTERFACE");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Interface;
  }

  public indentationStart(_prev) {
    return -2;
  }

}