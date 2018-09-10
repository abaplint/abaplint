import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, opt, seq, per, plus, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Do extends Statement {

  public static get_matcher(): IRunnable {
    let vary = seq(str("VARYING"),
                   new Target(),
                   str("FROM"),
                   new Reuse.Source(),
                   str("NEXT"),
                   new Reuse.Source());

    let times = seq(new Reuse.Source(), str("TIMES"));

    return seq(str("DO"), opt(per(plus(vary), times)));
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}