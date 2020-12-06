import {IStatement} from "./_statement";
import {str, seqs, altPrio, plus, alt, opt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Split implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seqs("IN", alt(str("CHARACTER"), str("BYTE")), str("MODE"));

    const into = altPrio(seqs("TABLE", Target, opt(mode)),
                         plus(new Target()));

    const ret = seqs("SPLIT",
                     Source,
                     "AT",
                     Source,
                     "INTO",
                     into);
    return ret;
  }

}