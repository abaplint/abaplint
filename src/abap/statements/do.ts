import {Statement} from "./statement";
import {str, opt, seq, per, plus, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Do extends Statement {

  public get_matcher(): IRunnable {
    let vary = seq(str("VARYING"),
                   new Target(),
                   str("FROM"),
                   new Source(),
                   str("NEXT"),
                   new Source());

    let times = seq(new Source(), str("TIMES"));

    return seq(str("DO"), opt(per(plus(vary), times)));
  }

}