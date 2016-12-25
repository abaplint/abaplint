import {Statement} from "./statement";
import {Case} from "./case";
import * as Combi from "../combi";

let str = Combi.str;

export class Endcase extends Statement {

  public static get_matcher(): Combi.IRunnable {
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