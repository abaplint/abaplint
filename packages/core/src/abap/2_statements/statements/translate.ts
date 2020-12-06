import {IStatement} from "./_statement";
import {str, seqs, alt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Translate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const cas = seqs("TO",
                     alt(str("UPPER"), str("LOWER")),
                     "CASE");

    const using = seqs("USING", Source);

    return seqs("TRANSLATE",
                Target,
                alt(cas, using));
  }

}