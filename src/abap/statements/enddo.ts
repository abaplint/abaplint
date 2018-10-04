import {Statement} from "./statement";
import {Do} from "./do";
import {str, IRunnable} from "../combi";

export class Enddo extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDDO");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof Do;
  }

  public indentationStart() {
    return -2;
  }

}