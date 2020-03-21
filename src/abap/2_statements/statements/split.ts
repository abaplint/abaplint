import {IStatement} from "./_statement";
import {str, seq, altPrio, plus, alt, opt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Split implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seq(str("IN"), alt(str("CHARACTER"), str("BYTE")), str("MODE"));

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