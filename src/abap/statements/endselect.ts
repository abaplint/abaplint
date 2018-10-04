import {Statement} from "./statement";
import {Select} from "./select";
import {str, IRunnable} from "../combi";

export class Endselect extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDSELECT");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s.isStructure() && s instanceof Select;
  }

  public indentationStart() {
    return -2;
  }

}