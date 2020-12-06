import {IStatement} from "./_statement";
import {verNot, seqs, alts, opts, plus, optPrios} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SortDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const order = alts("ASCENDING", "DESCENDING");

    const sel = alts(FieldSub, SourceFieldSymbol, Dynamic);

    const fields = plus(seqs(sel, optPrios(order)));

    const by = seqs("BY", fields);

    const ret = seqs("SORT", opts(by));

    return verNot(Version.Cloud, ret);
  }

}