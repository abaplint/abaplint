import {Statement} from "./statement";
import {Do} from "./do";
import * as Combi from "../combi";

let str = Combi.str;

export class Enddo extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDDO");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Do;
  }

  public indentationStart() {
    return -2;
  }

}