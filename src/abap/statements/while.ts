import {Statement} from "./statement";
import {str, seq, IRunnable, opt} from "../combi";
import {Cond, Source, Target} from "../expressions";

export class While extends Statement {

  public static get_matcher(): IRunnable {
    let vary = seq(str("VARY"), new Target(), str("FROM"), new Source(), str("NEXT"), new Source());

    return seq(str("WHILE"), new Cond(), opt(vary));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}