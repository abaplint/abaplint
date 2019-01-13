import {Statement} from "./_statement";
import {str, seq, altPrio, plus, opt, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Split extends Statement {

  public getMatcher(): IStatementRunnable {
    const mode = str("IN CHARACTER MODE");

    const into = altPrio(seq(str("TABLE"), new Target(), opt(mode)),
                         plus(new Target()));

    const ret = seq(str("SPLIT"),
                    new Source(),
                    str("AT"),
                    new Source(),
                    str("INTO"),
                    into);
    return ret;
  }

}