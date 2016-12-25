import {Statement} from "./statement";
import {Class} from "./class";
import * as Combi from "../combi";

let str = Combi.str;

export class Endclass extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDCLASS");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Class;
  }

  public indentationSetStart() {
    return 0;
  }

}