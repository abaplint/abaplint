import {Statement} from "./statement";
import {Module} from "./module";
import {str, IRunnable} from "../combi";

export class EndModule extends Statement {

  public static get_matcher(): IRunnable {
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