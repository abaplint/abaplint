import {Statement} from "./statement";
import {Try} from "./try";
import {str, IRunnable} from "../combi";

export class Endtry extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDTRY");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof Try;
  }

  public indentationStart() {
    return -4;
  }

}