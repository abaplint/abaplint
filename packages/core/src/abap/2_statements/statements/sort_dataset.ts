import {IStatement} from "./_statement";
import {verNot, seqs, alts, opt, plus, optPrio} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SortDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const order = alts("ASCENDING", "DESCENDING");

    const sel = alts(FieldSub,
                     SourceFieldSymbol,
                     Dynamic);

    const fields = plus(seqs(sel, optPrio(order)));

    const by = seqs("BY", fields);

    const ret = seqs("SORT", opt(by));

    return verNot(Version.Cloud, ret);
  }

}