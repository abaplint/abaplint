import {Statement} from "./statement";
import {Try} from "./try";
import * as Combi from "../combi";

let str = Combi.str;

export class Endtry extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDTRY");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Try;
  }

  public indentationStart() {
    return -4;
  }

}