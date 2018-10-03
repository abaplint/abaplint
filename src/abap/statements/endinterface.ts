import {Statement} from "./statement";
import {Interface} from "./interface";
import {str, IRunnable} from "../combi";

export class Endinterface extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDINTERFACE");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof Interface;
  }

  public indentationStart(_prev: Statement) {
    return -2;
  }

}