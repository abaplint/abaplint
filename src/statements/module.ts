import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {FormName} from "../expressions";

export class Module extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("MODULE"),
               new FormName(),
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