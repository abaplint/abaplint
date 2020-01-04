import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, plus, optPrio, IStatementRunnable} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic} from "../expressions";
import {Version} from "../../version";

export class SortDataset extends Statement {

  public getMatcher(): IStatementRunnable {
    const order = alt(str("ASCENDING"), str("DESCENDING"));

    const sel = alt(new FieldSub(),
                    new SourceFieldSymbol(),
                    new Dynamic());

    const fields = plus(seq(sel, optPrio(order)));

    const by = seq(str("BY"), fields);

    const ret = seq(str("SORT"), opt(by));

    return verNot(Version.Cloud, ret);
  }

}