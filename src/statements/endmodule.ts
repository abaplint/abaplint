import {Statement} from "./statement";
import {Module} from "./module";
import * as Combi from "../combi";

let str = Combi.str;

export class EndModule extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDMODULE");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Module;
  }

  public indentationStart() {
    return -2;
  }

}