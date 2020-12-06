import {IStatement} from "./_statement";
import {seqs, alts} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Translate implements IStatement {

  public getMatcher(): IStatementRunnable {
    const cas = seqs("TO",
                     alts("UPPER", "LOWER"),
                     "CASE");

    const using = seqs("USING", Source);

    return seqs("TRANSLATE",
                Target,
                alts(cas, using));
  }

}