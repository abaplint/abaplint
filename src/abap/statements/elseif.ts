import {Statement} from "./statement";
import {If} from "./if";
import {str, seq, IRunnable} from "../combi";
import {Cond} from "../expressions";

export class Elseif extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("ELSEIF"), new Cond());
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof If;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}