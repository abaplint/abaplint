import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, IRunnable} from "../combi";

export class Module extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("MODULE"),
               new Reuse.FormName(),
               opt(alt(str("INPUT"), str("OUTPUT"))));
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

  public indentationEnd() {
    return 2;
  }

}