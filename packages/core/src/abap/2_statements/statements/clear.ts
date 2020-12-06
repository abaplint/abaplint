import {IStatement} from "./_statement";
import {seqs, opt, alts} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Clear implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seqs("WITH", Source);

    const mode = alts("IN CHARACTER MODE",
                      "IN BYTE MODE");

    return seqs("CLEAR",
                Target,
                opt(wit),
                opt(mode));
  }

}