import {Statement} from "./statement";
import {If} from "./if";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Elseif extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("ELSEIF"), new Reuse.Cond());
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof If;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}