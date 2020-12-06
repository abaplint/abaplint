import {IStatement} from "./_statement";
import {verNot, seq, alts, opts, pluss, optPrios} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SortDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const order = alts("ASCENDING", "DESCENDING");

    const sel = alts(FieldSub, SourceFieldSymbol, Dynamic);

    const fields = pluss(seq(sel, optPrios(order)));

    const by = seq("BY", fields);

    const ret = seq("SORT", opts(by));

    return verNot(Version.Cloud, ret);
  }

}