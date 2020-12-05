import {IStatement} from "./_statement";
import {str, seqs, opt, alt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Clear implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seqs("WITH", Source);

    const mode = alt(str("IN CHARACTER MODE"),
                     str("IN BYTE MODE"));

    return seqs("CLEAR",
                Target,
                opt(wit),
                opt(mode));
  }

}