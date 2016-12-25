import {Statement} from "./statement";
import {Define} from "./define";
import * as Combi from "../combi";

let str = Combi.str;

export class Enddefine extends Statement {

  public static get_matcher(): Combi.IRunnable {
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