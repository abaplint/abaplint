import {Statement} from "./statement";
import {Define} from "./define";
import {str, IRunnable} from "../combi";

export class Enddefine extends Statement {

  public static get_matcher(): IRunnable {
    return str("END-OF-DEFINITION");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Define;
  }

  public indentationStart() {
    return -2;
  }

}