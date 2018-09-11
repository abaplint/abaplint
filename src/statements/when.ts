import {Statement} from "./statement";
import {Case} from "./case";
import {str, seq, star, IRunnable} from "../combi";
import {Source} from "../expressions";

export class When extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("WHEN"),
               new Source(),
               star(seq(str("OR"), new Source())));
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Case;
  }

  public indentationStart(prev) {
    if (!(prev instanceof Case)) {
      return -2;
    }
    return 0;
  }

  public indentationEnd(_prev) {
    return 2;
  }

}