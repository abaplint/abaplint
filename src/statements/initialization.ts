import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class Initialization extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("INITIALIZATION");
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