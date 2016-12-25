import {Statement} from "./statement";
import {Select} from "./select";
import * as Combi from "../combi";

export class Endselect extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return Combi.str("ENDSELECT");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s.isStructure() && s instanceof Select;
  }

  public indentationStart() {
    return -2;
  }

}