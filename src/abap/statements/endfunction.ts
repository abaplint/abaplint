import {Statement} from "./statement";
import {FunctionModule} from "./function_module";
import {str, IRunnable} from "../combi";

export class Endfunction extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDFUNCTION");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof FunctionModule;
  }

  public indentationStart() {
    return -2;
  }

}