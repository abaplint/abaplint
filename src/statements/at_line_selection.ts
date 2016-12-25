import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class AtLineSelection extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("AT LINE-SELECTION");
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