import {Statement} from "./statement";
import {Case} from "./case";
import {str, IRunnable} from "../combi";

export class Endcase extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDCASE");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Case;
  }

  public indentationStart() {
    return -4;
  }

}