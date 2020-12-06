import {IStatement} from "./_statement";
import {verNot, seq, alt, opt, pluss, optPrio} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SortDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const order = alt("ASCENDING", "DESCENDING");

    const sel = alt(FieldSub, SourceFieldSymbol, Dynamic);

    const fields = pluss(seq(sel, optPrio(order)));

    const by = seq("BY", fields);

    const ret = seq("SORT", opt(by));

    return verNot(Version.Cloud, ret);
  }

}