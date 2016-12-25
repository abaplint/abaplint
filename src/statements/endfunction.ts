import {Statement} from "./statement";
import {FunctionModule} from "./function_module";
import * as Combi from "../combi";

let str = Combi.str;

export class Endfunction extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDFUNCTION");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof FunctionModule;
  }

  public indentationStart() {
    return -2;
  }

}