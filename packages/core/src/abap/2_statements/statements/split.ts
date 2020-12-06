import {IStatement} from "./_statement";
import {seqs, altPrios, plus, alts, opt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Split implements IStatement {

  public getMatcher(): IStatementRunnable {
    const mode = seqs("IN", alts("CHARACTER", "BYTE"), "MODE");

    const into = altPrios(seqs("TABLE", Target, opt(mode)), plus(new Target()));

    const ret = seqs("SPLIT", Source, "AT", Source, "INTO", into);

    return ret;
  }

}