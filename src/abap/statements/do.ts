import {Statement} from "./statement";
import {str, opt, seq, per, plus, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Do extends Statement {

  public getMatcher(): IRunnable {
    let range = seq(str("RANGE"), new Source());

    let vary = seq(str("VARYING"),
                   new Target(),
                   str("FROM"),
                   new Source(),
                   str("NEXT"),
                   new Source(),
                   opt(range));

    let times = seq(new Source(), str("TIMES"));

    return seq(str("DO"), opt(per(plus(vary), times)));
  }

}