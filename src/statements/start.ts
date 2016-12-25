import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class Start extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("START-OF-SELECTION");
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s === undefined;
  }

  public indentationSetStart() {
    return 0;
  }

  public indentationSetEnd() {
    return 2;
  }

}