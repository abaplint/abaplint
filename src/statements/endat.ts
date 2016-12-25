import {Statement} from "./statement";
import {At} from "./at";
import * as Combi from "../combi";

export class Endat extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("ENDAT");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof At;
  }

  public indentationStart(_prev) {
    return -2;
  }

}